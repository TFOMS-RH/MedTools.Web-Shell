// Run from the repository root: node tests/medview-oncology.browser.mjs
// Requires Chrome (override CHROME_PATH if needed). All API responses are intercepted test fixtures.
import { spawn } from "node:child_process";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
const root = process.cwd();

const { createServer } = await import(
  pathToFileURL(join(root, "node_modules/vite/dist/node/index.js"))
);
const server = await createServer({
  logLevel: "silent",
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
  let onRequest;
  ws.onmessage = ({ data }) => {
    const msg = JSON.parse(data);
    if (msg.method === "Runtime.exceptionThrown")
      console.log("EXCEPTION " + JSON.stringify(msg.params));
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

  const pause = (ms = 180) => new Promise((r) => setTimeout(r, ms));
  const check = (n, ok) => {
    if (!ok) throw Error(n);
    console.log("PASS " + n);
  };
  const until = async (e) => {
    for (let i = 0; i < 150; i++) {
      if (await evaluate("Boolean(" + e + ")")) return;
      await pause(100);
    }
    throw Error("Timeout " + e);
  };
  let scene = {
    count: 2,
    modes: {},
    long: false,
    nullable: false,
    caseVersion: 0,
  };
  let caseUid = 100;
  const requests = [],
    held = [];
  const countFor = (kind) =>
    scene.modes[kind] === "empty" ? 0 : (scene.counts?.[kind] ?? scene.count);
  const oncology = () => ({
    oncologyCaseUid: caseUid * 10 + scene.caseVersion,
    referralReasonCode: 0,
    referralReason: scene.nullable
      ? null
      : scene.long
        ? "Тестовое длинное описание повода обращения. ".repeat(10)
        : "ТЕСТ-ПОВОД",
    stageCode: 0,
    stage: scene.nullable ? null : "ТЕСТ-СТАДИЯ",
    icdDiagnosis: "HIDDEN-ICD",
    tumorValue: scene.nullable ? null : 0,
    nodusValue: null,
    metastasisValue: null,
    isMetastasisDetected: null,
    totalFocusDose: scene.nullable ? null : 0,
    radiationFractionsCount: 777,
    weight: 987.123,
    height: 986.123,
    bodySurfaceArea: 985.123,
  });
  const service = (parent, i) => ({
    oncologyServiceUid: parent * 100 + i + 1,
    serviceTypeCode: 0,
    serviceType: scene.long
      ? "Тестовая длинная строка типа услуги. ".repeat(12)
      : "ТЕСТ-УСЛУГА-" + (parent * 100 + i + 1),
    surgicalTreatmentTypeCode: null,
    surgicalTreatmentType: null,
    drugTherapyLineCode: null,
    drugTherapyLine: null,
    drugTherapyCycleCode: 999,
    drugTherapyCycle: "HIDDEN-CYCLE",
    isAntiemeticProphylaxis: null,
    radioTherapyTypeCode: null,
    radiotherapyType: null,
  });
  const medication = (parent, i) => ({
    medicamentUid: parent * 100 + i + 1,
    drugIdentifier: scene.long
      ? "0000-ТЕСТ-ПРЕПАРАТ-".repeat(18)
      : "ТЕСТ-ПРЕПАРАТ-" + (parent * 100 + i + 1),
    drugExtendedIdentifier: "HIDDEN-EXTENDED",
    therapyRegimenCode: scene.nullable
      ? null
      : scene.long
        ? "0000-ТЕСТ-СХЕМА-".repeat(15)
        : "0000-ТЕСТ-СХЕМА",
  });
  const reply = (id, result) =>
    send("Fetch.fulfillRequest", {
      requestId: id,
      responseCode: 200,
      responseHeaders: [
        { name: "Content-Type", value: "application/json; charset=utf-8" },
      ],
      body: Buffer.from(JSON.stringify(result)).toString("base64"),
    });
  onRequest = async ({ requestId, request }) => {
    const u = new URL(request.url);
    if (!u.pathname.startsWith("/api/")) {
      await send("Fetch.continueRequest", { requestId });
      return;
    }
    const ep = u.pathname.split("/").at(-1),
      parent = Number(u.pathname.split("/").at(-2)),
      db = u.searchParams.get("targetDb");
    const kind = {
      "oncology-case": "case",
      consultations: "consult",
      diagnostics: "diag",
      contraindications: "contra",
      "oncology-services": "services",
      medications: "med",
      "injection-dates": "dates",
      injections: "inj",
    }[ep];
    requests.push({ kind, parent, db });
    const mode = scene.modes[kind] ?? "ready",
      n = countFor(kind);
    let value;
    if (kind === "case")
      value = { oncologyCase: mode === "empty" ? null : oncology() };
    if (kind === "consult")
      value = {
        consultations: Array.from({ length: n }, (_, i) => ({
          consultationUid: i + 1,
          consultationPurposeCode: 0,
          consultationPurpose: scene.long
            ? "Тестовое длинное описание консилиума. ".repeat(12)
            : "ТЕСТ-КОНСИЛИУМ-" + i,
          consultationDate: scene.nullable ? null : "2026-01-03",
        })),
      };
    if (kind === "diag")
      value = {
        diagnostics: Array.from({ length: n }, (_, i) => ({
          diagnosticsUid: i + 1,
          specimenCollectionDate: scene.nullable ? null : "2026-01-03",
          diagnosticType: scene.nullable ? null : 0,
          diagnosticCode: scene.nullable ? null : 0,
          diagnosticResultCode: scene.nullable ? null : 0,
          isResultReceived: scene.nullable ? null : i % 2 === 0,
        })),
      };
    if (kind === "contra")
      value = {
        contraindications: Array.from({ length: n }, (_, i) => ({
          contraindicationUid: i + 1,
          contraindicationCode: 0,
          contraindication: scene.long
            ? "Тестовое длинное противопоказание. ".repeat(12)
            : "ТЕСТ-ПРОТИВОПОКАЗАНИЕ-" + i,
          contraindicationDate: "2026-01-03",
        })),
      };
    if (kind === "services")
      value = {
        oncologyServices: Array.from({ length: n }, (_, i) =>
          service(parent, i),
        ),
      };
    if (kind === "med")
      value = {
        medications: Array.from({ length: n }, (_, i) => medication(parent, i)),
      };
    if (kind === "dates")
      value = {
        injectionDates: Array.from({ length: n }, (_, i) => ({
          injectionDateUid: i + 1,
          administrationDate: scene.long ? "bad-date" : "2026-01-03",
        })),
      };
    if (kind === "inj")
      value = {
        injections: Array.from({ length: n }, (_, i) => ({
          injectionUid: i + 1,
          administrationDate: scene.long ? "bad-date" : "2026-01-03",
          administeredQuantity: scene.nullable ? null : parent,
          consumedQuantity: scene.nullable ? null : 0,
          unitCost: scene.nullable ? null : 1234.567,
          administeredCost: scene.nullable ? null : 0,
          consumedCost: scene.nullable ? null : -1234.567,
          isReductionApplied: scene.nullable ? null : false,
        })),
      };
    const result =
      mode === "error"
        ? {
            isFailure: true,
            isSuccess: false,
            error: "TECH " + kind + " ERROR",
            clientMessage: "CLIENT " + kind + " ERROR",
            value: null,
          }
        : {
            isFailure: false,
            isSuccess: true,
            error: "",
            clientMessage: "",
            value,
          };
    if (mode === "loading")
      held.push({ kind, parent, finish: () => reply(requestId, result) });
    else await reply(requestId, result);
  };
  await send("Fetch.enable", { patterns: [{ urlPattern: "*/api/*" }] });
  await send("Emulation.setDeviceMetricsOverride", {
    width: 1440,
    height: 1100,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await send("Page.navigate", { url: "http://127.0.0.1:5189/" });
  await pause(2000);
  await evaluate(`(async()=>{
 const mod=await import('/node_modules/.vite/deps/react.js'),React=mod.default||mod;
 const dom=await import('/node_modules/.vite/deps/react-dom_client.js'),createRoot=dom.createRoot||dom.default.createRoot;
 const {QueryClientProvider}=await import(performance.getEntriesByType('resource').find(e=>e.name.includes('/@tanstack_react-query.js?v=')).name);
 const {queryClient}=await import('/src/shared/api/client/queryClient.ts');queryClient.setDefaultOptions({queries:{retry:false}});
 const {default:Category}=await import('/src/modules/medView/widgets/workspace/ui/categories/components/oncology/MedViewOncologyRoot.tsx');
 const {useMedViewWorkspaceStore:store}=await import('/src/modules/medView/widgets/workspace/model/stores/useMedViewWorkspaceStore.tsx');
 const {useMedViewFiltersStore:filters}=await import('/src/modules/medView/widgets/filters/model/stores/useMedViewFiltersStore.tsx');
 const host=document.createElement('main');host.id='audit-host';host.style='padding:24px;background:white;box-sizing:border-box;width:100%';document.body.replaceChildren(host);document.body.style.margin='0';
 window.auditStore=store;window.auditFilters=filters;window.auditClient=queryClient;filters.getState().selectTargetDb('SMODB18');
 window.auditArea=title=>[...host.querySelectorAll('h2,h3')].find(e=>e.textContent===title)?.closest('section');
 window.auditServices=()=>[...host.querySelectorAll('[data-oncology-service]')];
 window.auditMeds=()=>[...host.querySelectorAll('[data-oncology-medication]')];
 window.auditInjections=()=>auditArea('Инъекции')??document.createElement('section');
 const root=createRoot(host);window.auditRender=show=>root.render(React.createElement(QueryClientProvider,{client:queryClient},show?React.createElement(Category):React.createElement('p',null,'Другая категория')));
 window.auditRender(true);
 })()`);
  const text = 'document.getElementById("audit-host").textContent';
  const load = async (config) => {
    scene = {
      count: 2,
      modes: {},
      long: false,
      nullable: false,
      caseVersion: 0,
      ...config,
    };
    await evaluate(
      "auditStore.getState().selectMedicalCase(" + ++caseUid + ")",
    );
    await pause(300);
  };
  const ready = async (n) => {
    await until("auditServices().length===" + n);
    if (n) await until(text + '.includes("ТЕСТ-ПРОТИВОПОКАЗАНИЕ-0")');
  };
  const chooseService = async (i = 0) => {
    await evaluate("auditServices()[" + i + "].click()");
    await pause(250);
  };
  const chooseMed = async (i = 0) => {
    await evaluate("auditMeds()[" + i + "].click()");
    await pause(250);
  };
  await until(text + '.includes("Выберите медицинский случай")');
  check("no HTTP before case selection", requests.length === 0);
  await load();
  await ready(2);
  check(
    "five initial requests and one oncology-case HTTP",
    requests.filter((r) => r.kind === "case" && r.parent === caseUid).length ===
      1 && requests.length === 5,
  );
  check(
    "no auto selection",
    await evaluate(
      "auditStore.getState().selectedOncologyServiceUid===null&&auditStore.getState().selectedMedicationUid===null",
    ),
  );
  await chooseService();
  await until("auditMeds().length===2");
  const sid = await evaluate(
    "auditStore.getState().selectedOncologyServiceUid",
  );
  check(
    "service selection starts medications only",
    requests.at(-1).kind === "med" && requests.at(-1).parent === sid,
  );
  await chooseMed();
  await until(
    'auditInjections().querySelector("tbody tr")?.cells[1].textContent===String(auditStore.getState().selectedMedicationUid)',
  );
  const mid = await evaluate("auditStore.getState().selectedMedicationUid");
  check(
    "medication selection starts two parallel endpoints",
    requests
      .filter((r) => r.parent === mid)
      .map((r) => r.kind)
      .sort()
      .join(",") === "dates,inj",
  );
  check(
    "actual financial format / bool mapping",
    await evaluate(
      'auditInjections().querySelector("tbody tr").cells[3].textContent.includes("1 234,57")&&auditInjections().querySelector("tbody tr").cells[4].textContent.includes("0,00")&&auditArea("Диагностика").textContent.includes("Положительный")',
    ),
  );
  await chooseService();
  check(
    "same service click resets medication",
    await evaluate(
      "auditStore.getState().selectedOncologyServiceUid===" +
        sid +
        "&&auditStore.getState().selectedMedicationUid===null",
    ),
  );
  await chooseMed();
  await until('auditInjections().querySelector("tbody tr")');
  const medAgain = await evaluate(
    "auditStore.getState().selectedMedicationUid",
  );
  await chooseMed();
  check(
    "same medication click preserves selection",
    await evaluate("auditStore.getState().selectedMedicationUid===" + medAgain),
  );
  await evaluate(
    'auditStore.getState().setTargetCategory("patient");auditRender(false)',
  );
  await pause();
  await evaluate(
    'auditStore.getState().setTargetCategory("oncology");auditRender(true)',
  );
  await until('auditInjections().querySelector("tbody tr")');
  check(
    "category return preserves both UIDs",
    await evaluate(
      "auditStore.getState().selectedOncologyServiceUid===" +
        sid +
        "&&auditStore.getState().selectedMedicationUid===" +
        mid,
    ),
  );
  for (const count of [0, 1, 2, 10, 40]) {
    await load({ count });
    await until("auditServices().length===" + count);
    if (count === 0) {
      await until(
        text +
          '.includes("Онкологический случай не содержит онкологических услуг")',
      );
      check(
        "empty initial child lists",
        await evaluate(
          text +
            '.includes("не содержит диагностический блок")&&' +
            text +
            '.includes("не содержит информации о противопоказаниях")',
        ),
      );
      continue;
    }
    await chooseService();
    await until("auditMeds().length===" + count);
    await chooseMed();
    await until(
      'auditInjections().querySelectorAll("tbody tr").length===' + count,
    );
    check(
      "all collections " + count,
      await evaluate(
        "auditServices().length===" +
          count +
          "&&auditMeds().length===" +
          count +
          '&&auditArea("Консилиумы").querySelectorAll("li").length>=' +
          count +
          '&&auditArea("Даты введения").querySelectorAll("li").length===' +
          count,
      ),
    );
    if (count === 40)
      console.log(
        "FULL40 HEIGHT " +
          (await evaluate(
            'document.getElementById("audit-host").scrollHeight',
          )),
      );
  }
  // Delayed medication replies arriving after switching services.
  await load({ modes: { med: "loading" } });
  await ready(2);
  await chooseService(0);
  const oldS = await evaluate(
    "auditStore.getState().selectedOncologyServiceUid",
  );
  check(
    "medication initial loading uses existing skeleton",
    await evaluate(
      'auditMeds().length===0&&auditArea("Препараты выбранной услуги").querySelectorAll(".MuiSkeleton-root").length===8&&!' +
        text +
        '.includes("не содержит информации о лекарственных препаратах")',
    ),
  );
  await chooseService(1);
  const newS = await evaluate(
    "auditStore.getState().selectedOncologyServiceUid",
  );
  const oldReply = held.find((x) => x.kind === "med" && x.parent === oldS),
    newReply = held.find((x) => x.kind === "med" && x.parent === newS);
  await oldReply.finish();
  held.splice(held.indexOf(oldReply), 1);
  await pause();
  check(
    "late old service reply not shown",
    await evaluate(
      "auditMeds().length===0&&auditStore.getState().selectedMedicationUid===null",
    ),
  );
  await newReply.finish();
  held.splice(held.indexOf(newReply), 1);
  await until("auditMeds().length===2");
  check(
    "new service medication data correct",
    await evaluate(
      'auditMeds()[0].textContent.includes("ТЕСТ-ПРЕПАРАТ-' +
        (newS * 100 + 1) +
        '")',
    ),
  );
  // Delayed terminal requests and fast medication switching.
  scene.modes = { dates: "loading", inj: "loading" };
  await chooseMed(0);
  const oldM = await evaluate("auditStore.getState().selectedMedicationUid");
  check(
    "date and injection initial skeletons",
    await evaluate(
      'auditArea("Даты введения").querySelectorAll("li").length===10&&auditArea("Даты введения").querySelectorAll(".MuiSkeleton-root").length===10&&auditInjections().querySelectorAll("tbody .MuiSkeleton-root").length===35',
    ),
  );
  await chooseMed(1);
  const newM = await evaluate("auditStore.getState().selectedMedicationUid");
  for (const h of held.filter((x) => x.parent === oldM)) {
    await h.finish();
    held.splice(held.indexOf(h), 1);
  }
  await pause();
  check(
    "late old medication data not displayed",
    await evaluate(
      'auditInjections().querySelectorAll("tbody .MuiSkeleton-root").length===35&&auditStore.getState().selectedMedicationUid===' +
        newM,
    ),
  );
  for (const h of held.splice(0)) await h.finish();
  await until(
    'auditInjections().querySelector("tbody tr")?.cells[1].textContent==="' +
      newM +
      '"',
  );
  check("new medication data displayed", true);

  // Refresh does not clear confirmed selections on fetching/error.
  for (const kind of ["services", "med", "case"]) {
    scene.modes = { [kind]: "loading" };
    const key =
      kind === "med"
        ? "medications"
        : kind === "case"
          ? "oncology-case"
          : "oncology-services";
    await evaluate(
      'void auditClient.invalidateQueries({queryKey:["r-control","' +
        key +
        '"]})',
    );
    await pause(250);
    check(
      "fetching " + kind + " preserves context",
      await evaluate(
        "auditStore.getState().selectedOncologyServiceUid===" +
          newS +
          "&&auditStore.getState().selectedMedicationUid===" +
          newM +
          '&&Boolean(auditInjections().querySelector("tbody tr"))',
      ),
    );
    scene.modes = {};
    for (const h of held.splice(0)) await h.finish();
    await pause(250);
    check(
      "successful refetch " + kind + " preserves selections",
      await evaluate("auditStore.getState().selectedMedicationUid===" + newM),
    );
    scene.modes = { [kind]: "error" };
    await evaluate(
      'auditClient.invalidateQueries({queryKey:["r-control","' + key + '"]})',
    );
    await pause(250);
    check(
      "refetch error " + kind + " preserves selections",
      await evaluate(
        "auditStore.getState().selectedOncologyServiceUid===" +
          newS +
          "&&auditStore.getState().selectedMedicationUid===" +
          newM,
      ),
    );
    scene.modes = {};
    await evaluate(
      'auditClient.invalidateQueries({queryKey:["r-control","' + key + '"]})',
    );
    await pause(250);
  }
  scene.modes = { services: "empty" };
  await evaluate(
    'auditClient.invalidateQueries({queryKey:["r-control","oncology-services"]})',
  );
  await until("auditStore.getState().selectedOncologyServiceUid===null");
  check(
    "removed service clears entire chain and descendants",
    await evaluate(
      'auditStore.getState().selectedMedicationUid===null&&auditMeds().length===0&&!auditInjections().querySelector("tbody tr")',
    ),
  );
  await load();
  await ready(2);
  await chooseService();
  await until("auditMeds().length===2");
  await chooseMed();
  await until('auditInjections().querySelector("tbody tr")');
  const retainedService = await evaluate(
    "auditStore.getState().selectedOncologyServiceUid",
  );
  scene.modes = { med: "empty" };
  await evaluate(
    'auditClient.invalidateQueries({queryKey:["r-control","medications"]})',
  );
  await until("auditStore.getState().selectedMedicationUid===null");
  check(
    "removed medication clears only medication and injections",
    await evaluate(
      "auditStore.getState().selectedOncologyServiceUid===" +
        retainedService +
        '&&!auditInjections().querySelector("tbody tr")',
    ),
  );
  scene.modes = {};
  await evaluate(
    'auditClient.invalidateQueries({queryKey:["r-control","medications"]})',
  );
  await until("auditMeds().length===2");
  await chooseMed();
  await until('auditInjections().querySelector("tbody tr")');
  scene.modes = { case: "empty" };
  await evaluate(
    'auditClient.invalidateQueries({queryKey:["r-control","oncology-case"]})',
  );
  await until("auditStore.getState().selectedOncologyServiceUid===null");
  check(
    "case null clears chain, displays empty, consultations independent",
    await evaluate(
      'auditStore.getState().selectedMedicationUid===null&&!auditInjections().querySelector("tbody tr")&&!' +
        text +
        '.includes("Получение онкологического случая")&&' +
        text +
        '.includes("Онкологический случай отсутствует")&&' +
        text +
        '.includes("ТЕСТ-КОНСИЛИУМ")',
    ),
  );

  // Empty replies belonging to a previous parent must not clear a newer selection.
  await load();
  await ready(2);
  await chooseService(0);
  await until("auditMeds().length===2");
  await chooseMed();
  const previousService = await evaluate(
    "auditStore.getState().selectedOncologyServiceUid",
  );
  scene.modes = { med: "loading" };
  scene.counts = { med: 0 };
  await evaluate(
    'void auditClient.invalidateQueries({queryKey:["r-control","medications",' +
      previousService +
      "]})",
  );
  await pause(200);
  scene.modes = {};
  scene.counts = {};
  await chooseService(1);
  await until("auditMeds().length===2");
  await chooseMed();
  const nextDrug = await evaluate(
    "auditStore.getState().selectedMedicationUid",
  );
  for (const h of held.splice(0)) await h.finish();
  await pause(250);
  check(
    "late empty medication reply cannot clear new selection",
    await evaluate(
      "auditStore.getState().selectedMedicationUid===" +
        nextDrug +
        '&&Boolean(auditInjections().querySelector("tbody tr"))',
    ),
  );
  scene.modes = { services: "loading" };
  scene.counts = { services: 0 };
  await evaluate(
    'void auditClient.invalidateQueries({queryKey:["r-control","oncology-services"]})',
  );
  await pause(200);
  await load();
  await ready(2);
  await chooseService();
  await until("auditMeds().length===2");
  await chooseMed();
  const nextCaseDrug = await evaluate(
    "auditStore.getState().selectedMedicationUid",
  );
  for (const h of held.splice(0)) await h.finish();
  await pause(250);
  check(
    "late old medical case response cannot clear current selection",
    await evaluate(
      "auditStore.getState().selectedMedicationUid===" +
        nextCaseDrug +
        '&&Boolean(auditInjections().querySelector("tbody tr"))',
    ),
  );

  // Removal from a nonempty collection is distinct from an empty response.
  await load();
  await ready(2);
  await chooseService(1);
  await until("auditMeds().length===2");
  await chooseMed(1);
  scene.counts = { services: 1 };
  await evaluate(
    'auditClient.invalidateQueries({queryKey:["r-control","oncology-services"]})',
  );
  await until("auditStore.getState().selectedOncologyServiceUid===null");
  check(
    "removed service in nonempty collection clears chain without auto selection",
    await evaluate(
      "auditServices().length===1&&auditStore.getState().selectedMedicationUid===null&&auditMeds().length===0",
    ),
  );
  scene.counts = {};
  await chooseService();
  await until("auditMeds().length===2");
  await chooseMed(1);
  scene.counts = { med: 1 };
  await evaluate(
    'auditClient.invalidateQueries({queryKey:["r-control","medications"]})',
  );
  await until("auditStore.getState().selectedMedicationUid===null");
  check(
    "removed medication in nonempty list has no automatic replacement",
    await evaluate(
      'auditMeds().length===1&&!auditInjections().querySelector("tbody tr")&&auditStore.getState().selectedOncologyServiceUid!==null',
    ),
  );
  // Each initial area can fail independently.
  for (const kind of ["case", "consult", "diag", "contra", "services"]) {
    await load({ modes: { [kind]: "error" } });
    await until(
      text +
        '.includes("' +
        (kind === "consult" ? "TECH" : "CLIENT") +
        " " +
        kind +
        ' ERROR")',
    );
    check(
      "error " + kind + " rendered without whole category failure",
      await evaluate(
        'Boolean(document.getElementById("audit-host").querySelector("[class*=oncologyRoot_]"))',
      ),
    );
  }
  await load({ modes: { med: "error" } });
  await ready(2);
  await chooseService();
  await until(text + '.includes("CLIENT med ERROR")');
  check(
    "med error preserves services",
    await evaluate("auditServices().length===2"),
  );
  for (const kind of ["dates", "inj"]) {
    await load({ modes: { [kind]: "error" } });
    await ready(2);
    await chooseService();
    await until("auditMeds().length===2");
    await chooseMed();
    await until(text + '.includes("CLIENT ' + kind + ' ERROR")');
    check(
      "terminal error " + kind + " preserves sibling",
      await evaluate(
        kind === "dates"
          ? 'auditInjections().querySelectorAll("tbody tr").length===2'
          : 'auditArea("Даты введения").querySelectorAll("li").length===2',
      ),
    );
  }
  await load({ modes: { med: "empty" } });
  await ready(2);
  await chooseService();
  await until(
    text +
      '.includes("Онкологический случай не содержит информации о лекарственных препаратах")',
  );
  check("med empty state", true);
  for (const kind of ["dates", "inj"]) {
    await load({ modes: { [kind]: "empty" } });
    await ready(2);
    await chooseService();
    await until("auditMeds().length===2");
    await chooseMed();
    await until(
      text +
        '.includes("' +
        (kind === "dates"
          ? "Лекарственный препарат не содержит сведений о датах введения"
          : "Лекарственный препарат не содержит информации о инъекциях") +
        '")',
    );
    check("empty terminal " + kind + " independent", true);
  }
  await load({ nullable: true });
  await ready(2);
  await chooseService();
  await until("auditMeds().length===2");
  await chooseMed();
  await until(
    'auditInjections().querySelector("tbody tr")?.cells[1].textContent==="—"',
  );
  check(
    "null fields render and zero separate",
    await evaluate(
      'auditInjections().querySelector("tbody tr").cells[6].textContent==="-"&&auditArea("Онкологический случай").textContent.includes("—")',
    ),
  );
  await load({ long: true });
  await until("auditServices().length===2");
  await chooseService();
  await until("auditMeds().length===2");
  await chooseMed();
  await until('auditInjections().querySelectorAll("tbody tr").length===2');

  check(
    "selector button semantics and selected state",
    await evaluate(
      '[...document.querySelectorAll("article[role=button]")].every(e=>e.tabIndex===0&&e.getAttribute("role")==="button"&&e.hasAttribute("aria-pressed"))',
    ),
  );
  check(
    "invalid dates replaced by dash",
    await evaluate(
      "!" +
        text +
        '.includes("Invalid Date")&&auditInjections().querySelector("tbody tr").cells[0].textContent==="—"',
    ),
  );
  await evaluate("auditServices()[0].focus()");
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
  check(
    "Enter on same service resets medication",
    await evaluate("auditStore.getState().selectedMedicationUid===null"),
  );
  await evaluate("auditMeds()[1].focus()");
  await send("Input.dispatchKeyEvent", {
    type: "keyDown",
    key: " ",
    code: "Space",
    windowsVirtualKeyCode: 32,
  });
  await send("Input.dispatchKeyEvent", {
    type: "keyUp",
    key: " ",
    code: "Space",
    windowsVirtualKeyCode: 32,
  });
  await pause();
  check(
    "Space selects medication with visible focus",
    await evaluate(
      'auditMeds()[1].getAttribute("aria-pressed")==="true"&&getComputedStyle(auditMeds()[1]).outlineStyle==="solid"&&parseFloat(getComputedStyle(auditMeds()[1]).outlineWidth)===2',
    ),
  );
  const dates = await evaluate(
    '(async()=>{const {formatOncologyDate:f}=await import("/src/modules/medView/widgets/workspace/ui/categories/components/oncology/formatOncologyDate.ts");return [null,undefined,""," ","bad","2026-02-30","2026-13-01","2026-01-01T25:00:00Z","2026-01-03T23:30:00-12:00","2026-01-03T00:30:00+14:00","2024-02-29"].map(f)})()',
  );
  check(
    "strict dates and original calendar day",
    JSON.stringify(dates) ===
      JSON.stringify([
        "—",
        "—",
        "—",
        "—",
        "—",
        "—",
        "—",
        "—",
        "03.01.2026",
        "03.01.2026",
        "29.02.2024",
      ]),
  );
  for (const width of [360, 768, 1440, 1920]) {
    await send("Emulation.setDeviceMetricsOverride", {
      width,
      height: 1100,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await pause();
    console.log(
      "LAYOUT " +
        width +
        " " +
        (await evaluate(
          'JSON.stringify({width:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth,height:document.getElementById("audit-host").scrollHeight,serviceColumns:getComputedStyle(document.querySelector("[class*=pairedPanels_]")).gridTemplateColumns,medicationColumns:getComputedStyle(document.querySelector("[class*=pairedPanels_]")).gridTemplateColumns})',
        )),
    );
  }
  for (const width of [320, 600, 1000]) {
    await evaluate(
      'document.getElementById("audit-host").style.width="' + width + 'px"',
    );
    await pause();
    console.log(
      "CONTAINER " +
        width +
        " " +
        (await evaluate(
          'JSON.stringify({width:document.getElementById("audit-host").clientWidth,scroll:document.getElementById("audit-host").scrollWidth})',
        )),
    );
  }
  await evaluate('document.getElementById("audit-host").style.width="100%"');
  check(
    "hidden fields not rendered",
    await evaluate(
      "!" +
        text +
        '.includes("HIDDEN-ICD")&&!' +
        text +
        '.includes("HIDDEN-CYCLE")&&!' +
        text +
        '.includes("HIDDEN-EXTENDED")',
    ),
  );
  await load();
  await ready(2);
  check(
    "medical case switch resets children",
    await evaluate(
      "auditStore.getState().selectedOncologyServiceUid===null&&auditStore.getState().selectedMedicationUid===null",
    ),
  );
  await chooseService();
  await until("auditMeds().length===2");
  await chooseMed();
  await until('auditInjections().querySelector("tbody tr")');
  await evaluate(
    'auditStore.getState().resetWorkspace();auditFilters.getState().selectTargetDb("INOGOROD18")',
  );
  await until(text + '.includes("Выберите медицинский случай")');
  check(
    "source handler sequence resets entire selection",
    await evaluate(
      "auditStore.getState().selectedMedicalCaseUid===null&&auditStore.getState().selectedOncologyServiceUid===null&&auditStore.getState().selectedMedicationUid===null",
    ),
  );
  await load();
  await ready(2);
  check(
    "new source sent to API",
    requests.some((r) => r.db === "INOGOROD18" && r.parent === caseUid),
  );
  // The offline route shares the production composition and presentation components.
  await send("Fetch.disable");
  await send("Emulation.setDeviceMetricsOverride", {
    width: 1440,
    height: 1100,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await send("Page.navigate", {
    url: "http://127.0.0.1:5189/med-view?demoOncology=1",
  });
  await until('document.getElementById("medview-case-tab-oncology")');
  await evaluate(
    'document.getElementById("medview-case-tab-oncology").click()',
  );
  const panel = 'document.getElementById("medview-case-panel")';
  await until(panel + '.textContent.includes("Демонстрационная онкология")');
  const change = async (i, value) => {
    await evaluate(
      "(()=>{const e=" +
        panel +
        '.querySelectorAll("select")[' +
        i +
        "];e.value=" +
        JSON.stringify(value) +
        ';e.dispatchEvent(new Event("change",{bubbles:true}));})()',
    );
    await pause();
  };
  const services = panel + '.querySelectorAll("[data-oncology-service]")';
  const medications = panel + '.querySelectorAll("[data-oncology-medication]")';
  for (const count of [0, 1, 2, 10, 40]) {
    await change(1, String(count));
    check(
      "preview collection " + count,
      await evaluate(services + ".length===" + count),
    );
    if (!count) {
      check(
        "zero collection empty state",
        await evaluate(panel + '.textContent.includes("Данных не найдено")'),
      );
      continue;
    }
    await evaluate(services + "[0].click()");
    await until(medications + ".length===" + count);
    await evaluate(medications + "[0].click()");
    await pause();
    check(
      "preview selection context " + count,
      await evaluate(
        panel +
          '.querySelector("dl[aria-label]").textContent.includes("0000-ТЕСТ-1-1")',
      ),
    );
    const metrics = await evaluate(
      "(()=>{const a=" +
        services +
        "[0].parentElement,b=" +
        medications +
        "[0].parentElement;return {a:a.scrollHeight>a.clientHeight,b:b.scrollHeight>b.clientHeight,max:getComputedStyle(a).maxHeight};})()",
    );
    check(
      "natural short / bounded long lists " + count,
      count <= 3
        ? metrics.max === "none" && !metrics.a && !metrics.b
        : metrics.a && metrics.b,
    );
    check(
      "injection table seven columns and numeric alignment",
      await evaluate(
        "(()=>{const t=" +
          panel +
          '.querySelector("table[aria-label=Инъекции]");return t.tHead.rows[0].cells.length===7&&t.tBodies[0].rows.length===' +
          count +
          '&&getComputedStyle(t.tBodies[0].rows[0].cells[3]).textAlign==="right"&&getComputedStyle(t.tBodies[0].rows[0].cells[3]).fontVariantNumeric.includes("tabular-nums")&&getComputedStyle(t.tHead.rows[0].cells[1]).whiteSpace==="normal"&&getComputedStyle(t.tBodies[0].rows[0].cells[0]).whiteSpace==="nowrap";})()',
      ),
    );
    if (count === 40) {
      await evaluate(medications + "[39].focus()");
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
      check(
        "last record keyboard choice scrolls into view",
        await evaluate(
          medications +
            '[39].getAttribute("aria-pressed")==="true"&&' +
            medications +
            "[39].parentElement.scrollTop>0",
        ),
      );
    }
  }
  await change(1, "2");
  for (const dataset of ["full", "long"]) {
    await change(0, dataset);
    await evaluate(services + "[0].click()");
    await pause();
    await evaluate(medications + "[0].click()");
    await pause();
    for (const width of [320, 360, 600, 768, 1000, 1440, 1920]) {
      await send("Emulation.setDeviceMetricsOverride", {
        width,
        height: 1100,
        deviceScaleFactor: 1,
        mobile: false,
      });
      await pause();
      const m = await evaluate(
        "(()=>{const root=" +
          panel +
          '.querySelector("[class*=oncologyRoot_]"),rows=[...root.querySelectorAll("[class*=pairedPanels_]")],v=root.querySelector("table[aria-label=Инъекции]").parentElement;return {page:document.documentElement.scrollWidth,available:document.documentElement.clientWidth,root:root.clientWidth,columns:getComputedStyle(rows[0]).gridTemplateColumns.split(" ").length,tableScroll:v.scrollWidth>v.clientWidth,top:getComputedStyle(rows[0]).alignItems};})()',
      );
      check(dataset + " no page overflow " + width, m.page <= m.available);
      check(
        dataset + " container-driven column count " + width,
        m.columns === (m.root >= 896 ? 2 : 1) && m.top === "start",
      );
      if (width < 1000)
        check(dataset + " local table scroll " + width, m.tableScroll);
    }
  }
  await send("Emulation.setDeviceMetricsOverride", {
    width: 1920,
    height: 1100,
    deviceScaleFactor: 1,
    mobile: false,
  });
  for (const width of [320, 600, 1000]) {
    await evaluate(panel + '.style.width="' + width + 'px"');
    await pause();
    check(
      "independent container " + width,
      await evaluate(
        "(()=>{const p=" +
          panel +
          ',g=p.querySelector("[class*=pairedPanels_]");return p.scrollWidth<=p.clientWidth&&getComputedStyle(g).gridTemplateColumns.split(" ").length===' +
          (width >= 896 ? 2 : 1) +
          ";})()",
      ),
    );
  }
  await evaluate(panel + '.style.width=""');
  await change(0, "full");
  await change(2, "empty");
  check(
    "preview null parent consultations independent",
    await evaluate(
      panel +
        '.textContent.includes("Тестовый консилиум")&&!' +
        panel +
        '.querySelector("[data-oncology-service]")&&!' +
        panel +
        '.querySelector("dl[aria-label]")',
    ),
  );
  await change(2, "ready");
  await evaluate(services + "[0].click()");
  await pause();
  await change(7, "loading");
  check(
    "preview medication skeleton",
    await evaluate(
      panel +
        '.querySelectorAll("[class*=selectionList_] .MuiSkeleton-root").length===8',
    ),
  );
  await change(7, "ready");
  await evaluate(medications + "[0].click()");
  await pause();
  await change(8, "loading");
  check(
    "preview date skeleton",
    await evaluate(
      panel +
        '.querySelectorAll("[class*=dates_] .MuiSkeleton-root").length===10',
    ),
  );
  await change(8, "ready");
  await change(0, "invalid-dates");
  check(
    "preview invalid dates safe",
    await evaluate("!" + panel + '.textContent.includes("Invalid Date")'),
  );
  await change(0, "full");
  if (process.env.MEDVIEW_SCREENSHOTS_DIR) {
    const { mkdir, writeFile } = await import("node:fs/promises");
    await mkdir(process.env.MEDVIEW_SCREENSHOTS_DIR, { recursive: true });
    for (const width of [1440, 360]) {
      await send("Emulation.setDeviceMetricsOverride", {
        width,
        height: 1100,
        deviceScaleFactor: 1,
        mobile: false,
      });
      await pause();
      for (const [name, selector] of [
        ["top", "[class*=oncologyRoot_]"],
        ["treatment", "[class*=treatment_]"],
      ]) {
        const clip = await evaluate(
          "(()=>{const r=" +
            panel +
            ".querySelector(" +
            JSON.stringify(selector) +
            ").getBoundingClientRect();return {x:r.x+scrollX,y:r.y+scrollY,width:r.width,height:Math.min(r.height,1100),scale:1};})()",
        );
        const shot = await send("Page.captureScreenshot", {
          format: "png",
          captureBeyondViewport: true,
          clip,
        });
        await writeFile(
          join(
            process.env.MEDVIEW_SCREENSHOTS_DIR,
            "oncology-" + width + "-" + name + ".png",
          ),
          Buffer.from(shot.data, "base64"),
        );
      }
    }
  }

  console.log("ONCOLOGY REGRESSION CHECKS COMPLETE");
} finally {
  ws?.close();
  chrome.kill();
  await server.close();
}
