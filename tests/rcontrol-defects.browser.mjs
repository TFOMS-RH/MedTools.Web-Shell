// node tests/rcontrol-defects.browser.mjs — Chrome, offline preview and actual query components.
import { spawn } from "node:child_process";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const { createServer } = await import(pathToFileURL(join(process.cwd(), "node_modules/vite/dist/node/index.js")));
const server = await createServer({ logLevel: "silent", server: { host: "127.0.0.1", port: 5197, strictPort: true } });
await server.listen();
const profile = await mkdtemp(join(tmpdir(), "rcontrol-defects-"));
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
  await send("Page.navigate", { url: "http://127.0.0.1:5197/rcontrol?demoWorkspace=1" });
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
  await evaluate("workspace.getState().setTargetCategory('defects')");await until('document.querySelector("[aria-labelledby=rcontrol-defects-heading] table")');
  await evaluate(`window.defects=()=>document.querySelector('section[aria-labelledby=rcontrol-defects-heading]');window.sanctions=()=>document.querySelector('section[aria-labelledby=rcontrol-sanctions-heading]');`);
  const preview=async(index,value)=>{await evaluate(`(()=>{const e=document.querySelectorAll('[class*=controls_] select')[${index}];e.value=${JSON.stringify(value)};e.dispatchEvent(new Event('change',{bubbles:true}));})()`);await pause();};
  check('two defect columns and five sanction columns',await evaluate("defects().querySelectorAll('thead th').length===2&&sanctions().querySelectorAll('thead th').length===5"));
  for(const width of [360,768,1024,1440]){
    await send('Emulation.setDeviceMetricsOverride',{width,height:1100,deviceScaleFactor:1,mobile:false});await preview(2,'long');
    const result=await evaluate(`(()=>{const viewports=[defects().querySelector('.mt-table-viewport'),sanctions().querySelector('.mt-table-viewport')];return {overflow:document.documentElement.scrollWidth>innerWidth,scroll:viewports.every(e=>{e.scrollLeft=200;return getComputedStyle(e).overflowX==='auto'&&(e.scrollWidth<=e.clientWidth||e.scrollLeft>0);}),full:sanctions().textContent.includes('ТЕСТ-САНКЦИЯ-0000123456789'.repeat(8))&&sanctions().textContent.includes('ТЕСТ-ДЛИННОЕ-ИМЯ-ФАЙЛА-'.repeat(14)+'.xml')&&defects().textContent.includes('Вторая строка комментария.'),clamped:[...document.querySelectorAll('td,dd')].some(e=>getComputedStyle(e).webkitLineClamp!=='none')};})()`);
    check('no page overflow or truncated long data at '+width,!result.overflow&&result.full&&!result.clamped);check('both tables scroll locally at '+width,result.scroll);
    await evaluate("defects().scrollIntoView({block:'start',behavior:'instant'})");await pause();await screenshot('defects-long-'+width);
  }
  await preview(2,'financial');check('zero and negative financial values remain distinct',await evaluate("sanctions().querySelector('tbody tr').cells[3].textContent.includes('0,00')&&sanctions().querySelectorAll('tbody')[1].rows[0].cells[3].textContent.includes('-')"));
  await preview(2,'empty-fields');check('empty fields use dash and zero refusal code is retained',await evaluate("sanctions().querySelector('tbody tr').cells[0].textContent==='—'&&sanctions().querySelector('tbody tr').cells[1].textContent==='0'&&defects().querySelector('tbody td').textContent==='—'"));await preview(2,'full');
  for(const count of [0,1,2,10,40]){
    await preview(0,String(count));await preview(1,String(count));check('collections and paged defects retained at '+count,await evaluate(count===0?"defects().textContent.includes('Данных не найдено')&&sanctions().textContent.includes('Данных не найдено')":`defects().querySelector('tbody').rows.length===${Math.min(count,10)}&&sanctions().querySelectorAll('tbody').length===${count}`));
  }
  await evaluate("defects().querySelectorAll('.MuiTablePagination-actions button')[1].click()");await pause();check('demo pagination changes defect page',await evaluate("defects().textContent.includes('Демонстрационный дефект 11')&&!defects().textContent.includes('Демонстрационный дефект 1\\n')"));
  await preview(0,'2');await preview(1,'2');
  for(const [index,name] of [[3,'defects'],[4,'sanctions']]){
    for(const state of ['loading','empty','error']){await preview(index,state);check('independent '+name+' '+state,await evaluate(`Boolean(${name}()${state==='loading'?".querySelector('.MuiSkeleton-root')":`.textContent.includes('${state==='empty'?'Данных не найдено':'Ошибка данных'}')`}&&${name==='defects'?'sanctions':'defects'}().textContent.includes('Демонстрацион'))`));}await preview(index,'ready');
  }
  await preview(0,'0');check('sanctions stay visible without defects',await evaluate("defects().textContent.includes('Данных не найдено')&&sanctions().querySelectorAll('tbody').length===2"));await preview(0,'2');
  await evaluate("defects().querySelector('.mt-table-viewport').scrollLeft=0;defects().scrollIntoView({block:'start',behavior:'instant'})");await screenshot('rcontrol-defects-full-1440');
  await evaluate("sanctions().querySelector('.mt-table-viewport').scrollLeft=0;sanctions().scrollIntoView({block:'start',behavior:'instant'})");await screenshot('rcontrol-sanctions-full-1440');
  const reference=await evaluate(`(()=>{const s=getComputedStyle(sanctions().querySelector('thead th')),d=getComputedStyle(sanctions().querySelector('td'));return {padding:s.padding,font:s.fontSize,weight:s.fontWeight,background:s.backgroundColor,cellPadding:d.padding};})()`);

  await evaluate(`(async()=>{const {default:api}=await import('/src/shared/api/client/apiClient.ts');const original=api.defaults.adapter;window.modes={};window.held=[];window.requests=[];
    api.defaults.adapter=async config=>{const parts=(config.url??'').split('/'),kind=parts.at(-1),uid=Number(parts.at(-2));if(!['defects','medical-sanctions'].includes(kind))return original(config);const mode=modes[kind];requests.push({kind,uid,...config.params});
      const count=mode==='empty'?0:kind==='defects'?40:3,page=config.params.page??1,pageSize=config.params.pageSize??10,start=kind==='defects'?(page-1)*pageSize:0;
      const rows=Array.from({length:kind==='defects'?Math.min(pageSize,count-start):count},(_,i)=>kind==='defects'?{defectUid:uid*100+i+start,code:i===0?0:100+i,comment:'DEFECT-'+uid+'-'+(start+i+1)}:{medicalSanctionUid:uid*100+i,sanctionCode:'TYPE-'+i,sanctionAmount:i===0?0:i===1?null:-1234.567,controlTypeCode:'HIDDEN',refusalReasonCode:0,comment:['SANCTION-'+uid+'-'+i,'SECOND LINE'].join(String.fromCharCode(10)),source:999,unitsRemoved:0,expertiseActDate:'2026-01-03',expertiseActNumber:'0000-ACT',expertCode:i===1?null:'EXPERT',filename:'TEST.xml',year:2026,month:1,uploadDate:null});
      if(mode==='loading')await new Promise(resolve=>held.push({kind,uid,resolve}));return {config,status:200,statusText:'OK',headers:{},data:{isFailure:mode==='error',isSuccess:mode!=='error',clientMessage:'TEST ERROR',error:'TEST ERROR',value:mode==='error'?null:kind==='defects'?{defects:rows,totalCount:count}:{medicalSanctions:rows}}};
    };const url=new URL(location.href);url.searchParams.set('demoDefects','live');history.replaceState(history.state,'',url);workspace.getState().setTargetCategory('default');})()`);
  await pause();await evaluate("workspace.getState().setTargetCategory('defects')");await until("defects()?.textContent.includes('DEFECT-1111')&&sanctions()?.textContent.includes('SANCTION-1111')");
  check('actual types, null and zero amounts stay distinct',await evaluate("(()=>{const rows=[...sanctions().querySelectorAll('tbody')].map(e=>e.rows[0]);return rows.length===3&&rows[0].cells[0].textContent==='TYPE-0'&&rows[0].cells[3].textContent.includes('0,00')&&rows[1].cells[3].textContent==='—'&&rows[2].cells[3].textContent.includes('-')&&sanctions().textContent.includes('03.01.2026');})()"));
  await evaluate("defects().querySelectorAll('.MuiTablePagination-actions button')[1].click()");await until("defects().textContent.includes('DEFECT-1111-11')");check('server pagination uses current UID and one-based page',await evaluate("requests.some(r=>r.kind==='defects'&&r.uid===1111&&r.page===2&&r.pageSize===10)&&sanctions().textContent.includes('SANCTION-1111')"));
  await evaluate("modes.defects='loading';workspace.getState().selectMedicalCase(1112)");await until("held.some(r=>r.uid===1112)&&sanctions().textContent.includes('SANCTION-1112')");check('new case hides old defects while sanctions load independently',await evaluate("!defects().textContent.includes('DEFECT-1111')&&Boolean(defects().querySelector('.MuiSkeleton-root'))&&workspace.getState().defectsTablePagination.page===0"));
  await evaluate("delete modes.defects;workspace.getState().selectMedicalCase(1111)");await until("defects().textContent.includes('DEFECT-1111')");await evaluate('held.splice(0).forEach(r=>r.resolve())');await pause();check('late response cannot replace current defects',await evaluate("defects().textContent.includes('DEFECT-1111')&&!defects().textContent.includes('DEFECT-1112')"));
  for(const [kind,name,other,marker] of [['defects','defects','sanctions','SANCTION'],['medical-sanctions','sanctions','defects','DEFECT']]){
    for(const state of ['empty','error']){await evaluate(`modes['${kind}']='${state}';client.invalidateQueries({queryKey:['r-control','${kind}']})`);await pause();check('actual independent '+name+' '+state,await evaluate(`${name}().textContent.includes('${state==='empty'?'Данных не найдено':'Ошибка данных'}')&&${other}().textContent.includes('${marker}-1111')`));}await evaluate(`delete modes['${kind}'];client.invalidateQueries({queryKey:['r-control','${kind}']})`);await pause();
  }
  await send('Page.navigate',{url:'http://127.0.0.1:5197/med-view?demoDefects=1'});await until('document.getElementById("medview-case-tab-defects")');await evaluate('document.getElementById("medview-case-tab-defects").click()');await until('document.querySelector("section[aria-labelledby=medview-sanctions-heading] table")');
  const medview=await evaluate(`(()=>{const e=document.querySelector('section[aria-labelledby=medview-sanctions-heading]'),s=getComputedStyle(e.querySelector('thead th')),d=getComputedStyle(e.querySelector('td'));return {padding:s.padding,font:s.fontSize,weight:s.fontWeight,background:s.backgroundColor,cellPadding:d.padding};})()`);
  check('table density and typography match actual MedView',JSON.stringify(reference)===JSON.stringify(medview));await evaluate("document.querySelector('section[aria-labelledby=medview-sanctions-heading]').scrollIntoView({block:'start',behavior:'instant'})");await screenshot('medview-sanctions-reference-1440');
  check('no runtime exceptions',errors.length===0);console.log('RCONTROL DEFECTS CHECKS COMPLETE');
} finally {ws?.close();chrome.kill();await server.close();}
