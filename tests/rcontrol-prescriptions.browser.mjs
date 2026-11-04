// node tests/rcontrol-prescriptions.browser.mjs — Chrome, offline preview and actual query components.
import { spawn } from "node:child_process";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const { createServer } = await import(pathToFileURL(join(process.cwd(), "node_modules/vite/dist/node/index.js")));
const server = await createServer({ logLevel: "silent", server: { host: "127.0.0.1", port: 5194, strictPort: true } });
await server.listen();
const profile = await mkdtemp(join(tmpdir(), "rcontrol-prescriptions-"));
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
  await send("Page.navigate", { url: "http://127.0.0.1:5194/rcontrol?demoWorkspace=1" });
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
  await evaluate("workspace.getState().setTargetCategory('prescriptions')");
  await until('document.querySelector("[aria-labelledby=rcontrol-prescriptions-heading]")');
  await evaluate(`window.prescriptions=()=>document.querySelector('[aria-labelledby=rcontrol-prescriptions-heading]');window.referrals=()=>document.querySelector('[aria-labelledby=rcontrol-referrals-heading]');window.cards=()=>[...prescriptions().querySelectorAll('article')];`);
  const preview=async(index,value)=>{
    await evaluate(`(()=>{const e=document.querySelectorAll('[class*=controls_] select')[${index}];e.value=${JSON.stringify(value)};e.dispatchEvent(new Event('change',{bubbles:true}));})()`);await pause();
  };
  check('two independent sections and five referral columns',await evaluate("cards().length===2&&referrals().querySelectorAll('th').length===5"));
  for(const width of [360,768,1024,1440]){
    await send('Emulation.setDeviceMetricsOverride',{width,height:1100,deviceScaleFactor:1,mobile:false});await preview(1,'long');
    const result=await evaluate(`(()=>{const e=cards()[0],groups=e.querySelector('[class*=groups_]'),s=getComputedStyle(e),viewport=referrals().querySelector('.mt-table-viewport');viewport.scrollLeft=200;return {overflow:document.documentElement.scrollWidth>innerWidth,cols:getComputedStyle(groups).gridTemplateColumns.split(' ').length,scroll:viewport.scrollWidth<=viewport.clientWidth||viewport.scrollLeft>0,border:s.borderStyle,shadow:s.boxShadow,full:prescriptions().textContent.includes('000123456789'.repeat(8))&&referrals().textContent.includes('000123456789'.repeat(8)),clamped:[...document.querySelectorAll('dd,td')].some(e=>getComputedStyle(e).webkitLineClamp!=='none')};})()`);
    check('no page overflow or truncated data at '+width,!result.overflow&&result.full&&!result.clamped);
    check('responsive groups and borderless surfaces at '+width,result.cols===(width===360?1:width===1440?3:2)&&result.border==='none'&&result.shadow==='none');
    check('referrals scroll locally at '+width,result.scroll);
    await evaluate("prescriptions().scrollIntoView({block:'start',behavior:'instant'})");await pause();await screenshot('prescriptions-long-'+width);
  }
  await preview(1,'codes-only');check('code fallbacks retain zero and identifiers',await evaluate("cards()[0].textContent.includes('0')&&cards()[0].textContent.includes('202')&&referrals().textContent.includes('0000404')"));
  await preview(1,'empty-fields');check('empty fields display dash',await evaluate("cards()[0].textContent.includes('—')&&referrals().textContent.includes('—')"));
  await preview(1,'full');
  for(const count of [0,1,2,10,40]){
    await preview(0,String(count));check('all records retained at '+count,await evaluate(count===0?"prescriptions().textContent.includes('Данных не найдено')&&referrals().textContent.includes('Данных не найдено')":`cards().length===${count}&&referrals().querySelector('tbody').rows.length===${count}`));
  }
  await preview(0,'2');
  for(const index of [2,3]){
    for(const state of ['loading','empty','error']){
      await preview(index,state);const area=index===2?'prescriptions':'referrals',other=index===2?'referrals':'prescriptions';
      check('independent '+area+' '+state,await evaluate(`Boolean(${area}()${state==='loading'?".querySelector('.MuiSkeleton-root')":`.textContent.includes('${state==='empty'?'Данных не найдено':'Ошибка данных'}')`}&&${other}().textContent.includes('Демонстрационное'))`));
    }await preview(index,'ready');
  }
  await evaluate("prescriptions().scrollIntoView({block:'start',behavior:'instant'})");await screenshot('rcontrol-prescriptions-full-1440');
  await evaluate("referrals().scrollIntoView({block:'start',behavior:'instant'})");await screenshot('rcontrol-referrals-full-1440');
  const reference=await evaluate(`(()=>{const e=cards()[0],s=getComputedStyle(e),h=getComputedStyle(e.querySelector('h4'));return {padding:s.padding,gap:s.gap,radius:s.borderRadius,background:s.backgroundColor,font:h.fontSize,weight:h.fontWeight};})()`);
  await evaluate(`(async()=>{const {default:api}=await import('/src/shared/api/client/apiClient.ts');const original=api.defaults.adapter;window.modes={};window.held=[];window.requests=[];
    api.defaults.adapter=async config=>{const parts=(config.url??'').split('/'),kind=parts.at(-1),uid=Number(parts.at(-2));if(!['prescriptions','referrals'].includes(kind))return original(config);requests.push({kind,uid});const mode=modes[kind];
      const rows=Array.from({length:2},(_,i)=>kind==='prescriptions'?{perscriptionUid:uid*10+i,sequenceNumber:i+1,prescriptionTypeCode:0,prescriptionType:'PRESCRIPTION-'+uid+'-'+i,physicianSpecialtyCode:null,diagnosticMethodCode:202,diagnosticMethod:'METHOD',serviceCode:123456789,referralDate:'2026-01-03T00:00:00+14:00',referredToMoCode:'000123',medicalCareProfile:0,bedProfile:'BED'}:{referralUid:uid*10+i,referralDate:'2026-01-03',referredToMoCode:'000123',referralTypeCode:0,referralType:'REFERRAL-'+uid+'-'+i,diagnosticMethodCode:202,diagnosticMethod:'METHOD',referredServiceCode:'0000404',referredService:'SERVICE'});
      if(mode==='loading')await new Promise(resolve=>held.push({kind,uid,resolve}));return {config,status:200,statusText:'OK',headers:{},data:{isFailure:mode==='error',isSuccess:mode!=='error',clientMessage:'TEST ERROR',error:'TEST ERROR',value:mode==='error'?null:{[kind]:mode==='empty'?[]:rows}}};
    };const url=new URL(location.href);url.searchParams.set('demoPrescriptions','live');history.replaceState(history.state,'',url);workspace.getState().setTargetCategory('default');})()`);
  await pause();await evaluate("workspace.getState().setTargetCategory('prescriptions')");await until("prescriptions()?.textContent.includes('PRESCRIPTION-1111')&&referrals()?.textContent.includes('REFERRAL-1111')");
  check('both actual queries use current medical UID',await evaluate("['prescriptions','referrals'].every(kind=>requests.some(r=>r.kind===kind&&r.uid===1111))"));
  check('original date formats and zero values preserved',await evaluate("cards()[0].textContent.includes('2026-01-03T00:00:00+14:00')&&referrals().textContent.includes('03.01.2026')&&[...cards()[0].querySelectorAll('dd')].some(e=>e.textContent==='0')"));
  await evaluate("modes.prescriptions='loading';workspace.getState().selectMedicalCase(1112)");await until("held.some(r=>r.uid===1112)&&referrals().textContent.includes('REFERRAL-1112')");
  check('old prescriptions hidden while independent referrals are ready',await evaluate("Boolean(!prescriptions().textContent.includes('PRESCRIPTION-1111')&&prescriptions().querySelector('.MuiSkeleton-root'))"));
  await evaluate("delete modes.prescriptions;workspace.getState().selectMedicalCase(1111)");await until("prescriptions().textContent.includes('PRESCRIPTION-1111')");await evaluate('held.splice(0).forEach(r=>r.resolve())');await pause();
  check('late response cannot replace current case',await evaluate("prescriptions().textContent.includes('PRESCRIPTION-1111')&&!prescriptions().textContent.includes('PRESCRIPTION-1112')"));
  for(const kind of ['prescriptions','referrals']){
    for(const state of ['empty','error']){
      await evaluate(`modes.${kind}='${state}';client.invalidateQueries({queryKey:['r-control','${kind}']})`);await pause();
      check('actual independent '+kind+' '+state,await evaluate(`${kind}().textContent.includes('${state==='empty'?'Данных не найдено':'Ошибка данных'}')&&${kind==='prescriptions'?'referrals':'prescriptions'}().textContent.includes('${kind==='prescriptions'?'REFERRAL':'PRESCRIPTION'}-1111')`));
    }await evaluate(`delete modes.${kind};client.invalidateQueries({queryKey:['r-control','${kind}']})`);await pause();
  }
  await send('Page.navigate',{url:'http://127.0.0.1:5194/med-view?demoPrescriptions=1'});await until('document.getElementById("medview-case-tab-prescriptions")');await evaluate('document.getElementById("medview-case-tab-prescriptions").click()');
  await until('document.querySelector("[aria-labelledby=medview-prescriptions-heading] article")');
  const medview=await evaluate(`(()=>{const e=document.querySelector('[aria-labelledby=medview-prescriptions-heading] article'),s=getComputedStyle(e),h=getComputedStyle(e.querySelector('h4'));return {padding:s.padding,gap:s.gap,radius:s.borderRadius,background:s.backgroundColor,font:h.fontSize,weight:h.fontWeight};})()`);
  check('panel geometry and typography match actual MedView',JSON.stringify(reference)===JSON.stringify(medview));
  await evaluate("document.querySelector('[aria-labelledby=medview-prescriptions-heading]').scrollIntoView({block:'start',behavior:'instant'})");await screenshot('medview-prescriptions-reference-1440');
  check('no runtime exceptions',errors.length===0);console.log('RCONTROL PRESCRIPTIONS CHECKS COMPLETE');
} finally {ws?.close();chrome.kill();await server.close();}
