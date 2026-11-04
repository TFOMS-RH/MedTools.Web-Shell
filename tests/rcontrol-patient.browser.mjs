// node tests/rcontrol-patient.browser.mjs — Chrome, offline preview and actual query components.
import { spawn } from "node:child_process";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const { createServer } = await import(pathToFileURL(join(process.cwd(), "node_modules/vite/dist/node/index.js")));
const server = await createServer({ logLevel: "silent", server: { host: "127.0.0.1", port: 5191, strictPort: true } });
await server.listen();
const profile = await mkdtemp(join(tmpdir(), "rcontrol-patient-"));
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
  await send("Page.navigate", { url: "http://127.0.0.1:5191/rcontrol?demoWorkspace=1" });
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
  await evaluate('document.getElementById("rcontrol-case-tab-patient").click()');
  await until('document.querySelector("[class*=patientName_]")?.textContent.includes("Демонстрационный")');
  await evaluate(`window.patientArea=()=>document.querySelector('[class*=patientCategoryRoot_]');
    window.profilePanel=()=>document.querySelector('[aria-labelledby=rcontrol-patient-0]');
    window.documentPanel=()=>document.querySelector('[aria-labelledby=rcontrol-patient-1]');
    window.insurancePanel=()=>document.querySelector('[aria-labelledby=rcontrol-patient-insurance]');
    window.representativePanel=()=>document.querySelector('[aria-labelledby=rcontrol-patient-2]');`);
  const preview = async (label, value) => {
    await evaluate(`(()=>{const label=[...document.querySelectorAll('label')].find(e=>e.querySelector('select')&&e.textContent.trim().startsWith(${JSON.stringify(label)}));const select=label.querySelector('select');select.value=${JSON.stringify(value)};select.dispatchEvent(new Event('change',{bubbles:true}));})()`);
    await pause();
  };
  check("preview displays patient, document, insurance and representative", await evaluate("Boolean(profilePanel()&&documentPanel()&&insurancePanel()&&representativePanel())"));
  for (const width of [360, 768, 1024, 1440]) {
    await send("Emulation.setDeviceMetricsOverride", { width, height: 1100, deviceScaleFactor: 1, mobile: false });
    await preview("Набор данных", "long");
    await evaluate("document.fonts.ready.then(()=>true)");
    const layout = await evaluate(`(()=>{const a=documentPanel().getBoundingClientRect(),b=insurancePanel().getBoundingClientRect();return {sameTop:Math.abs(a.top-b.top)<1,sameHeight:Math.abs(a.height-b.height)<1,ordered:b.top>=a.bottom,natural:Math.abs(a.height-b.height)>1,overflow:document.documentElement.scrollWidth>innerWidth,panels:[documentPanel(),insurancePanel(),representativePanel()].map(e=>({border:getComputedStyle(e).borderStyle,shadow:getComputedStyle(e).boxShadow}))};})()`);
    check("no page overflow at " + width, !layout.overflow);
    check("soft panels without borders or shadows at " + width, layout.panels.every(p => p.border === "none" && p.shadow === "none"));
    check("adaptive panel geometry at " + width, width >= 1024 ? layout.sameTop && layout.sameHeight : layout.ordered && layout.natural);
    check("long identifiers remain complete at " + width, await evaluate(`documentPanel().textContent.includes('0000123456789012345678901234567890')&&insurancePanel().textContent.includes('0000123456789012345678901234567890')`));
    await evaluate("patientArea().scrollIntoView({block:'start',behavior:'instant'})"); await pause();
    await screenshot("patient-long-" + width);
  }
  await preview("Набор данных", "no-representative");
  check("absent representative does not create an empty panel", await evaluate("Boolean(!representativePanel()&&documentPanel()&&insurancePanel())"));
  await preview("Набор данных", "empty-fields");
  check("nullable fields use the existing dash formatting", await evaluate("documentPanel().textContent.includes('—')&&insurancePanel().textContent.includes('—')"));
  await preview("Набор данных", "full");
  await preview("Пациент", "loading");
  check("patient skeleton preserves independent ready insurance", await evaluate("profilePanel().querySelector('.MuiSkeleton-root')&&documentPanel().querySelector('.MuiSkeleton-root')&&insurancePanel().textContent.includes('0000000087654321')"));
  await preview("Пациент", "error");
  check("patient error does not hide insurance", await evaluate("profilePanel().textContent.includes('Ошибка данных')&&insurancePanel().textContent.includes('0000000087654321')"));
  await preview("Пациент", "empty");
  check("patient empty does not hide insurance", await evaluate("profilePanel().textContent.includes('Данных не найдено')&&insurancePanel().textContent.includes('0000000087654321')"));
  await preview("Пациент", "success");
  for (const state of ["loading", "error", "empty"]) {
    await preview("Страхование", state);
    check("insurance " + state + " keeps patient and document visible", await evaluate("profilePanel().textContent.includes('Демонстрационный')&&documentPanel().textContent.includes('0001234567')"));
  }
  await preview("Страхование", "success");
  await evaluate("patientArea().scrollIntoView({block:'start',behavior:'instant'})"); await screenshot("patient-full-1440");

  // Switch only this category to the actual hooks. Workspace fixtures remain unchanged.
  const patient = {
    patientLastName: "Тестовый", patientFirstName: "Иван", patientMiddleName: "Иванович", patientBirthDate: "1985-06-15", patientSex: "М",
    documentTypeCode: "14", documentTypeName: "Паспорт", documentSeries: "0012", documentNumber: "0001234567", documentIssueDate: "2020-09-10", issuedBy: "Тестовое подразделение",
    patientRepresentativeLastName: "Представитель", patientRepresentativeFirstName: "Анна", patientRepresentativeMiddleName: "Тестовна", patientRepresentativeBirthday: "1960-02-20", patientRepresentativeSex: "Ж",
  };
  const insurance = { insuranceCompanyCode: "00001", insuranceCompanyName: "Тестовая СМО", ogrn: "0000123456789", okato: "00012345678", insurancePolicyUnifiedNumber: "0000000012345678", insurancePolicyNumber: "0000000087654321", insurancePolicySeries: "0012", insurancePolicyTypeCode: 3, insurancePolicyTypeName: "Единый полис ОМС" };
  await evaluate(`(async()=>{const {default:api}=await import('/src/shared/api/client/apiClient.ts');const original=api.defaults.adapter;
    window.patientModes={patient:'success',insurance:'success'};window.patientHeld=[];window.patientRequests=[];window.partialPatient=false;
    api.defaults.adapter=async config=>{const segments=(config.url??'').split('/'),kind=segments.at(-1),uid=Number(segments.at(-2));
      if(!['patient','insurance'].includes(kind))return original(config);
      patientRequests.push({kind,uid});const mode=patientModes[kind];let data=kind==='patient'?{...${JSON.stringify(patient)},patientLastName:'Тестовый-'+uid}: {...${JSON.stringify(insurance)},insuranceCompanyName:'Тестовая СМО '+uid};
      if(kind==='patient'&&partialPatient)data={...data,patientFirstName:'',patientMiddleName:'',patientRepresentativeLastName:null,patientRepresentativeFirstName:null,patientRepresentativeMiddleName:null,patientRepresentativeBirthday:null};
      if(mode==='loading')await new Promise(resolve=>patientHeld.push({kind,uid,resolve}));
      return {config,status:200,statusText:'OK',headers:{},data:{isSuccess:mode!=='error',isFailure:mode==='error',error:'Тестовая ошибка '+kind,clientMessage:'',value:mode==='error'?null:{[kind]:mode==='empty'?null:data}}};
    };const url=new URL(location.href);url.searchParams.set('demoPatient','live');history.replaceState(history.state,'',url);workspace.getState().setTargetCategory('default');})()`);
  await pause(); await evaluate("workspace.getState().setTargetCategory('patient')");
  await until("profilePanel()?.textContent.includes('Тестовый-1111')&&insurancePanel()?.textContent.includes('Тестовая СМО 1111')");
  check("both actual hooks use the selected medical UID", await evaluate("['patient','insurance'].every(kind=>patientRequests.some(r=>r.kind===kind&&r.uid===1111))"));
  check("original field values and date formatting are preserved", await evaluate(`['Тестовый-1111','Иван','Иванович','15.06.1985','М','14 Паспорт','0012','0001234567','10.09.2020','Тестовое подразделение','Представитель','Анна','Тестовна','20.02.1960','Ж','00001','Тестовая СМО 1111','0000123456789','00012345678','0000000012345678','0000000087654321','3 : Единый полис ОМС'].every(value=>patientArea().textContent.includes(value))`));
  check("old and new policy labels keep their original bindings", await evaluate(`(()=>{const fields=[...insurancePanel().querySelectorAll('[class*=cardFieldRoot_]')];return fields.find(e=>e.querySelector('label').textContent==='Номер полиса (старый)').querySelector('p').textContent==='0000000012345678'&&fields.find(e=>e.querySelector('label').textContent==='Номер полиса (новый)').querySelector('p').textContent==='0000000087654321';})()`));
  await evaluate("patientModes.patient='loading';workspace.getState().selectMedicalCase(1112)");
  await until("patientHeld.some(r=>r.uid===1112)&&insurancePanel().textContent.includes('Тестовая СМО 1112')");
  check("new medical case hides the old patient while independent insurance is ready", await evaluate("Boolean(!profilePanel().textContent.includes('Тестовый-1111')&&profilePanel().querySelector('.MuiSkeleton-root'))"));
  await evaluate("patientModes.patient='success';workspace.getState().selectMedicalCase(1111)");
  await until("profilePanel().textContent.includes('Тестовый-1111')");
  await evaluate("patientHeld.splice(0).forEach(request=>request.resolve())"); await pause();
  check("late patient response cannot replace current patient", await evaluate("profilePanel().textContent.includes('Тестовый-1111')&&!profilePanel().textContent.includes('Тестовый-1112')"));
  for (const state of ["error", "empty"]) {
    await evaluate(`patientModes.patient='${state}';client.invalidateQueries({queryKey:['r-control','patient']})`); await pause();
    check("actual patient " + state + " preserves independent insurance", await evaluate(`profilePanel().textContent.includes(${JSON.stringify(state === "error" ? "Ошибка данных" : "Данных не найдено")})&&insurancePanel().textContent.includes('Тестовая СМО 1111')`));
  }
  await evaluate("patientModes.patient='success';client.invalidateQueries({queryKey:['r-control','patient']})"); await pause();
  await evaluate("patientModes.insurance='error';client.invalidateQueries({queryKey:['r-control','insurance']})"); await pause();
  check("actual insurance error keeps patient and document", await evaluate("profilePanel().textContent.includes('Тестовый-1111')&&documentPanel().textContent.includes('0001234567')&&insurancePanel().textContent.includes('Ошибка данных')"));
  await evaluate("partialPatient=true;client.invalidateQueries({queryKey:['r-control','patient']})"); await pause();
  check("partial names and representative attributes remain readable", await evaluate("document.querySelector('[class*=patientName_]').textContent==='Тестовый-1111'&&representativePanel().textContent.includes('Ж')&&representativePanel().textContent.includes('—')"));
  check("no runtime exceptions", errors.length === 0);
  console.log("RCONTROL PATIENT CHECKS COMPLETE");
} finally {
  ws?.close(); chrome.kill(); await server.close();
}
