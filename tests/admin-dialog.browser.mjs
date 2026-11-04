// node tests/admin-dialog.browser.mjs — Chrome checks for iframe and ordinary Dialog geometry.
import { spawn } from "node:child_process";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const { createServer } = await import(pathToFileURL(join(process.cwd(), "node_modules/vite/dist/node/index.js")));
const server = await createServer({ logLevel: "silent", server: { host: "127.0.0.1", port: 5202, strictPort: true } });
await server.listen();
const profile = await mkdtemp(join(tmpdir(), "admin-dialog-"));
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
  await send("Page.navigate", { url: "http://127.0.0.1:5202/admin?demoWorkspace=1" });
  await until("document.querySelector('iframe')?.contentDocument?.body.textContent.includes('demo.user.1')");
  await evaluate("window.frame=()=>document.querySelector('iframe').contentWindow;window.doc=()=>frame().document;window.button=text=>[...doc().querySelectorAll('button')].find(e=>e.textContent.trim()===text);window.nav=text=>[...doc().querySelectorAll('nav a')].find(e=>e.textContent===text);");
  await evaluate("Promise.all([document.fonts.ready,doc().fonts.ready]).then(()=>true)");
  const key = async (key, code, keyCode, shiftKey=false) => {
    for(const type of ['keyDown','keyUp']) await send('Input.dispatchKeyEvent',{type,key,code,windowsVirtualKeyCode:keyCode,modifiers:shiftKey?8:0});
    await pause(40);
  };
  const open=async(index=0)=>{
    await until("button('Открыть')?.disabled===false");
    await evaluate(`(()=>{const e=[...doc().querySelectorAll('button')].filter(e=>e.textContent.trim()==='Открыть')[${index}];e.focus();e.click();})()`);
    await until("doc().querySelector('.MuiDialogContent-root form')");await pause(400);
  };
  const close=async()=>{
    await key('Escape','Escape',27);
    await until("!doc().querySelector('[role=dialog]')&&getComputedStyle(document.body).overflow!=='hidden'");await pause(300);
  };
  const geometry=()=>evaluate(`(()=>{const f=document.querySelector('iframe'),p=doc().querySelector('.MuiDialog-paper'),c=p.querySelector('.MuiDialogContent-root'),t=p.querySelector('.MuiDialogTitle-root'),a=p.querySelector('.MuiDialogActions-root');const rect=e=>{const r=e.getBoundingClientRect();return {top:r.top,bottom:r.bottom,height:r.height}};return {height:innerHeight,parentScroll:document.documentElement.scrollHeight,frame:rect(f),paper:rect(p),title:rect(t),actions:rect(a),hostLock:getComputedStyle(document.body).overflow,childLock:frame().getComputedStyle(doc().body).overflow,contentScroll:c.scrollHeight>c.clientHeight+1,scrollers:[...doc().querySelector('.MuiDialog-root').querySelectorAll('*')].filter(e=>e.scrollHeight>e.clientHeight+1&&['auto','scroll'].includes(frame().getComputedStyle(e).overflowY)).map(e=>e.className)};})()`);
  for(const width of [360,768,1024,1440]){
    for(const height of [600,1400]){
      await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});await open();
      const g=await geometry();
      check('modal uses visible viewport at '+width+'x'+height,g.frame.top===0&&g.frame.height===height&&g.paper.top>=0&&g.paper.bottom<=height&&g.title.top>=g.paper.top&&g.actions.bottom<=height);
      check('single necessary scroll area at '+width+'x'+height,g.scrollers.length<=1&&(!g.scrollers.length||g.scrollers[0].includes('MuiDialogContent-root')));
      if(width>=1024&&height===1400)check('tall viewport uses natural height without inner scrolling at '+width,!g.contentScroll&&g.paper.height<height-64);
      check('both backgrounds locked at '+width+'x'+height,g.hostLock==='hidden'&&g.childLock==='hidden');
      check('profile form adapts at '+width,await evaluate(`(()=>{const inputs=[...doc().querySelector('form').querySelectorAll('input')],a=inputs[0].getBoundingClientRect(),b=inputs[1].getBoundingClientRect();return ${width>=768?'a.top===b.top':'b.top>a.top'};})()`));
      check('dialog header and system section rendered',await evaluate("doc().querySelector('#admin-user-title').textContent==='Редактирование пользователя'&&doc().querySelector('#admin-user-system-title').textContent==='Системная информация'"));
      // Flush the resized iframe's compositor surface before sending pointer input.
      await send('Page.captureScreenshot',{format:'png'});
      const before=await evaluate('({parent:scrollY,child:frame().scrollY})');
      await send('Input.dispatchMouseEvent',{type:'mouseWheel',x:5,y:5,deltaX:0,deltaY:500});await pause();
      check('background wheel cannot move page at '+width+'x'+height,await evaluate(`scrollY===${before.parent}&&frame().scrollY===${before.child}`));
      if(width===360||width===1440)await screenshot('admin-dialog-'+width+'x'+height);
      for(let i=0;i<18;i++)await key('Tab','Tab',9);
      check('Tab remains within modal at '+width+'x'+height,await evaluate("Boolean(doc().activeElement.closest('.MuiDialog-root'))"));
      await close();
      check('focus and scroll lock restore after Escape at '+width+'x'+height,await evaluate("doc().body.style.overflow!=='hidden'&&doc().activeElement.textContent.trim()==='Открыть'&&document.querySelector('header').inert===false"));
      await evaluate('frame().scrollTo(0,0)');
      if(await evaluate('doc().documentElement.scrollHeight>frame().innerHeight+10')){
        const point=await evaluate("(()=>{const r=document.querySelector('iframe').getBoundingClientRect();return {x:5,y:r.top+10};})()");
        await send('Input.dispatchMouseEvent',{type:'mouseWheel',...point,deltaX:0,deltaY:300});await pause();
        check('background scroll is usable after close at '+width+'x'+height,await evaluate('frame().scrollY>0'));
      }
    }
  }
  await send('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});await open();
  check('1000px viewport keeps header/actions visible with at most one scroll area',(await geometry()).actions.bottom<=1000&&(await geometry()).scrollers.length<=1);
  await until("doc().querySelector('[role=combobox]')?.disabled===false");
  await screenshot('admin-controls-closed');
  await evaluate("doc().querySelector('.MuiAutocomplete-popupIndicator').click()");
  await until("doc().querySelector('[role=listbox]')");await pause(300);
  check('role popup is portalled, visible and not clipped by dialog',await evaluate("(()=>{const l=doc().querySelector('[role=listbox]'),r=l.getBoundingClientRect();return !doc().querySelector('.MuiDialog-paper').contains(l)&&r.height>0&&r.top>=0&&r.bottom<=frame().innerHeight&&l.contains(doc().elementFromPoint(r.left+10,r.top+10));})()"));
  await screenshot('admin-controls-roles-open');
  await evaluate("doc().querySelector('[role=combobox]').focus()");
  await send('Input.insertText',{text:'администратор'});
  await until("doc().querySelectorAll('[role=option]').length===1");
  await key('ArrowDown','ArrowDown',40);await key('Enter','Enter',13);
  await until("doc().querySelectorAll('.MuiChip-root').length===2");
  check('keyboard search and Enter add a role',true);
  if(await evaluate("doc().querySelector('[role=combobox]')?.getAttribute('aria-expanded')==='true'"))await key('Escape','Escape',27);
  await key('Backspace','Backspace',8);await until("doc().querySelectorAll('.MuiChip-root').length===1");
  check('keyboard Backspace removes selected role',true);
  check('plain associated labels replace floating labels',await evaluate("[...doc().querySelector('form').querySelectorAll('input')].every(e=>e.labels.length===1)&&!doc().querySelector('.MuiInputLabel-root')&&doc().querySelector('#admin-user-birthDate').type==='date'"));
  check('disabled save button remains visually muted',await evaluate("(()=>{const b=button('Сохранить данные');return b.disabled&&frame().getComputedStyle(b).color!==frame().getComputedStyle(button('Активировать')).color;})()"));
  await evaluate(`(()=>{const w=frame(),values={lastName:'Проверка полей',firstName:' ',middleName:'Тест',email:'test@example.invalid',contactPhone:'+7 000 000-00-00',birthDate:'1992-02-29'};for(const [field,value] of Object.entries(values)){const e=doc().getElementById('admin-user-'+field);Object.getOwnPropertyDescriptor(w.HTMLInputElement.prototype,'value').set.call(e,value);e.dispatchEvent(new w.Event('input',{bubbles:true}));}})()`);
  await until("button('Сохранить данные')?.disabled===false");await evaluate("button('Сохранить данные').click()");await until("doc().body.textContent.includes('Укажите имя.')");
  check('validation preserves field error and visible error indicator',await evaluate("(()=>{const e=doc().querySelector('#admin-user-firstName'),r=e.closest('.MuiInputBase-root');return e.getAttribute('aria-invalid')==='true'&&frame().getComputedStyle(r).boxShadow!=='none'&&Boolean(doc().getElementById(e.getAttribute('aria-describedby')));})()"));
  await screenshot('admin-controls-validation');
  await evaluate("button('Отменить изменения').click()");await until("doc().querySelector('#admin-user-firstName').value==='Демонстрационный'&&button('Сохранить данные').disabled");
  await close();

  // Exercise all existing operations through the real demo UI, with simultaneous drafts.
  await open();
  await evaluate(`(()=>{const w=frame(),e=[...doc().querySelectorAll('input')].find(e=>e.value==='Пользователь 1');Object.getOwnPropertyDescriptor(w.HTMLInputElement.prototype,'value').set.call(e,'Пользователь для UI-проверки');e.dispatchEvent(new w.Event('input',{bubbles:true}));doc().querySelector('.MuiAutocomplete-popupIndicator').click();})()`);
  await until("[...doc().querySelectorAll('[role=option]')].some(e=>e.textContent==='Демонстрационный администратор')");
  await evaluate("[...doc().querySelectorAll('[role=option]')].find(e=>e.textContent==='Демонстрационный администратор').click()");
  if(await evaluate("doc().querySelector('[role=combobox]')?.getAttribute('aria-expanded')==='true'"))await key('Escape','Escape',27);
  await until("button('Сохранить данные')?.disabled===false&&button('Сохранить роли')?.disabled===false");
  await evaluate("button('Сохранить данные').click()");await until("doc().body.textContent.includes('Данные пользователя сохранены.')");
  await until("button('Сохранить роли')?.disabled===false");
  check('profile saves independently while role draft remains',await evaluate("button('Сохранить данные').disabled&&Boolean(doc().querySelector('.MuiDialog-root'))"));
  await evaluate("button('Сохранить роли').click()");await until("doc().body.textContent.includes('Роли сохранены.')");
  await until("button('Активировать')?.disabled===false");
  for(const [action,message] of [['Активировать','Учётная запись активирована.'],['Отключить','Учётная запись отключена.']]){
    await evaluate(`button(${JSON.stringify(action)}).click()`);await until("doc().querySelector('[aria-labelledby=user-status-title]')");
    await evaluate(`[...doc().querySelector('[aria-labelledby=user-status-title]').querySelectorAll('button')].find(e=>e.textContent.trim()===${JSON.stringify(action)}).click()`);
    await until(`doc().body.textContent.includes(${JSON.stringify(message)})&&!doc().querySelector('[aria-labelledby=user-status-title]')`);
    check(action+' completes with confirmation and keeps dialog open',await evaluate("Boolean(doc().querySelector('[aria-labelledby=admin-user-title]'))"));
  }
  await close();

  // Extend fixture responses only in this browser test, keeping production DTOs/transport unchanged.
  const fixtureScript = `(async()=>{const {default:api}=await import('/src/shared/api/client/apiClient.ts');const original=api.defaults.adapter;window.longContent=false;window.holdDetail=false;api.defaults.adapter=async config=>{const response=await original(config),url=config.url??'';if((config.method??'get')==='get'){if(url.includes('/users/')&&url.split('/').length===5&&window.holdDetail)await new Promise(resolve=>window.releaseDetail=resolve);if(window.longContent&&url.endsWith('/roles')){response.data=Array.from({length:30},(_,i)=>({id:'long-role-'+i,name:'Тестовая роль с длинным названием '+i}));}}return response;};})()`;
  await evaluate(`frame().eval(${JSON.stringify(fixtureScript)})`);
  await evaluate("frame().holdDetail=true");
  await until("button('Открыть')?.disabled===false");await evaluate("[...doc().querySelectorAll('button')].filter(e=>e.textContent.trim()==='Открыть')[1].click()");
  await until("doc().querySelector('[aria-label=\"Загрузка пользователя\"]')");
  const loading=await geometry();check('loading has compact natural geometry',loading.paper.height<400&&!loading.contentScroll&&loading.frame.top===0);await screenshot('admin-dialog-loading');
  await until("typeof frame().releaseDetail==='function'");
  await evaluate("frame().holdDetail=false;frame().releaseDetail()");await until("doc().querySelector('.MuiDialogContent-root form')");await pause(350);await close();
  await evaluate("frame().longContent=true");await open(2);
  await until("doc().querySelectorAll('.MuiChip-root').length>=30");
  const long=await geometry();check('long content scrolls only inside DialogContent',long.contentScroll&&long.scrollers.length===1&&long.scrollers[0].includes('MuiDialogContent-root')&&long.actions.bottom<=long.height);
  await evaluate("doc().querySelector('.MuiDialogContent-root').scrollTop=10000");
  check('actions remain visible after long content scroll',(await geometry()).actions.bottom<=1000);await screenshot('admin-dialog-long-content');await close();

  // Existing UI error and nested discard confirmation, with the demo's own error switch.
  await evaluate("doc().querySelector('aside input[type=checkbox]').click()");await open();
  await evaluate(`(()=>{const w=frame(),e=[...doc().querySelectorAll('input')].find(e=>e.value==='Демонстрационный');Object.getOwnPropertyDescriptor(w.HTMLInputElement.prototype,'value').set.call(e,'Проверка ошибки');e.dispatchEvent(new w.Event('input',{bubbles:true}));})()`);
  await until("button('Сохранить данные')?.disabled===false");await evaluate("button('Сохранить данные').click()");await until("doc().body.textContent.includes('Демонстрационная ошибка')");
  check('save error stays within bounded modal',(await geometry()).actions.bottom<=1000);await screenshot('admin-dialog-save-error');
  await evaluate("button('Закрыть').click()");await until("doc().querySelector('[aria-labelledby=discard-user-title]')");
  check('nested confirmation keeps host locked',await evaluate("getComputedStyle(document.body).overflow==='hidden'"));
  await evaluate("button('Продолжить редактирование').click()");await pause(300);
  check('closing nested confirmation preserves main modal lock',await evaluate("getComputedStyle(document.body).overflow==='hidden'&&Boolean(doc().querySelector('[aria-labelledby=admin-user-title]'))"));
  await evaluate("button('Закрыть').click()");await until("button('Не сохранять')");await evaluate("button('Не сохранять').click()");await until("!doc().querySelector('[role=dialog]')&&getComputedStyle(document.body).overflow!=='hidden'");

  // Ordinary routes use the same UI, with a test-only adapter; no real HTTP or auth changes.
  await evaluate(`(async()=>{
    const {default:api}=await import('/src/shared/api/client/apiClient.ts');
    const {useAuthStore}=await import('/src/modules/auth/stores/authStore.ts');
    const {adminPermissions}=await import('/src/modules/admin/model/permissions.ts');
    const user={id:'test-user',organizationId:'test-org',userName:'ordinary.test',firstName:'Тестовый',lastName:'Пользователь',middleName:null,email:null,contactPhone:null,birthDate:null};
    const roles=[{id:'normal-role',name:'Тестовая роль'}];let roleIds=[];window.normalRequests=[];
    api.defaults.adapter=async config=>{
      const url=config.url??'',method=config.method??'get',body=typeof config.data==='string'?JSON.parse(config.data):config.data;
      normalRequests.push({url,method,body});
      if(method==='patch'&&url==='/identity/admin/users/test-user')Object.assign(user,body);
      if(method==='put'&&url==='/identity/admin/users/test-user/roles')roleIds=body.roleIds;
      const data=url==='/identity/admin/users'?[user]:url==='/identity/admin/users/test-user'?user:url==='/identity/admin/roles'?roles:url==='/identity/admin/users/test-user/roles'?roles.filter(r=>roleIds.includes(r.id)):[];
      return {config,status:200,statusText:'OK',headers:{},data};
    };
    useAuthStore.setState({accessToken:null,isInitialized:true,user:{...user,id:'test-session'},permissions:Object.values(adminPermissions)});
    window.normalButton=text=>[...document.querySelectorAll('button')].find(e=>e.textContent.trim()===text);
    history.pushState({},'', '/admin/users');dispatchEvent(new PopStateEvent('popstate'));
  })()`);
  await until("!document.querySelector('iframe')&&document.body.textContent.includes('ordinary.test')");
  for(const height of [600,1400]){
    await send('Emulation.setDeviceMetricsOverride',{width:1440,height,deviceScaleFactor:1,mobile:false});
    await until("[...document.querySelectorAll('button')].some(e=>e.textContent.trim()==='Открыть'&&!e.disabled)");await evaluate("[...document.querySelectorAll('button')].find(e=>e.textContent.trim()==='Открыть').click()");await until("document.querySelector('.MuiDialogContent-root form')");await pause(350);
    check('ordinary Admin modal bounded and background locked at '+height,await evaluate(`(()=>{const p=document.querySelector('.MuiDialog-paper').getBoundingClientRect();return p.top>=0&&p.bottom<=${height}&&getComputedStyle(document.body).overflow==='hidden';})()`));
    if(height===1400)check('ordinary Admin natural height remains unchanged',await evaluate("(()=>{const c=document.querySelector('.MuiDialogContent-root');return c.scrollHeight<=c.clientHeight+1;})()"));
    await screenshot('ordinary-admin-dialog-'+height);await key('Escape','Escape',27);await until("!document.querySelector('[role=dialog]')&&getComputedStyle(document.body).overflow!=='hidden'");
  }
  await evaluate("normalButton('Открыть').click()");await until("document.querySelector('#admin-user-firstName')&&document.querySelector('.MuiAutocomplete-popupIndicator')");
  await evaluate(`(()=>{const e=document.querySelector('#admin-user-firstName');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(e,'Новое имя');e.dispatchEvent(new Event('input',{bubbles:true}));document.querySelector('.MuiAutocomplete-popupIndicator').click();})()`);
  await until("document.querySelector('[role=option]')");await evaluate("document.querySelector('[role=option]').click()");
  await until("normalButton('Сохранить данные')?.disabled===false&&normalButton('Сохранить роли')?.disabled===false");
  await evaluate("normalButton('Сохранить данные').click()");await until("document.body.textContent.includes('Данные пользователя сохранены.')&&normalButton('Сохранить роли')?.disabled===false");
  check('ordinary profile save leaves role draft unsaved',await evaluate("normalRequests.filter(r=>r.method==='patch').length===1&&!normalRequests.some(r=>r.method==='put')&&normalButton('Сохранить данные').disabled"));
  await evaluate("normalButton('Сохранить роли').click()");await until("document.body.textContent.includes('Роли сохранены.')");
  check('ordinary profile and roles retain separate endpoints and payloads',await evaluate("normalRequests.some(r=>r.url==='/identity/admin/users/test-user'&&r.method==='patch'&&JSON.stringify(r.body)===JSON.stringify({firstName:'Новое имя'}))&&normalRequests.some(r=>r.url==='/identity/admin/users/test-user/roles'&&r.method==='put'&&JSON.stringify(r.body)===JSON.stringify({roleIds:['normal-role']}))"));
  await screenshot('ordinary-admin-independent-saves');await until("normalButton('Закрыть')?.disabled===false");await evaluate("normalButton('Закрыть').click()");await until("!document.querySelector('[role=dialog]')");
  for(const [path,label] of [['users','Пользователи'],['roles','Роли'],['permissions','Разрешения']]){
    await evaluate(`document.querySelector('nav a[href="/admin/${path}"]').click()`);
    await until(`location.pathname==='/admin/${path}'&&document.querySelector('nav a[aria-current=page]')?.textContent==='${label}'&&document.querySelector('h2')?.textContent==='${label}'`);
    check('ordinary '+path+' uses shared white workspace and navigation',await evaluate("!document.querySelector('iframe')&&document.querySelector('h1').textContent==='Администрирование'&&getComputedStyle(document.querySelector('h1').closest('section')).backgroundColor==='rgb(255, 255, 255)'&&document.querySelectorAll('nav a').length===3"));
    await screenshot('ordinary-admin-'+path);
  }
  check('no admin HTTP requests in geometry tests',requests.length===0);check('no runtime exceptions',errors.length===0);console.log('ADMIN DIALOG GEOMETRY CHECKS COMPLETE');
} finally{ws?.close();chrome.kill();await server.close();}
