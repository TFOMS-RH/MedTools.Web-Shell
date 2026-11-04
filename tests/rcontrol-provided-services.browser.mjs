// node tests/rcontrol-provided-services.browser.mjs — Chrome, offline preview and actual query components.
import { spawn } from "node:child_process";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const { createServer } = await import(pathToFileURL(join(process.cwd(), "node_modules/vite/dist/node/index.js")));
const server = await createServer({ logLevel: "silent", server: { host: "127.0.0.1", port: 5196, strictPort: true } });
await server.listen();
const profile = await mkdtemp(join(tmpdir(), "rcontrol-provided-services-"));
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
  const pending = new Map(), errors = [];
  ws.onmessage = ({ data }) => {
    const message = JSON.parse(data);
    if (message.method === "Runtime.exceptionThrown") errors.push(message.params);
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
    console.log(await evaluate("document.body.innerText"));
    throw Error("Timeout " + expression);
  };
  const screenshot = async name => {
    const { data } = await send("Page.captureScreenshot", { format: "png" });
    const path = join(profile, name + ".png"); await writeFile(path, Buffer.from(data, "base64")); console.log("SCREENSHOT " + path);
  };
  await send("Page.enable"); await send("Runtime.enable"); await send("Page.bringToFront");
  await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 1100, deviceScaleFactor: 1, mobile: false });
  await send("Page.navigate", { url: "http://127.0.0.1:5196/rcontrol?demoWorkspace=1" });
  await until('document.body.textContent.includes("Сначала выберите источник данных")');
  await evaluate(`(async()=>{
    const {useRControlWorkspaceStore:workspace}=await import('/src/modules/rControl/widgets/workspace/model/store/useRControlWorkspaceStore.ts');
    const {useRControlWorkspacePanelStore:panel}=await import('/src/modules/rControl/widgets/workspace/model/store/useRControlWorkspacePanelStore.ts');
    window.workspace=workspace;window.panel=panel;
    const element=document.querySelector('[class*=filtersPanelRoot_]');
    let fiber=element[Object.keys(element).find(key=>key.startsWith('__reactFiber$'))];
    while(fiber){if(fiber.memoizedProps?.client?.getQueryCache){window.client=fiber.memoizedProps.client;break;}fiber=fiber.return;}
    panel.getState().selectTargetDb('SMODB18');panel.getState().selectMedicalOrganization('001');
    panel.getState().selectBillingYear(2026);panel.getState().selectBillingMonth(1);
    workspace.getState().selectInvoice(11);workspace.getState().selectCompletedCase(111);
  })()`);
  await until("workspace.getState().selectedMedicalCaseUid===1111");
  await evaluate("workspace.getState().setTargetCategory('provided-services')");
  await until('document.querySelector("[aria-labelledby=rcontrol-services-heading] input[type=radio]")');
  await evaluate(`window.services=()=>document.querySelector('section[aria-labelledby=rcontrol-services-heading]');window.devices=()=>document.querySelector('section[aria-labelledby=rcontrol-devices-heading]');window.radios=()=>[...services().querySelectorAll('input[type=radio]')];`);
  const preview=async(index,value)=>{await evaluate(`(()=>{const e=document.querySelectorAll('[class*=controls_] select')[${index}];e.value=${JSON.stringify(value)};e.dispatchEvent(new Event('change',{bubbles:true}));})()`);await pause();};
  const space=async()=>{await send('Input.dispatchKeyEvent',{type:'keyDown',key:' ',code:'Space',windowsVirtualKeyCode:32});await send('Input.dispatchKeyEvent',{type:'keyUp',key:' ',code:'Space',windowsVirtualKeyCode:32});await pause();};
  check('devices are gated before service selection',await evaluate("devices().textContent.includes('Выберите оказанную услугу')&&!devices().querySelector('table')"));
  await evaluate('radios()[0].focus()');await space();await until('devices().querySelector("table tbody")?.rows.length===2');
  check('native radio keyboard selection and green focus',await evaluate("radios()[0].checked&&radios()[0].matches(':focus-visible')&&getComputedStyle(radios()[0]).outlineColor==='rgb(36, 135, 109)'"));
  check('service and device columns retained',await evaluate("services().querySelectorAll('thead th').length===5&&devices().querySelectorAll('thead th').length===3"));
  for(const width of [360,768,1024,1440]){
    await send('Emulation.setDeviceMetricsOverride',{width,height:1100,deviceScaleFactor:1,mobile:false});await preview(2,'long');
    const geometry=await evaluate(`(()=>{const viewports=[...services().querySelectorAll('.mt-table-viewport'),...devices().querySelectorAll('.mt-table-viewport')];return {overflow:document.documentElement.scrollWidth>innerWidth,local:viewports.every(e=>{e.scrollLeft=200;return getComputedStyle(e).overflowX==='auto'&&(e.scrollWidth<=e.clientWidth||e.scrollLeft>0);}),full:services().textContent.includes('ТЕСТ-УСЛУГА-000123456789'.repeat(5))&&services().textContent.includes('Вторая строка комментария.')&&devices().textContent.includes('0000123456789'.repeat(16)),clamp:[...document.querySelectorAll('td,dd')].some(e=>getComputedStyle(e).webkitLineClamp!=='none')};})()`);
    check('no page overflow or truncated long data at '+width,!geometry.overflow&&geometry.full&&!geometry.clamp);check('both tables scroll locally at '+width,geometry.local);
    await evaluate("services().scrollIntoView({block:'start',behavior:'instant'})");await pause();await screenshot('provided-services-long-'+width);
  }
  await preview(2,'empty-fields');check('null tariff stays dash while real quantity zero stays zero',await evaluate("(()=>{const cells=services().querySelector('tbody tr').cells;return cells[2].textContent==='0'&&cells[3].textContent==='—'&&services().textContent.includes('—')&&devices().textContent.includes('—');})()"));
  await preview(2,'codes-only');check('codes without descriptions remain visible',await evaluate("services().textContent.includes('ТЕСТ-УСЛУГА-1001')&&services().textContent.includes('31')"));await preview(2,'full');
  for(const count of [0,1,2,10,40]){
    await preview(0,String(count));await preview(1,String(count));if(count)await evaluate('radios()[0].click()');await pause();
    check('all service and device records retained at '+count,await evaluate(count===0?"services().textContent.includes('Данных не найдено')&&devices().textContent.includes('Данных не найдено')":`radios().length===${count}&&devices().querySelector('tbody').rows.length===${count}`));
  }
  await preview(0,'2');await preview(1,'2');await evaluate('radios()[0].click()');await pause();
  for(const [index,name] of [[3,'services'],[4,'devices']]){
    for(const state of ['loading','empty','error']){
      await preview(index,state);check('preview '+name+' '+state,await evaluate(`Boolean(${name}()${state==='loading'?".querySelector('.MuiSkeleton-root')":`.textContent.includes('${state==='empty'?'Данных не найдено':'Ошибка данных'}')`})`));
    }await preview(index,'ready');
  }
  await evaluate("services().querySelector('.mt-table-viewport').scrollLeft=0;services().scrollIntoView({block:'start',behavior:'instant'})");await screenshot('rcontrol-provided-services-full-1440');
  await evaluate("devices().scrollIntoView({block:'start',behavior:'instant'})");await screenshot('rcontrol-medical-devices-full-1440');
  const reference=await evaluate(`(()=>{const e=services().querySelector('thead th'),s=getComputedStyle(e),d=getComputedStyle(services().querySelector('td'));return {padding:s.padding,font:s.fontSize,weight:s.fontWeight,background:s.backgroundColor,cellPadding:d.padding};})()`);

  await evaluate(`(async()=>{const {default:api}=await import('/src/shared/api/client/apiClient.ts');const original=api.defaults.adapter;window.modes={};window.held=[];window.requests=[];
    api.defaults.adapter=async config=>{const parts=(config.url??'').split('/'),kind=parts.at(-1),uid=Number(parts.at(-2)),property={'provided-services':'providedServices','medical-devices':'medicalDevices'}[kind];if(!property)return original(config);requests.push({kind,uid});const mode=modes[kind];
      const rows=Array.from({length:2},(_,i)=>kind==='provided-services'?{providedServiceUid:uid*10+i+1,serviceCode:'0000-SERVICE-'+uid+'-'+i,service:'SERVICE-'+uid+'-'+i,medicalInterventionType:'INTERVENTION',medicalProfileCode:0,medicalProfile:'PROFILE',physicianSpecialtyCode:31,physicianSpecialty:'SPECIALTY',isPediatric:i===1,serviceStartDate:'2026-01-03',serviceEndDate:'2026-01-05',diagnosis:'DX-CODE',serviceQuantity:i===0?0:1.12345,unitRate:i===0?null:1225.5,amountBilled:2451,internalComment:['COMMENT','SECOND LINE'].join(String.fromCharCode(10))}:{medicalDeviceUid:uid*10+i,implantationDate:'2026-01-04',medicalDeviceTypeCode:0,serialNumber:'SERIAL-'+uid+'-'+i});
      if(mode==='loading')await new Promise(resolve=>held.push({kind,uid,resolve}));return {config,status:200,statusText:'OK',headers:{},data:{isFailure:mode==='error',isSuccess:mode!=='error',clientMessage:'TEST ERROR',error:'TEST ERROR',value:mode==='error'?null:{[property]:mode==='empty'?[]:rows}}};
    };const url=new URL(location.href);url.searchParams.set('demoProvidedServices','live');history.replaceState(history.state,'',url);workspace.getState().setTargetCategory('default');})()`);
  await pause();await evaluate("workspace.getState().setTargetCategory('provided-services')");await until("services()?.textContent.includes('SERVICE-1111')&&radios().length===2");
  check('no service or devices selected automatically',await evaluate("workspace.getState().selectedProvidedServiceUid===null&&!devices().querySelector('table')&&!requests.some(r=>r.kind==='medical-devices')"));
  check('original formats and medical fields retained',await evaluate("['03.01.2026','05.01.2026','DX-CODE','PROFILE','SPECIALTY','Взрослый','Ребенок','INTERVENTION','1.12345','SECOND LINE'].every(v=>services().textContent.includes(v))&&services().querySelector('tbody tr').cells[3].textContent==='—'&&services().querySelector('tbody tr').cells[2].textContent==='0'"));
  await evaluate('radios()[0].focus()');await space();await until("devices().textContent.includes('SERIAL-11111')");
  check('device query uses selected service UID',await evaluate("requests.some(r=>r.kind==='medical-devices'&&r.uid===workspace.getState().selectedProvidedServiceUid)"));
  await evaluate("client.invalidateQueries({queryKey:['r-control','provided-services']})");await pause();check('refetch retains selected service',await evaluate('workspace.getState().selectedProvidedServiceUid===11111&&radios()[0].checked'));
  await evaluate("modes['medical-devices']='loading';radios()[1].click()");await until("held.some(r=>r.kind==='medical-devices'&&r.uid===11112)");check('service change hides old medical devices',await evaluate("!devices().textContent.includes('SERIAL-11111')&&Boolean(devices().querySelector('.MuiSkeleton-root'))"));
  await evaluate("delete modes['medical-devices'];radios()[0].click()");await until("devices().textContent.includes('SERIAL-11111')");await evaluate('held.splice(0).forEach(r=>r.resolve())');await pause();check('late devices cannot replace current selection',await evaluate("devices().textContent.includes('SERIAL-11111')&&!devices().textContent.includes('SERIAL-11112')"));
  for(const state of ['empty','error']){await evaluate(`modes['medical-devices']='${state}';client.invalidateQueries({queryKey:['r-control','medical-devices']})`);await pause();check('device '+state+' preserves services',await evaluate(`devices().textContent.includes('${state==='empty'?'Данных не найдено':'Ошибка данных'}')&&services().textContent.includes('SERVICE-1111')`));}
  await evaluate("delete modes['medical-devices'];modes['provided-services']='loading';workspace.getState().selectMedicalCase(1112)");await until("held.some(r=>r.kind==='provided-services'&&r.uid===1112)");check('medical case change clears selection and old dependent content',await evaluate("workspace.getState().selectedProvidedServiceUid===null&&!services().textContent.includes('SERVICE-1111')&&!devices().querySelector('table')"));
  await evaluate("delete modes['provided-services'];workspace.getState().selectMedicalCase(1111)");await until("services().textContent.includes('SERVICE-1111')");await evaluate('held.splice(0).forEach(r=>r.resolve())');await pause();check('late services cannot replace current case',await evaluate("services().textContent.includes('SERVICE-1111')&&!services().textContent.includes('SERVICE-1112')"));
  for(const state of ['empty','error']){await evaluate(`modes['provided-services']='${state}';client.invalidateQueries({queryKey:['r-control','provided-services']})`);await pause();check('service '+state+' handled by existing query root',await evaluate(`services().textContent.includes('${state==='empty'?'Данных не найдено':'Ошибка данных'}')`));}
  await send('Page.navigate',{url:'http://127.0.0.1:5196/med-view?demoProvidedServices=1'});await until('document.getElementById("medview-case-tab-provided-services")');await evaluate('document.getElementById("medview-case-tab-provided-services").click()');await until('document.querySelector("section[aria-labelledby=medview-services-heading] table")');
  const medview=await evaluate(`(()=>{const e=document.querySelector('section[aria-labelledby=medview-services-heading] thead th'),s=getComputedStyle(e),d=getComputedStyle(document.querySelector('section[aria-labelledby=medview-services-heading] td'));return {padding:s.padding,font:s.fontSize,weight:s.fontWeight,background:s.backgroundColor,cellPadding:d.padding};})()`);
  check('table density and typography match actual MedView',JSON.stringify(reference)===JSON.stringify(medview));await evaluate("document.querySelector('section[aria-labelledby=medview-services-heading]').scrollIntoView({block:'start',behavior:'instant'})");await screenshot('medview-provided-services-reference-1440');
  check('no runtime exceptions',errors.length===0);console.log('RCONTROL PROVIDED SERVICES CHECKS COMPLETE');
} finally {ws?.close();chrome.kill();await server.close();}
