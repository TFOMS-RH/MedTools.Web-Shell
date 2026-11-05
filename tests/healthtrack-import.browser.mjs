// node tests/healthtrack-import.browser.mjs — actual HealthTrack UI, all API requests intercepted.
import { spawn } from "node:child_process";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const { createServer } = await import(pathToFileURL(join(process.cwd(), "node_modules/vite/dist/node/index.js")));
const server = await createServer({ logLevel: "silent", server: { host: "127.0.0.1", port: 5209, strictPort: true } });
await server.listen();
const profile = await mkdtemp(join(tmpdir(), "ht-import-"));
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


  let uploadMode='success', releaseUpload;
  const uploads=[],unexpected=[];
  onRequest=async({requestId,request})=>{
    const path=new URL(request.url).pathname;
    if(!path.startsWith("/api/"))return send("Fetch.continueRequest",{requestId});
    const reply=(data,responseCode=200)=>send('Fetch.fulfillRequest',{requestId,responseCode,responseHeaders:[{name:'Content-Type',value:'application/json'}],body:Buffer.from(JSON.stringify(data)).toString('base64')});
    if(path.startsWith('/api/health-track/import/')){
      uploads.push({path,method:request.method});
      if(uploadMode==='hold')await new Promise(resolve=>{releaseUpload=resolve;});
      if(uploadMode==='error')return reply({title:'Файл отклонён сервером: тестовая ошибка валидации'},422);
      return reply({documentId:101,recordsCount:12,updatedCount:2,warnings:['Демонстрационное предупреждение сервера']});
    }
    if(path==='/api/health-track/documents')return reply({items:[],totalCount:0,page:1,pageSize:50,totalPages:1,hasPrevious:false,hasNext:false});
    unexpected.push(path);return send('Fetch.failRequest',{requestId,errorReason:'BlockedByClient'});
  };
  await send('Network.enable');await send('Page.enable');await send('Runtime.enable');
  await send('Fetch.enable',{patterns:[{urlPattern:'*/api/*'}]});
  await send('Page.setInterceptFileChooserDialog',{enabled:true});
  let choosers=0;
  const original=ws.onmessage;
  ws.onmessage=event=>{const message=JSON.parse(event.data);if(message.method==='Page.fileChooserOpened')choosers++;original(event);};
  await send('Emulation.setDeviceMetricsOverride',{width:1920,height:1080,deviceScaleFactor:1,mobile:false});
  await send('Page.navigate',{url:'http://127.0.0.1:5209/health-track'});
  await until("document.querySelector('[aria-label=\"Разделы HealthTrack\"] [role=tab]')");
  await evaluate("[...document.querySelectorAll('[role=tab]')].find(e=>e.textContent==='Импорт').click()");
  await until("document.querySelector('input[type=file]')");
  await evaluate(`window.zone=()=>document.querySelector('input[type=file]').parentElement;
    window.choose=()=>zone().querySelector('button');
    window.button=label=>[...document.querySelectorAll('button')].find(e=>e.textContent.trim()===label);
    window.file=(name,size=16)=>new File([new Uint8Array(size)],name,{type:name.toLowerCase().endsWith('.zip')?'application/zip':'application/xml'});
    window.drop=(name,size)=>{const dt=new DataTransfer();dt.items.add(file(name,size));zone().dispatchEvent(new DragEvent('drop',{bubbles:true,cancelable:true,dataTransfer:dt}));};
    window.pick=name=>{const input=document.querySelector('input[type=file]');const dt=new DataTransfer();dt.items.add(file(name));input.files=dt.files;input.dispatchEvent(new Event('change',{bubbles:true}));};
  `);
  await screenshot("healthtrack-import-empty");
  check('native XML/ZIP chooser',await evaluate("choose().tagName==='BUTTON'&&document.querySelector('input[type=file]').accept==='.xml,.zip,application/xml,application/zip'"));
  const press=async(key,code,vk)=>{for(const type of ['keyDown','keyUp'])await send('Input.dispatchKeyEvent',{type,key,code,windowsVirtualKeyCode:vk,...(key==='Enter'&&type==='keyDown'?{text:'\r'}:{})});};
  await evaluate('choose().focus()');await press('Enter','Enter',13);await pause();
  check('Enter opens native file chooser',choosers===1);
  await press(' ','Space',32);await pause();check('Space opens native file chooser',choosers===2);
  check('visible keyboard focus',await evaluate("getComputedStyle(choose()).outlineWidth==='2px'"));
  await evaluate("choose().click()");await pause();check('click opens native file chooser',choosers===3);
  const chosenPath=join(profile,'GST19_2609_1.xml');await writeFile(chosenPath,'<demo/>');
  const dom=await send('DOM.getDocument');const input=await send('DOM.querySelector',{nodeId:dom.root.nodeId,selector:'input[type=file]'});
  await send('DOM.setFileInputFiles',{nodeId:input.nodeId,files:[chosenPath]});
  await until("zone().textContent.includes('GST19_2609_1.xml')&&!!button('Загрузить')");
  check('selection keeps explicit submit and detected period',uploads.length===0&&await evaluate("document.querySelector('input[placeholder=\"2026-09\"]').value==='2026-09'&&!button('Загрузить').disabled"));
  await evaluate("zone().querySelector('[aria-label=\"Удалить файл\"]').click()");
  await until("choose().textContent.includes('Перетащите')");
  await evaluate("zone().dispatchEvent(new DragEvent('dragenter',{bubbles:true,cancelable:true}))");

  await evaluate("choose().firstElementChild.dispatchEvent(new DragEvent('dragenter',{bubbles:true,cancelable:true}));zone().dispatchEvent(new DragEvent('dragleave',{bubbles:true,cancelable:true}))");
  await pause(200);
  check('drag over stays branded across children',await evaluate("getComputedStyle(zone()).backgroundColor==='rgb(228, 245, 244)'"));
  await evaluate("zone().dispatchEvent(new DragEvent('dragleave',{bubbles:true,cancelable:true}))");await pause(200);
  check('drag leave restores neutral background',await evaluate("getComputedStyle(zone()).backgroundColor!=='rgb(228, 245, 244)'"));
  await evaluate("drop('bad.txt')");await until("document.body.textContent.includes('Поддерживаются только файлы')");
  check('unsupported extension rejected',await evaluate("!button('Загрузить')")&&uploads.length===0);
  await evaluate("drop('GST19_2609_1.xml',100*1024*1024+1)");await until("document.body.textContent.includes('Размер файла превышает 100 МБ')");
  check('100 MB limit unchanged',await evaluate("!button('Загрузить')"));
  await evaluate("drop('unknown.xml')");await until("document.querySelector('[role=alert]')?.textContent.includes('Не удалось определить тип')");
  check('invalid filename keeps parser error',await evaluate("!button('Загрузить')"));
  await evaluate("drop('GST19_2609_1.zip')");await until("button('Загрузить')&&!button('Загрузить').disabled");
  check('ZIP accepted without automatic upload',uploads.length===0&&await evaluate("zone().textContent.includes('ZIP')"));
  uploadMode='hold';await evaluate("button('Загрузить').click()");await until("document.querySelector('[role=progressbar]')");
  check('pending blocks repeat selection and removal',await evaluate("choose().disabled&&zone().querySelector('[aria-label=\"Удалить файл\"]').disabled&&!button('Загрузить')"));
  await evaluate("drop('GPT19_2609_1.xml');choose().click()");await pause(300);
  check('pending drop cannot replace file or send twice',uploads.length===1&&await evaluate("zone().textContent.includes('GST19_2609_1.zip')"));
  await screenshot('healthtrack-import-uploading');
  releaseUpload();await until("document.body.textContent.includes('Импорт завершён')");
  await screenshot("healthtrack-import-success");
  check('success counts warnings and endpoint',uploads[0].path==='/api/health-track/import/gst'&&await evaluate("document.body.textContent.includes('Демонстрационное предупреждение сервера')&&!!button('Перейти к документу')&&!!button('Загрузить ещё')"));
  await evaluate("button('Загрузить ещё').click()");await until("choose().textContent.includes('Перетащите')");
  const longName='GST'+'9'.repeat(160)+'_2609_1.xml';
  await evaluate('pick('+JSON.stringify(longName)+')');await until("button('Загрузить')");
  for(const width of [360,768,1024,1920,2560]){
    await send('Emulation.setDeviceMetricsOverride',{width,height:width===2560?1440:1080,deviceScaleFactor:1,mobile:false});await pause(220);
    check('full long filename and no page overflow '+width,await evaluate("document.documentElement.scrollWidth<=innerWidth&&zone().textContent.includes("+JSON.stringify(longName)+")&&getComputedStyle(zone().querySelector('[class*=fileName]')).textOverflow!=='ellipsis'"));
    await evaluate('window.scrollTo(0,0)');await screenshot('healthtrack-import-'+width);
  }
  uploadMode='error';await evaluate("button('Загрузить').click()");await until("document.body.textContent.includes('Ошибка импорта')");
  await until("document.body.textContent.includes('Файл отклонён сервером: тестовая ошибка валидации')");
  await screenshot("healthtrack-import-error");
  check('specific server notification preserved',await evaluate("document.body.textContent.includes('Файл отклонён сервером: тестовая ошибка валидации')&&!!button('Попробовать снова')"));
  await evaluate("button('Попробовать снова').click()");await until("choose().textContent.includes('Перетащите')");
  check('retry keeps reset workflow',await evaluate("!button('Загрузить')"));
  check('no unexpected API',unexpected.length===0);check('no runtime exceptions',errors.length===0);

  const callsBeforeDemo=uploads.length;
  await send('Page.navigate',{url:'http://127.0.0.1:5209/health-track?demoWorkspace=1'});
  await until("document.querySelector('iframe')?.contentDocument?.querySelector('[role=tab]')");
  await evaluate("window.w=()=>document.querySelector('iframe').contentWindow;window.d=()=>w().document;window.db=text=>[...d().querySelectorAll('button')].find(e=>e.textContent.trim()===text);db('Импорт').click()");
  await until("d().querySelector('input[type=file]')");
  await evaluate("(()=>{const dt=new (w().DataTransfer)();dt.items.add(new (w().File)(['<demo/>'],'GST19_2609_1.xml',{type:'application/xml'}));const input=d().querySelector('input[type=file]');input.files=dt.files;input.dispatchEvent(new (w().Event)('change',{bubbles:true}));})()");
  await until("db('Загрузить')&&!db('Загрузить').disabled");
  await evaluate("db('Загрузить').click()");await until("d().body.textContent.includes('Импорт завершён')");
  check('preview local import without real requests',uploads.length===callsBeforeDemo&&await evaluate("d().body.textContent.includes('файл не обрабатывался')"));
  await evaluate("db('Перейти к документу').click()");
  await until("d().querySelector('.MuiDrawer-paper')?.textContent.includes('GST19_2609_1.xml')");
  check('preview result opens imported demo document',true);
  check('no runtime exceptions including preview',errors.length===0);
  console.log('HEALTHTRACK IMPORT CHECKS COMPLETE');
} finally { ws?.close();chrome.kill();await server.close(); }
