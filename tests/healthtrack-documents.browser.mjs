// node tests/healthtrack-documents.browser.mjs — actual HealthTrack UI, all API requests intercepted.
import { spawn } from "node:child_process";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const { createServer } = await import(pathToFileURL(join(process.cwd(), "node_modules/vite/dist/node/index.js")));
const server = await createServer({ logLevel: "silent", server: { host: "127.0.0.1", port: 5204, strictPort: true } });
await server.listen();
const profile = await mkdtemp(join(tmpdir(), "ht-documents-"));
const chrome = spawn(process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe", [
  "--headless=new", "--disable-gpu", "--no-first-run", "--no-default-browser-check",
  "--remote-debugging-port=0", `--user-data-dir=${profile}`, "about:blank",
], { windowsHide: true, stdio: ["ignore", "ignore", "pipe"] });
let ws;
try {
  const endpoint = await new Promise((resolve, reject) => {
    let output = "";
    const timer = setTimeout(() => reject(Error("Chrome startup timed out")), 20000);
    chrome.on("error", reject);
    chrome.stderr.on("data", chunk => {
      output += chunk;
      const match = output.match(/DevTools listening on (ws:\/\/[^\s]+)/);
      if (match) { clearTimeout(timer); resolve(match[1]); }
    });
  });
  const target = await (await fetch(`http://127.0.0.1:${new URL(endpoint).port}/json/new?about:blank`, { method: "PUT" })).json();
  ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });
  let onRequest = () => {};
  let sequence = 0;
  const pending = new Map(), errors = [], requests = [];
  ws.onmessage = ({ data }) => {
    const message = JSON.parse(data);
    if (message.method === "Fetch.requestPaused") onRequest(message.params).catch(error => { errors.push(String(error)); });
    if (message.method === "Runtime.exceptionThrown") errors.push(message.params);
    if (message.method === "Network.requestWillBeSent" && new URL(message.params.request.url).pathname.startsWith("/api/")) requests.push(message.params.request);
    if (message.id) {
      const call = pending.get(message.id); pending.delete(message.id);
      if (message.error) call.reject(Error(JSON.stringify(message.error))); else call.resolve(message.result);
    }
  };
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++sequence; const timeout=setTimeout(()=>{pending.delete(id);reject(Error("CDP timeout: "+method));},30000); pending.set(id, { resolve:value=>{clearTimeout(timeout);resolve(value);}, reject:error=>{clearTimeout(timeout);reject(error);} }); ws.send(JSON.stringify({ id, method, params }));
  });
  const evaluate = async expression => {
    const result = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) throw Error(JSON.stringify(result.exceptionDetails));
    return result.result.value;
  };
  const pause = (ms = 160) => new Promise(resolve => setTimeout(resolve, ms));
  const check = (name, value) => { if (!value) throw Error(name); console.log("PASS " + name); };
  const until = async expression => {
    for (let i = 0; i < 450; i++) { if (await evaluate(`Boolean(${expression})`)) return; await pause(100); }
    console.log(await evaluate("JSON.stringify({text:document.body.innerText.slice(-1800),active:document.activeElement?.outerHTML})"));
    console.log(JSON.stringify({errors,calls:calls.slice(-8),unexpected}));
    await screenshot("timeout");
    throw Error("Timeout " + expression);
  };
  const screenshot = async name => {
    const { data } = await send("Page.captureScreenshot", { format: "png" });
    const path = join(profile, name + ".png"); await writeFile(path, Buffer.from(data, "base64")); console.log("SCREENSHOT " + path);
  };

  let mode = 'data', delay = 0;
  const calls = [], unexpected = [];
  const fixture = id => ({ id,
    fileName: (id === 1 ? 'DSPN_Демонстрационный_файл_с_длинным_именем_для_проверки_переноса_без_потери_символов_' : 'PROF_TEST_') + id + '.xml',
    fileType: ['DSPN','PROF','GST','DSPN','PROF','PROF','GST'][(id-1)%7],
    status: ['Uploaded','Uploaded','Ready','Checking','Error','Queued','Uploaded'][(id-1)%7],
    period: '2026-09', hospitalCode: '190006', regionCode: '19', recordsCount: id%3 ? 1234567 : null,
    isValid: true, uploadedBy: 'demo', uploadDate: '2026-10-01T10:20:00Z', checkedAt: null,
    checkedBy: null, checkAttempts: 0, validationErrors: null });
  const reply = (requestId, payload, status=200, file=false) => send('Fetch.fulfillRequest', {
    requestId, responseCode: status,
    responseHeaders: [{ name: 'Content-Type', value: file?'application/zip':'application/json' }],
    body: Buffer.from(file?'fixture export':JSON.stringify(payload)).toString('base64')
  });
  onRequest = async ({requestId, request}) => {
    const url = new URL(request.url), path = url.pathname;
    if (!path.startsWith("/api/")) return send("Fetch.continueRequest", {requestId});
    calls.push({path, search:url.search, method:request.method, body:request.postData});
    if(path === '/api/health-track/documents' && request.method==='GET') {
      const currentMode=mode;
      if(delay) await pause(delay);
      const size=Number(url.searchParams.get('pageSize') || 50), page=Number(url.searchParams.get('page')||1);
      return reply(requestId, currentMode==='error'?{title:'Тестовая ошибка'}:{items:currentMode==='empty'?[]:Array.from({length:size},(_,i)=>fixture((page-1)*size+i+1)),totalCount:currentMode==='empty'?0:400,page,pageSize:size,totalPages:currentMode==='empty'?1:Math.ceil(400/size)},currentMode==='error'?500:200);
    }
    if(path.endsWith('/audit')) return reply(requestId,[]);
    if(/^\/api\/health-track\/documents\/\d+$/.test(path)) return reply(requestId,request.method==='DELETE'?null:fixture(Number(path.split('/').at(-1))));
    if(path.endsWith('/check-batch')) return reply(requestId,{results:[],successCount:JSON.parse(request.postData).documentIds.length,failedCount:0});
    if(path.endsWith('/check')) return reply(requestId,{documentId:1,isSuccess:true,recordsCount:10,approvedCount:10,rejectedCount:0,errors:[]});
    if(path.startsWith('/api/health-track/export/')) { await pause(350); return reply(requestId,null,200,true); }
    unexpected.push(request.url); return send('Fetch.failRequest',{requestId,errorReason:'BlockedByClient'});
  };
  await send('Network.enable'); await send('Page.enable'); await send('Runtime.enable'); await send('Page.bringToFront');
  await send('Fetch.enable',{patterns:[{urlPattern:'*/api/*'}]});
  await send('Emulation.setDeviceMetricsOverride',{width:1920,height:1080,deviceScaleFactor:1,mobile:false});
  await send('Page.navigate',{url:'http://127.0.0.1:5204/health-track'});
  await until("document.body.textContent.includes('Документы и экспорт')");
  await evaluate("(async()=>{const {useAuthStore}=await import('/src/modules/auth/stores/authStore.ts');useAuthStore.setState({permissions:['healthtrack.documents.read','healthtrack.documents.check','healthtrack.documents.delete','healthtrack.export.aggregated'],organizationCode:'19000'});})()");
  await until("document.querySelector('table[aria-label] tbody tr button')");
  await evaluate("window.button=text=>[...document.querySelectorAll('button')].find(e=>e.textContent.trim()===text);window.setInput=(e,value)=>{const proto=e.tagName==='SELECT'?HTMLSelectElement.prototype:HTMLInputElement.prototype;Object.getOwnPropertyDescriptor(proto,'value').set.call(e,value);e.dispatchEvent(new Event(e.tagName==='SELECT'?'change':'input',{bubbles:true}));};window.viewport=()=>document.querySelector('[aria-label=\"Таблица документов\"]');window.rows=()=>[...document.querySelectorAll('table[aria-label] tbody tr')];");
  check('two working surfaces, export then documents with filters and refresh',await evaluate("(()=>{const exports=document.getElementById('ht-export-heading'),exportSurface=exports.closest('section').parentElement,registry=document.querySelector('[aria-labelledby=ht-documents-heading]'),root=registry.parentElement,title=document.getElementById('ht-documents-heading'),filters=document.querySelector('form[aria-label]'),before=(a,b)=>Boolean(a.compareDocumentPosition(b)&Node.DOCUMENT_POSITION_FOLLOWING);return root.children.length===2&&root.firstElementChild===exportSurface&&root.lastElementChild===registry&&exports.tagName==='H2'&&title.tagName==='H2'&&exports.textContent==='Экспорт'&&title.textContent==='Документы'&&before(exports,title)&&before(title,filters)&&before(filters,viewport())&&registry.querySelector('header').contains(button('Обновить'))&&registry.contains(document.querySelector('[aria-label=\"Документов на странице\"]'))&&![...root.querySelectorAll('h2,h3')].some(e=>['Документы и экспорт','Формирование выгрузок'].includes(e.textContent))&&!root.textContent.includes('Поиск, проверка и выгрузка документов')&&!root.textContent.includes('Формирование сводных файлов для ГИС ОМС');})()"));
  check('status cells and header centered',await evaluate("getComputedStyle(document.querySelector('table thead th:nth-child(8)')).textAlign==='center'&&getComputedStyle(rows()[0].querySelector('td:nth-child(8)')).textAlign==='center'"));
  const primary=await evaluate("(()=>{const b=button('Найти'),s=getComputedStyle(b);return{color:s.color,bg:s.backgroundColor,border:s.borderWidth,icon:getComputedStyle(b.querySelector('svg')).color};})()");
  const luminance=color=>{const [r,g,b]=color.match(/[\d.]+/g).slice(0,3).map(Number).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;});return .2126*r+.7152*g+.0722*b;};
  check('white primary text and icon, AA contrast, no permanent border',primary.color==='rgb(255, 255, 255)'&&primary.icon==='rgb(255, 255, 255)'&&(luminance(primary.color)+.05)/(luminance(primary.bg)+.05)>=4.5&&primary.border==='0px');
  check('destructive action starts neutral',await evaluate("getComputedStyle(rows()[0].querySelector('[aria-label=\"Удалить документ\"]')).color===getComputedStyle(rows()[0].querySelector('[aria-label=\"Проверить документ\"]')).color"));
  const deleteBounds=await evaluate("(()=>{const r=rows()[0].querySelector('[aria-label=\"Удалить документ\"]').getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2};})()");
  await send('Input.dispatchMouseEvent',{type:'mouseMoved',...deleteBounds});await pause(200);
  check('delete hover is red with soft background',await evaluate("(()=>{const s=getComputedStyle(rows()[0].querySelector('[aria-label=\"Удалить документ\"]'));return s.color==='rgb(255, 0, 0)'&&s.backgroundColor!=='rgba(0, 0, 0, 0)';})()"));
  await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:0,y:0});
  for(const size of [25,50,100,200]) {
    await evaluate("setInput(document.querySelector('[aria-label=\"Документов на странице\"]'),'"+size+"')");
    await until("rows().length==="+size);
    check('server pagination '+size,calls.some(c=>c.search.includes('pageSize='+size)));
  }
  for(const width of [360,768,1024,1440,1920,2560]) {
    await send('Emulation.setDeviceMetricsOverride',{width,height:1080,deviceScaleFactor:1,mobile:false}); await pause(250);
    const geometry=await evaluate("(()=>{const v=viewport(), th=v.querySelector('th'),long=v.querySelector('tbody td:nth-child(3) button');v.scrollTop=130;v.scrollLeft=100;return {overflow:document.documentElement.scrollWidth>innerWidth,sticky:Math.abs(th.getBoundingClientRect().top-v.getBoundingClientRect().top)<2,scroll:v.scrollHeight>v.clientHeight,horizontal:v.scrollWidth>v.clientWidth,longWrap:getComputedStyle(long).overflowWrap==='anywhere',paginationOutside:!v.querySelector('[aria-label=\"Документов на странице\"]'),aligned:Math.abs(th.getBoundingClientRect().left-v.querySelector('tbody td').getBoundingClientRect().left)<2};})()");
    check('equal white islands with canvas gap '+width,await evaluate("(()=>{const registry=document.querySelector('[aria-labelledby=ht-documents-heading]'),root=registry.parentElement,a=root.children[0],b=registry,ra=a.getBoundingClientRect(),rb=b.getBoundingClientRect(),sa=getComputedStyle(a),sb=getComputedStyle(b),gap=rb.top-ra.bottom;return Math.abs(ra.left-rb.left)<1&&Math.abs(ra.width-rb.width)<1&&gap>=16&&gap<=24&&sa.padding===sb.padding&&sa.borderRadius===sb.borderRadius&&sa.backgroundColor==='rgb(255, 255, 255)'&&sa.backgroundColor===sb.backgroundColor&&getComputedStyle(root).backgroundColor==='rgb(245, 245, 247)'&&sa.boxShadow==='none'&&sb.boxShadow==='none';})()"));
    check('geometry '+width,!geometry.overflow&&geometry.sticky&&geometry.scroll&&geometry.longWrap&&geometry.paginationOutside&&geometry.aligned);
    if(width===360)check('local horizontal scrolling',geometry.horizontal);
    await evaluate('viewport().scrollTop=0;viewport().scrollLeft=0;window.scrollTo(0,0)');
    if([360,1440,1920,2560].includes(width))await screenshot('healthtrack-documents-'+width);
  }
  await send('Emulation.setDeviceMetricsOverride',{width:360,height:1080,deviceScaleFactor:1,mobile:false});
  await evaluate("document.querySelector('[aria-label=\"Фильтры документов\"]').scrollIntoView({block:'start'})");await screenshot('healthtrack-documents-mobile-content');
  await send('Emulation.setDeviceMetricsOverride',{width:1440,height:1080,deviceScaleFactor:1,mobile:false});
  check('mass selection removed, nine columns and plain document types',await evaluate("!document.querySelector('table[aria-label] input[type=checkbox]')&&!document.body.textContent.includes('Проверить выбранные')&&document.querySelectorAll('table[aria-label] thead th').length===9&&rows()[0].querySelector('td:nth-child(4)').textContent==='DSPN'&&rows()[0].querySelector('td:nth-child(4)').children.length===0"));
  await evaluate("rows()[0].querySelector('td:nth-child(3) button').focus()");
  check('visible keyboard focus',await evaluate("getComputedStyle(document.activeElement).outlineStyle==='solid'"));
  await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13,text:'\r'});
  await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});
  await until("document.querySelector('.MuiDrawer-paper')?.textContent.includes('Дата загрузки')");
  check('keyboard opens document details',true);
  await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
  await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape',windowsVirtualKeyCode:27}); await until("!document.querySelector('.MuiDrawer-paper')");
  await evaluate("setInput(document.querySelector('#ht-document-search'),'test');setInput(document.querySelector('#ht-document-type'),'DSPN');setInput(document.querySelector('#ht-document-mo'),'190006');setInput(document.querySelector('#ht-document-period'),'2026-09');setInput(document.querySelector('#ht-document-status'),'Uploaded');");
  await until("document.body.textContent.includes('Есть неприменённые изменения')");
  await evaluate("button('Найти').click()");
  await until("!document.body.textContent.includes('Есть неприменённые изменения')");
  check('all five filters reach API',calls.some(c=>c.search.includes('searchQuery=test')&&c.search.includes('fileType=DSPN')&&c.search.includes('hospitalCode=190006')&&c.search.includes('period=2026-09')&&c.search.includes('status=Uploaded')));
  await evaluate("document.querySelector('[aria-label=\"Следующая страница\"]').click()");await until("rows()[0].textContent.includes('201')");
  await evaluate("button('Сбросить').click()"); await until("document.querySelector('#ht-document-search').value===''"); await pause(250);
  await evaluate("rows()[0].querySelector('[aria-label=\"Проверить документ\"]').focus()");
  await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13,text:'\r'});
  await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});
  await until("!button('Обновить').disabled");
  check('single document check uses existing endpoint',calls.some(c=>c.path==='/api/health-track/documents/1/check'&&c.method==='POST'));
  await until("!rows()[4].querySelector('[aria-label=\"Скачать ответный файл\"]').disabled&&!button('Обновить').disabled");await pause(300);
  await evaluate("rows()[4].querySelector('[aria-label=\"Скачать ответный файл\"]').focus()");
  check('download receives keyboard focus',await evaluate("document.activeElement===rows()[4].querySelector('[aria-label=\"Скачать ответный файл\"]')"));
  await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13,text:'\r'});
  await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});
  for(let i=0;i<40&&!calls.some(c=>c.path==='/api/health-track/export/prof/5/response');i++) await pause(50);
  if(!calls.some(c=>c.path==='/api/health-track/export/prof/5/response')) console.log(await evaluate("document.activeElement.outerHTML"),calls.slice(-5));
  check('response download uses existing endpoint',calls.some(c=>c.path==='/api/health-track/export/prof/5/response'));
  await evaluate("rows()[6].querySelector('[aria-label=\"Удалить документ\"]').focus()");
  await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13,text:'\r'});
  await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});
  await until("document.querySelector('[role=dialog]')?.textContent.includes('Действие необратимо')");
  await evaluate("[...document.querySelectorAll('[role=dialog] button')].find(e=>e.textContent==='Удалить').click()");
  await until("!document.querySelector('[role=dialog]')");
  check('deletion retains confirmation and endpoint',calls.some(c=>c.path==='/api/health-track/documents/7'&&c.method==='DELETE'));
  check('all six export formats and one active form',await evaluate("document.querySelectorAll('[aria-label=\"Формат выгрузки\"] [role=tab]').length===6&&document.querySelectorAll('[role=tabpanel]').length===1&&document.querySelectorAll('[role=tabpanel] button').length===1"));
  await evaluate("window.exportTab=label=>[...document.querySelectorAll('[aria-label=\"Формат выгрузки\"] [role=tab]')].find(e=>e.textContent===label);window.exportPanel=()=>document.querySelector('[role=tabpanel]');");
  await evaluate("setInput(exportPanel().querySelector('input'),'2026-09');exportTab('GPT').click()");await pause();
  await evaluate("exportTab('GST').click()");await pause();
  check('drafts survive format switch without exports',await evaluate("exportPanel().querySelector('input').value==='2026-09'")&&!calls.some(c=>c.path.includes('/export/')&&!c.path.endsWith('/response')));
  await evaluate("exportTab('GST').focus()");
  await send('Input.dispatchKeyEvent',{type:'keyDown',key:'ArrowRight',code:'ArrowRight',windowsVirtualKeyCode:39});
  await send('Input.dispatchKeyEvent',{type:'keyUp',key:'ArrowRight',code:'ArrowRight',windowsVirtualKeyCode:39});
  await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13,text:'\r'});
  await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});
  await until("exportTab('GPT').getAttribute('aria-selected')==='true'");
  check('keyboard format switching and ARIA panel linkage',await evaluate("exportPanel().getAttribute('aria-labelledby')===exportTab('GPT').id&&exportTab('GPT').getAttribute('aria-controls')===exportPanel().id"));
  for(const label of ['GST','GPT','GF','PF','DSPN → СМО','PROF → СМО']) {
    await evaluate("exportTab("+JSON.stringify(label)+").click()");await pause();
    if(label==='GF') {
      const before=calls.filter(c=>c.path.includes('/export/')&&!c.path.endsWith('/response')).length;
      await evaluate("setInput(exportPanel().querySelector('input'),'2026-09')");await pause();
      await evaluate("exportPanel().querySelector('button').click()");await pause();
      check('GF retains required MO validation',calls.filter(c=>c.path.includes('/export/')&&!c.path.endsWith('/response')).length===before);
    }
    if(label.endsWith('СМО')) {
      await evaluate("setInput(exportPanel().querySelector('input'),'2026-09')");await pause();
      check(label+' requires SMO for admin',await evaluate("exportPanel().querySelector('button').disabled"));
    }
    const expected=label==='GF'?3:2;
    check(label+' own fields and disabled state',await evaluate("exportPanel().querySelectorAll('input').length==="+expected+"&&(exportPanel().querySelector('input').value!==''||exportPanel().querySelector('button').disabled)"));
    await evaluate("(()=>{for(const input of exportPanel().querySelectorAll('input')){const label=input.closest('label').querySelector('span').textContent;setInput(input,label==='Период'?'2026-09':label==='Номер файла'?'2':label==='Код СМО'?'19001':'190006');}})()");await pause();
    await evaluate("exportPanel().querySelector('button').click()");await until("exportPanel().querySelector('button').disabled&&exportPanel().querySelector('.MuiCircularProgress-root')");await until("!exportPanel().querySelector('button').disabled");
  }
  const exports=calls.filter(c=>c.path.includes('/export/')&&!c.path.endsWith('/response'));
  check('all six existing export endpoints used',new Set(exports.map(c=>c.path)).size===6);
  check('export parameters unchanged',exports.every(c=>new URLSearchParams(c.search).get('period')==='2026-09')&&exports.find(c=>c.path.endsWith('/gf')).search.includes('fileNumber=2')&&exports.filter(c=>c.path.endsWith('/to-smo')).every(c=>c.search.includes('smoCode=19001')));
  for(const width of [360,768,1920,2560]) {
    await send('Emulation.setDeviceMetricsOverride',{width,height:width===2560?1440:1080,deviceScaleFactor:1,mobile:false});await pause(200);
    check('active export form no page overflow '+width,await evaluate("document.documentElement.scrollWidth<=innerWidth&&exportPanel().getBoundingClientRect().width<=innerWidth&&document.querySelector('[aria-label=\"Формат выгрузки\"]').getBoundingClientRect().width<=innerWidth"));
  }
  await evaluate("exportPanel().scrollIntoView({block:'center'})");await screenshot('healthtrack-export-form');
  mode='empty';await evaluate("button('Обновить').click()");await until("document.body.textContent.includes('Документы не найдены')");check('empty state',true);
  mode='error';await evaluate("button('Обновить').click()");await until("document.body.textContent.includes('Не удалось загрузить документы')");
  check('error is not empty result',await evaluate("!document.body.textContent.includes('Документы не найдены')"));
  mode='data';await evaluate("button('Обновить').click()");await until("rows()[0]?.querySelector('button')");await until("!button('Обновить').disabled");
  await until("!document.body.textContent.includes('Данные обновлены')");await pause(500);delay=1200;
  await evaluate("button('Обновить').click()");await until("document.body.textContent.includes('Обновление документов…')");
  check('background update retains rows and does not report premature success',await evaluate("rows().length===200&&!document.body.textContent.includes('Данные обновлены')"));
  await until("document.body.textContent.includes('Данные обновлены')");delay=0;
  delay=900;
  await evaluate("(async()=>{const {queryClient}=await import('/src/shared/api/client/queryClient.ts');void queryClient.resetQueries({queryKey:['ht','documents']});})()");
  await until("document.querySelector('table[aria-label] .MuiSkeleton-root')");
  check('initial loading uses the same table geometry',await evaluate("document.querySelectorAll('table[aria-label] thead th').length===9&&document.querySelectorAll('table[aria-label] .noneHover').length===10"));
  await until("rows()[0]?.querySelector('button')");delay=0;
  check('no unexpected API requests',unexpected.length===0);
  check('no runtime exceptions',errors.length===0);
  console.log('HEALTHTRACK DOCUMENTS CHECKS COMPLETE');
} finally {ws?.close();chrome.kill();await server.close();}
