// node tests/rcontrol-oncology.browser.mjs — Chrome, offline preview and actual query components.
import { spawn } from "node:child_process";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const { createServer } = await import(pathToFileURL(join(process.cwd(), "node_modules/vite/dist/node/index.js")));
const server = await createServer({ logLevel: "silent", server: { host: "127.0.0.1", port: 5193, strictPort: true } });
await server.listen();
const profile = await mkdtemp(join(tmpdir(), "rcontrol-oncology-"));
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
  await send("Page.navigate", { url: "http://127.0.0.1:5193/rcontrol?demoWorkspace=1" });
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
  await evaluate("workspace.getState().setTargetCategory('oncology')");
  await until('document.querySelector("[aria-labelledby=rcontrol-oncology-treatment]")');
  await evaluate(`window.oncology=()=>document.querySelector('[class*=oncologyRoot_]');window.services=()=>[...document.querySelectorAll('[data-oncology-service]')];window.medications=()=>[...document.querySelectorAll('[data-oncology-medication]')];`);
  const preview=async(index,value)=>{
    await evaluate(`(()=>{const s=document.querySelectorAll('[class*=controls_] select')[${index}];s.value=${JSON.stringify(value)};s.dispatchEvent(new Event('change',{bubbles:true}));})()`);await pause();
  };
  const key=async key=>{
    await send('Input.dispatchKeyEvent',{type:'keyDown',key,code:key===' '?'Space':key,windowsVirtualKeyCode:key===' '?32:13});
    await send('Input.dispatchKeyEvent',{type:'keyUp',key,code:key===' '?'Space':key,windowsVirtualKeyCode:key===' '?32:13});await pause();
  };
  await until('services().length===2');
  await evaluate('services()[0].focus()');await key('Enter');
  await until('medications().length===2');
  await evaluate('medications()[0].focus()');await key(' ');
  await until('document.querySelector("table[aria-label=Инъекции]")');
  check('native Enter and Space select services and medications',await evaluate("services()[0].getAttribute('aria-pressed')==='true'&&medications()[0].getAttribute('aria-pressed')==='true'"));
  check('both tables retain all columns',await evaluate("document.querySelector('table[aria-label=Диагностика] thead').querySelectorAll('th').length===5&&document.querySelector('table[aria-label=Инъекции] thead').querySelectorAll('th').length===7"));
  for(const width of [360,768,1024,1440]){
    await send('Emulation.setDeviceMetricsOverride',{width,height:1100,deviceScaleFactor:1,mobile:false});
    await preview(0,'long');
    const geometry=await evaluate(`(()=>{const p=oncology().querySelector('[class*=pairedPanels_]'),a=p.children[0].getBoundingClientRect(),b=p.children[1].getBoundingClientRect();return {overflow:document.documentElement.scrollWidth>innerWidth,paired:Math.abs(a.top-b.top)<1,stacked:b.top>=a.bottom,tables:[...oncology().querySelectorAll('.mt-table-viewport')].map(e=>({width:e.clientWidth,scroll:e.scrollWidth,overflow:getComputedStyle(e).overflowX})),noClamp:[...oncology().querySelectorAll('[class*=recordText_],[class*=selectionTitle_]')].every(e=>getComputedStyle(e).webkitLineClamp==='none')};})()`);
    check('no page overflow and responsive panels at '+width,!geometry.overflow&&(width>=1024?geometry.paired:geometry.stacked));
    check('wide tables scroll locally and long text is not clamped at '+width,geometry.tables.length===2&&geometry.tables.every(e=>e.overflow==='auto')&&geometry.noClamp);
    await evaluate("oncology().scrollIntoView({block:'start',behavior:'instant'})");await pause();await screenshot('oncology-long-'+width);
    await evaluate("document.querySelector('table[aria-label=Инъекции]').parentElement.scrollLeft=200");
    check('injections scroll when wider than viewport at '+width,await evaluate("(()=>{const e=document.querySelector('table[aria-label=Инъекции]').parentElement;return e.scrollWidth<=e.clientWidth||e.scrollLeft>0;})()"));
  }
  await preview(0,'nullable');
  check('null, false and zero remain distinct',await evaluate("oncology().textContent.includes('—')&&document.querySelector('table[aria-label=Инъекции]').textContent.includes('-')"));
  await preview(0,'full');
  for(const index of [2,3,4,5,6,7,8,9]){
    for(const state of ['loading','empty','error']){
      // Empty service/medication states clear the local preview's descendants.
      if(index>=7){await evaluate('services()[0]?.click()');await pause();}
      if(index>=8){await evaluate('medications()[0]?.click()');await pause();}
      await preview(index,state);
      const area = index < 6 ? `oncology().querySelector('[class*=topSection_]').querySelectorAll('[class*=panel_]')[${index-2}]` : index < 8 ? `document.querySelector('[aria-labelledby=rcontrol-oncology-${index===6?'services':'medications'}]')` : `[...oncology().querySelectorAll('h3')].find(e=>e.textContent==='${index===8?'Даты введения':'Инъекции'}').parentElement`;
      check('preview area '+index+' '+state,await evaluate(`Boolean((${area})${state==='loading'?".querySelector('.MuiSkeleton-root')":`.textContent.includes('${state==='empty'?'Данных не найдено':'Ошибка данных'}')`})`));
      await preview(index,'ready');
    }
  }
  await preview(1,'10');await evaluate('services()[0].click()');await pause();await evaluate('medications()[0].click()');await pause();
  check('multiple table records and bounded selection lists',await evaluate("document.querySelector('table[aria-label=Диагностика] tbody').rows.length===10&&document.querySelector('table[aria-label=Инъекции] tbody').rows.length===10&&getComputedStyle(services()[0].parentElement).overflowY==='auto'&&getComputedStyle(medications()[0].parentElement).overflowY==='auto'"));
  await preview(1,'2');await evaluate('services()[0].click()');await pause();await evaluate('medications()[0].click()');await pause();
  for(const selector of ['services','medications']){
    await evaluate(`${selector}()[1].scrollIntoView({block:'center',behavior:'instant'});${selector}()[1].focus()`);
    await key('Enter');
    check(selector+' keyboard focus and selected state remain distinct',await evaluate(`${selector}()[1].matches(':focus-visible')&&getComputedStyle(${selector}()[1]).outlineStyle==='solid'&&${selector}()[1].getAttribute('aria-pressed')==='true'`));
    const point=await evaluate(`(()=>{const r=${selector}()[1].getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2};})()`);
    const background=await evaluate(`getComputedStyle(${selector}()[1]).backgroundColor`);
    await send('Input.dispatchMouseEvent',{type:'mouseMoved',...point});await pause();
    check(selector+' selected hover stays accented',await evaluate(`${selector}()[1].getAttribute('aria-pressed')==='true'&&getComputedStyle(${selector}()[1]).backgroundColor!==getComputedStyle(${selector}()[1].parentElement.parentElement).backgroundColor&&getComputedStyle(${selector}()[1]).backgroundColor!==${JSON.stringify(background)}`));
  }
  await evaluate("oncology().scrollIntoView({block:'start',behavior:'instant'})");await screenshot('rcontrol-oncology-full-1440');
  await evaluate("document.querySelector('[aria-labelledby=rcontrol-oncology-treatment]').scrollIntoView({block:'start',behavior:'instant'})");await pause();await screenshot('rcontrol-oncology-treatment-1440');
  const reference=await evaluate(`(()=>{const e=oncology().querySelector('[class*=panel_]'),s=getComputedStyle(e),h=getComputedStyle(e.querySelector('h3'));return {padding:s.padding,gap:s.gap,radius:s.borderRadius,background:s.backgroundColor,font:h.fontSize,weight:h.fontWeight};})()`);

  // Actual query roots and existing store actions, with test-only adapter fixtures.
  await evaluate(`(async()=>{const {default:api}=await import('/src/shared/api/client/apiClient.ts');const original=api.defaults.adapter;
    window.modes={};window.held=[];window.requests=[];
    api.defaults.adapter=async config=>{const parts=(config.url??'').split('/'),kind=parts.at(-1),uid=Number(parts.at(-2));
      const property={'oncology-case':'oncologyCase',consultations:'consultations',diagnostics:'diagnostics',contraindications:'contraindications','oncology-services':'oncologyServices',medications:'medications','injection-dates':'injectionDates',injections:'injections'}[kind];
      if(!property)return original(config);requests.push({kind,uid});const mode=modes[kind];
      let data=kind==='oncology-case'?{oncologyCaseUid:uid*10,referralReasonCode:0,referralReason:'CASE-'+uid,stageCode:0,stage:'TEST',tumorValue:0,nodusValue:null,metastasisValue:null,isMetastasisDetected:false,totalFocusDose:0}:
        Array.from({length:2},(_,i)=>{const id=uid*10+i+1;return kind==='consultations'?{consultationUid:id,consultationDate:'2026-01-03',consultationPurpose:'CONSULT-'+uid,consultationPurposeCode:0}:kind==='diagnostics'?{diagnosticsUid:id,specimenCollectionDate:'2026-01-03',diagnosticType:0,diagnosticCode:0,diagnosticResultCode:0,isResultReceived:i===0}:kind==='contraindications'?{contraindicationUid:id,contraindicationDate:'2026-01-03',contraindication:'CONTRA-'+uid,contraindicationCode:0}:kind==='oncology-services'?{oncologyServiceUid:id,serviceType:'SERVICE-'+uid+'-'+i,serviceTypeCode:0,surgicalTreatmentType:null,surgicalTreatmentTypeCode:null,drugTherapyLine:null,drugTherapyLineCode:null,isAntiemeticProphylaxis:false,radiotherapyType:null,radioTherapyTypeCode:null}:kind==='medications'?{medicamentUid:id,drugIdentifier:'DRUG-'+uid+'-'+i,therapyRegimenCode:'TEST-REGIMEN'}:kind==='injection-dates'?{injectionDateUid:id,administrationDate:'2026-01-03'}:{injectionUid:id,administrationDate:'2026-01-03',administeredQuantity:0,consumedQuantity:1,unitCost:1234.56,administeredCost:0,consumedCost:1234.56,isReductionApplied:false};});
      if(mode==='loading')await new Promise(resolve=>held.push({kind,uid,resolve}));
      if(mode==='empty')data=kind==='oncology-case'?null:[];
      return {config,status:200,statusText:'OK',headers:{},data:{isFailure:mode==='error',isSuccess:mode!=='error',error:'TEST ERROR',clientMessage:'',value:mode==='error'?null:{[property]:data}}};
    };const url=new URL(location.href);url.searchParams.set('demoOncology','live');history.replaceState(history.state,'',url);workspace.getState().setTargetCategory('default');})()`);
  await pause();await evaluate("workspace.getState().setTargetCategory('oncology')");
  await until("oncology()?.textContent.includes('CASE-1111')&&services().length===2");
  check('no automatic service or medication selection introduced',await evaluate("workspace.getState().selectedOncologyServiceUid===null&&workspace.getState().selectedMedicationUid===null&&medications().length===0"));
  await evaluate('services()[0].click()');await until('medications().length===2');
  await evaluate('medications()[0].click()');await until('document.querySelector("table[aria-label=Инъекции] tbody")?.rows.length===2');
  const before=await evaluate('({service:workspace.getState().selectedOncologyServiceUid,medication:workspace.getState().selectedMedicationUid})');
  await evaluate("client.invalidateQueries({queryKey:['r-control','oncology-services']})");await pause();
  check('refetch preserves current store selection',await evaluate(`workspace.getState().selectedOncologyServiceUid===${before.service}&&workspace.getState().selectedMedicationUid===${before.medication}`));
  await evaluate('services()[1].click()');await until(`workspace.getState().selectedOncologyServiceUid!==${before.service}&&medications().length===2`);
  check('service change clears medication and old injections',await evaluate("workspace.getState().selectedMedicationUid===null&&!document.querySelector('table[aria-label=Инъекции]')"));
  await evaluate('medications()[0].click()');await until('document.querySelector("table[aria-label=Инъекции]")');
  await evaluate("modes['oncology-case']='loading';workspace.getState().selectMedicalCase(1112)");await until("held.some(r=>r.uid===1112)");
  check('new case loading hides previous oncology and descendants',await evaluate("!oncology().textContent.includes('CASE-1111')&&services().length===0&&medications().length===0&&!document.querySelector('table[aria-label=Инъекции]')"));
  await evaluate("delete modes['oncology-case'];workspace.getState().selectMedicalCase(1111)");await until("oncology().textContent.includes('CASE-1111')");
  await evaluate('held.splice(0).forEach(r=>r.resolve())');await pause();
  check('late response cannot replace current oncology',await evaluate("oncology().textContent.includes('CASE-1111')&&!oncology().textContent.includes('CASE-1112')"));
  for(const kind of ['consultations','diagnostics','contraindications','oncology-services','oncology-case']){
    for(const state of ['empty','error']){
      await evaluate(`modes['${kind}']='${state}';client.invalidateQueries({queryKey:['r-control','${kind}']})`);await pause();
      check('actual '+kind+' '+state+' keeps independent information',await evaluate(`oncology().textContent.includes('${kind==='oncology-case'?'CONSULT-1111':'CASE-1111'}')&&oncology().textContent.includes('${state==='error'?'Ошибка данных':'Данных не найдено'}')`));
    }
    await evaluate(`delete modes['${kind}'];client.invalidateQueries({queryKey:['r-control','${kind}']})`);await pause();
  }
  await send('Page.navigate',{url:'http://127.0.0.1:5193/med-view?demoOncology=1'});
  await until('document.getElementById("medview-case-tab-oncology")');await evaluate('document.getElementById("medview-case-tab-oncology").click()');
  await until('document.querySelector("[aria-labelledby=medview-oncology-treatment]")');
  const medview=await evaluate(`(()=>{const e=document.querySelector('[class*=oncologyRoot_] [class*=panel_]'),s=getComputedStyle(e),h=getComputedStyle(e.querySelector('h3'));return {padding:s.padding,gap:s.gap,radius:s.borderRadius,background:s.backgroundColor,font:h.fontSize,weight:h.fontWeight};})()`);
  check('panel geometry and typography match actual MedView',JSON.stringify(reference)===JSON.stringify(medview));
  await evaluate("document.querySelector('[class*=oncologyRoot_]').scrollIntoView({block:'start',behavior:'instant'})");await pause();await screenshot('medview-oncology-reference-1440');
  check('no runtime exceptions',errors.length===0);
  console.log('RCONTROL ONCOLOGY CHECKS COMPLETE');
} finally {ws?.close();chrome.kill();await server.close();}
