// node tests/rcontrol-case-details.browser.mjs — Chrome, offline preview and actual query components.
import { spawn } from "node:child_process";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const { createServer } = await import(pathToFileURL(join(process.cwd(), "node_modules/vite/dist/node/index.js")));
const server = await createServer({ logLevel: "silent", server: { host: "127.0.0.1", port: 5192, strictPort: true } });
await server.listen();
const profile = await mkdtemp(join(tmpdir(), "rcontrol-case-details-"));
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
  await send("Page.navigate", { url: "http://127.0.0.1:5192/rcontrol?demoWorkspace=1" });
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
  await evaluate("workspace.getState().setTargetCategory('case-details')");
  await until('document.querySelector("[aria-labelledby=rcontrol-details-basic]")');
  await evaluate(`window.medical=()=>document.querySelector('[aria-labelledby=rcontrol-medical-details-heading]');
    window.completed=()=>document.querySelector('[aria-labelledby=rcontrol-completed-details-heading]');
    window.group=id=>document.querySelector('[aria-labelledby='+id+']');`);
  const preview = async (index,value) => {
    await evaluate(`(()=>{const select=document.querySelectorAll('[class*=controls_] select')[${index}];select.value=${JSON.stringify(value)};select.dispatchEvent(new Event('change',{bubbles:true}));})()`);
    await pause();
  };
  check('all nine information groups render',await evaluate("medical().querySelectorAll('h4').length===5&&completed().querySelectorAll('h4').length===4"));
  for(const width of [360,768,1024,1440]){
    await send('Emulation.setDeviceMetricsOverride',{width,height:1100,deviceScaleFactor:1,mobile:false});
    await preview(0,'long');
    await evaluate('document.fonts.ready.then(()=>true)');
    const layout=await evaluate(`(()=>{const pairs=[['rcontrol-details-basic','rcontrol-details-characteristics'],['rcontrol-details-treatment','rcontrol-details-additional'],['rcontrol-completed-care','rcontrol-completed-treatment']];return {overflow:document.documentElement.scrollWidth>innerWidth,pairs:pairs.map(([a,b])=>{const x=group(a).getBoundingClientRect(),y=group(b).getBoundingClientRect();return {paired:Math.abs(x.top-y.top)<1&&Math.abs(x.height-y.height)<1,stacked:y.top>=x.bottom};}),panels:[...medical().querySelectorAll('section'),...completed().querySelectorAll('section')].map(e=>({border:getComputedStyle(e).borderStyle,shadow:getComputedStyle(e).boxShadow})),long:medical().textContent.includes('0000123456789012345678901234567890')};})()`);
    check('no page overflow at '+width,!layout.overflow);
    check('equal-height pairs or natural stacking at '+width,layout.pairs.every(p=>width>=1024?p.paired:p.stacked));
    check('borderless surfaces and complete long identifiers at '+width,layout.long&&layout.panels.every(p=>p.border==='none'&&p.shadow==='none'));
    await evaluate("medical().scrollIntoView({block:'start',behavior:'instant'})"); await pause();
    await screenshot('case-details-long-'+width);
  }
  await preview(0,'empty-fields');
  check('nullable values use dash',await evaluate("medical().textContent.includes('—')&&completed().textContent.includes('—')"));
  await preview(0,'codes-only');
  check('organization codes remain without names',await evaluate("completed().textContent.includes('000001')&&completed().textContent.includes('000002')"));
  await preview(0,'full');
  for(const index of [1,2]){
    for(const state of ['loading','empty','error']){
      await preview(index,state);
      check('independent preview '+index+' '+state,await evaluate(`Boolean(${index===1?'completed':'medical'}().querySelector('h4')&&${index===1?'medical':'completed'}().${state==='loading'?"querySelector('.MuiSkeleton-root')":`textContent.includes('${state==='empty'?'Данных не найдено':'Ошибка данных'}')`})`));
    }
    await preview(index,'ready');
  }
  await evaluate("medical().scrollIntoView({block:'start',behavior:'instant'})");await screenshot('case-details-full-1440');

  // Exercise the actual query roots with test-only HTTP adapter responses.
  await evaluate(`(async()=>{const {default:api}=await import('/src/shared/api/client/apiClient.ts');const original=api.defaults.adapter;
    window.detailModes={medical:'success',completed:'success'};window.detailHeld=[];window.detailRequests=[];
    api.defaults.adapter=async config=>{const segments=(config.url??'').split('/'),uid=Number(segments.at(-1)),path=segments.at(-2);const kind=path==='medical-cases'?'medical':path==='completed-cases'?'completed':null;
      if(!kind||!Number.isFinite(uid))return original(config);
      detailRequests.push({kind,uid});const mode=detailModes[kind];
      const data=kind==='medical'?{medicalProfile:77,physicianSpecialty:31,treatmentStartDate:'2026-01-03',treatmentEndDate:'2026-01-15',primaryDiagnosis:'TEST-DX',paidUnits:0,department:'TEST-DEPARTMENT',departmentCode:123,isPediatric:false,visitPurpose:'TEST-PURPOSE',bedProfile:66,medicalRecordNumber:'RECORD-'+uid,isAdmissionTransfer:null,isRehabilitation:true,facilityLevel:'TEST-LEVEL',initialDiagnosis:'TEST-INITIAL',isOncologySuspicion:false,physicianCode:'TEST-PHYSICIAN',weight:77.7,diseaseCharacter:9,internalComment:'TEST-COMMENT'}:{medicalOrganizationCode:'000001',medicalOrganizationName:'ORGANIZATION-'+uid,referringMedicalOrganizationCode:'000002',referringMedicalOrganizationName:'REFERRAL',referralDate:'2026-01-02',careConditions:103,medicalCareType:101,paymentMethodCode:104,medicalCareForm:102,treatmentStartDate:'2026-01-03',treatmentEndDate:'2026-01-20',hospitalizationDuration:17,hospitalizationOutcome:201,isIntrahospitalTransfer:true,screeningResult:203,isRefusal:false,isMobileTeam:null,diseaseOutcome:202};
      if(mode==='loading')await new Promise(resolve=>detailHeld.push({kind,uid,resolve}));
      return {config,status:200,statusText:'OK',headers:{},data:{isSuccess:mode!=='error',isFailure:mode==='error',error:'TEST ERROR',clientMessage:'',value:mode==='error'?null:{[kind==='medical'?'medicalCaseDetails':'completedCaseDetails']:mode==='empty'?null:data}}};
    };const url=new URL(location.href);url.searchParams.set('demoCaseDetails','live');history.replaceState(history.state,'',url);workspace.getState().setTargetCategory('default');})()`);
  await pause();await evaluate("workspace.getState().setTargetCategory('case-details')");
  await until("medical()?.textContent.includes('RECORD-1111')&&completed()?.textContent.includes('ORGANIZATION-111')");
  check('actual queries use current parent UIDs',await evaluate("detailRequests.some(r=>r.kind==='medical'&&r.uid===1111)&&detailRequests.some(r=>r.kind==='completed'&&r.uid===111)"));
  check('dates, zero and tri-state booleans preserved',await evaluate("['03.01.2026','15.01.2026','Взрослый','Да','Нет','—'].every(v=>medical().textContent.includes(v))&&[...medical().querySelectorAll('p')].some(e=>e.textContent==='0')"));
  await evaluate("detailModes.medical='loading';workspace.getState().selectMedicalCase(1112)");
  await until("detailHeld.some(r=>r.uid===1112)");
  check('switch hides previous case while completed details remain ready',await evaluate("Boolean(!medical().textContent.includes('RECORD-1111')&&medical().querySelector('.MuiSkeleton-root')&&completed().textContent.includes('ORGANIZATION-111'))"));
  await evaluate("detailModes.medical='success';workspace.getState().selectMedicalCase(1111)");
  await until("medical().textContent.includes('RECORD-1111')");
  await evaluate("detailHeld.splice(0).forEach(r=>r.resolve())");await pause();
  check('late response does not replace current case',await evaluate("medical().textContent.includes('RECORD-1111')&&!medical().textContent.includes('RECORD-1112')"));
  for(const kind of ['medical','completed']){
    for(const state of ['error','empty']){
      await evaluate(`detailModes.${kind}='${state}';client.invalidateQueries({queryKey:['r-control','${kind}-case-details']})`);await pause();
      check('actual independent '+kind+' '+state,await evaluate(`${kind}().textContent.includes('${state==='empty'?'Данных не найдено':'Ошибка данных'}')&&${kind==='medical'?'completed':'medical'}().textContent.includes('${kind==='medical'?'ORGANIZATION-111':'RECORD-1111'}')`));
    }
    await evaluate(`detailModes.${kind}='success';client.invalidateQueries({queryKey:['r-control','${kind}-case-details']})`);await pause();
  }
  const referenceStyles = await evaluate(`(()=>{const e=group('rcontrol-details-basic'),s=getComputedStyle(e),h=getComputedStyle(e.querySelector('h4'));return {padding:s.padding,gap:s.gap,radius:s.borderRadius,background:s.backgroundColor,font:h.fontSize,weight:h.fontWeight};})()`);
  await send('Page.navigate',{url:'http://127.0.0.1:5192/med-view?demoCaseDetails=1'});
  await until('document.getElementById("medview-case-tab-case-details")');
  await evaluate('document.getElementById("medview-case-tab-case-details").click()');
  await until('document.querySelector("[aria-labelledby=medview-details-basic]")');
  const medviewStyles=await evaluate(`(()=>{const e=document.querySelector('[aria-labelledby=medview-details-basic]'),s=getComputedStyle(e),h=getComputedStyle(e.querySelector('h4'));return {padding:s.padding,gap:s.gap,radius:s.borderRadius,background:s.backgroundColor,font:h.fontSize,weight:h.fontWeight};})()`);
  check('surfaces and typography match the actual MedView category',JSON.stringify(referenceStyles)===JSON.stringify(medviewStyles));
  await evaluate("document.querySelector('[aria-labelledby=medview-medical-details-heading]').scrollIntoView({block:'start',behavior:'instant'})");await pause();
  await screenshot('medview-reference-1440');
  check('no runtime exceptions',errors.length===0);
  console.log('RCONTROL CASE DETAILS CHECKS COMPLETE');
} finally {
  ws?.close();chrome.kill();await server.close();
}
