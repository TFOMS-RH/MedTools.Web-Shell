// node tests/healthtrack-register-drawer.browser.mjs — actual HealthTrack UI, all API requests intercepted.
import { spawn } from "node:child_process";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const { createServer } = await import(pathToFileURL(join(process.cwd(), "node_modules/vite/dist/node/index.js")));
const server = await createServer({ logLevel: "silent", server: { host: "127.0.0.1", port: 5211, strictPort: true } });
await server.listen();
const profile = await mkdtemp(join(tmpdir(), "ht-register-drawer-"));
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


  let sample, mode='ready', hold=true, release;
  const requested=[],unexpected=[];
  const patients=[0,1].map(index=>({enp:String(9900000000000000n+BigInt(index)),fam:'Демонстрационный',im:'Пациент',ot:null,fullName:'Демонстрационный пациент '+index,birthDate:null,gender:null,episodesCount:0,sources:'GF',lastDnInDate:null}));
  onRequest=async({requestId,request})=>{
    const path=new URL(request.url).pathname;
    if(!path.startsWith('/api/'))return send('Fetch.continueRequest',{requestId});
    const reply=(data,status=200)=>send('Fetch.fulfillRequest',{requestId,responseCode:status,responseHeaders:[{name:'Content-Type',value:'application/json'}],body:Buffer.from(JSON.stringify(data)).toString('base64')});
    if(path==='/api/health-track/documents')return reply({items:[],totalCount:0,page:1,pageSize:50,totalPages:1});
    if(path==='/api/health-track/register-dn')return reply({items:patients,totalCount:2,page:1,pageSize:50,totalPages:1});
    if(path.startsWith('/api/health-track/register-dn/')){
      const enp=path.split('/').pop();requested.push(enp);
      if(hold)await new Promise(resolve=>{release=resolve;});
      if(mode==='error')return reply({title:'Тестовая ошибка получения пациента'},500);
      if(mode==='missing')return reply({title:'Пациент не найден'},404);
      if(mode==='empty')return reply(null);
      return reply(enp===patients[0].enp?sample:{...patients[1],snils:null,smo:null,spolis:null,npolis:null,vpolis:null,adres:null,tel:null,episodes:[],gfRecords:[]});
    }
    unexpected.push(path);return send('Fetch.failRequest',{requestId,errorReason:'BlockedByClient'});
  };
  await send('Network.enable');await send('Page.enable');await send('Runtime.enable');await send('Page.bringToFront');
  await send('Fetch.enable',{patterns:[{urlPattern:'*/api/*'}]});
  await send('Emulation.setDeviceMetricsOverride',{width:1920,height:1080,deviceScaleFactor:1,mobile:false});
  await send('Page.navigate',{url:'http://127.0.0.1:5211/health-track'});
  await until("document.querySelector('[aria-label=\"Разделы HealthTrack\"] [role=tab]')");
  sample=await evaluate("(async()=>{const {createDocumentsDemoTransport}=await import('/src/modules/healthTrack/demo/transport.ts');return (await createDocumentsDemoTransport().adapter({url:'health-track/register-dn/9900000000000000',method:'get',headers:{}})).data;})()");
  await evaluate("[...document.querySelectorAll('[role=tab]')].find(e=>e.textContent==='Регистр ДН').click()");
  await until("document.querySelector('table tbody button[aria-label]')");
  await evaluate(`window.opener=()=>document.querySelector('table tbody button[aria-label]');
    window.paper=()=>document.querySelector('.MuiDrawer-paper');
    window.content=()=>paper()?.querySelector('section[aria-busy]');
    window.close=()=>paper().querySelector('[aria-label="Закрыть карточку пациента"]');
    window.retry=()=>[...paper().querySelectorAll('button')].find(e=>e.textContent==='Повторить');
  `);
  await evaluate("opener().focus();opener().click()");
  await until("paper()?.querySelector('[role=status]')?.textContent.includes('Загрузка')");
  check('details queried by exact ENP and loading visible',requested[0]===patients[0].enp);
  await screenshot('healthtrack-patient-loading');
  hold=false;release();await until("paper()?.textContent.includes('Эпизоды ДН (3)')");
  check('full synthetic fixture and all nested groups',await evaluate("paper().textContent.includes('Сведения PLAN отсутствуют.')&&paper().textContent.includes('Сведения об информировании отсутствуют.')&&paper().textContent.includes('На учёте')&&paper().textContent.includes('Снят')&&paper().textContent.includes('Код МО плана')&&paper().textContent.includes('Информирование')&&paper().textContent.includes('Данные ГИС ОМС (2)')"));
  check('dialog labelled by full name and ENP not duplicated',await evaluate("paper().getAttribute('role')==='dialog'&&paper().getAttribute('aria-modal')==='true'&&document.getElementById(paper().getAttribute('aria-labelledby')).textContent.trim()==="+JSON.stringify([sample.fam,sample.im,sample.ot].join(' '))+"&&[...paper().querySelectorAll('dt')].every(e=>!['ЕНП','ФИО'].includes(e.textContent))"));
  const press=async(key,code,vk)=>{for(const type of ['keyDown','keyUp'])await send('Input.dispatchKeyEvent',{type,key,code,windowsVirtualKeyCode:vk,...(key==='Enter'&&type==='keyDown'?{text:'\r'}:{})});};
  await press('Tab','Tab',9);
  check('visible close focus trapped inside drawer',await evaluate("paper().contains(document.activeElement)&&getComputedStyle(close()).outlineWidth==='2px'"));
  const pageTop=await evaluate('scrollY');
  await send('Input.dispatchMouseEvent',{type:'mouseWheel',x:100,y:500,deltaY:500,deltaX:0});await pause();
  check('background scroll locked',await evaluate("document.body.style.overflow==='hidden'&&scrollY==="+pageTop));
  check('only content is scrollable',await evaluate("getComputedStyle(paper()).overflowY==='hidden'&&content().scrollHeight>content().clientHeight&&getComputedStyle(content()).overflowY==='auto'"));
  await screenshot('healthtrack-patient-1920');
  const area=await evaluate("(()=>{const r=content().getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2}})()");
  await send('Input.dispatchMouseEvent',{type:'mouseWheel',...area,deltaY:900,deltaX:0});await pause();
  check('long content scrolls with close available',await evaluate("content().scrollTop>0&&close().getBoundingClientRect().top>=0"));
  await evaluate("content().scrollTop=content().scrollHeight");await pause();await screenshot('healthtrack-patient-gf');
  for(const width of [360,768,1920,2560]){
    await send('Emulation.setDeviceMetricsOverride',{width,height:width===2560?1440:1080,deviceScaleFactor:1,mobile:false});await pause(220);
    await evaluate("content().scrollTop=0");
    check('no drawer or page horizontal overflow '+width,await evaluate("paper().scrollWidth<=paper().clientWidth+1&&content().scrollWidth<=content().clientWidth+1&&document.documentElement.scrollWidth<=innerWidth"));
    check('width and complete name '+width,await evaluate("paper().getBoundingClientRect().width"+(width===360?"===innerWidth":"<=736")+"&&getComputedStyle(paper().querySelector('h2')).textOverflow!=='ellipsis'"));
    await screenshot('healthtrack-patient-'+width);
  }
  await press('Escape','Escape',27);await until("!paper()");
  check('Escape restores focus and background scroll',await evaluate("document.activeElement===opener()&&document.body.style.overflow!=='hidden'"));
  await evaluate("document.querySelectorAll('table tbody button[aria-label]')[1].click()");
  await until("paper()?.textContent.includes('Эпизоды ДН отсутствуют.')");
  check('partial patient shows empty collections',await evaluate("paper().textContent.includes('Записи GF отсутствуют.')&&paper().textContent.includes('—')&&!paper().textContent.includes('СНИЛС')"));
  await evaluate("close().click()");await until("!paper()");
  await evaluate("(async()=>{const {queryClient}=await import('/src/shared/api/client/queryClient.ts');window.client=queryClient;})()");
  await evaluate("client.removeQueries({queryKey:['ht','register-dn','details']})");
  mode='error';await evaluate("opener().click()");await until("paper()?.querySelector('[role=alert]')?.textContent.includes('Тестовая ошибка получения пациента')");
  check('specific error and retry visible',await evaluate("!!retry()&&!paper().textContent.includes('Эпизоды ДН (3)')"));
  await screenshot('healthtrack-patient-error');
  mode='ready';await evaluate("retry().click()");await until("paper()?.textContent.includes('Эпизоды ДН (3)')");
  check('retry restores complete patient',true);
  await evaluate("close().click()");await until("!paper()");
  await evaluate("client.removeQueries({queryKey:['ht','register-dn','details']})");
  mode='missing';await evaluate("opener().click()");await until("paper()?.querySelector('[role=alert]')?.textContent.includes('Пациент не найден')");
  check('404 is not an empty episode list',await evaluate("!paper().textContent.includes('Эпизоды ДН отсутствуют.')"));
  await evaluate("close().click()");await until("!paper()");
  await evaluate("client.removeQueries({queryKey:['ht','register-dn','details']})");
  mode='empty';await evaluate("opener().click()");await until("paper()?.textContent.includes('Сведения о пациенте отсутствуют.')");
  check('null response has explicit empty state',true);
  await evaluate("close().click()");await until("!paper()");
  if(unexpected.length||errors.length)console.log(JSON.stringify({unexpected,errors}));
  check('no unexpected API and runtime errors',unexpected.length===0&&errors.length===0);
  console.log('HEALTHTRACK REGISTER DRAWER CHECKS COMPLETE');
} finally {ws?.close();chrome.kill();await server.close();}
