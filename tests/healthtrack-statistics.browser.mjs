// node tests/healthtrack-statistics.browser.mjs — actual HealthTrack UI, all API requests intercepted.
import { spawn } from "node:child_process";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const { createServer } = await import(pathToFileURL(join(process.cwd(), "node_modules/vite/dist/node/index.js")));
const server = await createServer({ logLevel: "silent", server: { host: "127.0.0.1", port: 5212, strictPort: true } });
await server.listen();
const profile = await mkdtemp(join(tmpdir(), "ht-statistics-"));
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


  let hold=true,release,mode='ready';
  const calls=[],unexpected=[];
  onRequest=async({requestId,request})=>{
    const url=new URL(request.url),path=url.pathname;
    if(!path.startsWith('/api/'))return send('Fetch.continueRequest',{requestId});
    const reply=(data,status=200)=>send('Fetch.fulfillRequest',{requestId,responseCode:status,responseHeaders:[{name:'Content-Type',value:'application/json'}],body:Buffer.from(JSON.stringify(data)).toString('base64')});
    if(path==='/api/health-track/documents')return reply({items:[],totalCount:0,page:1,pageSize:50,totalPages:1});
    if(path==='/api/health-track/statistics/overview'){
      const params=Object.fromEntries(url.searchParams);calls.push(params);
      if(hold)await new Promise(resolve=>{release=resolve;});
      if(mode==='error')return reply({title:'Тестовая ошибка статистики'},500);
      const data=await evaluate("(async()=>{fixture.setMode("+JSON.stringify(mode==='empty'?'empty':'ready')+");return (await fixture.adapter({url:'health-track/statistics/overview',method:'get',params:"+JSON.stringify(params)+",headers:{}})).data;})()");
      if(mode==='partial')data.topMos=[];
      return reply(data);
    }
    unexpected.push(path);return send('Fetch.failRequest',{requestId,errorReason:'BlockedByClient'});
  };
  await send('Network.enable');await send('Page.enable');await send('Runtime.enable');await send('Page.bringToFront');
  await send('Fetch.enable',{patterns:[{urlPattern:'*/api/*'}]});
  await send('Emulation.setDeviceMetricsOverride',{width:1920,height:1080,deviceScaleFactor:1,mobile:false});
  await send('Page.navigate',{url:'http://127.0.0.1:5212/health-track'});
  await until("document.querySelector('[aria-label=\"Разделы HealthTrack\"] [role=tab]')");
  await evaluate("(async()=>{const {createDocumentsDemoTransport}=await import('/src/modules/healthTrack/demo/transport.ts');window.fixture=createDocumentsDemoTransport();const {queryClient}=await import('/src/shared/api/client/queryClient.ts');window.client=queryClient;})()");
  await evaluate("[...document.querySelectorAll('[role=tab]')].find(e=>e.textContent==='Статистика').click()");
  await until("document.getElementById('ht-statistics-heading')");
  await evaluate(`window.kpi=()=>document.querySelector('[aria-labelledby=ht-statistics-kpi]');
    window.regions=()=>[...document.querySelectorAll('[role=region][aria-label]')];
    window.region=name=>regions().find(e=>e.getAttribute('aria-label')===name);
    window.form=()=>document.querySelector('form[aria-label="Период статистики"]');
    window.inputs=()=>[...form().querySelectorAll('input')];
    window.button=text=>[...document.querySelectorAll('button')].find(e=>e.textContent.trim()===text);
    window.setInput=(index,value)=>{const el=inputs()[index];Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(el,value);el.dispatchEvent(new Event('input',{bubbles:true}));};
    window.values=()=>[...kpi().querySelectorAll('[class*=tileValue]')].map(e=>e.textContent);
  `);
  check('initial loading is not zero statistics',calls.length===1&&!Object.keys(calls[0]).length&&await evaluate("!kpi()&&regions().length===0&&document.body.textContent.includes('Загрузка статистики')"));
  await screenshot('healthtrack-statistics-loading');
  hold=false;release();
  await until("regions().length===4&&!button('Применить').disabled");
  await pause(1200);
  check('six nonzero KPIs and explicit ready-documents label',await evaluate("values().length===6&&values().every(v=>Number(v.replace(/\\s/g,''))>0)&&kpi().textContent.includes('Готово документов')"));
  check('actual response period displayed',await evaluate("document.querySelector('[data-statistics-range]').textContent.includes('2025-11 — 2026-10')"));
  check('all four real Recharts graphs rendered',await evaluate("regions().every(r=>!!r.querySelector('.recharts-wrapper'))"));
  check('donut sectors and complete area are present',await evaluate("region('По возрасту').querySelectorAll('.recharts-pie-sector path').length>=5&&!!region('Динамика по периодам').querySelector('.recharts-area-area')"));
  check('complete DTO arrays shown without slicing',await evaluate("region('Топ-10 МО').querySelectorAll('tbody tr').length===10&&region('Топ-10 диагнозов').querySelectorAll('tbody tr').length===10&&region('Динамика по периодам').querySelectorAll('tbody tr').length===12"));
  await evaluate("region('Топ-10 диагнозов').querySelector('summary').click()");
  check('long diagnosis readable outside tooltip and null name preserved',await evaluate("region('Топ-10 диагнозов').querySelector('details').open&&region('Топ-10 диагнозов').querySelector('tbody').textContent.includes('Демонстрационная длинная расшифровка диагноза')&&region('Топ-10 диагнозов').querySelectorAll('tbody tr')[9].cells[1].textContent==='—'"));
  check('unknown age has no invented suffix',await evaluate("region('По возрасту').textContent.includes('Неизвестно')&&!region('По возрасту').textContent.includes('Неизвестно лет')&&!region('По возрасту').textContent.includes('До 18 лет')"));
  await evaluate("region('Топ-10 диагнозов').querySelector('summary').click()");
  for(const width of [360,768,1024,1920,2560]){
    await send('Emulation.setDeviceMetricsOverride',{width,height:width===2560?1440:1080,deviceScaleFactor:1,mobile:false});await pause(350);
    check('no page or chart horizontal overflow '+width,await evaluate("document.documentElement.scrollWidth<=innerWidth&&regions().every(r=>r.scrollWidth<=r.clientWidth+1)"));
    const columns=await evaluate("getComputedStyle(kpi().querySelector('[class*=kpiRoot]')).gridTemplateColumns.split(' ').length");
    check('container-based KPI grid '+width,columns===(width>=1920?6:width===360?2:3));
    check('analytics column count '+width,await evaluate("getComputedStyle(region('Топ-10 МО').parentElement).gridTemplateColumns.split(' ').length==="+(width>=1920?2:1)));
    await evaluate("window.scrollTo(0,0)");await screenshot('healthtrack-statistics-'+width);
    if(width===360){
      await evaluate("region('Топ-10 диагнозов').querySelector('summary').click();region('Топ-10 диагнозов').scrollIntoView()");await pause(200);
      check('expanded full diagnoses stay inside narrow surface',await evaluate("document.documentElement.scrollWidth<=innerWidth&&region('Топ-10 диагнозов').querySelector('details').open"));
      await screenshot('healthtrack-statistics-diagnoses-mobile');
      await evaluate("region('Топ-10 диагнозов').querySelector('summary').click()");
    }
  }
  await send('Emulation.setDeviceMetricsOverride',{width:1440,height:1080,deviceScaleFactor:1,mobile:false});
  const before=calls.length;
  await evaluate("setInput(0,'2026-13');setInput(1,'')");
  await pause(250);check('draft does not fetch',calls.length===before);
  await evaluate("button('Применить').click()");await until("form().querySelector('[role=alert]')");
  check('month 13 rejected without request',calls.length===before);
  await evaluate("setInput(0,'2026-00');button('Применить').click()");await pause();
  check('month 00 rejected without request',calls.length===before);
  await evaluate("setInput(0,' 2026-10 ');setInput(1,'2026-01');button('Применить').click()");
  await until("form().textContent.includes('«От» не может быть позже «до»')");
  check('normalized reversed range rejected',calls.length===before);
  const press=async(key,code,vk)=>{for(const type of ['keyDown','keyUp'])await send('Input.dispatchKeyEvent',{type,key,code,windowsVirtualKeyCode:vk,...(key==='Enter'&&type==='keyDown'?{text:'\r'}:{})});};
  await evaluate("setInput(0,' 2026-01 ');setInput(1,' 2026-03 ');inputs()[0].focus()");
  hold=true;await press('Enter','Enter',13);await until("document.body.textContent.includes('Загрузка статистики за выбранный период')");
  check('new range hides old data and range label',await evaluate("!kpi()&&regions().length===0&&!document.querySelector('[data-statistics-range]')")&&calls.at(-1).periodFrom==='2026-01'&&calls.at(-1).periodTo==='2026-03');
  hold=false;release();await until("kpi()&&!button('Применить').disabled");
  check('filtered fixture updates all blocks together',await evaluate("document.querySelector('[data-statistics-range]').textContent.includes('2026-01 — 2026-03')&&region('Динамика по периодам').querySelectorAll('tbody tr').length===3&&values()[0].replace(/\\s/g,'')==='360'"));
  const oldValues=await evaluate("JSON.stringify(values())");
  hold=true;await evaluate("void client.invalidateQueries({queryKey:['ht','statistics','overview']})");
  await until("document.body.textContent.includes('Обновление статистики')");
  check('same-range background refresh keeps labelled data',await evaluate("JSON.stringify(values())")==oldValues&&await evaluate("regions().length===4&&document.querySelector('[data-statistics-range]').textContent.includes('2026-01 — 2026-03')"));
  hold=false;release();await until("!button('Применить').disabled");
  await evaluate("setInput(0,'');setInput(1,'2026-01');button('Применить').click()");
  await until("!button('Применить').disabled&&document.querySelector('[data-statistics-range]').textContent.includes('2026-01')");
  check('optional from bound preserved',!calls.at(-1).periodFrom&&calls.at(-1).periodTo==='2026-01');
  await evaluate("setInput(0,'2026-04');setInput(1,'2026-04');button('Применить').click()");
  await until("kpi()&&!button('Применить').disabled");
  check('real zero values are not errors',await evaluate("values().every(v=>v==='0')&&!document.querySelector('[role=alert]')&&region('Динамика по периодам').querySelector('tbody').textContent.includes('2026-04')"));
  check('zero age distribution differs from an empty array',await evaluate("region('По возрасту').textContent.includes('0 пациентов.')&&!region('По возрасту').textContent.includes('Нет данных')"));
  await screenshot('healthtrack-statistics-zero');
  await evaluate("button('Сбросить').click()");await until("kpi()&&!button('Применить').disabled");
  check('reset clears both bounds and restores full snapshot',await evaluate("inputs().every(el=>el.value==='')&&document.querySelector('[data-statistics-range]').textContent.includes('2025-11 — 2026-10')"));
  mode='partial';await evaluate("void client.invalidateQueries({queryKey:['ht','statistics','overview']})");await until("region('Топ-10 МО').textContent.includes('Нет данных')&&!button('Применить').disabled");
  check('empty block stays naturally shorter than filled neighbor',await evaluate("region('Топ-10 МО').getBoundingClientRect().height<240&&region('Топ-10 диагнозов').getBoundingClientRect().height>region('Топ-10 МО').getBoundingClientRect().height"));
  mode='empty';await evaluate("void client.invalidateQueries({queryKey:['ht','statistics','overview']})");await until("regions().every(r=>r.textContent.includes('Нет данных'))&&!button('Применить').disabled");
  check('empty arrays retain truthful zero KPIs and compact blocks',await evaluate("values().every(v=>v==='0')&&regions().every(r=>r.getBoundingClientRect().height<240)"));
  await screenshot('healthtrack-statistics-empty');
  mode='error';await evaluate("void client.invalidateQueries({queryKey:['ht','statistics','overview']})");await until("document.querySelector('[role=alert]')?.textContent.includes('Тестовая ошибка статистики')");
  check('API error never masquerades as zeros',await evaluate("!kpi()&&regions().length===0&&!!button('Повторить')"));
  await screenshot('healthtrack-statistics-error');
  mode='ready';await evaluate("button('Повторить').click()");await until("regions().length===4&&!button('Применить').disabled");
  check('retry restores populated dashboard',true);
  check('no unexpected API and runtime errors',unexpected.length===0&&errors.length===0);
  await send('Emulation.setDeviceMetricsOverride',{width:1920,height:2200,deviceScaleFactor:1,mobile:false});
  await until("region('Топ-10 МО').querySelector('.recharts-bar-rectangle')&&region('Топ-10 диагнозов').querySelector('.recharts-bar-rectangle')&&region('Динамика по периодам').querySelector('.recharts-area-area')&&region('По возрасту').querySelector('.recharts-pie-sector path')");
  await pause(300);
  await evaluate('window.scrollTo(0,0)');
  const height=await evaluate("Math.ceil(region('По возрасту').parentElement.getBoundingClientRect().bottom+32)");
  const full=await send('Page.captureScreenshot',{format:'png',clip:{x:0,y:0,width:1920,height,scale:1}});
  await writeFile(join(profile,'healthtrack-statistics-full.png'),Buffer.from(full.data,'base64'));console.log('SCREENSHOT '+join(profile,'healthtrack-statistics-full.png'));
  const callsBeforeDemo=calls.length;
  await send('Page.navigate',{url:'http://127.0.0.1:5212/health-track?demoWorkspace=1'});
  await until("document.querySelector('iframe')?.contentDocument?.querySelector('[role=tab]')");
  await evaluate("window.w=()=>document.querySelector('iframe').contentWindow;window.d=()=>w().document;window.db=text=>[...d().querySelectorAll('button')].find(e=>e.textContent.trim()===text);db('Статистика').click()");
  await until("d().querySelectorAll('[role=region] .recharts-wrapper').length===4");
  check('actual preview is populated without real API requests',calls.length===callsBeforeDemo);
  await evaluate("(()=>{const inputs=d().querySelectorAll('form[aria-label=\"Период статистики\"] input');for(const input of inputs){Object.getOwnPropertyDescriptor(w().HTMLInputElement.prototype,'value').set.call(input,'2026-04');input.dispatchEvent(new (w().Event)('input',{bubbles:true}));}db('Применить').click();})()");
  await until("d().querySelector('[data-statistics-range]')?.textContent.includes('2026-04 — 2026-04')&&!db('Применить').disabled");
  check('preview filter reaches coherent zero fixture',await evaluate("[...d().querySelectorAll('[class*=tileValue]')].every(el=>el.textContent==='0')")&&calls.length===callsBeforeDemo);
  console.log('HEALTHTRACK STATISTICS CHECKS COMPLETE');
}finally{ws?.close();chrome.kill();await server.close();}
