// Run from the repository root: node tests/rcontrol-workspace.browser.mjs
// Requires Chrome (override CHROME_PATH if needed). Runs intercepted regressions and the dev demo.
// Pass --demo-only to run just /rcontrol?demoWorkspace=1 without browser API interception.
// Layout checks first measure HEAD with matching data; no checkout or working-tree mutation.
import { spawn, spawnSync } from "node:child_process";
import { mkdtemp, writeFile, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
const root = process.cwd();
const baselineLayout = process.argv.includes("--baseline-layout");
const layoutCheck = baselineLayout || process.argv.includes("--current-layout");
const baselinePath = join(tmpdir(), "rcontrol-baseline-layout.json");
if (!layoutCheck) {
  const baseline = spawnSync(process.execPath, [process.argv[1], "--baseline-layout"], {
    cwd: root, stdio: "inherit", windowsHide: true,
  });
  if (baseline.status !== 0) throw new Error("Baseline Chrome layout check failed");
}

const { createServer } = await import(
  pathToFileURL(join(root, "node_modules/vite/dist/node/index.js"))
);
const server = await createServer({
  logLevel: "silent",
  plugins: baselineLayout ? [{name:"rcontrol-before-stabilization",enforce:"pre",load(id){
    const path=id.replaceAll('\\','/').split('?')[0];
    const relative=path.slice(root.replaceAll('\\','/').length+1);
    if(!relative.startsWith('src/modules/rControl/')||! /\.(tsx?|scss)$/.test(relative)) return;
    const result=spawnSync('git',['show','HEAD:'+relative],{cwd:root,encoding:'utf8',windowsHide:true});
    if(result.status===0) return result.stdout;
  }}] : [],
  server: { host: "127.0.0.1", port: 5189, strictPort: true },
});
await server.listen();
const profile = await mkdtemp(join(tmpdir(), "medtools-chrome-"));
const chrome = spawn(
  process.env.CHROME_PATH ||
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
  [
    "--headless=new",
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    "--remote-debugging-port=0",
    `--user-data-dir=${profile}`,
    "about:blank",
  ],
  { windowsHide: true, stdio: ["ignore", "ignore", "pipe"] },
);
let ws;
try {
  const endpoint = await new Promise((resolve, reject) => {
    let output = "";
    const timer = setTimeout(
      () =>
        reject(new Error("Chrome startup timed out: " + output.slice(-1000))),
      20000,
    );
    chrome.on("error", reject);
    chrome.stderr.on("data", (data) => {
      output += data;
      const match = output.match(/DevTools listening on (ws:\/\/[^\s]+)/);
      if (match) {
        clearTimeout(timer);
        resolve(match[1]);
      }
    });
  });
  const port = new URL(endpoint).port;
  const target = await (
    await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, {
      method: "PUT",
    })
  ).json();
  ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });
  let id = 0;
  const pending = new Map();
  const runtimeErrors = [];
  let onRequest;
  ws.onmessage = ({ data }) => {
    const msg = JSON.parse(data);
    if (msg.method === "Runtime.exceptionThrown") {
      runtimeErrors.push(msg.params);
      console.log("EXCEPTION " + JSON.stringify(msg.params));
    }
    if (msg.method === "Runtime.consoleAPICalled" &&
        msg.params.args.some(arg => String(arg.value).includes("out-of-range")))
      runtimeErrors.push(msg.params.args);
    if (msg.method === "Runtime.consoleAPICalled")
      console.log("CONSOLE " + JSON.stringify(msg.params.args));
    if (msg.method === "Fetch.requestPaused")
      onRequest?.(msg.params).catch(console.error);
    if (msg.id) {
      const call = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) call.reject(new Error(JSON.stringify(msg.error)));
      else call.resolve(msg.result);
    }
  };
  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const callId = ++id;
      pending.set(callId, { resolve, reject });
      ws.send(JSON.stringify({ id: callId, method, params }));
    });
  const evaluate = async (expression) => {
    const result = await send("Runtime.evaluate", {
      expression,
      awaitPromise: true,
      returnByValue: true,
    });
    if (result.exceptionDetails)
      throw new Error(JSON.stringify(result.exceptionDetails));
    return result.result.value;
  };
  await send("Page.enable");
  await send("Runtime.enable");
  await send("Page.bringToFront");
  const pause = (ms = 160) => new Promise((r) => setTimeout(r, ms));
  const check = (name, ok) => {
    if (!ok) throw Error(name);
    console.log("PASS " + name);
  };
  const until = async (expr) => {
    for (let i = 0; i < 150; i++) {
      if (await evaluate("Boolean(" + expr + ")")) return;
      await pause(100);
    }
    console.log("TIMEOUT STATE " + JSON.stringify(await evaluate(`({
      panel: window.rcPanel?.getState(), workspace: window.rcStore?.getState(),
      body: document.body.innerText, active: document.activeElement?.outerHTML,
      queries: window.rcClient?.getQueryCache().getAll().map(q=>({key:q.queryKey,status:q.state.status,fetch:q.state.fetchStatus,error:q.state.error?.message}))
    })`)));
    console.log("LAST REQUESTS " + JSON.stringify(requests.slice(-10)));
    throw Error("Timeout " + expr);
  };
  const modes = {},
    held = [],
    requests = [];
  let shiftedInvoices = false,
    shiftedCompleted = false,
    fullInvoices = false,
    fullCompleted = false,
    orgMissing = false,
    yearMissing = false,
    monthMissing = false;
  const fail = (kind) => ({
    isFailure: true,
    isSuccess: false,
    error: "ТЕСТ-ОШИБКА-" + kind,
    clientMessage: "ТЕСТ-ОШИБКА-" + kind,
    value: null,
  });
  const reply = (id, data) =>
    send("Fetch.fulfillRequest", {
      requestId: id,
      responseCode: 200,
      responseHeaders: [
        { name: "Content-Type", value: "application/json;charset=utf-8" },
      ],
      body: Buffer.from(JSON.stringify(data)).toString("base64"),
    });
  const invoice = (uid) => ({
    invoiceUid: uid,
    number: layoutCheck ? "ДЕМО-SMODB18-" + uid : "ТЕСТ-СЧЕТ-" + uid,
    billingDate: "2026-01-03",
    amount: 1234.56,
    medicalCasesCount: 2,
    status: 0,
  });
  const completed = (uid) => ({
    completedCaseUid: uid,
    entryNumber: layoutCheck ? Math.floor(uid/10)*100+uid%10 : uid * 10,
    entryPositionNumber: layoutCheck ? uid%10 : uid,
    patientLastName: layoutCheck ? "Демонстрационный" : "Тестовый",
    patientFirstName: layoutCheck ? `Пациент ${uid%10}` : "Пациент",
    patientMiddleName: "",
    medicalCareConditions: 0,
    insurancePolicySeries: null,
    insurancePolicyNumber: "0000000000000000",
    amountBilled: 1234.56,
    approvedAmount: null,
    insuranceCompanyApprovedAmount: null,
  });
  const medical = (uid) => ({
    medicalCaseUid: uid,
    medicalProfile: null,
    isPediatric: false,
    physicianSpecialty: 0,
    treatmentStartDate: "2026-01-01",
    treatmentEndDate: "2026-01-03",
    primaryDiagnosis: layoutCheck ? "" : "ТЕСТ-МЕД-" + uid,
    paidUnits: 1,
    unitRate: null,
    amountBilled: 1234.56,
    approvedAmount: null,
    insuranceCompanyApprovedAmount: null,
  });
  onRequest = async ({ requestId, request }) => {
    const url = new URL(request.url),
      path = url.pathname;
    if (!path.startsWith("/api/")) {
      await send("Fetch.continueRequest", { requestId });
      return;
    }
    const kind = path.endsWith("/lookups/medical-organizations")
      ? "org"
      : path.endsWith("/lookups/billing-periods")
        ? "period"
        : /\/invoices$/.test(path)
          ? "invoice"
          : /\/invoices\/\d+\/summary$/.test(path)
            ? "summary"
            : /\/invoices\/\d+\/completed-cases$/.test(path)
              ? "completed"
              : /\/completed-cases\/\d+\/medical-cases$/.test(path)
                ? "medical"
                : "other";
    const parent = Number(path.split("/").at(-2)),
      page = Number(url.searchParams.get("page") ?? 1),
      mode = modes[kind] ?? (kind === "other" ? "error" : "ready");
    requests.push({
      kind,
      parent,
      page,
      search: url.searchParams.get("searchString"),
      db: url.searchParams.get("targetDb"),
      org: url.searchParams.get("medicalOrganizationCode"),
      year: url.searchParams.get("year"),
      month: url.searchParams.get("month"),
    });
    let value;
    if (kind === "org")
      value = {
        medicalOrganizations:
          mode === "empty"
            ? []
            : orgMissing
              ? [
                  {
                    medicalOrganizationCode: "002",
                    medicalOrganizationName: "Тестовая организация Бета",
                  },
                ]
              : [
                  {
                    medicalOrganizationCode: "001",
                    medicalOrganizationName: "Тестовая организация Альфа",
                  },
                  {
                    medicalOrganizationCode: "002",
                    medicalOrganizationName: "Тестовая организация Бета",
                  },
                ],
      };
    if (kind === "period")
      value = {
        billingPeriods:
          mode === "empty"
            ? []
            : yearMissing
              ? [{ billingYear: 2025, billingMonths: [3] }]
              : [
                  {
                    billingYear: 2026,
                    billingMonths: monthMissing ? [2] : [1, 2],
                  },
                  { billingYear: 2025, billingMonths: [3] },
                ],
      };
    if (kind === "invoice") {
      const rows =
        mode === "empty"
          ? []
          : [11, 12].map((n) =>
              invoice(n + (page - 1) * 10 + (shiftedInvoices ? 100 : 0)),
            );
      value = {
        invoices: rows,
        recordsCount: mode === "empty" ? 0 : fullInvoices || layoutCheck ? rows.length : 100,
      };
    }
    if (kind === "completed") {
      const rows =
        mode === "empty"
          ? []
          : [1, 2].map((n) =>
              completed(
                parent * 10 +
                  (page - 1) * 10 +
                  n +
                  (shiftedCompleted ? 1000 : 0),
              ),
            );
      value = {
        completedCases: rows,
        totalCount: mode === "empty" ? 0 : fullCompleted || layoutCheck ? rows.length : 50,
      };
    }
    if (kind === "medical")
      value = {
        medicalCases:
          mode === "empty" ? [] : [1, 2].map((n) => medical(parent * 10 + n)),
      };
    if (kind === "summary")
      value = {
        invoiceSummary: {
          invoiceUid: parent,
          filename: layoutCheck ? "demo-invoice.xml" : "ТЕСТ-ФАЙЛ-" + parent,
          invoiceUploadDate: "2026-01-03",
          invoiceAmount: 1234.56,
          approvedAmount: 0,
          medicalEconomicControlPenalty: 0,
          medicalEconomicExpertisePenalty: 0,
          medicalCareQualityExpertisePenalty: 0,
          insuranceCompanyApprovedAmount: 0,
          insuranceCompanyMedicalEconomicControlPenalty: 0,
          insuranceCompanyMedicalEconomicExpertisePenalty: 0,
          insuranceCompanyMedicalCareQualityExpertisePenalty: 0,
        },
      };
    const payload =
      mode === "error"
        ? fail(kind)
        : {
            isFailure: false,
            isSuccess: true,
            error: "",
            clientMessage: "",
            value,
          };
    if (mode === "loading")
      held.push({ kind, parent, finish: () => reply(requestId, payload) });
    else await reply(requestId, payload);
  };
  await send("Fetch.enable", { patterns: [{ urlPattern: "*/api/*" }] });
  await send("Emulation.setDeviceMetricsOverride", {
    width: 1440,
    height: 1200,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await send("Page.navigate", { url: "http://127.0.0.1:5189/rcontrol" });
  await until(
    baselineLayout ? 'document.querySelector("[class*=selectsGroup_]")' : 'document.body.textContent.includes("Сначала выберите источник данных")',
  );
  const initialize = async () => evaluate(`(async()=>{
  const {useRControlWorkspaceStore:store}=await import('/src/modules/rControl/widgets/workspace/model/store/useRControlWorkspaceStore.ts');
  const {useRControlWorkspacePanelStore:panel}=await import('/src/modules/rControl/widgets/workspace/model/store/useRControlWorkspacePanelStore.ts');
  const {queryClient}=await import('/src/shared/api/client/queryClient.ts');queryClient.setDefaultOptions({queries:{retry:false}});
  let client=queryClient;
  if(location.search.includes('demoWorkspace=1')) {
    const element=document.querySelector('[class*=filtersPanelRoot_]');
    let fiber=element[Object.keys(element).find(k=>k.startsWith('__reactFiber$'))];
    while(fiber) { if(fiber.memoizedProps?.client?.getQueryCache) {client=fiber.memoizedProps.client;break;} fiber=fiber.return; }
    if(client===queryClient) throw Error('Demo QueryClient not found');
  }
  window.rcStore=store;window.rcPanel=panel;window.rcClient=client;
  window.rcArea=t=>[...document.querySelectorAll('h2,h3')].find(e=>e.textContent.trim()===t)?.closest('section,article');
  window.rcInv=()=>rcArea('Реестр счетов')??rcArea('Счета');window.rcComp=()=>rcArea('Законченные случаи');
  window.rcMeds=()=>[...document.querySelectorAll('[class*=medicalCasesCards_] > article.selectedCardRoot')];
 })()`);
  await initialize();
  const invalidate = async (key) => {
    await evaluate(
      "rcClient.invalidateQueries({queryKey:" +
        JSON.stringify(["r-control", key]) +
        "})",
    );
    await pause();
  };
  const release = async (kind) => {
    for (const h of held.filter((h) => !kind || h.kind === kind)) {
      await h.finish();
      held.splice(held.indexOf(h), 1);
    }
    await pause();
  };
  const choose = async (label, value) => {
    await evaluate(
      '(()=>{const g=[...document.querySelectorAll("[role=group]")].find(e=>e.getAttribute("aria-label")===' +
        JSON.stringify(label) +
        ');g.querySelector("[role=combobox]").dispatchEvent(new MouseEvent("mousedown",{bubbles:true,button:0}));})()',
    );
    await until('document.querySelector("[role=listbox]")');
    await evaluate(
      '[...document.querySelectorAll("[role=option]")].find(e=>e.getAttribute("data-value")===' +
        JSON.stringify(value) +
        ").click()",
    );
    await pause();
  };
  const input = async (area, value, apply = true) => {
    await evaluate(
      "(()=>{const i=" +
        area +
        '().querySelector("input[placeholder]");Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,"value").set.call(i,' +
        JSON.stringify(value) +
        ');i.dispatchEvent(new Event("input",{bubbles:true}));})()',
    );
    await pause();
    if (apply) {
      await evaluate(area + '().querySelector("input[placeholder]").focus()');
      await send("Input.dispatchKeyEvent", {
        type: "keyDown",
        key: "Enter",
        code: "Enter",
        windowsVirtualKeyCode: 13,
      });
      await send("Input.dispatchKeyEvent", {
        type: "keyUp",
        key: "Enter",
        code: "Enter",
        windowsVirtualKeyCode: 13,
      });
      await pause();
    }
  };
  const press = async (key) => {
    const code = key === " " ? "Space" : key === "Tab" ? "Tab" : "Enter",
      n = key === " " ? 32 : key === "Tab" ? 9 : 13;
    await send("Input.dispatchKeyEvent", {
      type: "keyDown",
      key,
      code,
      windowsVirtualKeyCode: n,
      ...(key === "Tab" ? {} : { text: key === " " ? " " : "\r" }),
    });
    await send("Input.dispatchKeyEvent", {
      type: "keyUp",
      key,
      code,
      windowsVirtualKeyCode: n,
    });
    await pause();
  };
  const selectInvoice = async (index) => {
    await evaluate(
      'rcInv().querySelectorAll("tbody button")[' + index + "].click()",
    );
    await until('rcComp()?.querySelectorAll("tbody button").length===2');
  };
  const selectCompleted = async (index) => {
    await evaluate(
      'rcComp()?.querySelectorAll("tbody button")[' + index + "].click()",
    );
    await until(
      "rcMeds().length===2&&rcStore.getState().selectedMedicalCaseUid!==null",
    );
  };
  if (layoutCheck) {
    await evaluate('document.querySelector("button[value=SMODB18]").click()');
    // The baseline has no local lookup wrappers or row buttons.
    const originalChoose=async(index,value)=>{
      await evaluate(`document.querySelectorAll('[class*=selectsGroup_] [role=combobox]')[${index}].dispatchEvent(new MouseEvent('mousedown',{bubbles:true,button:0}))`);
      await until('document.querySelector("[role=listbox]")');
      await evaluate(`[...document.querySelectorAll('[role=option]')].find(e=>e.getAttribute('data-value')===${JSON.stringify(value)}).click()`);
      await pause();
    };
    await until('rcClient.getQueryData(["r-control","medical-organizations","SMODB18"])');
    await originalChoose(0,"001");
    await until('rcClient.getQueryData(["r-control","billing-periods","001","SMODB18"])');
    await originalChoose(1,"2026");await originalChoose(2,"1");
    await until('rcInv().querySelectorAll("tbody tr").length===2');
    await evaluate('rcInv().querySelector("tbody tr").click()');
    await until('rcComp()?.querySelectorAll("tbody tr").length===2');
    await evaluate('rcComp().querySelector("tbody tr").click()');
    await until('rcMeds().length===2');
    await evaluate('document.fonts.ready.then(()=>true)');
    const measurements=[];
    for(const width of [360,768,1024,1440,1920]) {
      await send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:false});await pause();
      const geometry=await evaluate(`({viewport:innerWidth,page:document.documentElement.scrollWidth,body:document.body.scrollWidth,overflow:[...document.querySelectorAll('body *')].filter(e=>e.getBoundingClientRect().right>innerWidth+1).slice(0,5).map(e=>({cls:e.className,right:e.getBoundingClientRect().right}))})`);
      measurements.push(geometry);console.log((baselineLayout?'BASELINE':'CURRENT')+' GEOMETRY '+JSON.stringify(geometry));
    }
    if(baselineLayout) await writeFile(baselinePath,JSON.stringify(measurements));
    if(baselineLayout) console.log('BASELINE MEASUREMENTS '+baselinePath);
  } else {
  if (!process.argv.includes("--demo-only")) {
  check(
    "initial dependencies inert without requests",
    requests.length === 0 &&
      (await evaluate(
        '[...document.querySelectorAll("[class*=selectsGroup_] [role=combobox]")].every(e=>Boolean(e.closest("[inert]")))',
      )),
  );
  await evaluate('rcStore.getState().setTargetCategory("patient")');
  await pause();
  check(
    "no categories, tables, medical blocks or requests without their parent",
    requests.length === 0 &&
      (await evaluate('!document.querySelector(".MuiSkeleton-root")&&!rcComp()&&!document.querySelector("[class*=invoicesTableRoot_]")&&!document.querySelector("[class*=categoriesPanelRoot_]")&&rcMeds().length===0')),
  );
  await evaluate('rcStore.getState().setTargetCategory("default")');
  modes.org = "error";
  await evaluate('document.querySelector("button[value=SMODB18]").click()');
  await until(
    'document.body.textContent.includes("Не удалось загрузить организации")',
  );
  check(
    "organization error is not empty",
    await evaluate(
      '!document.body.textContent.includes("В выбранном источнике нет организаций")',
    ),
  );
  modes.org = "empty";
  await invalidate("medical-organizations");
  await until(
    'document.body.textContent.includes("В выбранном источнике нет организаций")',
  );
  modes.org = "loading";
  await evaluate(
    'void rcClient.invalidateQueries({queryKey:["r-control","medical-organizations"]})',
  );
  await pause();
  check(
    "organization loading explicit",
    await evaluate(
      '/Загрузка организаций|Обновление организаций/.test(document.body.textContent)',
    ),
  );
  modes.org = "ready";
  await release("org");
  await choose("Организация", "001");
  check(
    "organization code retained and name displayed",
    await evaluate(
      'rcPanel.getState().selectedMedicalOrganization==="001"&&[...document.querySelectorAll("[role=group]")].find(e=>e.getAttribute("aria-label")==="Организация").textContent.includes("Тестовая организация Альфа")',
    ),
  );
  modes.period = "error";
  await invalidate("billing-periods");
  await until(
    'document.body.textContent.includes("Не удалось загрузить периоды")',
  );
  modes.period = "empty";
  await invalidate("billing-periods");
  await until('document.body.textContent.includes("нет доступных периодов")');
  modes.period = "loading";
  await evaluate(
    'void rcClient.invalidateQueries({queryKey:["r-control","billing-periods"]})',
  );
  await pause();
  check(
    "period loading explicit",
    await evaluate(
      '/Загрузка доступных периодов|Обновление доступных периодов/.test(document.body.textContent)',
    ),
  );
  modes.period = "ready";
  await release("period");
  await choose("Год", "2026");
  await choose("Месяц", "1");
  await until('rcInv().querySelectorAll("tbody button").length===2');
  check(
    "invoices load automatically once with valid period",
    requests.filter((r) => r.kind === "invoice").length === 1,
  );
  const beforeInput = requests.filter((r) => r.kind === "invoice").length;
  await input("rcInv", "invoice-text", false);
  check(
    "typing does not apply invoice search",
    requests.filter((r) => r.kind === "invoice").length === beforeInput &&
      (await evaluate('rcStore.getState().invoiceTableSearchString===""')),
  );
  await input("rcInv", "invoice-text");
  await until('rcStore.getState().invoiceTableSearchString==="invoice-text"');
  check(
    "invoice Enter applies search",
    requests.some((r) => r.kind === "invoice" && r.search === "invoice-text"),
  );
  await input("rcInv", "");
  await until('rcStore.getState().invoiceTableSearchString===""');
  modes.summary = "loading";
  await evaluate(
    "(()=>{const original=rcStore.getState().selectInvoice;window.invoiceActions=0;rcStore.setState({selectInvoice:uid=>{window.invoiceActions++;original(uid);}});})()",
  );
  await pause();
  await evaluate('rcInv().querySelector("tbody button").focus()');
  await press("Enter");
  await until('rcComp()?.querySelectorAll("tbody button").length===2');
  check(
    "native invoice Enter activates once",
    await evaluate(
      "window.invoiceActions===1&&rcStore.getState().selectedInvoiceUid===11",
    ),
  );
  check(
    "invoice focus visible",
    await evaluate(
      'getComputedStyle(rcInv().querySelector("tbody button")).outlineStyle==="solid"&&getComputedStyle(rcInv().querySelector("tbody button")).outlineColor==="rgb(36, 135, 109)"',
    ),
  );
  check(
    "completed query independent from pending summary",
    held.some((h) => h.kind === "summary") &&
      requests.some((r) => r.kind === "completed" && r.parent === 11),
  );
  modes.summary = "ready";
  await release("summary");
  const beforeCaseInput = requests.filter((r) => r.kind === "completed").length;
  await input("rcComp", "case-text", false);
  check(
    "typing does not apply case search",
    requests.filter((r) => r.kind === "completed").length === beforeCaseInput,
  );
  await input("rcComp", "case-text");
  check(
    "case Enter applies independently",
    await evaluate(
      'rcStore.getState().selectedInvoiceUid===11&&rcStore.getState().completedCasesTableSearchString==="case-text"&&rcStore.getState().invoiceTableSearchString===""',
    ),
  );
  await input("rcComp", "");
  await until('rcComp()?.querySelectorAll("tbody button").length===2');
  await evaluate(
    "(()=>{const original=rcStore.getState().selectCompletedCase;window.completedActions=0;rcStore.setState({selectCompletedCase:uid=>{window.completedActions++;original(uid);}});})()",
  );
  await pause();
  await evaluate('rcComp().querySelector("tbody button").focus()');
  await press(" ");
  await until("rcStore.getState().selectedMedicalCaseUid===1111");
  check(
    "native completed Space activates once and medical first selected",
    await evaluate(
      "window.completedActions===1&&rcStore.getState().selectedCompletedCaseUid===111&&rcMeds().length===2",
    ),
  );
  await evaluate("rcMeds()[1].click()");
  await pause();
  check(
    "manual medical choice retained",
    await evaluate("rcStore.getState().selectedMedicalCaseUid===1112"),
  );
  for (const [key, kind] of [
    ["invoice-list-items", "invoice"],
    ["completed-cases", "completed"],
    ["medical-cases", "medical"],
  ]) {
    modes[kind] = "loading";
    await evaluate(
      "void rcClient.invalidateQueries({queryKey:" +
        JSON.stringify(["r-control", key]) +
        "})",
    );
    await pause();
    check(
      "refetch " + kind + " retains selections",
      await evaluate(
        "rcStore.getState().selectedInvoiceUid===11&&rcStore.getState().selectedCompletedCaseUid===111&&rcStore.getState().selectedMedicalCaseUid===1112",
      ),
    );
    modes[kind] = "ready";
    await release(kind);
    await pause();
    check(
      "successful refetch " + kind + " does not reselect first",
      await evaluate("rcStore.getState().selectedMedicalCaseUid===1112"),
    );
    modes[kind] = "error";
    await invalidate(key);
    check(
      "refetch error " + kind + " retains selections",
      await evaluate("rcStore.getState().selectedMedicalCaseUid===1112"),
    );
    modes[kind] = "ready";
    await invalidate(key);
  }
  shiftedInvoices = true;
  await invalidate("invoice-list-items");
  check(
    "missing invoice on partial page does not reset or hide confirmed child",
    await evaluate(
      'rcStore.getState().selectedInvoiceUid===11&&rcStore.getState().selectedMedicalCaseUid===1112&&rcComp()?.querySelectorAll("tbody button").length===2',
    ),
  );
  shiftedInvoices = false;
  await invalidate("invoice-list-items");
  shiftedCompleted = true;
  await invalidate("completed-cases");
  check(
    "missing completed on partial page does not reset medical child",
    await evaluate(
      "rcStore.getState().selectedCompletedCaseUid===111&&rcStore.getState().selectedMedicalCaseUid===1112&&rcMeds().length===2",
    ),
  );
  shiftedCompleted = false;
  await invalidate("completed-cases");
  modes.medical = "empty";
  await invalidate("medical-cases");
  await until("rcStore.getState().selectedMedicalCaseUid===null");
  check(
    "successful empty medical clears selected UID and cards",
    await evaluate(
      "rcStore.getState().selectedCompletedCaseUid===111&&rcMeds().length===0",
    ),
  );
  modes.medical = "ready";
  await invalidate("medical-cases");
  await until("rcStore.getState().selectedMedicalCaseUid===1111");
  modes.medical = "loading";
  await selectInvoice(1);
  await evaluate('rcComp().querySelector("tbody button").click()');
  await pause();
  check("medical area opens while loading but categories remain hidden",await evaluate(`document.querySelector('[aria-label="Медицинские случаи"]')&&!document.querySelector('[class*=categoriesPanelRoot_]')`));
  const oldParent = await evaluate(
    "rcStore.getState().selectedCompletedCaseUid",
  );
  modes.medical = "ready";
  await selectInvoice(0);
  await selectCompleted(1);
  const newMedical = await evaluate(
    "rcStore.getState().selectedMedicalCaseUid",
  );
  await release("medical");
  check(
    "late medical response cannot change newer parent choice",
    await evaluate(
      "rcStore.getState().selectedMedicalCaseUid===" +
        newMedical +
        '&&!rcMeds()[0].textContent.includes("ТЕСТ-МЕД-' +
        (oldParent * 10 + 1) +
        '")',
    ),
  );
  // Paginated lists do not reconcile selection, even when this response fits one page.
  fullCompleted = true;
  shiftedCompleted = true;
  await invalidate("completed-cases");
  check(
    "completed response does not infer deletion or reset descendants",
    await evaluate(
      "rcStore.getState().selectedInvoiceUid===11&&rcStore.getState().selectedMedicalCaseUid===" + newMedical,
    ),
  );
  fullCompleted = false;
  shiftedCompleted = false;
  await invalidate("completed-cases");
  await selectCompleted(0);
  fullInvoices = true;
  shiftedInvoices = true;
  await invalidate("invoice-list-items");
  check(
    "invoice response does not infer deletion or reset descendants",
    await evaluate(
      "rcStore.getState().selectedInvoiceUid===11&&rcStore.getState().selectedCompletedCaseUid===111&&rcStore.getState().selectedMedicalCaseUid===1111",
    ),
  );
  fullInvoices = false;
  shiftedInvoices = false;
  await invalidate("invoice-list-items");
  await selectInvoice(0);
  await selectCompleted(0);
  // Existing explicit pagination reset is preserved; no extra absence-based reconciliation occurs.
  await evaluate("rcStore.getState().setInvoicesTablePagination({page:1})");
  await until(
    'rcInv().querySelector("tbody button")?.textContent==="ТЕСТ-СЧЕТ-21"',
  );
  check(
    "server pagination uses page+1 and existing selection reset",
    requests.some((r) => r.kind === "invoice" && r.page === 2) &&
      (await evaluate("rcStore.getState().selectedInvoiceUid===null")),
  );
  await evaluate("rcStore.getState().setInvoicesTablePagination({page:0})");
  await until(
    'rcInv().querySelector("tbody button")?.textContent==="ТЕСТ-СЧЕТ-11"',
  );
  await input("rcInv", "remember-invoice");
  await selectInvoice(0);
  await input("rcComp", "remember-case");
  await selectCompleted(0);
  const history = await send("Page.getNavigationHistory"),
    entry = history.entries[history.currentIndex].id;
  await evaluate(
    '[...document.querySelectorAll("a")].find(e=>e.getAttribute("href")==="/").click()',
  );
  await until('location.pathname==="/"');
  await send("Page.navigateToHistoryEntry", { entryId: entry });
  await until(
    'location.pathname==="/rcontrol"&&rcInv()?.querySelector("input[placeholder]")',
  );
  check(
    "SPA return restores applied searches in inputs",
    await evaluate(
      'rcInv().querySelector("input[placeholder]").value==="remember-invoice"&&rcComp().querySelector("input[placeholder]").value==="remember-case"',
    ),
  );
  await input("rcComp", "unapplied-draft", false);
  await selectInvoice(1);
  check(
    "parent change restores real applied filter instead of old draft",
    await evaluate(
      'rcComp().querySelector("input[placeholder]").value==="remember-case"',
    ),
  );
  await evaluate('rcStore.getState().setCompletedCasesSearch("")');
  await pause();
  check(
    "external search reset synchronizes field",
    await evaluate('rcComp().querySelector("input[placeholder]").value===""'),
  );
  await input("rcInv", "");
  // Successful full lookup invalidation resets only dependent selectors and their entity chain.
  monthMissing = true;
  await invalidate("billing-periods");
  await until("rcPanel.getState().selectedBillingMonth===null");
  check(
    "removed month invalidates invoice context",
    await evaluate(
      "rcPanel.getState().selectedBillingYear===2026&&rcStore.getState().selectedInvoiceUid===null",
    ),
  );
  monthMissing = false;
  await invalidate("billing-periods");
  await choose("Месяц", "1");
  yearMissing = true;
  await invalidate("billing-periods");
  await until("rcPanel.getState().selectedBillingYear===null");
  check(
    "removed year preserves organization",
    await evaluate(
      'rcPanel.getState().selectedMedicalOrganization==="001"&&rcPanel.getState().selectedBillingMonth===null',
    ),
  );
  yearMissing = false;
  await invalidate("billing-periods");
  await choose("Год", "2026");
  await choose("Месяц", "1");
  orgMissing = true;
  await invalidate("medical-organizations");
  await until("rcPanel.getState().selectedMedicalOrganization===null");
  check(
    "removed organization preserves source only",
    await evaluate(
      'rcPanel.getState().targetDb==="SMODB18"&&rcPanel.getState().selectedBillingYear===null&&rcStore.getState().selectedInvoiceUid===null',
    ),
  );
  orgMissing = false;
  await invalidate("medical-organizations");
  await choose("Организация", "001");
  await choose("Год", "2026");
  await choose("Месяц", "1");
  await selectInvoice(0);
  await selectCompleted(0);
  modes.org = "loading";
  await evaluate('document.querySelector("button[value=INOGOROD18]").click()');
  await pause();
  check(
    "source change immediately gates old children",
    await evaluate(
      "rcStore.getState().selectedInvoiceUid===null&&rcStore.getState().selectedCompletedCaseUid===null&&rcStore.getState().selectedMedicalCaseUid===null&&rcMeds().length===0",
    ),
  );
  modes.org = "ready";
  await release("org");
  await choose("Организация", "002");
  await choose("Год", "2026");
  await choose("Месяц", "2");
  await until('rcInv().querySelectorAll("tbody button").length===2');
  check(
    "new source and period reach correct API params",
    requests.some(
      (r) =>
        r.kind === "invoice" &&
        r.db === "INOGOROD18" &&
        r.org === "002" &&
        r.month === "2",
    ),
  );
  console.log("RCONTROL WORKSPACE REGRESSIONS COMPLETE");
  }
  // Exercise the existing development transport itself, without CDP API fixtures.
  await send("Fetch.disable");
  await send("Page.navigate", {
    url: "http://127.0.0.1:5189/rcontrol?demoWorkspace=1&demoDelay=400",
  });
  await until('document.body.textContent.includes("Сначала выберите источник данных")');
  await initialize();
  const mouse = async (expression) => {
    const point = await evaluate(`(()=>{const e=${expression};e.scrollIntoView({block:'center',inline:'nearest'});const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()`);
    await send("Input.dispatchMouseEvent", {type:"mouseMoved", ...point});
    await send("Input.dispatchMouseEvent", {type:"mousePressed", ...point, button:"left",clickCount:1});
    await send("Input.dispatchMouseEvent", {type:"mouseReleased", ...point, button:"left",clickCount:1});
    await pause();
  };
  const demoMode = async (name, mode) => {
    await evaluate(`(()=>{const u=new URL(location.href);u.searchParams.set(${JSON.stringify('demo'+name)},${JSON.stringify(mode)});history.replaceState(history.state,'',u);})()`);
  };
  const screenshot = async (name, selector) => {
    const clip = selector ? await evaluate(`(()=>{const r=document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();return {x:r.x+scrollX,y:r.y+scrollY,width:r.width,height:r.height,scale:1};})()`) : undefined;
    const result = await send("Page.captureScreenshot", { format:"png", ...(clip ? {clip,captureBeyondViewport:true} : {}) });
    const path = join(profile, name + ".png");
    await writeFile(path, Buffer.from(result.data, "base64"));
    console.log("SCREENSHOT " + path);
  };
  await screenshot("rcontrol-context-initial");
  check("demo state A shows one accounts workspace and no dependent areas",await evaluate(`document.querySelector('#rcontrol-accounts-title')&&document.querySelector('#rcontrol-context-title')&&!document.querySelector('[class*=invoicesTableRoot_]')&&!rcComp()&&!document.querySelector('[aria-label="Медицинские случаи"]')&&!document.querySelector('[class*=categoriesPanelRoot_]')`));
  await mouse('document.querySelector("button[value=SMODB18]")');
  await until('document.body.textContent.includes("Загрузка организаций")');
  check("demo initial organizations loading", await evaluate('document.querySelector("[aria-label=Организация]").getAttribute("aria-busy")==="true"'));
  await until('document.querySelector("[aria-label=Организация]").getAttribute("aria-disabled")==="false"');
  for (const [mode, text] of [["error","Не удалось загрузить организации"],["empty","В выбранном источнике нет организаций"],["ready","ДЕМО-РКОНТРОЛ"]]) {
    await demoMode("Organizations",mode);
    await invalidate("medical-organizations");
    if(mode!=="ready") await until(`document.body.textContent.includes(${JSON.stringify(text)})`);
    check("demo organizations "+mode, await evaluate('document.querySelector("[aria-label=Организация]").getAttribute("aria-disabled")==='+JSON.stringify(mode==="empty"?"true":"false")));
  }
  await choose("Организация","001");
  await until('document.body.textContent.includes("Загрузка доступных периодов")');
  check("demo initial periods loading",await evaluate('document.querySelector("[aria-label=Год]").getAttribute("aria-busy")==="true"'));
  await until('document.querySelector("[aria-label=Год]").getAttribute("aria-disabled")==="false"');
  for (const [mode,text] of [["error","Не удалось загрузить периоды"],["empty","нет доступных периодов"],["ready",null]]) {
    await demoMode("Periods",mode);
    await invalidate("billing-periods");
    if(text) await until(`document.body.textContent.includes(${JSON.stringify(text)})`);
    check("demo periods "+mode, await evaluate('document.querySelector("[aria-label=Год]").getAttribute("aria-disabled")==='+JSON.stringify(mode==="empty"?"true":"false")));
  }
  await choose("Год","2026");
  await choose("Месяц","1");
  await until('rcInv().querySelectorAll("tbody button").length===2');
  const summary = 'document.querySelector("[aria-labelledby=rcontrol-invoice-summary-title]")';
  check("demo summary absent before invoice selection",await evaluate(`!${summary}`));
  check("demo state B hides completed and medical areas",await evaluate(`!rcComp()&&rcMeds().length===0&&!document.querySelector('[class*=categoriesPanelRoot_]')`));
  await demoMode("Invoices","empty");
  await invalidate("invoice-list-items");
  check("demo invoices empty keeps summary hidden",await evaluate(`rcInv().textContent.includes('Нет найденных счетов')&&!${summary}`));
  await screenshot("rcontrol-invoices-empty");
  await demoMode("Invoices","error");
  await invalidate("invoice-list-items");
  check("demo invoices error keeps summary hidden",await evaluate(`rcInv().textContent.includes('Демонстрационная ошибка: Invoices')&&!${summary}`));
  await screenshot("rcontrol-invoices-error");
  await demoMode("Invoices","ready");
  await evaluate(`(()=>{const u=new URL(location.href);u.searchParams.set('demoDelay','1000');history.replaceState(history.state,'',u);void rcClient.resetQueries({queryKey:['r-control','invoice-list-items']});})()`);
  await until('rcInv().querySelector(".MuiSkeleton-root")');
  await screenshot("rcontrol-invoices-loading");
  await until('rcInv().querySelectorAll("tbody button").length===2');
  await evaluate(`(()=>{const u=new URL(location.href);u.searchParams.set('demoDelay','400');history.replaceState(history.state,'',u);})()`);
  await screenshot("rcontrol-context-ready");
  await evaluate(`(()=>{const original=rcStore.getState().selectInvoice;window.invoiceActions=0;rcStore.setState({selectInvoice:uid=>{invoiceActions++;original(uid)}});const originalCase=rcStore.getState().selectCompletedCase;window.completedActions=0;rcStore.setState({selectCompletedCase:uid=>{completedActions++;originalCase(uid)}});})()`);
  await pause();
  await mouse('rcInv().querySelector("tbody tr td:nth-child(2)")');
  await until('rcComp()?.querySelectorAll("tbody button").length===2');
  check("demo native mouse invoice row selects once",await evaluate("invoiceActions===1&&rcStore.getState().selectedInvoiceUid===11"));
  check("demo state C shows completed cases as a separate sibling section",await evaluate(`(()=>{const accounts=document.querySelector('[aria-labelledby=rcontrol-accounts-title]'),completed=rcComp();return ${summary}?.closest('[aria-labelledby=rcontrol-accounts-title]')===accounts&&!accounts.contains(completed)&&accounts.nextElementSibling===completed&&getComputedStyle(completed).backgroundColor==='rgb(255, 255, 255)'&&rcMeds().length===0&&!document.querySelector('[class*=categoriesPanelRoot_]');})()`));
  await screenshot("rcontrol-workspace-invoice-selected",'[aria-labelledby=rcontrol-accounts-title]');
  await mouse('rcComp().querySelector("tbody button")');
  await until("rcStore.getState().selectedMedicalCaseUid===1111");
  check("demo native mouse case button selects once and reaches medical",await evaluate("completedActions===1&&rcStore.getState().selectedCompletedCaseUid===111&&rcMeds().length===2"));
  check("demo state E shows all seven categories after automatic medical selection",await evaluate(`document.querySelector('[class*=categoriesPanelRoot_]')?.children.length===7`));
  await mouse('rcInv().querySelectorAll("tbody button")[1]');
  await until("rcStore.getState().selectedInvoiceUid===12&&rcComp()?.querySelectorAll('tbody button').length===2");
  check("demo invoice button has no double activation",await evaluate("invoiceActions===2&&rcStore.getState().selectedMedicalCaseUid===null"));
  await mouse('rcComp().querySelector("tbody tr td:nth-child(2)")');
  await until("rcStore.getState().selectedMedicalCaseUid===1211");
  check("demo completed mouse row selects once",await evaluate("completedActions===2&&rcStore.getState().selectedCompletedCaseUid===121"));
  const tabTo = async (expression) => {
    await evaluate(`(()=>{const target=${expression};const all=[...document.querySelectorAll('button,input,a[href],[tabindex]')].filter(e=>e.tabIndex>=0&&!e.disabled&&!e.closest('[inert]')&&e.getClientRects().length);all[all.indexOf(target)-1].focus();})()`);
    await press("Tab");
    check("demo Tab reaches "+expression,await evaluate(`document.activeElement===${expression}`));
    check("demo focus-visible "+expression,await evaluate(`document.activeElement.matches(':focus-visible')&&getComputedStyle(document.activeElement).outlineStyle==='solid'&&getComputedStyle(document.activeElement).outlineColor==='rgb(36, 135, 109)'`));
  };
  await tabTo('rcInv().querySelector("tbody button")');
  await press("Enter");
  await until('rcStore.getState().selectedInvoiceUid===11&&rcComp()?.querySelectorAll("tbody button").length===2');
  check("demo Enter invoice once",await evaluate("invoiceActions===3"));
  await press(" ");
  check("demo Space invoice once",await evaluate("invoiceActions===4"));
  await tabTo('rcComp().querySelector("tbody button")');
  await press("Enter");
  await until("rcStore.getState().selectedMedicalCaseUid===1111");
  check("demo Enter completed once",await evaluate("completedActions===3"));
  await press(" ");
  await until("rcStore.getState().selectedMedicalCaseUid===1111");
  check("demo Space completed once restores the first medical card",await evaluate("completedActions===4&&rcMeds()[0].classList.contains('selectedCard')"));
  await evaluate('rcComp().querySelector("tbody button").scrollIntoView({block:"center"})');
  await screenshot("rcontrol-selected-focus-1440");
  for(const area of ["rcInv","rcComp"]) {
    const colors=await evaluate(`(()=>{const rows=${area}().querySelectorAll('tbody tr');return [...rows].map(e=>({selected:e.classList.contains('selectedRow')||e.classList.contains('mt-table__row--selected'),background:getComputedStyle(e).backgroundColor}));})()`);
    check("demo selected styling "+area,colors.some(e=>e.selected)&&colors[0].background!==colors[1].background);
  }
  check("demo summary is inside invoices below the table",await evaluate(`${summary}?.closest('[class*=invoicesTableRoot_]')===rcInv()&&${summary}.getBoundingClientRect().top>=rcInv().querySelector('table').getBoundingClientRect().bottom`));
  check("demo summary identifies selected invoice",await evaluate(`${summary}.querySelector('header').textContent.includes('ДЕМО-SMODB18-11')`));
  await demoMode("Summary","error");
  await invalidate("invoice-summary");
  check("demo summary error does not block completed cases",await evaluate(`${summary}.textContent.includes('Демонстрационная ошибка: Summary')&&rcComp()?.querySelectorAll('tbody button').length===2`));
  await screenshot("rcontrol-summary-error");
  await demoMode("Summary","empty");
  await invalidate("invoice-summary");
  check("demo summary empty",await evaluate(`${summary}.textContent.includes('Подробных данных о счете не найдено')`));
  await demoMode("Summary","ready");
  await evaluate(`(()=>{const u=new URL(location.href);u.searchParams.set('demoDelay','1000');history.replaceState(history.state,'',u);void rcClient.resetQueries({queryKey:['r-control','invoice-summary']});})()`);
  await until(`${summary}?.querySelector('.MuiSkeleton-root')`);
  check("demo summary loading leaves completed cases usable",await evaluate('rcComp()?.querySelectorAll("tbody button").length===2'));
  await screenshot("rcontrol-summary-loading");
  await until(`!${summary}?.querySelector('.MuiSkeleton-root')`);
  check("demo summary preserves all financial and metadata fields",await evaluate(`${summary}.querySelectorAll('dd').length===12`));
  await demoMode("Completed","error");
  await invalidate("completed-cases");
  check("demo completed error does not hide financial information",await evaluate(`rcComp().textContent.includes('Демонстрационная ошибка: Completed')&&${summary}.querySelectorAll('dd').length===12`));
  await demoMode("Completed","ready");
  await invalidate("completed-cases");
  await evaluate(`(()=>{const u=new URL(location.href);u.searchParams.set('demoDelay','400');history.replaceState(history.state,'',u);})()`);
  await input("rcInv","saved-invoice");
  check("demo invoice search uses RControl focus",await evaluate(`getComputedStyle(rcInv().querySelector('.MuiOutlinedInput-notchedOutline')).borderColor==='rgb(36, 135, 109)'`));
  await until('rcInv().querySelectorAll("tbody button").length===2');
  await selectInvoice(0);
  await input("rcComp","saved-case");
  await until('rcComp()?.querySelectorAll("tbody button").length===2');
  await input("rcComp","unsent",false);
  await mouse('rcInv().querySelectorAll("tbody button")[1]');
  check("demo parent restores applied search",await evaluate('rcComp().querySelector("input[placeholder]").value==="saved-case"'));
  await until('rcComp()?.querySelectorAll("tbody button").length===2');
  await selectCompleted(0);
  await demoMode("Medical","empty");
  await invalidate("medical-cases");
  await until("rcStore.getState().selectedMedicalCaseUid===null&&rcMeds().length===0");
  check("demo empty medical removes old dependent data",true);
  await demoMode("Medical","ready");
  await invalidate("medical-cases");
  await until("rcMeds().length===2&&rcStore.getState().selectedMedicalCaseUid!==null");
  for(const width of [360,768,1024,1440,1920]) {
    await evaluate('document.fonts.ready.then(()=>true)');
    await send("Emulation.setDeviceMetricsOverride",{width,height:1000,deviceScaleFactor:1,mobile:false});
    await pause();
    const geometry=await evaluate(`({viewport:innerWidth,page:document.documentElement.scrollWidth,body:document.body.scrollWidth,overflow:[...document.querySelectorAll('body *')].filter(e=>e.getBoundingClientRect().right>innerWidth+1).slice(0,8).map(e=>({tag:e.tagName,cls:e.className,right:e.getBoundingClientRect().right}))})`);
    console.log("DEMO GEOMETRY "+JSON.stringify(geometry));
    const scoped=await evaluate(`(()=>{const elements=[document.querySelector('[aria-labelledby=rcontrol-context-title]'),rcInv(),rcComp(),document.querySelector('[aria-labelledby=rcontrol-accounts-title]')];return elements.map(e=>({width:e.clientWidth,scroll:e.scrollWidth,right:e.getBoundingClientRect().right}));})()`);
    check("demo redesigned areas fit at "+width,scoped.every(e=>e.scroll<=e.width+1&&e.right<=width+1));
    check("accounts and completed sections share width and alignment at "+width,await evaluate(`(()=>{const a=document.querySelector('[aria-labelledby=rcontrol-accounts-title]').getBoundingClientRect(),b=rcComp().getBoundingClientRect();return Math.abs(a.width-b.width)<1&&Math.abs(a.left-b.left)<1&&b.top>=a.bottom;})()`));
    check("demo page does not overflow at "+width,geometry.page<=width+1&&geometry.body<=width+1);
    if(width===360||width===1440) {
      await screenshot("rcontrol-workspace-"+width,'[aria-labelledby=rcontrol-accounts-title]');
      await screenshot("rcontrol-completed-"+width,'[class*=CompletedCasesTableRoot_]');
    }
    const contextControls=await evaluate(`(()=>{const panel=document.querySelector('[aria-labelledby=rcontrol-context-title]');return [...panel.querySelectorAll('.MuiToggleButtonGroup-root,.MuiInputBase-root')].map(e=>Math.round(e.getBoundingClientRect().height));})()`);
    check("demo context controls have a consistent 44px height at "+width,contextControls.length===4&&contextControls.every(h=>h===44));
    if(width===360) {
      await evaluate(`(()=>{window.originalOrganizations=rcClient.getQueryData(['r-control','medical-organizations','SMODB18']);rcClient.setQueryData(['r-control','medical-organizations','SMODB18'],originalOrganizations.map((e,i)=>i===0?{...e,medicalOrganizationName:'ДЕМОНСТРАЦИОННОЕ ДЛИННОЕ НАЗВАНИЕ ОРГАНИЗАЦИИ '.repeat(5)}:e));})()`);
      await pause();
      await evaluate(`document.querySelector('[aria-label=Организация] [role=combobox]').dispatchEvent(new MouseEvent('mousedown',{bubbles:true,button:0}))`);
      await until('document.querySelector("[role=listbox]")');
      check("demo long organization names wrap fully in menu",await evaluate(`(()=>{const e=document.querySelector('[role=option][data-value="001"]');const r=e.getBoundingClientRect();return e.textContent.includes('ДЛИННОЕ НАЗВАНИЕ')&&getComputedStyle(e).whiteSpace==='normal'&&e.scrollWidth<=e.clientWidth+1&&r.right<=innerWidth;})()`));
      await pause(300);
      await screenshot("rcontrol-organization-long-360");
      await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
      await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
      await until('!document.querySelector("[role=listbox]")');
      await evaluate(`rcClient.setQueryData(['r-control','medical-organizations','SMODB18'],originalOrganizations)`);
      await pause();
    }
    const scrollTable=await evaluate(`(()=>{const e=rcInv().querySelector('.mt-table-viewport');e.scrollLeft=e.scrollWidth;return {width:e.clientWidth,scroll:e.scrollWidth,left:e.scrollLeft};})()`);
    if(width===360) check("demo invoices scroll horizontally inside the section",scrollTable.scroll>scrollTable.width&&scrollTable.left>0);
    if(width===360||width===768||width===1024||width===1920) {
      await evaluate('rcInv().scrollIntoView({block:"start"})');
      await screenshot("rcontrol-invoices-"+width);
    }
    if(geometry.page>width+1||geometry.body>width+1) {
      const baseline=JSON.parse(await readFile(baselinePath,'utf8')).find(e=>e.viewport===width);
      console.log('LIMIT existing horizontal overflow at '+width+'; baseline='+JSON.stringify(baseline));
      check('demo no added page overflow compared to baseline at '+width,geometry.page<=baseline.page&&geometry.body<=baseline.body);
    } else check("demo page has no horizontal overflow at "+width,true);
    if(width===360||width===1440) {
      await evaluate('document.querySelector("[class*=filtersPanelRoot_]").scrollIntoView({block:"start"})');
      await screenshot("rcontrol-demo-"+width);
    }
  }
  await evaluate(`(()=>{const u=new URL(location.href);u.searchParams.set('demoInvoiceCount','100');history.replaceState(history.state,'',u);})()`);
  for(const pageSize of [10,25,50,100]) {
    await evaluate(`rcStore.getState().setInvoicesTablePagination({page:0,pageSize:${pageSize}})`);
    await invalidate("invoice-list-items");
    await until(`rcInv().querySelectorAll('tbody button').length===${pageSize}`);
    check("pagination change collapses invoice descendants at "+pageSize,await evaluate(`!rcComp()&&!${summary}&&rcMeds().length===0&&!document.querySelector('[class*=categoriesPanelRoot_]')`));
    const sticky=await evaluate(`(()=>{const e=rcInv().querySelector('.mt-table-viewport');e.scrollTop=e.scrollHeight;const r=e.getBoundingClientRect(),h=e.querySelector('th').getBoundingClientRect();return {height:e.clientHeight,scroll:e.scrollHeight,top:e.scrollTop,offset:Math.abs(r.top-h.top)};})()`);
    check("invoice viewport is bounded with CSS sticky at "+pageSize,sticky.height<=400&&sticky.scroll>sticky.height&&sticky.top>0&&sticky.offset<2);
  }
  await evaluate(`rcInv().scrollIntoView({block:'start'})`);
  await screenshot("rcontrol-invoices-100-sticky");
  await evaluate(`(()=>{const u=new URL(location.href);u.searchParams.delete('demoInvoiceCount');history.replaceState(history.state,'',u);rcStore.getState().setInvoicesTablePagination({page:0,pageSize:10});})()`);
  await until('rcInv().querySelectorAll("tbody button").length===2');
  await selectInvoice(0);await selectCompleted(0);
  await choose("Месяц","2");
  check("demo month clears descendants",await evaluate("rcStore.getState().selectedInvoiceUid===null&&rcStore.getState().selectedMedicalCaseUid===null&&rcMeds().length===0"));
  await until('rcInv().querySelectorAll("tbody button").length===2');
  await selectInvoice(0);await selectCompleted(0);
  await choose("Год","2025");
  check("demo year clears month and descendants",await evaluate("rcPanel.getState().selectedBillingMonth===null&&rcStore.getState().selectedInvoiceUid===null&&rcMeds().length===0"));
  await choose("Месяц","12");
  await until('rcInv().querySelectorAll("tbody button").length===2');
  await selectInvoice(0);await selectCompleted(0);
  await choose("Организация","002");
  check("demo organization clears year month and descendants",await evaluate("rcPanel.getState().selectedBillingYear===null&&rcPanel.getState().selectedBillingMonth===null&&rcStore.getState().selectedInvoiceUid===null&&rcMeds().length===0"));
  await until('document.querySelector("[aria-label=Год]").getAttribute("aria-disabled")==="false"');
  await choose("Год","2026");await choose("Месяц","1");
  await until('rcInv().querySelectorAll("tbody button").length===2');
  await selectInvoice(0);await selectCompleted(0);
  await mouse('document.querySelector("button[value=INOGOROD18]")');
  check("demo source clears old descendants immediately",await evaluate("rcStore.getState().selectedInvoiceUid===null&&rcStore.getState().selectedCompletedCaseUid===null&&rcStore.getState().selectedMedicalCaseUid===null&&rcMeds().length===0"));
  check("demo summary hides after context reset",await evaluate(`!${summary}`));
  console.log("RCONTROL DEMO BROWSER CHECKS COMPLETE");
  check("no runtime exceptions or out-of-range select values", runtimeErrors.length === 0);
  }
} finally {
  ws?.close();
  chrome.kill();
  await server.close();
}
