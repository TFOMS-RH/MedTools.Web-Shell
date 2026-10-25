// node tests/admin-demo.browser.mjs — Chrome, offline preview and actual query components.
import { spawn } from "node:child_process";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const { createServer } = await import(pathToFileURL(join(process.cwd(), "node_modules/vite/dist/node/index.js")));
const server = await createServer({ logLevel: "silent", server: { host: "127.0.0.1", port: 5198, strictPort: true } });
await server.listen();
const profile = await mkdtemp(join(tmpdir(), "admin-demo-"));
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
  let sequence = 0;
  const pending = new Map(), errors = [], requests = [];
  ws.onmessage = ({ data }) => {
    const message = JSON.parse(data);
    if (message.method === "Runtime.exceptionThrown") errors.push(message.params);
    if (message.method === "Network.requestWillBeSent" && new URL(message.params.request.url).pathname.startsWith("/api/")) requests.push(message.params.request);
    if (message.id) {
      const call = pending.get(message.id); pending.delete(message.id);
      if (message.error) call.reject(Error(JSON.stringify(message.error))); else call.resolve(message.result);
    }
  };
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++sequence; pending.set(id, { resolve, reject }); ws.send(JSON.stringify({ id, method, params }));
  });
  const evaluate = async expression => {
    const result = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) throw Error(JSON.stringify(result.exceptionDetails));
    return result.result.value;
  };
  const pause = (ms = 160) => new Promise(resolve => setTimeout(resolve, ms));
  const check = (name, value) => { if (!value) throw Error(name); console.log("PASS " + name); };
  const until = async expression => {
    for (let i = 0; i < 150; i++) { if (await evaluate(`Boolean(${expression})`)) return; await pause(100); }
    console.log(await evaluate("document.querySelector('iframe')?.contentDocument?.body.innerText??document.body.innerText"));
    throw Error("Timeout " + expression);
  };
  const screenshot = async name => {
    const { data } = await send("Page.captureScreenshot", { format: "png" });
    const path = join(profile, name + ".png"); await writeFile(path, Buffer.from(data, "base64")); console.log("SCREENSHOT " + path);
  };
  await send("Network.enable");
  await send("Page.enable"); await send("Runtime.enable"); await send("Page.bringToFront");
  await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 1100, deviceScaleFactor: 1, mobile: false });
  await send("Page.navigate", { url: "http://127.0.0.1:5198/admin?demoWorkspace=1" });
  await until("document.querySelector('iframe')?.contentDocument?.body.textContent.includes('demo.user.1')");
  await evaluate("window.frame=()=>document.querySelector('iframe').contentWindow;window.doc=()=>frame().document;window.button=text=>[...doc().querySelectorAll('button')].find(e=>e.textContent.trim()===text);window.nav=text=>[...doc().querySelectorAll('nav a')].find(e=>e.textContent===text);");
  check('real admin users table and navigation rendered',await evaluate("doc().querySelectorAll('tbody tr').length===6&&doc().querySelectorAll('nav a').length===3"));
  await evaluate(`(async()=>{window.parentAuth=await import('/src/modules/auth/stores/authStore.ts');})()`);
  check('demo identity never reaches parent auth store',await evaluate("parentAuth.useAuthStore.getState().user===null&&parentAuth.useAuthStore.getState().permissions.length===0"));
  for(const width of [360,768,1024,1440]){
    await send('Emulation.setDeviceMetricsOverride',{width,height:1100,deviceScaleFactor:1,mobile:false});
    for(const [label,name,columns] of [['Пользователи','users',5],['Роли','roles',2],['Разрешения','permissions',3]]){
      await evaluate(`nav(${JSON.stringify(label)}).click()`);
      await until(`doc().querySelector('nav a[aria-current=page]')?.textContent===${JSON.stringify(label)}&&doc().querySelector('tbody tr')`);await pause(250);
      const geometry=await evaluate(`(()=>{const d=doc(),workspace=d.querySelector('[class*=workspace_]'),links=[...d.querySelectorAll('nav a')],cell=d.querySelector('tbody td');return {overflow:d.documentElement.scrollWidth>d.documentElement.clientWidth||document.documentElement.scrollWidth>innerWidth,heading:d.querySelectorAll('h1').length===1&&d.querySelector('h1').textContent==='Администрирование',surface:frame().getComputedStyle(workspace).backgroundColor,clickAreas:links.every(e=>e.getBoundingClientRect().height>=44),columns:d.querySelectorAll('thead th').length,padding:frame().getComputedStyle(cell).padding};})()`);
      check(name+' composition and no page overflow at '+width,!geometry.overflow&&geometry.heading&&geometry.surface==='rgb(255, 255, 255)'&&geometry.clickAreas);
      check(name+' table columns and cell density unchanged at '+width,geometry.columns===columns&&geometry.padding===(name==='users'?'16px 20px':'16px 24px'));
      await evaluate("window.scrollTo({top:0,behavior:'instant'});frame().scrollTo({top:0,behavior:'instant'})");await pause(200);await screenshot('admin-stage1-'+name+'-'+width);
    }
  }
  for(const [text,name] of [['Пользователи','users'],['Роли','roles'],['Разрешения','permissions']]){
    await evaluate(`nav(${JSON.stringify(text)}).click()`);await until(`doc().querySelector('nav a[aria-current=page]')?.textContent===${JSON.stringify(text)}&&doc().querySelector('tbody tr')`);
    await pause(250);await screenshot('admin-current-'+name);
  }
  await evaluate("nav('Роли').click()");await until("button('Открыть')");await evaluate("button('Открыть').click()");await until("doc().querySelector('[role=dialog]')?.textContent.includes('Разрешения роли')");await screenshot('admin-current-role-dialog');
  await evaluate("button('Закрыть').click()");await until("!doc().querySelector('[role=dialog]')");
  await evaluate("nav('Пользователи').click()");await until("doc().querySelector('nav a[aria-current=page]')?.textContent==='Пользователи'&&doc().querySelector('tbody')?.textContent.includes('demo.user.1')&&button('Открыть')?.disabled===false");await evaluate("button('Открыть').click()");await until("doc().querySelector('[role=dialog]')?.textContent.includes('Данные пользователя')");await screenshot('admin-current-user-dialog');
  await evaluate(`(()=>{const w=frame(),input=[...doc().querySelectorAll('input')].find(e=>e.value==='Демонстрационный');const setter=Object.getOwnPropertyDescriptor(w.HTMLInputElement.prototype,'value').set;setter.call(input,'Тестовое изменение');input.dispatchEvent(new w.Event('input',{bubbles:true}));})()`);
  await pause();
  await until("!button('Сохранить данные').disabled");await evaluate("button('Сохранить данные').click()");await until("doc().body.textContent.includes('Данные пользователя сохранены.')");
  await evaluate("button('Закрыть').click()");await until("!doc().querySelector('[role=dialog]')");check('profile mutation changes only local fixtures',await evaluate("doc().querySelector('tbody').textContent.includes('Тестовое изменение')&&parentAuth.useAuthStore.getState().user===null"));
  await evaluate("button('Создать пользователя').click()");await until("doc().querySelector('[role=dialog]')?.textContent.includes('Организация')");await screenshot('admin-current-create-user');await evaluate("button('Отмена').click()");await until("!doc().querySelector('[role=dialog]')");
  await evaluate("nav('Роли').click()");await until("button('Создать роль')");await evaluate("button('Создать роль').click()");await until("doc().querySelector('[role=dialog] input')");
  await evaluate(`(()=>{const w=frame(),input=doc().querySelector('[role=dialog] input');Object.getOwnPropertyDescriptor(w.HTMLInputElement.prototype,'value').set.call(input,'Новая тестовая роль');input.dispatchEvent(new w.Event('input',{bubbles:true}));})()`);await pause();
  await evaluate("doc().querySelector('[role=dialog] button[type=submit]').click()");await until("!doc().querySelector('[role=dialog]')&&doc().body.textContent.includes('Новая тестовая роль')");check('create mutation stays local',requests.length===0);
  for(const [mode,text] of [['empty','Ролей пока нет'],['error','Ошибка']]){
    await evaluate(`(()=>{const w=frame(),e=doc().querySelector('aside select');e.value='${mode}';e.dispatchEvent(new w.Event('change',{bubbles:true}));})()`);await until(`doc().body.textContent.includes(${JSON.stringify(text)})`);await screenshot('admin-current-'+mode);
  }
  await evaluate("(()=>{const w=frame(),e=doc().querySelector('aside select');e.value='loading';e.dispatchEvent(new w.Event('change',{bubbles:true}));})()");await until("doc().querySelector('[aria-busy=true]')");check('loading can be reproduced',await evaluate("Boolean(doc().querySelector('.MuiSkeleton-root'))"));
  await evaluate("sessionStorage.setItem('accessToken','not-a-real-token')");await send('Page.reload');await until("document.querySelector('iframe')?.contentDocument?.body.textContent.includes('demo.user.1')");check('demo opens offline even with a saved session',requests.length===0);
  await evaluate("(async()=>{const {useAuthStore}=await import('/src/modules/auth/stores/authStore.ts');useAuthStore.getState().clearSession();})()");
  for(const section of ['users','roles','permissions']){
    await send('Page.navigate',{url:'http://127.0.0.1:5198/admin/'+section+'?demoWorkspace=1'});await until("location.pathname==='/login'");check('ordinary '+section+' route remains protected',await evaluate("!document.querySelector('iframe')"));
  }
  check('no admin HTTP reads or mutations left the browser',requests.length===0);
  const {preview}=await import(pathToFileURL(join(process.cwd(),'node_modules/vite/dist/node/index.js')));
  const production=await preview({logLevel:'silent',preview:{host:'127.0.0.1',port:5199,strictPort:true}});
  try{
    await send('Page.navigate',{url:'http://127.0.0.1:5199/admin?demoWorkspace=1'});await until("location.pathname==='/login'");check('production query parameter cannot enable demo or admin access',await evaluate("!document.querySelector('iframe')&&!document.body.textContent.includes('Демонстрационный Admin')"));
  }finally{await new Promise(resolve=>production.httpServer.close(resolve));}
  check('no runtime exceptions',errors.length===0);console.log('ADMIN DEMO CHECKS COMPLETE');
} finally {ws?.close();chrome.kill();await server.close();}
