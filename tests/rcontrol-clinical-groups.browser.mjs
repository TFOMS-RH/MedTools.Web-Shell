// node tests/rcontrol-clinical-groups.browser.mjs — Chrome, offline preview and actual query components.
import { spawn } from "node:child_process";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const { createServer } = await import(pathToFileURL(join(process.cwd(), "node_modules/vite/dist/node/index.js")));
const server = await createServer({ logLevel: "silent", server: { host: "127.0.0.1", port: 5195, strictPort: true } });
await server.listen();
const profile = await mkdtemp(join(tmpdir(), "rcontrol-clinical-groups-"));
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
  await send("Page.navigate", { url: "http://127.0.0.1:5195/rcontrol?demoWorkspace=1" });
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
  await evaluate("workspace.getState().setTargetCategory('clinical-groups')");
  await until('document.querySelector("[aria-labelledby=rcontrol-csg-heading]")');
  await evaluate(`window.area=id=>document.querySelector('[aria-labelledby=rcontrol-'+id+'-heading]');window.csg=()=>area('csg');window.vmp=()=>area('vmp');window.criteria=()=>area('csg-criteria');window.coefficients=()=>area('csg-coefficients');`);
  const preview=async(index,value)=>{
    await evaluate(`(()=>{const e=document.querySelectorAll('[class*=controls_] select')[${index}];e.value=${JSON.stringify(value)};e.dispatchEvent(new Event('change',{bubbles:true}));})()`);await pause();
  };
  check('all four information panels render',await evaluate('Boolean(csg()&&vmp()&&criteria()&&coefficients())'));
  await evaluate("coefficients().querySelector('.mt-table-viewport').focus()");
  check('table keyboard focus uses RControl accent',await evaluate("(()=>{const e=coefficients().querySelector('.mt-table-viewport');return e.matches(':focus-visible')&&getComputedStyle(e).outlineStyle==='solid'&&getComputedStyle(e).outlineColor==='rgb(36, 135, 109)';})()"));
  for(const width of [360,768,1024,1440]){
    await send('Emulation.setDeviceMetricsOverride',{width,height:1100,deviceScaleFactor:1,mobile:false});await preview(0,'long');
    const result=await evaluate(`(()=>{const a=csg().getBoundingClientRect(),b=vmp().getBoundingClientRect(),x=criteria().getBoundingClientRect(),y=coefficients().getBoundingClientRect(),viewport=coefficients().querySelector('.mt-table-viewport');viewport.scrollLeft=200;return {overflow:document.documentElement.scrollWidth>innerWidth,topPaired:Math.abs(a.top-b.top)<1,topStacked:b.top>=a.bottom,relatedPaired:Math.abs(x.top-y.top)<1,relatedStacked:y.top>=x.bottom,scroll:viewport.scrollWidth<=viewport.clientWidth||viewport.scrollLeft>0,full:csg().textContent.includes('0000-ТЕСТ-КСГ-'.repeat(18))&&vmp().textContent.includes('0000-ТЕСТ-ТАЛОН-'.repeat(18))&&criteria().textContent.includes('ТЕСТКРИТЕРИЙ0000123456789'.repeat(24)),panels:[csg(),vmp(),criteria(),coefficients()].map(e=>({border:getComputedStyle(e).borderStyle,shadow:getComputedStyle(e).boxShadow}))};})()`);
    check('no page overflow or missing long values at '+width,!result.overflow&&result.full);
    check('reference panel geometry at '+width,(width===1440?result.topPaired:result.topStacked)&&(width>=1024?result.relatedPaired:result.relatedStacked));
    check('borderless panels and local table scrolling at '+width,result.scroll&&result.panels.every(e=>e.border==='none'&&e.shadow==='none'));
    await evaluate("csg().scrollIntoView({block:'start',behavior:'instant'})");await pause();await screenshot('clinical-groups-long-'+width);
  }
  await preview(0,'zeros');check('zero numbers and false flags retained',await evaluate("[...csg().querySelectorAll('dd')].filter(e=>e.textContent==='0').length>=7&&csg().textContent.includes('Нет')&&coefficients().querySelector('tbody td:last-child').textContent==='0'"));
  await preview(0,'full');check('coefficient and base rate precision retained',await evaluate("csg().textContent.includes('1.23456789')&&csg().textContent.includes('12345.6789')"));
  await preview(0,'nullable');check('nullable VMP and CSG values use dash',await evaluate("vmp().textContent.includes('—')&&csg().textContent.includes('—')"));await preview(0,'full');
  for(const count of [0,1,2,10,40]){
    await preview(1,String(count));await preview(2,String(count));check('all collection records retained at '+count,await evaluate(count===0?"criteria().textContent.includes('Данных не найдено')&&coefficients().textContent.includes('Данных не найдено')":`criteria().querySelectorAll('li').length===${count}&&coefficients().querySelector('tbody').rows.length===${count}`));
  }
  await preview(1,'2');await preview(2,'2');
  for(const [index,name] of [[3,'csg'],[4,'vmp'],[5,'criteria'],[6,'coefficients']]){
    for(const state of ['loading','empty','error']){
      await preview(index,state);check('independent '+name+' '+state,await evaluate(`Boolean(${name}()${state==='loading'?".querySelector('.MuiSkeleton-root')":`.textContent.includes('${state==='empty'?'Данных не найдено':'Ошибка данных'}')`}&&${name==='csg'?'vmp':'csg'}().querySelector('dd'))`));
    }await preview(index,'ready');
  }
  await preview(3,'empty');check('VMP-only keeps independent VMP and gates CSG collections',await evaluate("vmp().textContent.includes('ТЕСТ-ВИД-')&&!criteria()&&!coefficients()&&area('csg-related').textContent.includes('Клиническая группа отсутствует')"));
  await preview(4,'empty');check('neither type has explicit empty states',await evaluate("csg().textContent.includes('Данных не найдено')&&vmp().textContent.includes('Данных не найдено')"));
  await preview(3,'ready');check('CSG-only keeps its related collections',await evaluate("Boolean(csg().querySelector('dd')&&criteria()&&coefficients()&&vmp().textContent.includes('Данных не найдено'))"));await preview(4,'ready');
  await evaluate("csg().scrollIntoView({block:'start',behavior:'instant'})");await screenshot('rcontrol-clinical-groups-full-1440');
  const reference=await evaluate(`(()=>{const s=getComputedStyle(csg()),h=getComputedStyle(csg().querySelector('h3'));return {padding:s.padding,gap:s.gap,radius:s.borderRadius,background:s.backgroundColor,font:h.fontSize,weight:h.fontWeight};})()`);

  // Existing query roots exercised against local adapter fixtures, without modifying app API code.
  await evaluate(`(async()=>{const {default:api}=await import('/src/shared/api/client/apiClient.ts');const original=api.defaults.adapter;window.modes={};window.held=[];window.requests=[];
    const {useMedViewFiltersStore}=await import('/src/modules/medView/widgets/filters/model/stores/useMedViewFiltersStore.tsx');useMedViewFiltersStore.setState({targetDb:'INOGOROD18'});
    api.defaults.adapter=async config=>{const parts=(config.url??'').split('/'),kind=parts.at(-1),uid=Number(parts.at(-2)),property={'clinical-group':'clinicalGroup','high-tech-medical-care':'highTechMedicalCare','classification-criteria':'classificationCriteria','treatment-complexity-coefficients':'treatmentComplexityCoefficients'}[kind];if(!property)return original(config);requests.push({kind,uid,targetDb:config.params.targetDb});const mode=modes[kind];
      let data=kind==='clinical-group'?{clinicalGroupUid:uid*10,clinicalStatisticalGroupNumber:'CSG-'+uid,calculatedClinicalStatisticalGroupNumber:null,clinicalStatisticalGroupModelVersion:0,isCsgSubgroupUsed:false,clinicalProfileGroupNumber:null,costCoefficient:1.23456789,managementCoefficient:1.12345678,baseRate:12345.6789,differentiationCoefficient:1.3456789,levelCoefficient:1.456789,wageTargetCoefficient:null,isClspUsed:false,complexityCoefficient:0}:kind==='high-tech-medical-care'?{highTechCareTypeCode:'VMP-'+uid,highTechCareMethodCode:'METHOD',voucherNumber:'0000-VOUCHER',voucherIssueDate:'2026-01-03',plannedAdmissionDate:'2026-01-05'}:Array.from({length:2},(_,i)=>kind==='classification-criteria'?{classificationCriterionUid:uid*10+i,classificationCriterion:'CRITERION-'+uid+'-'+i}:{treatmentComplexityCoefficientUid:uid*10+i,complexityCoefficientNumber:'COEFFICIENT-'+uid+'-'+i,complexityCoefficientValue:i===0?0:1.23456789});
      if(mode==='loading')await new Promise(resolve=>held.push({kind,uid,resolve}));if(mode==='empty')data=['clinical-group','high-tech-medical-care'].includes(kind)?null:[];
      return {config,status:200,statusText:'OK',headers:{},data:{isFailure:mode==='error',isSuccess:mode!=='error',clientMessage:'TEST ERROR',error:'TEST ERROR',value:mode==='error'?null:{[property]:data}}};
    };const url=new URL(location.href);url.searchParams.set('demoClinicalGroups','live');history.replaceState(history.state,'',url);workspace.getState().setTargetCategory('default');})()`);
  await pause();await evaluate("workspace.getState().setTargetCategory('clinical-groups')");await until("csg()?.textContent.includes('CSG-1111')&&vmp()?.textContent.includes('VMP-1111')&&coefficients()?.textContent.includes('COEFFICIENT-11110')");
  check('all requests use RControl source, including coefficients',await evaluate("requests.length>=4&&requests.every(r=>r.targetDb==='SMODB18')"));
  check('actual numeric precision, zeros and dates unchanged',await evaluate("csg().textContent.includes('1.23456789')&&csg().textContent.includes('12345.6789')&&vmp().textContent.includes('03.01.2026')&&coefficients().querySelector('tbody td:last-child').textContent==='0'"));
  await evaluate("modes['clinical-group']='loading';workspace.getState().selectMedicalCase(1112)");await until("held.some(r=>r.uid===1112)&&vmp().textContent.includes('VMP-1112')");
  check('old CSG and related records hidden during new case loading',await evaluate("!csg().textContent.includes('CSG-1111')&&!criteria()&&!coefficients()"));
  await evaluate("delete modes['clinical-group'];workspace.getState().selectMedicalCase(1111)");await until("csg().textContent.includes('CSG-1111')");await evaluate('held.splice(0).forEach(r=>r.resolve())');await pause();
  check('late response cannot replace current CSG',await evaluate("csg().textContent.includes('CSG-1111')&&!csg().textContent.includes('CSG-1112')"));
  for(const [kind,name] of [['classification-criteria','criteria'],['treatment-complexity-coefficients','coefficients'],['high-tech-medical-care','vmp'],['clinical-group','csg']]){
    for(const state of ['empty','error']){
      await evaluate(`modes['${kind}']='${state}';client.invalidateQueries({queryKey:['r-control','${kind}']})`);await pause();
      check('actual independent '+kind+' '+state,await evaluate(`${name}().textContent.includes('${state==='empty'?'Данных не найдено':'Ошибка данных'}')&&${name==='csg'?'vmp':'csg'}().textContent.includes('${name==='csg'?'VMP':'CSG'}-1111')`));
    }await evaluate(`delete modes['${kind}'];client.invalidateQueries({queryKey:['r-control','${kind}']})`);await pause();
  }
  await evaluate("modes['high-tech-medical-care']='empty';client.invalidateQueries({queryKey:['r-control','high-tech-medical-care']})");await pause();check('actual CSG-only retains related collections',await evaluate("Boolean(csg().textContent.includes('CSG-1111')&&criteria()&&coefficients()&&vmp().textContent.includes('Данных не найдено'))"));
  await evaluate("modes['clinical-group']='empty';client.invalidateQueries({queryKey:['r-control','clinical-group']})");await pause();check('actual neither type hides dependent collections',await evaluate("!criteria()&&!coefficients()&&csg().textContent.includes('Данных не найдено')&&vmp().textContent.includes('Данных не найдено')"));
  await send('Page.navigate',{url:'http://127.0.0.1:5195/med-view?demoClinicalGroups=1'});await until('document.getElementById("medview-case-tab-clinical-groups")');await evaluate('document.getElementById("medview-case-tab-clinical-groups").click()');await until('document.querySelector("[aria-labelledby=medview-csg-heading] dd")');
  const medview=await evaluate(`(()=>{const e=document.querySelector('[aria-labelledby=medview-csg-heading]'),s=getComputedStyle(e),h=getComputedStyle(e.querySelector('h3'));return {padding:s.padding,gap:s.gap,radius:s.borderRadius,background:s.backgroundColor,font:h.fontSize,weight:h.fontWeight};})()`);
  check('surfaces and typography match actual MedView',JSON.stringify(reference)===JSON.stringify(medview));
  await evaluate("document.querySelector('[aria-labelledby=medview-csg-heading]').scrollIntoView({block:'start',behavior:'instant'})");await screenshot('medview-clinical-groups-reference-1440');
  check('no runtime exceptions',errors.length===0);console.log('RCONTROL CLINICAL GROUPS CHECKS COMPLETE');
} finally {ws?.close();chrome.kill();await server.close();}
