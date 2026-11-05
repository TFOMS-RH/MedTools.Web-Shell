// node tests/healthtrack-register-dn.browser.mjs — actual HealthTrack UI, all API requests intercepted.
import { spawn } from "node:child_process";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const { createServer } = await import(pathToFileURL(join(process.cwd(), "node_modules/vite/dist/node/index.js")));
const server = await createServer({ logLevel: "silent", server: { host: "127.0.0.1", port: 5210, strictPort: true } });
await server.listen();
const profile = await mkdtemp(join(tmpdir(), "ht-register-"));
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
    const result = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true, userGesture: true });
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


  const patients=Array.from({length:103},(_,index)=>({
    enp:String(9900000000000000n+BigInt(index)),fam:'Демонстрационный',im:'Пациент',ot:null,
    fullName:index===0?'Демонстрационный пациент с намеренно длинным именем '.repeat(7):'Пациент '+(index+1),
    birthDate:index===0?null:'1980-01-15',gender:index%2?'2':'1',episodesCount:0,sources:'GF',lastDnInDate:null
  }));
  let mode='ready', hold=true, release;
  const calls=[],details=[],unexpected=[];
  onRequest=async({requestId,request})=>{
    const url=new URL(request.url),path=url.pathname;
    if(!path.startsWith('/api/'))return send('Fetch.continueRequest',{requestId});
    const reply=(data,status=200)=>send('Fetch.fulfillRequest',{requestId,responseCode:status,responseHeaders:[{name:'Content-Type',value:'application/json'}],body:Buffer.from(JSON.stringify(data)).toString('base64')});
    if(path==='/api/health-track/register-dn'){
      const params=Object.fromEntries(url.searchParams);
      calls.push(params);
      if(hold)await new Promise(resolve=>{release=resolve;});
      if(mode==='error')return reply({title:'Демонстрационная ошибка регистра'},500);
      if(mode==='forbidden')return reply({title:'Forbidden'},403);
      const page=Number(params.page||1),pageSize=Number(params.pageSize||50);
      const items=mode==='empty'||params.searchQuery==='нет результатов'?[]:patients;
      const totalPages=Math.max(1,Math.ceil(items.length/pageSize));
      return reply({items:items.slice((page-1)*pageSize,page*pageSize),totalCount:items.length,totalPages,page,pageSize,hasPrevious:page>1,hasNext:page<totalPages});
    }
    if(path.startsWith('/api/health-track/register-dn/')){
      const enp=path.split('/').pop();details.push(enp);
      const item=patients.find(p=>p.enp===enp);
      return reply({...item,snils:null,smo:null,spolis:null,npolis:null,vpolis:null,adres:null,tel:null,episodes:[],gfRecords:[]});
    }
    if(path==='/api/health-track/documents')return reply({items:[],totalCount:0,page:1,pageSize:50,totalPages:1});
    unexpected.push(path);return send('Fetch.failRequest',{requestId,errorReason:'BlockedByClient'});
  };
  await send('Network.enable');await send('Page.enable');await send('Runtime.enable');await send('Page.bringToFront');
  await send('Fetch.enable',{patterns:[{urlPattern:'*/api/*'}]});
  await send('Emulation.setDeviceMetricsOverride',{width:1920,height:1080,deviceScaleFactor:1,mobile:false});
  await send('Page.navigate',{url:'http://127.0.0.1:5210/health-track'});
  await until("document.querySelector('[aria-label=\"Разделы HealthTrack\"] [role=tab]')");
  await evaluate("[...document.querySelectorAll('[role=tab]')].find(e=>e.textContent==='Регистр ДН').click()");
  await until("document.querySelector('table[aria-label=\"Пациенты регистра ДН\"]')");
  await evaluate(`window.table=()=>document.querySelector('table[aria-label="Пациенты регистра ДН"]');
    window.rows=()=>[...(table()?.querySelectorAll('tbody tr')??[])];
    window.button=text=>[...document.querySelectorAll('button')].find(e=>e.textContent.trim()===text);
    window.nameButtons=()=>[...(table()?.querySelectorAll('tbody button[aria-label]')??[])];
    window.setInput=(id,value)=>{const element=document.getElementById(id);Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(element,value);element.dispatchEvent(new Event('input',{bubbles:true}));};
    window.setSelect=(element,value)=>{Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,'value').set.call(element,value);element.dispatchEvent(new Event('change',{bubbles:true}));};
    window.closeDrawer=()=>document.querySelector('.MuiDrawer-paper header button').click();
  `);
  check('initial query and four-column skeleton',calls.length===1&&calls[0].page==='1'&&calls[0].pageSize==='50'&&calls[0].sortBy==='fullName'&&calls[0].sortDirection==='asc'&&await evaluate("table().querySelectorAll('th').length===4&&rows().length===10&&rows().every(row=>row.cells.length===4)&&!!table().querySelector('.MuiSkeleton-root')"));
  await screenshot('healthtrack-register-loading');
  hold=false;release();await until("nameButtons().length===50");
  check('initial count and existing null/date/gender formatting',await evaluate("document.body.textContent.includes('Найдено пациентов: 103')&&rows()[0].cells[2].textContent==='—'&&rows()[1].cells[2].textContent==='15.01.1980'&&rows()[0].cells[3].textContent==='Мужской'"));
  const press=async(key,code,vk)=>{for(const type of ['keyDown','keyUp'])await send('Input.dispatchKeyEvent',{type,key,code,windowsVirtualKeyCode:vk,...(key==='Enter'&&type==='keyDown'?{text:'\r'}:{})});};
  await evaluate("rows()[0].cells[0].click()");await until("document.querySelector('.MuiDrawer-paper')?.textContent.includes('Карточка пациента')");
  check('row click uses exact ENP',details.length===1&&details[0]===patients[0].enp);
  await evaluate("closeDrawer()");await until("!document.querySelector('.MuiDrawer-root')");
  await evaluate("nameButtons()[1].click()");await until("document.querySelector('.MuiDrawer-paper')?.textContent.includes('Карточка пациента')");
  check('name button opens one drawer and one request',details.length===2&&details[1]===patients[1].enp&&await evaluate("document.querySelectorAll('.MuiDrawer-root').length===1"));
  await evaluate("closeDrawer()");await until("!document.querySelector('.MuiDrawer-root')");
  await evaluate("nameButtons()[2].focus()");await press('Enter','Enter',13);
  await until("document.querySelector('.MuiDrawer-paper')?.textContent.includes('Карточка пациента')");
  check('Enter opens patient',details.at(-1)===patients[2].enp);
  await evaluate("closeDrawer()");await until("!document.querySelector('.MuiDrawer-root')");
  await evaluate("nameButtons()[3].focus()");await press(' ','Space',32);
  await until("document.querySelector('.MuiDrawer-paper')?.textContent.includes('Карточка пациента')");
  check('Space opens patient',details.at(-1)===patients[3].enp);
  await evaluate("closeDrawer()");await until("!document.querySelector('.MuiDrawer-root')");
  await evaluate("document.querySelector('[aria-label=\"Следующая страница\"]').click()");
  await until("nameButtons()[0]?.textContent.trim()==='Пациент 51'");
  check('server page 2',calls.at(-1).page==='2');
  const beforeDraft=calls.length;
  await evaluate("setInput('ht-register-search','  Поиск  ');setInput('ht-register-mo',' 990001 ');setInput('ht-register-diagnosis',' I10 ');setInput('ht-register-period',' 2026-09 ');setSelect(document.getElementById('ht-register-status'),'active')");
  await pause(300);check('draft fields do not fetch automatically',calls.length===beforeDraft);
  hold=true;await evaluate("button('Найти').click()");
  await until("table().querySelector('.MuiSkeleton-root')");
  check('placeholder old rows unavailable and count unknown',await evaluate("nameButtons().length===0&&document.body.textContent.includes('Обновление результатов')&&document.body.textContent.includes('Найдено пациентов: —')"));
  check('trimmed params and page reset unchanged',calls.at(-1).page==='1'&&calls.at(-1).searchQuery==='Поиск'&&calls.at(-1).hospitalCode==='990001'&&calls.at(-1).diagCode==='I10'&&calls.at(-1).period==='2026-09'&&calls.at(-1).status==='active');
  hold=false;release();await until("nameButtons().length===50");
  await evaluate("setInput('ht-register-search','нет результатов');document.getElementById('ht-register-search').focus()");
  await press('Enter','Enter',13);await until("table().textContent.includes('Пациенты не найдены')");
  check('Enter applies filter and filtered empty offers reset',calls.at(-1).searchQuery==='нет результатов'&&await evaluate("!!button('Сбросить фильтры')"));
  await screenshot('healthtrack-register-filtered-empty');
  await evaluate("(async()=>{const {queryClient}=await import('/src/shared/api/client/queryClient.ts');window.client=queryClient;})()");
  await evaluate("void client.invalidateQueries({queryKey:['ht','register-dn','list'],refetchType:'none'})");
  await evaluate("button('Сбросить фильтры').click()");await until("nameButtons().length===50");
  check('reset clears both states without changing size',!calls.at(-1).searchQuery&&!calls.at(-1).hospitalCode&&!calls.at(-1).diagCode&&!calls.at(-1).period&&!calls.at(-1).status&&calls.at(-1).page==='1'&&calls.at(-1).pageSize==='50'&&await evaluate("document.getElementById('ht-register-search').value===''"));
  for(const size of [25,100,200,50]){
    await evaluate("setSelect(document.querySelector('[aria-label=\"Количество пациентов на странице\"]'),'"+size+"')");
    await until("nameButtons().length==="+Math.min(size,patients.length));
    check('server page size '+size,calls.some(params=>params.pageSize===String(size)&&params.page==='1')&&await evaluate("document.querySelector('[aria-label=\"Количество пациентов на странице\"]').value==='"+size+"'&&document.querySelector('[aria-current=page]').textContent.trim()==='1'"));
  }
  await evaluate("(async()=>{const {queryClient}=await import('/src/shared/api/client/queryClient.ts');window.client=queryClient;})()");
  hold=true;await evaluate("void client.invalidateQueries({queryKey:['ht','register-dn','list']})");
  await until("nameButtons()[0]?.disabled");
  const beforeBlocked=details.length;
  await evaluate("rows()[4].cells[0].click();nameButtons()[4].click()");await pause();
  check('same-query refresh visible and old rows blocked',details.length===beforeBlocked&&await evaluate("document.body.textContent.includes('Обновление результатов')&&nameButtons().every(b=>b.disabled)"));
  hold=false;release();await until("!nameButtons()[0]?.disabled");
  for(const width of [360,768,1024,1920,2560]){
    await send('Emulation.setDeviceMetricsOverride',{width,height:width===2560?1440:1080,deviceScaleFactor:1,mobile:false});await pause(250);
    check('local scrolling and no page overflow '+width,await evaluate("document.documentElement.scrollWidth<=innerWidth&&table().closest('[role=region]').clientWidth<=innerWidth"));
    check('long name wraps and ENP stays complete '+width,await evaluate("getComputedStyle(nameButtons()[0]).whiteSpace!=='nowrap'&&rows()[0].cells[0].textContent.trim()==='"+patients[0].enp+"'"));
    await evaluate("window.scrollTo(0,0)");await screenshot('healthtrack-register-'+width);
  }
  await send('Emulation.setDeviceMetricsOverride',{width:1440,height:1080,deviceScaleFactor:1,mobile:false});
  await evaluate("nameButtons()[0].focus()");await press('Tab','Tab',9);await press('Tab','Tab',9); 
  check('keyboard focus remains visible',await evaluate("getComputedStyle(document.activeElement).outlineWidth==='2px'"));
  mode='empty';await evaluate("void client.invalidateQueries({queryKey:['ht','register-dn','list']})");
  await until("table().textContent.includes('Регистр ДН пуст')");
  check('unfiltered empty has no reset action',await evaluate("!button('Сбросить фильтры')"));
  mode='error';await evaluate("void client.invalidateQueries({queryKey:['ht','register-dn','list']})");
  await until("document.querySelector('[role=alert]')?.textContent.includes('Демонстрационная ошибка регистра')");
  check('error never becomes empty and retry available',await evaluate("!table()&&!!button('Повторить')&&!document.body.textContent.includes('Регистр ДН пуст')"));
  await screenshot('healthtrack-register-error');
  mode='ready';await evaluate("button('Повторить').click()");await until("nameButtons().length===50");
  check('retry restores list',true);
  mode='forbidden';await evaluate("void client.invalidateQueries({queryKey:['ht','register-dn','list']})");
  await until("document.querySelector('[role=alert]')?.textContent.includes('Нет доступа к регистру ДН')");
  check('403 is distinct without invented permissions',await evaluate("!table()&&!document.body.textContent.includes('Пациенты не найдены')"));
  check('no unexpected API and no runtime errors',unexpected.length===0&&errors.length===0);
  const beforeDemo=calls.length, detailsBeforeDemo=details.length;
  await send('Page.navigate',{url:'http://127.0.0.1:5210/health-track?demoWorkspace=1'});
  await until("document.querySelector('iframe')?.contentDocument?.querySelector('[role=tab]')");
  await evaluate("window.w=()=>document.querySelector('iframe').contentWindow;window.d=()=>w().document;window.db=text=>[...d().querySelectorAll('button')].find(e=>e.textContent.trim()===text);db('Регистр ДН').click()");
  await until("d().querySelectorAll('table[aria-label=\"Пациенты регистра ДН\"] tbody button').length===50");
  check('preview uses actual register and local patients',calls.length===beforeDemo&&await evaluate("d().body.textContent.includes('Найдено пациентов: 103')"));
  await evaluate("d().querySelector('table[aria-label=\"Пациенты регистра ДН\"] tbody button').click()");
  await until("d().querySelector('.MuiDrawer-paper')?.textContent.includes('Демонстрационный')");
  check('unchanged drawer works with isolated preview data',details.length===detailsBeforeDemo);
  await evaluate("d().querySelector('.MuiDrawer-paper header button').click()");
  await until("!d().querySelector('.MuiDrawer-root')");
  await evaluate("window.modeControl=()=>[...d().querySelectorAll('aside label')].find(e=>e.textContent.startsWith('Состояние списка')).querySelector('select');window.demoMode=value=>{const element=modeControl();Object.getOwnPropertyDescriptor(w().HTMLSelectElement.prototype,'value').set.call(element,value);element.dispatchEvent(new (w().Event)('change',{bubbles:true}));};demoMode('empty')");
  await until("d().body.textContent.includes('Регистр ДН пуст')");
  check('preview empty is reproducible',true);
  await evaluate("demoMode('error')");
  await until("d().querySelector('[role=alert]')?.textContent.includes('Демонстрационная ошибка загрузки регистра ДН')");
  check('preview error stays local',calls.length===beforeDemo);
  await evaluate("demoMode('loading')");
  await until("d().querySelector('table[aria-label=\"Пациенты регистра ДН\"] .MuiSkeleton-root')");
  await until("d().querySelectorAll('table[aria-label=\"Пациенты регистра ДН\"] tbody button').length===50");
  await screenshot('healthtrack-register-preview');
  check('preview loading resolves and no runtime errors',errors.length===0);
  console.log('HEALTHTRACK REGISTER CHECKS COMPLETE');
} finally {ws?.close();chrome.kill();await server.close();}
