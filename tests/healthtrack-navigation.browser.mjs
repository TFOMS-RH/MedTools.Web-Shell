// node tests/healthtrack-navigation.browser.mjs — actual HealthTrack UI, all API requests intercepted.
import { spawn } from "node:child_process";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const { createServer } = await import(pathToFileURL(join(process.cwd(), "node_modules/vite/dist/node/index.js")));
const server = await createServer({ logLevel: "silent", server: { host: "127.0.0.1", port: 5208, strictPort: true } });
await server.listen();
const profile = await mkdtemp(join(tmpdir(), "ht-navigation-"));
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


  const calls=[],unexpected=[];
  const reply=(requestId,data)=>send('Fetch.fulfillRequest',{requestId,responseCode:200,responseHeaders:[{name:'Content-Type',value:'application/json'}],body:Buffer.from(JSON.stringify(data)).toString('base64')});
  onRequest=async({requestId,request})=>{
    const url=new URL(request.url),path=url.pathname;
    if(!path.startsWith('/api/'))return send('Fetch.continueRequest',{requestId});
    calls.push({path,method:request.method});
    if(path==='/api/health-track/documents'||path==='/api/health-track/register-dn')return reply(requestId,{items:[],totalCount:0,page:1,pageSize:50,totalPages:1,hasPrevious:false,hasNext:false});
    if(path==='/api/health-track/statistics/overview')return reply(requestId,{kpi:{patientsTotal:0,patientsActive:0,patientsClosed:0,documentsTotal:0,documentsReady:0,recordsTotal:0},topMos:[],topDiagnoses:[],byPeriod:[],byAgeGroup:[],periodFrom:null,periodTo:null});
    unexpected.push(path);return send('Fetch.failRequest',{requestId,errorReason:'BlockedByClient'});
  };
  await send('Network.enable');await send('Page.enable');await send('Runtime.enable');await send('Page.bringToFront');
  await send('Fetch.enable',{patterns:[{urlPattern:'*/api/*'}]});
  await send('Emulation.setDeviceMetricsOverride',{width:1920,height:1080,deviceScaleFactor:1,mobile:false});
  await send('Page.navigate',{url:'http://127.0.0.1:5208/health-track'});
  await until("document.querySelector('[aria-label=\"Разделы HealthTrack\"] [role=tab]')");
  await evaluate("window.nav=()=>document.querySelector('[aria-label=\"Разделы HealthTrack\"]').closest('.MuiTabs-root');window.tabs=()=>[...nav().querySelectorAll('[role=tab]')];window.panel=()=>document.getElementById('ht-section-panel');");
  await until("panel().textContent.includes('У вас нет доступа к разделу')");
  check('default documents tab and existing denied state',await evaluate("tabs().length===4&&tabs()[0].getAttribute('aria-selected')==='true'&&tabs().every(e=>!e.disabled)"));
  check('no navigation descriptions or large icon cards',await evaluate("!nav().querySelector('p,h3')&&tabs().every(e=>e.querySelector('svg')&&getComputedStyle(e.querySelector('svg')).width==='20px'&&getComputedStyle(e).borderWidth==='0px')"));
  const press=async(key,code,vk)=>{for(const type of ['keyDown','keyUp'])await send('Input.dispatchKeyEvent',{type,key,code,windowsVirtualKeyCode:vk,...(key==='Enter'&&type==='keyDown'?{text:'\r'}:{})});};
  await evaluate("tabs()[0].focus()");await press('ArrowRight','ArrowRight',39);
  check('arrow key moves focus without changing selection',await evaluate("document.activeElement===tabs()[1]&&tabs()[0].getAttribute('aria-selected')==='true'"));
  check('visible keyboard focus',await evaluate("getComputedStyle(document.activeElement).outlineStyle==='solid'&&getComputedStyle(document.activeElement).outlineWidth==='2px'"));
  await press('Enter','Enter',13);await until("panel().textContent.includes('Импорт файла')");check('Enter opens existing import form',true);
  await press('ArrowRight','ArrowRight',39);await press(' ','Space',32);await until("panel().textContent.includes('Регистр ДН')");check('Space opens existing register',true);
  await press('End','End',35);await press('Enter','Enter',13);await until("panel().querySelector('h2')?.textContent==='Статистика'");check('End and Enter open existing statistics',true);
  await press('Home','Home',36);await press('Enter','Enter',13);await until("panel().textContent.includes('У вас нет доступа к разделу')");check('return preserves denied documents state',true);
  await evaluate("(async()=>{const {useAuthStore}=await import('/src/modules/auth/stores/authStore.ts');window.auth=useAuthStore;auth.setState({permissions:['healthtrack.documents.read','healthtrack.export.aggregated'],organizationCode:'19000'});})()");
  await until("document.getElementById('ht-documents-heading')");
  for(const width of [360,768,1024,1920,2560]){
    await send('Emulation.setDeviceMetricsOverride',{width,height:width===2560?1440:1080,deviceScaleFactor:1,mobile:false});await pause(250);
    const geometry=await evaluate("(()=>{const a=nav().getBoundingClientRect(),b=document.querySelector('[aria-labelledby=ht-documents-heading]').getBoundingClientRect(),c=document.getElementById('ht-export-heading').closest('section').parentElement.getBoundingClientRect();return{overflow:document.documentElement.scrollWidth>innerWidth,aligned:Math.abs(a.left-b.left)<1&&Math.abs(a.right-b.right)<1&&Math.abs(a.left-c.left)<1,compact:a.height<=80,white:getComputedStyle(nav()).backgroundColor==='rgb(255, 255, 255)',singleRow:new Set(tabs().map(e=>Math.round(e.getBoundingClientRect().top))).size===1,active:getComputedStyle(tabs()[0]).backgroundColor==='rgb(228, 245, 244)'};})()");
    check('compact aligned navigation at '+width,!geometry.overflow&&geometry.aligned&&geometry.compact&&geometry.white&&geometry.singleRow&&geometry.active);
    for(const [index,expected]of [[1,'Импорт файла'],[2,'Регистр ДН'],[3,'Статистика'],[0,'Экспорт']]){
      await evaluate('tabs()['+index+'].click()');await until('panel().textContent.includes('+JSON.stringify(expected)+')');
      check('section '+index+' and ARIA at '+width,await evaluate("panel().getAttribute('aria-labelledby')===tabs()["+index+"].id&&tabs()["+index+"].getAttribute('aria-controls')===panel().id&&location.pathname==='/health-track'&&document.documentElement.scrollWidth<=innerWidth"));
    }
    await evaluate('window.scrollTo(0,0)');await screenshot('healthtrack-navigation-'+width);
  }
  check('existing GET hooks used, no mutations',calls.every(c=>c.method==='GET')&&['/api/health-track/documents','/api/health-track/register-dn','/api/health-track/statistics/overview'].every(path=>calls.some(c=>c.path===path)));
  check('primary actions use token-derived teal with readable white text',await evaluate("(()=>{const button=document.querySelector('[aria-labelledby=ht-export-heading] .MuiButton-contained'),s=getComputedStyle(button);return s.color==='rgb(255, 255, 255)'&&s.backgroundColor.includes('color(srgb')&&s.backgroundColor!=='rgb(162, 102, 32)';})()"));
  await evaluate("auth.setState({permissions:[]})");await until("panel().textContent.includes('У вас нет доступа к разделу')");check('permission changes remain reflected',true);
  check('no unexpected API requests',unexpected.length===0);check('no runtime errors',errors.length===0);
  await send('Page.navigate',{url:'http://127.0.0.1:5208/'});
  await until("document.querySelector('a[href=\"/health-track\"]')");
  check('home HealthTrack card uses brand tokens',await evaluate("(()=>{const card=document.querySelector('a[href=\"/health-track\"]');return card.style.getPropertyValue('--module-accent')==='var(--mt-healthtrack-accent)'&&card.style.getPropertyValue('--module-cover')==='var(--mt-healthtrack-cover)'&&getComputedStyle(card.firstElementChild).backgroundColor==='rgb(228, 245, 244)';})()"));
  await screenshot('healthtrack-home-brand');
  console.log('HEALTHTRACK NAVIGATION CHECKS COMPLETE');
}finally{ws?.close();chrome.kill();await server.close();}
