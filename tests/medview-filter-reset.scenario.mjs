// Run with node tests/medview-progressive-workspace.browser.mjs --filters-only.
export const runFilterResetScenario = async ({
  send,
  evaluate,
  until,
  pause,
  check,
  reply,
  intercept,
}) => {
  const requests = [];
  const longPolicyLabel = "Тестовый полис с длинным названием для проверки переноса на узком экране";
  const policyOptions = [
    { value: "1", label: "Тестовый полис" },
    { value: "2", label: longPolicyLabel },
  ];
  const resultBodies = () => requests.filter(({ path }) =>
    path.endsWith("/medical-register/completed-cases")
  ).map(({ body }) => body);

  intercept(async ({ requestId, request }) => {
    const url = new URL(request.url);
    if (!url.pathname.startsWith("/api/")) {
      await send("Fetch.continueRequest", { requestId });
      return;
    }
    const path = decodeURIComponent(url.pathname);
    const search = url.searchParams.get("searchString");
    const body = request.postData ? JSON.parse(request.postData) : null;
    requests.push({ path, search, body });
    if (path.endsWith("/medical-register/completed-cases")) {
      await reply(requestId, {
        values: [{
          completedCaseUid: body.page,
          entryNumber: body.page,
          entryPositionNumber: body.page,
          patientLastName: "ТЕСТ-ПАЦИЕНТ",
          patientFirstName: "Тест",
          patientMiddleName: "",
          insurancePolicySeries: null,
          insurancePolicyNumber: "0000",
          medicalCareConditionsCode: 1,
          medicalCareConditionsName: "Тест",
          amountBilled: 100,
          approvedAmount: null,
          insuranceCompanyApprovedAmount: null,
        }],
        totalRecords: 40,
      });
      return;
    }

    await reply(requestId, path.endsWith("/F008/options")
      ? policyOptions
      : search ? [{ value: "A01", label: "Тестовая услуга" }] : []);
  });

  await send("Fetch.enable", { patterns: [{ urlPattern: "*/api/*" }] });
  await send("Emulation.setDeviceMetricsOverride", {
    width: 1440,
    height: 1200,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await send("Page.navigate", { url: "http://127.0.0.1:5189/med-view" });
  await until('document.body.textContent.includes("Начните с поиска")');
  await evaluate(`(async () => {
    const { useMedViewWorkspaceStore } =
      await import('/src/modules/medView/widgets/workspace/model/stores/useMedViewWorkspaceStore.tsx');
    const { useMedViewFiltersStore } =
      await import('/src/modules/medView/widgets/filters/model/stores/useMedViewFiltersStore.tsx');
    const { initialFiltersDraft } =
      await import('/src/modules/medView/widgets/workspace/model/types/FiltersDraft.ts');
    const { mapFiltersDraftToApplied } =
      await import('/src/modules/medView/widgets/workspace/model/mappers/mapFiltersDraftToApplied.ts');
    const { filterGroups, filterGroupIds, resetFiltersDraft } =
      await import('/src/modules/medView/widgets/filters/model/filterGroups.ts');
    window.filtersTest = {
      workspace: useMedViewWorkspaceStore,
      applied: () => useMedViewFiltersStore.getState().appliedFilters,
      defaults: mapFiltersDraftToApplied(initialFiltersDraft),
      button: (label) => [...document.querySelectorAll("button")]
        .find((element) => element.textContent.trim() === label),
      group: (label) => [...document.querySelectorAll("li > button")]
        .find((element) => element.firstElementChild?.textContent.trim() === label),
      control: (label, index = 0) => [...document.querySelectorAll("label")]
        .filter((element) => element.textContent.trim() === label)[index]
        ?.parentElement.querySelector('[role=combobox]'),
      modelCheck: () => {
        const fill = (value) => Array.isArray(value) ? ["example"]
          : value === null ? 123
          : typeof value === "string" ? "example"
          : Object.fromEntries(Object.entries(value).map(([key, item]) => [key, fill(item)]));
        const populated = fill(initialFiltersDraft);
        return filterGroupIds.every((id) => {
          const reset = resetFiltersDraft(populated, id);
          const selected = filterGroups[id].draftKey;
          return JSON.stringify(reset[selected]) === JSON.stringify(initialFiltersDraft[selected])
            && reset[selected] !== initialFiltersDraft[selected]
            && resetFiltersDraft(reset, id) === reset
            && Object.keys(populated).every((key) =>
              key === selected || reset[key] === populated[key]);
        });
      },
    };
  })()`);

  const button = (label) => `filtersTest.button(${JSON.stringify(label)})`;
  const group = (label) => `filtersTest.group(${JSON.stringify(label)})`;
  const control = (label, index = 0) =>
    `filtersTest.control(${JSON.stringify(label)}, ${index})`;
  const click = (selector) => evaluate(`${selector}.click()`);
  const menuShadow = () => evaluate(`getComputedStyle(
    document.querySelector("[role=listbox]").closest(".MuiPaper-root")
  ).boxShadow`);
  const expectedMenuShadow = "rgba(0, 0, 0, 0.1) 0px 6px 18px 0px";
  const select = async (selector, label, verifyShadow = false) => {
    await evaluate(`${selector}.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, button: 0 }))`);
    const option = `[...document.querySelectorAll('[role=option]')].find((element) =>
      element.textContent.trim() === ${JSON.stringify(label)})`;
    await until(option);
    if (verifyShadow) {
      check("select popup has the MedView shadow for " + label,
        await menuShadow() === expectedMenuShadow);
    }
    await click(option);
    await send("Input.dispatchKeyEvent", { type: "keyDown", key: "Escape", code: "Escape", windowsVirtualKeyCode: 27 });
    await until('!document.querySelector("[role=listbox]")');
  };
  const type = async (selector, value) =>
    evaluate(`(() => {
      const input = ${selector};
      input.focus();
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(input, ${JSON.stringify(value)});
      input.dispatchEvent(new Event("input", { bubbles: true }));
    })()`);
  const waitForResults = async (count) => {
    for (let attempt = 0; attempt < 120 && resultBodies().length < count; attempt++)
      await pause(100);
    check("completed-cases request count " + count, resultBodies().length === count);
    await until('document.querySelector("table tbody")?.textContent.includes("ТЕСТ-ПАЦИЕНТ")');
  };

  const resetLabel = "Сбросить фильтры группы";
  const resetGroup = `document.querySelector('button[aria-label="${resetLabel}"]')`;
  const resetAll = button("Сбросить всё");
  const apply = button("Применить фильтры");
  const people = group("Персональные данные");
  const services = group("Оказанные услуги");
  const surname = 'document.querySelector("input[placeholder=Иванов]")';
  const serviceSearch = control("Название услуги");
  const sex = control("Пол");
  const policy = control("Тип полиса");
  const birthDate = 'document.querySelector(".MuiPickersTextField-root")';
  const openCalendar = `${birthDate}.querySelector("button")`;
  const row = 'document.querySelector("table tbody").textContent';
  const active = (expression) => `${expression}.getAttribute("aria-current") === "true"`;

  const getColor = (selector) => evaluate(`getComputedStyle(${selector}).color`);
  const getBackground = (selector) =>
    evaluate(`getComputedStyle(${selector}).backgroundColor`);
  const hover = async (selector) => {
    const point = await evaluate(`(() => {
      const element = ${selector};
      element.scrollIntoView({ block: "center" });
      const rect = element.getBoundingClientRect();
      return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
    })()`);
    await send("Input.dispatchMouseEvent", { type: "mouseMoved", ...point });
  };
  const checkResetLayout = async () => {
    await send("Emulation.setDeviceMetricsOverride", {
      width: 360, height: 800, deviceScaleFactor: 1, mobile: false,
    });
    check("reset controls stay to the right at 360 px", await evaluate(`
      [${resetGroup}, ${resetAll}].every((element) => {
        const header = element.closest("header");
        const bounds = element.getBoundingClientRect();
        const heading = header.querySelector("h2").getBoundingClientRect();
        return bounds.left >= heading.right &&
          bounds.right <= header.getBoundingClientRect().right &&
          bounds.top < heading.bottom;
      })
    `));
    await send("Emulation.setDeviceMetricsOverride", {
      width: 1440, height: 1200, deviceScaleFactor: 1, mobile: false,
    });
  };
  const disabledGroupColor = await getColor(resetGroup);
  const disabledAllColor = await getColor(resetAll);
  const checkResetActions = async () => {
    check("enabled and disabled reset actions have distinct colors",
      await getColor(resetGroup) !== disabledGroupColor &&
      await getColor(resetAll) !== disabledAllColor);
    const groupSize = await evaluate(`${resetGroup}.getBoundingClientRect().width`);
    check("group reset is icon-only with a 40 px target", groupSize >= 40 &&
      await evaluate(`${resetGroup}.textContent === "" && Boolean(${resetGroup}.querySelector("svg"))`));
    const allBackground = await getBackground(resetAll);
    await hover(resetAll);
    await until(`getComputedStyle(${resetAll}).backgroundColor !== ${JSON.stringify(allBackground)}`);
    check("global reset shows a hover surface", true);
    const groupBackground = await getBackground(resetGroup);
    await hover(resetGroup);
    await until(`getComputedStyle(${resetGroup}).backgroundColor !== ${JSON.stringify(groupBackground)}`);
    const tooltip = 'document.querySelector("[role=tooltip]")';
    await until(`${tooltip}?.textContent === ${JSON.stringify(resetLabel)}`);
    check("group reset shows the hover surface and tooltip", true);
    await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: 0, y: 0 });
    await evaluate(`${apply}.focus()`);
    await send("Input.dispatchKeyEvent", {
      type: "keyDown", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9,
    });
    await send("Input.dispatchKeyEvent", {
      type: "keyUp", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9,
    });
    await until(`document.activeElement === ${resetGroup} &&
      getComputedStyle(${resetGroup}).outlineStyle === "solid"`);
    check("group reset can receive visible focus with Tab", true);
  };

  await checkResetLayout();
  check("every nested category restores its own defaults", await evaluate("filtersTest.modelCheck()"));
  check("initial reset actions disabled", await evaluate(`${resetGroup}.disabled && ${resetAll}.disabled`));

  await click('document.querySelector("button[value=Internal]")');
  await type(surname, "Тестов");
  await checkResetActions();
  await select(sex, "Мужской", true);
  await select(policy, "Тестовый полис", true);
  await click(openCalendar);
  const day = 'document.querySelector("button[role=gridcell]:not([disabled])")';
  await until(day);
  await click(day);
  const confirmDate = 'document.querySelector(".MuiPickersLayout-actionBar button:last-child")';
  if (await evaluate(`Boolean(${confirmDate})`)) await click(confirmDate);
  await until(`/[0-9]/.test(${birthDate}.querySelector("input").value)`);
  await type("document.querySelector('input[placeholder=\"Укажите номера\"]')", "7788,");
  await click(services);
  check("empty autocomplete displays the unselected placeholder",
    await evaluate(`${serviceSearch}.placeholder === "Не выбрано" &&
      ${serviceSearch}.matches(":placeholder-shown") &&
      getComputedStyle(${serviceSearch}, "::placeholder").opacity === "1"`));
  await type(serviceSearch, "поиск");
  check("typing hides the autocomplete placeholder",
    await evaluate(`${serviceSearch}.value === "поиск" &&
      !${serviceSearch}.matches(":placeholder-shown")`));
  const serviceOption = '[role="option"]';
  await until(`document.querySelector('${serviceOption}')?.textContent.includes("Тестовая услуга")`);
  check("autocomplete popup has the same MedView shadow",
    await menuShadow() === expectedMenuShadow);
  await click(`document.querySelector('${serviceOption}')`);
  await until(`!${serviceSearch}.hasAttribute("placeholder")`);
  check("selected autocomplete displays its chip without the empty placeholder",
    await evaluate(`${serviceSearch}.closest(".MuiAutocomplete-root")
      .querySelector(".MuiChip-root")?.textContent === "Тестовая услуга"`));
  await click(apply);
  await waitForResults(1);
  const applied = resultBodies()[0].filters;
  check("ordinary apply carries selected fields from both groups: " +
    JSON.stringify({person: applied.person, services: applied.providedService}),
    applied.person.patient.lastName === "Тестов" &&
    applied.person.patient.sex === "male" &&
    typeof applied.person.patient.birthDate === "string" &&
    applied.person.insurance.insurancePolicyTypes[0] === "1" &&
    applied.person.insurance.insurancePolicyNumbers[0] === "7788" &&
    applied.providedService.providedServices[0] === "A01");

  await evaluate("filtersTest.workspace.getState().setCompletedCasesTablePagination({ page: 1 })");
  await waitForResults(2);
  await type(serviceSearch, "ещё");
  await until(`document.querySelector('${serviceOption}')?.textContent.includes("Тестовая услуга")`);
  const beforeGroupReset = requests.length;
  const beforeTable = await evaluate(row);
  await click(resetGroup);
  await until(`${resetGroup}.disabled && ${serviceSearch}.value === ""`);
  check("category reset restores the autocomplete placeholder",
    await evaluate(`${serviceSearch}.placeholder === "Не выбрано" &&
      ${serviceSearch}.matches(":placeholder-shown")`));
  await click(resetGroup);
  await pause(400);
  check("category reset does not fetch, change results, pagination or applied filters",
    requests.length === beforeGroupReset && await evaluate(`${row} === ${JSON.stringify(beforeTable)}
      && filtersTest.workspace.getState().completedCasePaginationState.page === 1
      && filtersTest.applied().providedService.providedServices[0] === "A01"`));
  check("category reset preserves active category and other draft values",
    await evaluate(`${active(services)} && ${resetGroup}.closest("section")
      .querySelectorAll(".MuiAutocomplete-tag").length === 0 && !${resetAll}.disabled`));

  await click(people);
  await until(`${surname}.value === "Тестов" && ${sex}.textContent.trim() === "Мужской"
    && ${policy}.textContent.includes("Тестовый полис")`);
  await click(apply);
  await waitForResults(3);
  check("apply after category reset sends updated draft and first page",
    resultBodies()[2].page === 1 &&
    JSON.stringify(resultBodies()[2].filters.person) === JSON.stringify(applied.person) &&
    resultBodies()[2].filters.providedService.providedServices.length === 0);

  await click(services);
  await type(serviceSearch, "только поиск");
  await until(`!${resetGroup}.disabled && document.querySelector('${serviceOption}')`);
  const beforeSearchReset = requests.length;
  await click(resetGroup);
  await until(`${serviceSearch}.value === "" && ${resetGroup}.disabled`);
  await pause(300);
  check("unselected server search text is reset without fetching", requests.length === beforeSearchReset);
  await type(serviceSearch, "для общего сброса");
  await until(`document.querySelector('${serviceOption}')?.textContent.includes("Тестовая услуга")`);
  await click(`document.querySelector('${serviceOption}')`);

  await click(people);
  await until(`${surname}.value === "Тестов"`);
  await pause();
  const beforeGlobalReset = requests.length;
  const beforeGlobalTable = await evaluate(row);
  await click(resetAll);
  await until(`${resetGroup}.disabled && ${resetAll}.disabled`);
  await pause(400);
  check("global reset clears controlled fields and leaves results, source and category intact",
    requests.length === beforeGlobalReset && await evaluate(`
      ${surname}.value === "" &&
      ${sex}.textContent.trim() === "Не выбрано" &&
      ${policy}.textContent.trim() === "Не выбрано" &&
      !/[0-9]/.test(${birthDate}.querySelector("input").value) &&
      ${active(people)} && ${services}.children.length === 1 &&
      document.querySelector("button[value=Internal]").getAttribute("aria-pressed") === "true" &&
      ${row} === ${JSON.stringify(beforeGlobalTable)} &&
      filtersTest.applied().person.patient.lastName === "Тестов"`));

  await click(apply);
  await waitForResults(4);
  check("apply after global reset posts only initial filter values",
    resultBodies()[3].page === 1 &&
    resultBodies()[3].registerType === "Internal" &&
    JSON.stringify(resultBodies()[3].filters) === JSON.stringify(await evaluate("filtersTest.defaults")));

  const representativeSex = control("Пол", 1);
  const month = control("Расчетный месяц");
  const year = `document.querySelector('input[placeholder="2026"]')`;
  const technical = group("Служебная информация");
  const emptySelection = "Не выбрано";
  const hasLabel = (selector, label) =>
    `${selector}.textContent.trim() === ${JSON.stringify(label)}`;

  await type(surname, "Тестов");
  await select(sex, "Мужской");
  await select(representativeSex, "Женский");
  await click(technical);
  await select(month, "Январь");
  await type(year, "2025");
  await click(apply);
  await waitForResults(5);
  const selectedFilters = resultBodies()[4].filters;
  check("apply includes all three selected single-select values",
    selectedFilters.person.patient.sex === "male" &&
    selectedFilters.person.representative.sex === "female" &&
    selectedFilters.internalService.invoiceBillingMonth === "1");

  const beforeMonthClear = requests.length;
  await select(month, emptySelection);
  await until(hasLabel(month, emptySelection));
  check("clearing the month preserves the year and active filters without a request",
    requests.length === beforeMonthClear &&
    await evaluate(`${year}.value === "2025" &&
      filtersTest.applied().internalService.invoiceBillingMonth === "1"`));

  await click(people);
  await until(`${hasLabel(sex, "Мужской")} && ${hasLabel(representativeSex, "Женский")}`);
  // Wait for the reference data that reloads when the personal group is opened.
  await pause();
  const beforeSexClear = requests.length;
  const beforeClearTable = await evaluate(row);
  const press = async (key, windowsVirtualKeyCode) => {
    await send("Input.dispatchKeyEvent", {
      type: "keyDown", key, code: key, windowsVirtualKeyCode,
      text: key === "Enter" ? "\r" : undefined,
    });
    await send("Input.dispatchKeyEvent", { type: "keyUp", key, code: key, windowsVirtualKeyCode });
  };
  await evaluate(`${sex}.focus()`);
  await press("ArrowDown", 40);
  await until('document.activeElement.getAttribute("role") === "option"');
  const firstOption = 'document.querySelector("[role=listbox] [role=option]")';
  check("the empty choice is the first menu option",
    await evaluate(hasLabel(firstOption, emptySelection)));
  await press("Home", 36);
  await until(hasLabel("document.activeElement", emptySelection));
  await press("Enter", 13);
  await until(hasLabel(sex, emptySelection));
  await until('!document.querySelector("[role=listbox]")');
  check("clearing the patient sex by keyboard preserves the representative and surname",
    await evaluate(`${hasLabel(representativeSex, "Женский")} && ${surname}.value === "Тестов"`));

  await select(representativeSex, emptySelection);
  await until(hasLabel(representativeSex, emptySelection));
  await pause(300);
  check("clearing either sex produces no API call and leaves the table and applied values intact",
    requests.length === beforeSexClear &&
    await evaluate(`${row} === ${JSON.stringify(beforeClearTable)} &&
      filtersTest.applied().person.patient.sex === "male" &&
      filtersTest.applied().person.representative.sex === "female"`));

  await click(apply);
  await waitForResults(6);
  const clearedFilters = resultBodies()[5].filters;
  check("apply sends the initial values for cleared fields and retains neighboring filters",
    clearedFilters.person.patient.sex === null &&
    clearedFilters.person.representative.sex === null &&
    clearedFilters.person.patient.lastName === "Тестов" &&
    clearedFilters.internalService.invoiceBillingMonth === "" &&
    clearedFilters.internalService.invoiceBillingYear === "2025");

  const chips = `[...${policy}.querySelectorAll(".MuiChip-root")]`;
  const chipLabels = (...labels) =>
    `JSON.stringify(${chips}.map((chip) => chip.textContent)) === ${JSON.stringify(JSON.stringify(labels))}`;
  const beforePolicySelect = requests.length;
  await select(policy, "Тестовый полис");
  await select(policy, longPolicyLabel);
  await until(chipLabels("Тестовый полис", longPolicyLabel));
  check("multiple select renders one chip per selected value without fetching",
    requests.length === beforePolicySelect);

  await send("Emulation.setDeviceMetricsOverride", {
    width: 360, height: 800, deviceScaleFactor: 1, mobile: false,
  });
  check("long chip label wraps inside the multiple select at 360 px",
    await evaluate(`(() => {
      const select = ${policy};
      const label = ${chips}[1].querySelector(".MuiChip-label");
      const style = getComputedStyle(label);
      const bounds = label.getBoundingClientRect();
      return bounds.right <= select.getBoundingClientRect().right &&
        bounds.height > parseFloat(style.lineHeight) &&
        label.scrollWidth <= label.clientWidth &&
        label.scrollHeight <= label.clientHeight;
    })()`));
  await send("Emulation.setDeviceMetricsOverride", {
    width: 1440, height: 1200, deviceScaleFactor: 1, mobile: false,
  });

  await click(apply);
  await waitForResults(7);
  check("apply still sends multiple-select codes",
    JSON.stringify(resultBodies()[6].filters.person.insurance.insurancePolicyTypes) === '["1","2"]');

  const beforePolicyClear = requests.length;
  const removeChip = (label) =>
    `[...${policy}.querySelectorAll("button")].find((button) =>
      button.getAttribute("aria-label") === ${JSON.stringify(`Убрать «${label}»`)})`;
  const firstRemove = removeChip("Тестовый полис");
  const point = await evaluate(`(() => {
    const button = ${firstRemove};
    button.scrollIntoView({ block: "center" });
    const rect = button.getBoundingClientRect();
    return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
  })()`);
  await send("Input.dispatchMouseEvent", {
    type: "mousePressed", button: "left", clickCount: 1, ...point,
  });
  await send("Input.dispatchMouseEvent", {
    type: "mouseReleased", button: "left", clickCount: 1, ...point,
  });
  await until(chipLabels(longPolicyLabel));
  check("clicking a chip cross removes only its value and keeps the menu closed",
    await evaluate(`${policy}.getAttribute("aria-expanded") === "false"`));
  await evaluate(`(async () => {
    const { queryClient } = await import('/src/shared/api/client/queryClient.ts');
    queryClient.setQueryData(["refrences", "options", "F008", undefined], [{ value: "1", label: "Тестовый полис" }]);
  })()`);
  await until(chipLabels("2"));
  const fallbackRemove = removeChip("2");
  await evaluate(`${policy}.focus()`);
  await press("Tab", 9);
  await until(`document.activeElement === ${fallbackRemove} &&
    getComputedStyle(${fallbackRemove}).outlineStyle === "solid"`);
  await press("Enter", 13);
  await until(`${chips}.length === 0 && ${policy}.textContent.trim() === "Не выбрано"`);
  check("the chip cross can be activated by keyboard and returns focus to the select",
    await evaluate(`document.activeElement === ${policy} &&
      ${policy}.getAttribute("aria-expanded") === "false"`));

  await select(policy, "Тестовый полис");
  await until(chipLabels("Тестовый полис"));
  await click(resetGroup);
  await until(`${chips}.length === 0 && ${policy}.textContent.trim() === "Не выбрано"`);
  check("removal and reset update chips while missing options preserve selected codes",
    requests.length === beforePolicyClear &&
    await evaluate('filtersTest.applied().person.insurance.insurancePolicyTypes.join(",") === "1,2"'));

  await click(technical);
  const patientUid = control("UID пациента");
  const medicalCaseUid = control("UID случая");
  const completedCaseUid = control("UID законченного случая");
  const invoiceUid = control("UID счета");
  const uidChips = (selector) =>
    `[...${selector}.closest(".MuiAutocomplete-root").querySelectorAll(".MuiChip-label")]`;
  const beforeUids = requests.length;
  await type(patientUid, "12abc34");
  check("an invalid UID is flagged during typing",
    await evaluate(`${patientUid}.getAttribute("aria-invalid") === "true" &&
      ${uidChips(patientUid)}.length === 0`));
  await press("Enter", 13);
  await until(`${patientUid}.value === ""`);

  const pasted = "4711\n001002; 4711, 12abc34 -7 18.1 0 2147483648";
  await evaluate(`(() => {
    const clipboardData = new DataTransfer();
    clipboardData.setData("text/plain", ${JSON.stringify(pasted)});
    ${patientUid}.dispatchEvent(new ClipboardEvent("paste", { bubbles: true, clipboardData }));
  })()`);
  await until(`${uidChips(patientUid)}.map((chip) => chip.textContent).join(",") === "4711,1002"`);
  check("pasting a UID list drops invalid tokens and numeric duplicates",
    await evaluate('document.body.textContent.includes("Некорректные UID пропущены")'));

  await type(medicalCaseUid, "2001");
  await press("Tab", 9);
  await until(`${uidChips(medicalCaseUid)}[0]?.textContent === "2001"`);
  await type(completedCaseUid, "3001,3002;");
  await until(`${uidChips(completedCaseUid)}.length === 2`);
  await type(invoiceUid, "4001");
  check("editing UID lists does not send a request", requests.length === beforeUids);

  const applyPoint = await evaluate(`(() => {
    const button = ${apply};
    button.scrollIntoView({ block: "center" });
    const rect = button.getBoundingClientRect();
    return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
  })()`);
  await send("Input.dispatchMouseEvent", {
    type: "mousePressed", button: "left", clickCount: 1, ...applyPoint,
  });
  await send("Input.dispatchMouseEvent", {
    type: "mouseReleased", button: "left", clickCount: 1, ...applyPoint,
  });
  await waitForResults(8);
  const uidFilters = resultBodies()[7].filters.internalService;
  check("apply sends numeric UID arrays including the last uncommitted value " + JSON.stringify(uidFilters),
    JSON.stringify(uidFilters.patientUid) === "[4711,1002]" &&
    JSON.stringify(uidFilters.medicalCaseUid) === "[2001]" &&
    JSON.stringify(uidFilters.completedCaseUid) === "[3001,3002]" &&
    JSON.stringify(uidFilters.invoiceUid) === "[4001]" &&
    uidFilters.invoiceBillingYear === "2025");
};
