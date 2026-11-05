// node tests/healthtrack-documents-demo.browser.mjs — actual HealthTrack UI, all API requests intercepted.
import { spawn } from "node:child_process";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const { createServer } = await import(pathToFileURL(join(process.cwd(), "node_modules/vite/dist/node/index.js")));
const server = await createServer({ logLevel: "silent", server: { host: "127.0.0.1", port: 5205, strictPort: true } });
await server.listen();
const profile = await mkdtemp(join(tmpdir(), "ht-documents-demo-"));
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


  await send('Network.enable');await send('Page.enable');await send('Runtime.enable');await send('Page.bringToFront');
  onRequest = ({requestId,request}) => send(new URL(request.url).pathname.startsWith('/api/')?'Fetch.failRequest':'Fetch.continueRequest',new URL(request.url).pathname.startsWith('/api/')?{requestId,errorReason:'BlockedByClient'}:{requestId});
  await send('Fetch.enable',{patterns:[{urlPattern:'*/api/*'}]});
  await send('Emulation.setDeviceMetricsOverride',{width:1440,height:1080,deviceScaleFactor:1,mobile:false});
  await send('Page.navigate',{url:'http://127.0.0.1:5205/health-track?demoWorkspace=1'});
  await until("document.querySelector('iframe')?.contentDocument?.querySelector('table[aria-label] tbody button')");
  await evaluate("window.w=()=>document.querySelector('iframe').contentWindow;window.d=()=>w().document;window.button=text=>[...d().querySelectorAll('button')].find(e=>e.textContent.trim()===text);window.rows=()=>[...d().querySelectorAll('table[aria-label] tbody tr')];window.control=text=>[...d().querySelectorAll('aside label')].find(e=>e.textContent.startsWith(text)).querySelector('select');window.change=(element,value)=>{Object.getOwnPropertyDescriptor(w().HTMLSelectElement.prototype,'value').set.call(element,value);element.dispatchEvent(new (w().Event)('change',{bubbles:true}));};");
  check('real documents table, filters and six exports',await evaluate("rows().length===50&&d().querySelectorAll('form[aria-label] select').length===3&&d().querySelectorAll('[aria-label=\"Формат выгрузки\"] [role=tab]').length===6&&d().querySelectorAll('[role=tabpanel]').length===1"));
  await evaluate("(async()=>{const {useAuthStore}=await import('/src/modules/auth/stores/authStore.ts');window.mainAuth=useAuthStore;})()");
  check('preview permissions never reach parent session',await evaluate("mainAuth.getState().permissions.length===0&&mainAuth.getState().user===null&&mainAuth.getState().accessToken===null"));
  for(const width of [360,768,1440,1920]) {
    await send('Emulation.setDeviceMetricsOverride',{width,height:1080,deviceScaleFactor:1,mobile:false});await pause(200);
    check('no host/frame page overflow at '+width,await evaluate("document.documentElement.scrollWidth<=innerWidth&&d().documentElement.scrollWidth<=w().innerWidth"));
  }
  await send('Emulation.setDeviceMetricsOverride',{width:1440,height:1080,deviceScaleFactor:1,mobile:false});
  const before=await evaluate("document.querySelector('header').getBoundingClientRect().top");
  await evaluate("window.scrollTo(0,250)");await pause(200);
  check('header scrolls naturally with preview',await evaluate("document.querySelector('header').getBoundingClientRect().top")<before-100);
  await evaluate("window.scrollTo(0,0)");
  await screenshot('healthtrack-documents-preview');
  check('no bulk selection in preview',await evaluate("!d().querySelector('table[aria-label] input')&&!d().body.textContent.includes('Проверить выбранные')"));
  await evaluate("rows()[0].querySelector('[aria-label=\"Проверить документ\"]').click()");
  await until("rows()[0].textContent.includes('Готов')");check('single check updates local document',true);
  await evaluate("rows()[0].querySelector('td:nth-child(3) button').click()");
  await until("d().querySelector('.MuiDrawer-paper')?.textContent.includes('Дата загрузки')");
  check('details use local document data',await evaluate("d().querySelector('.MuiDrawer-paper').textContent.includes('Демонстрационный оператор')"));
  await evaluate("[...d().querySelectorAll('[role=tab]')].find(e=>e.textContent.includes('История')).click()");
  await until("d().querySelector('.MuiDrawer-paper')?.textContent.includes('Демонстрационная проверка завершена в памяти')");check('local audit history',true);
  await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
  await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});await until("!d().querySelector('.MuiDrawer-paper')");
  await evaluate("rows()[0].querySelector('[aria-label=\"Удалить документ\"]').click()");await until("d().querySelector('[role=dialog]')");
  await evaluate("[...d().querySelectorAll('[role=dialog] button')].find(e=>e.textContent==='Удалить').click()");
  await until("!d().querySelector('[role=dialog]')&&d().body.textContent.includes('Найдено: 99')");check('deletion affects demo memory only',true);
  for(const [value,total] of [['190006',2],['19001',2],['19000',6]]) {
    await evaluate("change(control('Вариант организации'),'"+value+"')");await until("d().querySelectorAll('[aria-label=\"Формат выгрузки\"] [role=tab]').length==="+total);
  }
  check('all organization export variants',true);
  await evaluate("change(control('Количество документов'),'200')");await until("d().body.textContent.includes('Найдено: 200')");
  await evaluate("change(d().querySelector('[aria-label=\"Документов на странице\"]'),'200')");await until("rows().length===200");check('200 demo documents and server-like pagination',true);
  await evaluate("change(control('Состояние списка'),'loading')");
  await until("d().querySelector('.MuiSkeleton-root')");await until("rows()[0]?.querySelector('button')");check('loading scenario resolves',true);
  await evaluate("button('Обновить').click()");await until("d().body.textContent.includes('Обновление документов…')");
  check('background refresh retains previous data',await evaluate("rows().length===200&&Boolean(rows()[0].querySelector('button'))"));await until("!button('Обновить').disabled");
  await evaluate("change(control('Состояние списка'),'empty')");await until("d().body.textContent.includes('Документы не найдены')");check('empty scenario',true);
  await evaluate("change(control('Состояние списка'),'error')");await until("d().body.textContent.includes('Не удалось загрузить документы')");check('error scenario',true);
  await evaluate("change(control('Состояние списка'),'ready')");await until("rows()[0]?.querySelector('button')");
  check('zero HTTP API requests',requests.length===0);
  check('no runtime errors',errors.length===0);
  for (const path of ['/', '/rcontrol?demoWorkspace=1', '/med-view']) {
    await send('Page.navigate',{url:'http://127.0.0.1:5205'+path});
    await until("document.querySelector('header a')?.textContent.includes('MedTools')");await pause(400);
    check('header remains in document flow '+path,await evaluate("(()=>{const h=document.querySelector('header');return getComputedStyle(h).position==='static'&&h.getBoundingClientRect().left>=0&&h.getBoundingClientRect().right<=innerWidth&&document.documentElement.scrollWidth<=innerWidth;})()"));
  }
  const {preview}=await import(pathToFileURL(join(process.cwd(),'node_modules/vite/dist/node/index.js')));
  const production=await preview({logLevel:'silent',preview:{host:'127.0.0.1',port:5206,strictPort:true}});
  try {
    await send('Page.navigate',{url:'http://127.0.0.1:5206/health-track?demoWorkspace=1'});
    await until("document.body.textContent.includes('У вас нет доступа к разделу')");
    check('production query cannot enable preview',await evaluate("!document.querySelector('iframe')&&!document.body.textContent.includes('Превью HealthTrack')"));
  } finally {await new Promise(resolve=>production.httpServer.close(resolve));}
  console.log('HEALTHTRACK PREVIEW CHECKS COMPLETE');
} finally {ws?.close();chrome.kill();await server.close();}
