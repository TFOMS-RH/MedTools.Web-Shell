// node tests/healthtrack-document-drawer.browser.mjs — actual HealthTrack UI, all API requests intercepted.
import { spawn } from "node:child_process";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const { createServer } = await import(pathToFileURL(join(process.cwd(), "node_modules/vite/dist/node/index.js")));
const server = await createServer({ logLevel: "silent", server: { host: "127.0.0.1", port: 5207, strictPort: true } });
await server.listen();
const profile = await mkdtemp(join(tmpdir(), "ht-document-drawer-"));
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
    console.log(JSON.stringify(errors));
    await screenshot("timeout");
    throw Error("Timeout " + expression);
  };
  const screenshot = async name => {
    const { data } = await send("Page.captureScreenshot", { format: "png" });
    const path = join(profile, name + ".png"); await writeFile(path, Buffer.from(data, "base64")); console.log("SCREENSHOT " + path);
  };


  let detailMode='ready',auditMode='ready',auditDelay=0;
  const checked=new Set(),calls=[],unexpected=[];
  const fixture=id=>({id,fileName:'DEMO_'+id+'_'+(id===3?'Очень_длинное_имя_файла_без_обрезания_значимых_данных_'.repeat(9):'документ_для_просмотра_')+'.xml',
    fileType:id===4?'GST':id===2||id===3?'PROF':'DSPN',status:checked.has(id)?'Ready':id===2?'Ready':id===3?'Error':'Uploaded',
    period:'2026-09',hospitalCode:id===5?null:'990001',regionCode:id===5?null:'99',recordsCount:id===5?null:id===2?0:123456,
    isValid:id!==3,uploadedBy:id===5?'':'demo.operator@example.invalid',uploadDate:'2026-10-01T10:00:00Z',
    checkedAt:checked.has(id)?'2026-10-02T11:00:00Z':null,checkedBy:checked.has(id)?'Демонстрационный оператор':null,checkAttempts:checked.has(id)?1:0,
    validationErrors:id===3?('Демонстрационное сообщение о проверке без персональных данных. '+ 'КОД_'.repeat(40)+'\n').repeat(40):null});
  const audit=()=>[3,2,1].map(i=>({id:i,createdAt:'2026-10-0'+i+'T10:00:00Z',userName:'demo.operator@example.invalid',userRole:i===2?null:'Demo',
    actionType:i===1?'IMPORT':'CHECK',actionDetail:'Событие '+i+' — '+('Описание действия без персональных данных. ').repeat(i===2?8:1),
    result:i===2?'ERROR':'SUCCESS',errorMessage:i===2?'Демонстрационная ошибка проверки':null}));
  const reply=(requestId,data,status=200)=>send('Fetch.fulfillRequest',{requestId,responseCode:status,responseHeaders:[{name:'Content-Type',value:'application/json'}],body:Buffer.from(JSON.stringify(data)).toString('base64')});
  onRequest=async({requestId,request})=>{
    const path=new URL(request.url).pathname;
    if(!path.startsWith('/api/'))return send('Fetch.continueRequest',{requestId});
    calls.push({path,method:request.method});
    if(path==='/api/health-track/documents')return reply(requestId,{items:[1,2,3,4,5].map(fixture),totalCount:5,page:1,pageSize:50,totalPages:1});
    if(path.endsWith('/audit')){if(auditDelay)await pause(auditDelay);return reply(requestId,auditMode==='error'?{title:'Ошибка истории'}:auditMode==='empty'?[]:audit(),auditMode==='error'?500:200);}
    const match=path.match(/\/documents\/(\d+)$/);
    if(match){if(detailMode==='loading')await pause(900);return reply(requestId,detailMode==='error'?{title:'Ошибка документа'}:fixture(Number(match[1])),detailMode==='error'?500:200);}
    if(path.endsWith('/check')){await pause(700);checked.add(Number(path.split('/').at(-2)));return reply(requestId,{documentId:1,isSuccess:true,recordsCount:123456,approvedCount:123456,rejectedCount:0,checkedAt:'2026-10-02T11:00:00Z',errors:[]});}
    if(path.includes('/export/'))return send('Fetch.fulfillRequest',{requestId,responseCode:200,responseHeaders:[{name:'Content-Type',value:'application/zip'}],body:Buffer.from('DEMO').toString('base64')});
    unexpected.push(path);return send('Fetch.failRequest',{requestId,errorReason:'BlockedByClient'});
  };
  await send('Network.enable');await send('Page.enable');await send('Runtime.enable');await send('Page.bringToFront');
  await send('Fetch.enable',{patterns:[{urlPattern:'*/api/*'}]});
  await send('Emulation.setDeviceMetricsOverride',{width:1920,height:1080,deviceScaleFactor:1,mobile:false});
  await send('Page.navigate',{url:'http://127.0.0.1:5207/health-track'});
  await until("document.body.textContent.includes('Документы и экспорт')");
  await evaluate("(async()=>{const {useAuthStore}=await import('/src/modules/auth/stores/authStore.ts');useAuthStore.setState({permissions:['healthtrack.documents.read','healthtrack.documents.check','healthtrack.documents.delete','healthtrack.export.aggregated'],organizationCode:'19000'});})()");
  await until("document.querySelector('table tbody button')");
  await evaluate("window.paper=()=>document.querySelector('.MuiDrawer-paper');window.tab=text=>[...paper().querySelectorAll('[role=tab]')].find(e=>e.textContent.startsWith(text));window.action=text=>[...paper().querySelectorAll('footer button')].find(e=>e.textContent===text);window.scrollArea=()=>paper().querySelector('[class*=scrollArea_]');");
  const open=async id=>{await evaluate("[...document.querySelectorAll('table tbody button')].find(e=>e.getAttribute('aria-label')==="+JSON.stringify('Открыть документ '+fixture(id).fileName)+").click()");await until("paper()");await pause(300);};
  const close=async()=>{await evaluate("paper().querySelector('[aria-label=\"Закрыть документ\"]').click()");await until("!paper()");};
  await open(1);await until("paper().querySelector('[role=tabpanel]')");
  check('all existing field labels retained',await evaluate("['Период','Код МО','Регион','Загрузил','Дата загрузки','Проверил','Дата проверки','Попыток проверки','Валиден','Всего'].every(text=>[...paper().querySelectorAll('dt')].some(e=>e.textContent===text))"));
  check('plain document type, semantic status and named dialog',await evaluate("paper().getAttribute('role')==='dialog'&&paper().getAttribute('aria-labelledby')===paper().querySelector('h2').id&&paper().textContent.includes('Тип документа: DSPN')&&paper().textContent.includes('Загружен')"));
  const primaryStyles=await evaluate("(()=>{const props=['backgroundColor','color','borderRadius','fontSize','minHeight'];const find=[...document.querySelectorAll('form button')].find(e=>e.textContent==='Найти');return props.map(p=>[getComputedStyle(find)[p],getComputedStyle(action('Проверить'))[p]]);})()");
  check('check uses exactly the existing primary button style',primaryStyles.every(([a,b])=>a===b));
  await screenshot('drawer-details');
  await evaluate("tab('История').click()");await until("paper().querySelector('ol li')");
  check('audit keeps API order, fields and errors',await evaluate("[...paper().querySelectorAll('ol li')].map(e=>e.querySelector('time').dateTime).join(',')==='2026-10-03T10:00:00Z,2026-10-02T10:00:00Z,2026-10-01T10:00:00Z'&&paper().textContent.includes('Демонстрационная ошибка проверки')&&paper().textContent.includes('demo.operator@example.invalid')"));
  check('history has no action footer',await evaluate("!paper().querySelector('footer')"));await screenshot('drawer-history');
  await evaluate("tab('Детали').focus()");
  for(const type of ['keyDown','keyUp'])await send('Input.dispatchKeyEvent',{type,key:'Enter',code:'Enter',windowsVirtualKeyCode:13,...(type==='keyDown'?{text:'\r'}:{})});
  await until("tab('Детали').getAttribute('aria-selected')==='true'");
  check('tabs are linked to active panel',await evaluate("paper().querySelector('[role=tabpanel]').getAttribute('aria-labelledby')===tab('Детали').id"));
  await evaluate("action('Проверить').focus()");
  for(const type of ['keyDown','keyUp'])await send('Input.dispatchKeyEvent',{type,key:'Enter',code:'Enter',windowsVirtualKeyCode:13,...(type==='keyDown'?{text:'\r'}:{})});
  await until("action('Проверить')?.disabled&&action('Проверить').querySelector('.MuiCircularProgress-root')");check('check loading and disabled visible',true);
  check('disabled primary style matches the registry',await evaluate("getComputedStyle(action('Проверить')).opacity===getComputedStyle([...document.querySelectorAll('form button')].find(e=>e.textContent==='Найти')).opacity"));
  await until("action('Скачать ответ')");check('check handler preserved and dependent action updates',calls.some(c=>c.path.endsWith('/1/check')&&c.method==='POST'));
  await close();
  auditMode='empty';await open(2);await until("action('Скачать ответ')");
  check('zero records remain zero',await evaluate("[...paper().querySelectorAll('dt')].find(e=>e.textContent==='Всего').nextElementSibling.textContent==='0'"));
  await evaluate("tab('История').click()");await until("paper().textContent.includes('Истории пока нет')");check('empty history',true);await close();
  await pause(4500);
  auditMode='error';await open(3);await until("action('Скачать ответ')");
  for(const [width,height] of [[360,740],[768,900],[1920,1080],[2560,1440]]){
    await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});await pause(150);
    const geometry=await evaluate("(()=>{const p=paper(),s=scrollArea(),footer=p.querySelector('footer');s.scrollTop=s.scrollHeight;const r=footer.getBoundingClientRect();return{overflow:p.scrollWidth>p.clientWidth||document.documentElement.scrollWidth>innerWidth||p.getBoundingClientRect().right>innerWidth+1||p.getBoundingClientRect().left<0,scrollers:[...p.querySelectorAll('*')].filter(e=>['auto','scroll'].includes(getComputedStyle(e).overflowY)&&e.scrollHeight>e.clientHeight+1).length,footer:r.bottom<=innerHeight+1&&r.top>=0,clear:s.getBoundingClientRect().bottom<=r.top+1,name:p.querySelector('h2').scrollWidth<=p.querySelector('h2').clientWidth,fullName:p.querySelector('h2').textContent.length>400,pre:getComputedStyle(p.querySelector('pre')).maxHeight==='none'};})()");
    check('long filename, validation and single scroll '+width,!geometry.overflow&&geometry.scrollers===1&&geometry.footer&&geometry.clear&&geometry.name&&geometry.fullName&&geometry.pre);
    await evaluate("scrollArea().scrollTop=0");await screenshot('drawer-long-'+width);
  }
  await evaluate("tab('История').click()");await until("paper().textContent.includes('Не удалось загрузить историю документа')");check('independent audit error',true);await close();
  detailMode='error';await open(4);await until("paper().textContent.includes('Не удалось загрузить детали документа')");
  check('details error hides actions',await evaluate("!paper().querySelector('footer')"));await close();
  detailMode='loading';auditMode='ready';auditDelay=1600;await open(5);await until("paper().textContent.includes('Загрузка…')");check('initial loading',true);
  await until("paper().querySelector('[role=tabpanel]')");
  check('missing values use dashes and preserve fields',await evaluate("[...paper().querySelectorAll('dt')].filter(e=>['Код МО','Регион','Загрузил','Проверил','Дата проверки','Всего'].includes(e.textContent)).every(e=>e.nextElementSibling.textContent==='—')"));
  await evaluate("tab('История').click()");await until("paper().textContent.includes('Загрузка истории…')");await until("paper().querySelector('ol li')");check('independent history loading',true);
  await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
  await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});await until("!paper()");
  check('Escape closes and restores body scrolling',await evaluate("document.body.style.overflow!=='hidden'"));
  check('no unexpected API calls',unexpected.length===0);check('no runtime exceptions',errors.length===0);
  console.log('HEALTHTRACK DRAWER CHECKS COMPLETE');
}finally{ws?.close();chrome.kill();await server.close();}
