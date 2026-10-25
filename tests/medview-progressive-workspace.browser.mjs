// Run from the repository root: node tests/medview-progressive-workspace.browser.mjs
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
  const check = (name, ok) => {
    if (!ok) throw Error(name);
    console.log("PASS " + name);
  };
  const until = async (expr) => {
    for (let i = 0; i < 150; i++) {
      if (await evaluate("Boolean(" + expr + ")")) return;
      await pause(100);
    }
    throw Error("Timeout " + expr);
  };
  let resultMode = "ready",
    medicalMode = "ready",
    resultCount = 2,
    medicalCount = 2;
  const held = [],
    requests = [];
  const completed = () =>
    Array.from({ length: resultCount }, (_, i) => ({
      completedCaseUid: i + 1,
      entryNumber: 1001 + i,
      entryPositionNumber: i + 1,
      patientLastName: "ТЕСТ-ПАЦИЕНТ-" + (i + 1),
      patientFirstName: "Тест",
      patientMiddleName: "",
      medicalCareConditions: 1,
      insurancePolicySeries: null,
      insurancePolicyNumber: "0000000000000000",
      amountBilled: 12345.67,
      approvedAmount: null,
      insuranceCompanyApprovedAmount: null,
    }));
  const medical = (parent) =>
    Array.from({ length: medicalCount }, (_, i) => ({
      medicalCaseUid: parent * 100 + i + 1,
      medicalProfile: null,
      isPediatric: false,
      physicianSpecialty: 0,
      treatmentStartDate: "2026-01-01",
      treatmentEndDate: "2026-01-03",
      primaryDiagnosis: "ТЕСТ-МЕД-" + (parent * 100 + i + 1),
      paidUnits: 1,
      unitRate: null,
      amountBilled: 12345.67,
      approvedAmount: null,
      insuranceCompanyApprovedAmount: null,
    }));
  const reply = (requestId, result) =>
    send("Fetch.fulfillRequest", {
      requestId,
      responseCode: 200,
      responseHeaders: [
        { name: "Content-Type", value: "application/json;charset=utf-8" },
      ],
      body: Buffer.from(JSON.stringify(result)).toString("base64"),
    });
  onRequest = async ({ requestId, request }) => {
    const url = new URL(request.url);
    if (!url.pathname.startsWith("/api/")) {
      await send("Fetch.continueRequest", { requestId });
      return;
    }
    const resultRequest = url.pathname.endsWith("/med-view/completed-cases"),
      medRequest = /\/completed-cases\/\d+\/medical-cases$/.test(url.pathname);
    const kind = resultRequest ? "results" : medRequest ? "medical" : "other",
      parent = medRequest ? Number(url.pathname.split("/").at(-2)) : null;
    requests.push({
      kind,
      parent,
      body: request.postData,
      db: url.searchParams.get("targetDb"),
    });
    const mode = resultRequest
      ? resultMode
      : medRequest
        ? medicalMode
        : "error";
    const value = resultRequest
      ? {
          completedCases: mode === "empty" ? [] : completed(),
          totalCount: mode === "empty" ? 0 : resultCount,
        }
      : medRequest
        ? { medicalCases: mode === "empty" ? [] : medical(parent) }
        : null;
    const result =
      mode === "error"
        ? {
            isSuccess: false,
            isFailure: true,
            error: kind === "other" ? "ТЕСТ-КАТЕГОРИЯ" : "ТЕСТ-ОШИБКА-" + kind,
            clientMessage:
              kind === "other" ? "ТЕСТ-КАТЕГОРИЯ" : "ТЕСТ-ОШИБКА-" + kind,
            value: null,
          }
        : {
            isSuccess: true,
            isFailure: false,
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
    height: 1200,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await send("Page.navigate", {
    url: "http://127.0.0.1:5189/med-view",
  });
  await until('document.body.textContent.includes("Начните с поиска")');
  await evaluate(`(async()=>{
  const {useMedViewWorkspaceStore:store}=await import('/src/modules/medView/widgets/workspace/model/stores/useMedViewWorkspaceStore.tsx');
  const {useMedViewFiltersStore:filters}=await import('/src/modules/medView/widgets/filters/model/stores/useMedViewFiltersStore.tsx');
  const {queryClient}=await import('/src/shared/api/client/queryClient.ts');queryClient.setDefaultOptions({queries:{retry:false}});
  window.wsStore=store;window.wsFilters=filters;window.wsClient=queryClient;
  window.wsArea=()=>document.querySelector('section[aria-label="Рабочее пространство MedView"]');
  window.wsRows=()=>[...wsArea().querySelectorAll('table tbody tr.mt-table__row--interactive')];
  window.wsCards=()=>wsArea().querySelector('section[aria-label="Медицинские случаи"]');
  window.wsDetails=()=>document.getElementById('medview-case-heading');
 })()`);
  const screenshot = async (name) => {
    if (!process.env.MEDVIEW_SCREENSHOTS_DIR) return;
    const { mkdir, writeFile } = await import("node:fs/promises");
    await mkdir(process.env.MEDVIEW_SCREENSHOTS_DIR, { recursive: true });
    const clip = await evaluate(
      "(()=>{const r=wsArea().getBoundingClientRect();return {x:r.x+scrollX,y:r.y+scrollY,width:r.width,height:Math.min(r.height,1400),scale:1};})()",
    );
    const shot = await send("Page.captureScreenshot", {
      format: "png",
      captureBeyondViewport: true,
      clip,
    });
    await writeFile(
      join(process.env.MEDVIEW_SCREENSHOTS_DIR, name + ".png"),
      Buffer.from(shot.data, "base64"),
    );
  };
  const apply = async (value) => {
    await evaluate(
      '(()=>{const i=document.querySelector("input[placeholder=Иванов]");Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,"value").set.call(i,' +
        JSON.stringify(value) +
        ');i.dispatchEvent(new Event("input",{bubbles:true}));})()',
    );
    await pause();
    await evaluate(
      '[...document.querySelectorAll("button")].find(e=>e.textContent.trim()==="Применить фильтры").click()',
    );
    await pause();
  };
  check(
    "initial only compact search prompt",
    await evaluate(
      '!wsArea().querySelector("table")&&!wsCards()&&!wsDetails()&&!wsArea().textContent.includes("Выберите медицинский случай")',
    ),
  );
  await screenshot("01-before-search");
  await evaluate('document.querySelector("button[value=SMODB18]").click()');
  await pause();
  resultMode = "loading";
  await apply("Пустой");
  await until('wsArea().querySelectorAll(".MuiSkeleton-root").length>0');
  check(
    "search loading hides dependent levels",
    await evaluate("!wsCards()&&!wsDetails()"),
  );
  // Complete the initial request, then run a different filtered search with an empty result.
  resultMode = "empty";
  for (const h of held.splice(0)) await h.finish();
  await until("wsRows().length===2");
  await apply("Нет результатов");
  await until(
    'wsArea().textContent.includes("Нет данных по текущим фильтрам")',
  );
  check(
    "successful empty is distinct from no selection",
    await evaluate(
      '!wsCards()&&!wsDetails()&&!wsArea().textContent.includes("Выберите")',
    ),
  );
  resultMode = "ready";
  await apply("Есть результаты");
  await until("wsRows().length===2");
  check(
    "results shown without empty dependent panels",
    await evaluate("!wsCards()&&!wsDetails()"),
  );
  await screenshot("02-after-search");
  medicalMode = "loading";
  await evaluate("wsRows()[0].click()");
  await pause();
  check(
    "completed selection reveals medical loading only",
    await evaluate(
      'wsArea().querySelectorAll(".MuiSkeleton-root").length>0&&!wsDetails()&&wsRows().length===2',
    ),
  );
  await screenshot("03-completed-case-selected");
  medicalMode = "ready";
  await evaluate("wsRows()[1].click()");
  await until("wsCards()&&wsDetails()");
  check(
    "auto first medical choice preserved and seven tabs revealed",
    await evaluate(
      'wsStore.getState().selectedMedicalCaseUid===201&&document.querySelectorAll("[role=tab]").length===7&&wsRows().length===2',
    ),
  );
  await until(
    'document.getElementById("medview-case-panel")?.textContent.includes("Выберите раздел")',
  );
  await screenshot("04-medical-case-selected");
  for (const h of held.splice(0)) await h.finish();
  await pause();
  check(
    "late old parent data not displayed",
    await evaluate(
      'wsStore.getState().selectedMedicalCaseUid===201&&!wsCards().textContent.includes("ТЕСТ-МЕД-101")',
    ),
  );
  await evaluate('wsCards().querySelectorAll("button")[1].click()');
  await pause();
  check(
    "medical switching preserves preceding levels",
    await evaluate(
      "wsStore.getState().selectedMedicalCaseUid===202&&Boolean(wsDetails())&&wsRows().length===2",
    ),
  );
  // Refresh retains current selections and visible descendants.
  for (const kind of ["results", "medical"]) {
    if (kind === "results") resultMode = "loading";
    else medicalMode = "loading";
    await evaluate(
      "void wsClient.invalidateQueries({queryKey:" +
        JSON.stringify(
          kind === "results"
            ? ["med-view", "completed-cases"]
            : ["r-control", "medical-cases"],
        ) +
        "})",
    );
    await pause(250);
    check(
      "refetch " + kind + " keeps choice and details",
      await evaluate(
        "wsStore.getState().selectedMedicalCaseUid===202&&Boolean(wsCards())&&Boolean(wsDetails())",
      ),
    );
    for (const h of held.splice(0)) await h.finish();
    resultMode = "ready";
    medicalMode = "ready";
    await pause();
  }
  // A newly successful empty medical collection hides only the details.
  medicalMode = "empty";
  await evaluate(
    'wsClient.invalidateQueries({queryKey:["r-control","medical-cases"]})',
  );
  await until('wsArea().textContent.includes("Медицинские случаи не найдены")');
  check(
    "empty medical area keeps results and hides details",
    await evaluate("wsRows().length===2&&!wsDetails()&&!wsCards()"),
  );
  medicalMode = "ready";
  await evaluate(
    'wsClient.invalidateQueries({queryKey:["r-control","medical-cases"]})',
  );
  await until("wsDetails()");
  // Background failure does not discard confirmed cached membership.
  medicalMode = "error";
  await evaluate(
    'wsClient.invalidateQueries({queryKey:["r-control","medical-cases"]})',
  );
  await until('wsArea().textContent.includes("ТЕСТ-ОШИБКА-medical")');
  check(
    "refetch medical error retains choice and details",
    await evaluate(
      "wsStore.getState().selectedMedicalCaseUid===202&&Boolean(wsDetails())",
    ),
  );
  medicalMode = "ready";
  await evaluate(
    'wsClient.invalidateQueries({queryKey:["r-control","medical-cases"]})',
  );
  await until("wsCards()");
  await evaluate("wsStore.getState().resetWorkspace()");
  await pause();
  await evaluate(
    'wsClient.removeQueries({queryKey:["r-control","medical-cases"]})',
  );
  medicalMode = "error";
  await evaluate("wsRows()[0].click()");
  await until('wsArea().textContent.includes("ТЕСТ-ОШИБКА-medical")');
  check(
    "initial medical error has no false detail prompt",
    await evaluate("wsRows().length===2&&!wsDetails()"),
  );
  // New search resets the complete chain through the existing Apply handler.
  resultMode = "error";
  await apply("Ошибка поиска");
  await until('wsArea().textContent.includes("ТЕСТ-ОШИБКА-results")');
  check(
    "search error visible without descendants",
    await evaluate(
      "!wsCards()&&!wsDetails()&&wsStore.getState().selectedCompletedCaseUid===null&&wsStore.getState().selectedMedicalCaseUid===null",
    ),
  );
  resultMode = "ready";
  medicalMode = "ready";
  await apply("Повторный поиск");
  await until("wsRows().length===2");
  check(
    "new successful search does not restore old selection",
    await evaluate("!wsCards()&&!wsDetails()"),
  );
  await evaluate("wsRows()[0].click()");
  await until("wsCards()&&wsDetails()");
  await evaluate('document.getElementById("medview-case-tab-patient").click()');
  await until(
    'document.getElementById("medview-case-panel").textContent.includes("ТЕСТ-КАТЕГОРИЯ")',
  );
  check(
    "category error remains inside visible details",
    await evaluate(
      "wsRows().length===2&&Boolean(wsCards())&&Boolean(wsDetails())",
    ),
  );
  await evaluate('wsStore.getState().setTargetCategory("default")');
  await pause();
  const beforeNavigation = await send("Page.getNavigationHistory");
  const priorEntry = beforeNavigation.entries[beforeNavigation.currentIndex].id;
  check(
    "home navigation available",
    await evaluate(
      'Boolean([...document.querySelectorAll("a")].find(e=>e.getAttribute("href")==="/"))',
    ),
  );
  await evaluate(
    '[...document.querySelectorAll("a")].find(e=>e.getAttribute("href")==="/").click()',
  );
  await until('location.pathname==="/"');
  await send("Page.navigateToHistoryEntry", { entryId: priorEntry });
  await until(
    'location.pathname==="/med-view"&&Boolean(document.getElementById("medview-case-heading"))',
  );
  check(
    "SPA return restores current selection",
    await evaluate(
      "wsStore.getState().selectedMedicalCaseUid===101&&Boolean(wsCards())&&wsRows().length===2",
    ),
  );
  resultMode = "loading";
  await evaluate('document.querySelector("button[value=INOGOROD18]").click()');
  await pause();
  check(
    "source change clears selection but preserves applied search",
    await evaluate(
      'wsFilters.getState().targetDb==="INOGOROD18"&&wsFilters.getState().appliedFilters!==null&&wsStore.getState().selectedCompletedCaseUid===null&&wsStore.getState().selectedMedicalCaseUid===null&&!wsDetails()&&!wsCards()',
    ),
  );
  for (const h of held.splice(0)) await h.finish();
  resultMode = "ready";
  await until("wsRows().length===2");
  check(
    "new source reaches existing completed API contract",
    requests.some(
      (r) =>
        r.kind === "results" && JSON.parse(r.body).targetDb === "INOGOROD18",
    ),
  );
  await evaluate("wsRows()[0].click()");
  await until("wsCards()&&wsDetails()");
  for (const width of [320, 360, 600, 768, 1000, 1440, 1920]) {
    await send("Emulation.setDeviceMetricsOverride", {
      width,
      height: 1200,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await pause();
    check(
      "workspace no horizontal overflow " + width,
      await evaluate(
        "document.documentElement.scrollWidth<=document.documentElement.clientWidth",
      ),
    );
  }
  await send("Emulation.setDeviceMetricsOverride", {
    width: 1920,
    height: 1200,
    deviceScaleFactor: 1,
    mobile: false,
  });
  for (const width of [320, 600, 1000]) {
    await evaluate('wsArea().style.width="' + width + 'px"');
    await pause();
    check(
      "workspace constrained container " + width,
      await evaluate("wsArea().scrollWidth<=wsArea().clientWidth"),
    );
  }
  await evaluate('wsArea().style.width=""');
  // Real page reload resets the in-memory stores; only SPA return preserves them.
  await send("Page.navigate", {
    url: "http://127.0.0.1:5189/med-view?demoWorkspace=1",
  });
  await until(
    'document.body.textContent.includes("Демонстрационный стенд")&&document.body.textContent.includes("Начните с поиска")',
  );
  const invoiceBefore = requests.filter((r) => r.kind !== "other").length;
  await evaluate('document.querySelector("button[value=SMODB18]").click()');
  await pause();
  await apply("Демо");
  await until(
    'document.querySelectorAll("table tbody tr.mt-table__row--interactive").length===2',
  );
  await evaluate(
    'document.querySelector("table tbody tr.mt-table__row--interactive").click()',
  );
  await until('document.getElementById("medview-case-heading")');
  for (const id of [
    "patient",
    "case-details",
    "oncology",
    "prescriptions",
    "clinical-groups",
    "provided-services",
    "defects",
  ]) {
    await evaluate(
      'document.getElementById("medview-case-tab-' + id + '").click()',
    );
    await until(
      'document.getElementById("medview-case-panel").textContent.includes("Демонстраци")||document.getElementById("medview-case-panel").textContent.includes("Демонстрацион")',
    );
    check(
      "offline category " + id,
      await evaluate(
        '!document.getElementById("medview-case-panel").textContent.includes("ТЕСТ-КАТЕГОРИЯ")',
      ),
    );
  }
  check(
    "offline route never requests invoice results or cases",
    requests.filter((r) => r.kind !== "other").length === invoiceBefore,
  );

  await evaluate(
    `(async()=>{const {useMedViewWorkspaceStore}=await import('/src/modules/medView/widgets/workspace/model/stores/useMedViewWorkspaceStore.tsx');const {useMedViewFiltersStore}=await import('/src/modules/medView/widgets/filters/model/stores/useMedViewFiltersStore.tsx');window.demoStore=useMedViewWorkspaceStore;window.demoFilters=useMedViewFiltersStore;})()`,
  );
  await evaluate(
    '[...document.querySelectorAll("a")].find(e=>e.getAttribute("href")==="/").click()',
  );
  await until(
    'location.pathname==="/"&&demoStore.getState().selectedCompletedCaseUid===null',
  );
  check(
    "leaving offline sandbox restores real stores",
    await evaluate(
      "demoStore.getState().selectedMedicalCaseUid===null&&demoFilters.getState().appliedFilters===null&&demoFilters.getState().targetDb===null",
    ),
  );
  const standaloneDemos = [
    ["demoPatient", "patient"],
    ["demoCaseDetails", "case-details"],
    ["demoOncology", "oncology"],
    ["demoPrescriptions", "prescriptions"],
    ["demoClinicalGroups", "clinical-groups"],
    ["demoProvidedServices", "provided-services"],
    ["demoDefects", "defects"],
  ];
  for (const [flag, id] of standaloneDemos) {
    await send("Page.navigate", {
      url: "http://127.0.0.1:5189/med-view?" + flag + "=1",
    });
    await until('document.getElementById("medview-case-tab-' + id + '")');
    await evaluate(
      'document.getElementById("medview-case-tab-' + id + '").click()',
    );
    await until(
      'document.getElementById("medview-case-panel").textContent.includes("Демонстраци")||document.getElementById("medview-case-panel").textContent.includes("Демонстрацион")',
    );
    check(
      "standalone category fixture " + id,
      await evaluate('!document.body.textContent.includes("ТЕСТ-КАТЕГОРИЯ")'),
    );
  }
  await send("Page.navigate", {
    url: "http://127.0.0.1:5189/med-view?demoTable=1",
  });
  await until('document.querySelectorAll("table tbody tr").length===10');
  check("standalone completed table fixture", true);
  await send("Page.navigate", {
    url: "http://127.0.0.1:5189/med-view?demoCases=1",
  });
  await until(
    '[...document.querySelectorAll("section[aria-label]")].find(e=>e.getAttribute("aria-label")==="Медицинские случаи")',
  );
  check("standalone medical cards fixture", true);

  console.log("PROGRESSIVE WORKSPACE CHECKS COMPLETE");
} finally {
  ws?.close();
  chrome.kill();
  await server.close();
}
