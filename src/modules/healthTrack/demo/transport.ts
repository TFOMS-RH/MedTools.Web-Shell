import type { HTStatisticsOverview, HTStatisticsQueryParams } from "../types/htStatistics";
import type { HTRegisterDnItem, HTRegisterDnDetails, HTRegisterDnQueryParams } from "../types/htRegisterDn";
import { AxiosError, type AxiosAdapter } from "axios";
import {
  canCheckDocument,
  type HTCheckDocumentResultItem,
  type HTDocumentAuditItem,
  type HTDocumentDetails,
  type HTDocumentFileType,
  type HTDocumentsQueryParams,
  type HTDocumentStatus,
} from "../types/htDocuments";

export type DemoMode = "ready" | "loading" | "empty" | "error";

const makeDocuments = (count: number): HTDocumentDetails[] => {
  const types: HTDocumentFileType[] = ["DSPN", "PROF", "GST", "GPT", "GSM", "GPM", "GF", "PF"];
  const statuses: HTDocumentStatus[] = ["Uploaded", "Ready", "Error", "Checking", "Queued"];
  return Array.from({ length: count }, (_, index) => {
    const id = index + 1;
    const fileType = types[index % types.length];
    const status = statuses[Math.floor(index / types.length) % statuses.length];
    return {
      id, fileType, status,
      fileName: `DEMO_${fileType}_${index % 9 === 0 ? "Длинное_демонстрационное_имя_файла_для_проверки_переноса_и_доступности_полного_названия_" : ""}${String(id).padStart(4, "0")}.xml`,
      period: `2026-${String(8 + index % 3).padStart(2, "0")}`,
      hospitalCode: index % 7 === 0 ? null : `99000${1 + index % 3}`,
      regionCode: "99", recordsCount: status === "Uploaded" ? null : index % 7 === 0 ? 0 : id * 127,
      isValid: status !== "Error", uploadedBy: "demo.operator@example.invalid",
      uploadDate: new Date(Date.UTC(2026, 9, 1, 10, 0, count - index)).toISOString(),
      checkedAt: status === "Ready" || status === "Error" ? "2026-10-02T10:00:00Z" : null,
      checkedBy: status === "Ready" || status === "Error" ? "Демонстрационный оператор" : null,
      checkAttempts: status === "Ready" || status === "Error" ? 1 : 0,
      validationErrors: status === "Error" ? "Демонстрационная ошибка валидации: тестовый файл содержит некорректную запись. Реальные медицинские данные не используются." : null,
    };
  });
};

// Synthetic registry records for the isolated development preview only.
const registerPatients: HTRegisterDnItem[] = Array.from({ length: 103 }, (_, index) => ({
  enp: String(9900000000000000n + BigInt(index)),
  fullName: index === 0
    ? "Демонстрационный пациент с намеренно длинным именем для проверки переноса текста без потери данных"
    : "Демонстрационный пациент " + String(index + 1).padStart(3, "0"),
  fam: "Демонстрационный", im: "Пациент " + (index + 1), ot: null,
  birthDate: index % 5 === 0 ? null : "1980-01-15", gender: index % 2 === 0 ? "1" : "2",
  episodesCount: 0, sources: "GF", lastDnInDate: null,
}));

registerPatients[0].fam = "Демонстрационный пациент с намеренно длинной составной фамилией для проверки переноса";
registerPatients[0].im = "ТестовоеИмя";
registerPatients[0].ot = "ДемонстрационноеОтчество";
registerPatients[0].fullName = [registerPatients[0].fam, registerPatients[0].im, registerPatients[0].ot].join(" ");

const makeRegisterDetails = (patient: HTRegisterDnItem): HTRegisterDnDetails => {
  const populated = patient === registerPatients[0];
  return {
    enp: patient.enp, fam: patient.fam, im: patient.im, ot: patient.ot,
    birthDate: patient.birthDate, gender: patient.gender,
    snils: populated ? "000-000-000 00 (демо)" : null,
    smo: populated ? "Демонстрационная страховая организация с длинным названием для проверки переноса" : null,
    spolis: populated ? "ДЕМО" : null, npolis: populated ? "0000000000000000" : null,
    vpolis: null, adres: populated ? "Демонстрационный адрес, тестовый населённый пункт, улица проверки длинных значений" : null,
    tel: null, sources: populated ? "DSPN,GF" : patient.sources,
    episodes: populated ? [0, 1, 2].map(index => ({
      dspnRecordId: 9000 + index, nZap: index + 1, diagCode: index === 2 ? null : "I10",
      diagName: index === 0 ? "Демонстрационная длинная медицинская формулировка для проверки чтения диагноза целиком без обрезания текста. Вымышленные данные, не медицинское заключение." : null,
      diagDate: index === 2 ? null : "2026-09-01", dateDnIn: "2026-09-02",
      dateDnOut: index === 1 ? "2026-10-01" : null, statusDnIn: index === 0 ? 2 : 1,
      reasonDnOut: null, reasonDnIn: null, dnPrvs: null, moP: index === 2 ? null : "990001",
      iddokt: null, period: "2026-09", sourceDocumentId: null,
      sourceFileName: index === 2 ? null : "DEMO_DSPN_очень_длинное_имя_источника_для_проверки_переноса_без_обрезания.xml",
      sourceFileType: "DSPN",
      plan: index === 0 ? { mcodPlan: "990001", moPodrId: "Демонстрационное подразделение с длинным наименованием",
        medAreaCode: "ДЕМО-УЧАСТОК-01", moAssign: null, dsCode: "I10",
        planDateStart: "2026-10-01", planDateEnd: "2026-10-31" } : index === 2
        ? { mcodPlan: null, moPodrId: null, medAreaCode: null, moAssign: null, dsCode: null, planDateStart: null, planDateEnd: null } : null,
      inf: index === 0 ? { infType: 1, sposobInf: 2, dataInf: "2026-09-15", infUpdated: true }
        : index === 2 ? { infType: null, sposobInf: null, dataInf: null, infUpdated: false } : null,
    })) : [],
    gfRecords: populated ? [0, 1].map(index => ({
      gfRecordId: 9500 + index, attachMcode: index === 0 ? "990001" : null,
      attachDate: index === 0 ? "2026-09-01" : null, groupRhCode: index === 0 ? 1 : null,
      groupRhDs: index === 0 ? "I10" : null, groupRhProfile: index === 0 ? "ДЕМО-ПРОФИЛЬ" : null,
      groupRhName: index === 0 ? "Демонстрационное длинное наименование группы для проверки читаемости сведений ГИС ОМС" : null,
      sourceDocumentId: null, sourceFileName: "DEMO_GF_990001_202609.xml",
    })) : [],
  };
};

// Demonstration-only disjoint monthly cohorts. These totals define the fixture,
// not the aggregation rules of the production statistics API.
const makeStatistics = (params: HTStatisticsQueryParams, empty: boolean): HTStatisticsOverview => {
  const months = Array.from({ length: 12 }, (_, index) => ({
    period: new Date(Date.UTC(2025, 10 + index)).toISOString().slice(0, 7),
    base: index === 5 ? 0 : index + 1,
  })).filter(item => (!params.periodFrom || item.period >= params.periodFrom) &&
    (!params.periodTo || item.period <= params.periodTo));
  const scale = empty ? 0 : months.reduce((sum, item) => sum + item.base, 0);
  const codes = ["I10", "E11", "J45", "I25", "E78", "J44", "K29", "M54", "N18", "G40"];
  return {
    kpi: { patientsTotal: scale * 30, patientsActive: scale * 20, patientsClosed: scale * 10,
      documentsTotal: scale * 4, documentsReady: scale * 3, recordsTotal: scale * 80 },
    topMos: empty || !months.length ? [] : [6, 5, 4, 4, 3, 3, 2, 2, 1, 0].map((weight, index) =>
      ({ moCode: String(990001 + index), count: weight * scale })),
    topDiagnoses: empty || !months.length ? [] : [8, 5, 4, 3, 3, 2, 2, 2, 1, 0].map((weight, index) =>
      ({ diagCode: codes[index], diagName: index === 9 ? null : index === 0
        ? "Демонстрационная длинная расшифровка диагноза для проверки полного чтения медицинского названия в графике и текстовой таблице"
        : "Демонстрационное название диагноза " + (index + 1), count: weight * scale })),
    byPeriod: empty ? [] : months.map(item => ({ period: item.period, count: item.base * 30 })),
    byAgeGroup: empty || !months.length ? [] : ["До 18", "18-30", "31-45", "46-60", "61-75", "76+", "Неизвестно"].map((group, index) =>
      ({ group, count: [0, 3, 6, 9, 8, 2, 2][index] * scale })),
    periodFrom: months[0]?.period ?? params.periodFrom ?? null,
    periodTo: months.at(-1)?.period ?? params.periodTo ?? null,
  };
};

/** Local Axios adapter, installed only inside the development iframe. Never forwards HTTP. */
export function createDocumentsDemoTransport() {
  let documents = makeDocuments(100);
  let mode: DemoMode = "ready";
  let operationError = false;
  const history = new Map<number, HTDocumentAuditItem[]>();
  let eventId = 0;

  const adapter: AxiosAdapter = async (config) => {
    if (!import.meta.env.DEV) throw new Error("HealthTrack preview is development-only");
    const path = new URL(config.url ?? "", "http://demo.invalid/").pathname;
    const method = (config.method ?? "get").toLowerCase();
    const response = (data: unknown, status = 200) => ({
      config, data, status, statusText: status === 200 ? "OK" : "Demo error", headers: {},
    });
    const fail = (message: string, status = 503): never => {
      throw new AxiosError(message, "ERR_BAD_RESPONSE", config, undefined, response({ title: message }, status));
    };
    if (!path.startsWith("/health-track/")) return fail("Запрос недоступен в превью", 404);
    const isExport = path.startsWith("/health-track/export/");
    await new Promise((resolve) => window.setTimeout(resolve, mode === "loading" && !isExport && method === "get" ? 3000 : path.startsWith("/health-track/import/") ? 1500 : 300));
    if (config.signal?.aborted) throw new AxiosError("Превью: запрос отменён", "ERR_CANCELED", config);
    if (isExport || method !== "get") {
      if (operationError) return fail("Демонстрационная ошибка операции");
    } else if (mode === "error") return fail(path.startsWith("/health-track/register-dn")
      ? "Демонстрационная ошибка загрузки регистра ДН"
      : path.startsWith("/health-track/statistics/") ? "Демонстрационная ошибка загрузки статистики"
      : "Демонстрационная ошибка загрузки документов");

    if (/^\/health-track\/import\/(gst|gpt|gsm|gpm|gf|pf|dspn|prof)$/.test(path) && method === "post") {
      const form = config.data as FormData;
      const file = form.get("file") as File;
      const document = { ...makeDocuments(1)[0],
        id: Math.max(0, ...documents.map(item => item.id)) + 1,
        fileName: file.name, period: String(form.get("period")),
        fileType: path.split("/").pop()!.toUpperCase() as HTDocumentFileType,
        recordsCount: 0, status: "Uploaded" as const };
      documents = [document, ...documents];
      return response({ documentId: document.id, recordsCount: 0, updatedCount: 0,
        warnings: ["Демонстрационный импорт: файл не обрабатывался, медицинские записи не создавались."] });
    }

    if (isExport && method === "get") {
      // A valid, empty ZIP archive with a comment marking it as a preview artifact.
      const comment = new TextEncoder().encode("HealthTrack preview. No real medical data.");
      const bytes = new Uint8Array(22 + comment.length);
      bytes.set([0x50, 0x4b, 0x05, 0x06]);
      new DataView(bytes.buffer).setUint16(20, comment.length, true);
      bytes.set(comment, 22);
      return { ...response(new Blob([bytes], { type: "application/zip" })),
        headers: { "content-disposition": 'attachment; filename="DEMO_healthtrack.zip"' } };
    }

    if (path === "/health-track/documents" && method === "get") {
      const params = (config.params ?? {}) as HTDocumentsQueryParams;
      const search = params.searchQuery?.toLocaleLowerCase() ?? "";
      const items = mode === "empty" ? [] : documents.filter((doc) =>
        (!search || `${doc.fileName} ${doc.hospitalCode ?? ""}`.toLocaleLowerCase().includes(search)) &&
        (!params.fileType || doc.fileType === params.fileType) &&
        (!params.status || doc.status === params.status) &&
        (!params.hospitalCode || doc.hospitalCode === params.hospitalCode) &&
        (!params.period || doc.period === params.period));
      const page = params.page ?? 1;
      const pageSize = params.pageSize ?? 50;
      const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
      return response({ items: items.slice((page - 1) * pageSize, page * pageSize), totalCount: items.length,
        page, pageSize, totalPages, hasPrevious: page > 1, hasNext: page < totalPages });
    }

    // Empty local datasets let the real navigation show the other existing sections.
    if (path === "/health-track/register-dn" && method === "get") {
      const params = (config.params ?? {}) as HTRegisterDnQueryParams;
      const search = params.searchQuery?.toLocaleLowerCase() ?? "";
      const items = mode === "empty" ? [] : registerPatients.filter((patient, index) =>
        (!search || (patient.enp + " " + patient.fullName).toLocaleLowerCase().includes(search)) &&
        (!params.hospitalCode || params.hospitalCode === "990001") &&
        (!params.diagCode) &&
        (!params.period || params.period === "2026-09") &&
        (!params.status || params.status === (index % 2 === 0 ? "active" : "closed")));
      const page = Number(params.page ?? 1), pageSize = Number(params.pageSize ?? 50);
      const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
      return response({ items: items.slice((page - 1) * pageSize, page * pageSize),
        totalCount: items.length, page, pageSize, totalPages, hasPrevious: page > 1, hasNext: page < totalPages });
    }

    if (path.startsWith("/health-track/register-dn/") && method === "get") {
      const patient = registerPatients.find(item => item.enp === path.split("/").pop());
      if (!patient) return fail("Демонстрационный пациент не найден", 404);
      const details = makeRegisterDetails(patient);
      return response(details);
    }

    if (path === "/health-track/statistics/overview" && method === "get") {
      return response(makeStatistics((config.params ?? {}) as HTStatisticsQueryParams, mode === "empty"));
    }

    const addHistory = (id: number, actionType: string, detail: string) => {
      const event: HTDocumentAuditItem = {
        id: ++eventId, createdAt: new Date().toISOString(), userName: "demo.operator@example.invalid",
        userRole: "Demo", actionType, actionDetail: detail, result: "SUCCESS", errorMessage: null,
      };
      history.set(id, [...(history.get(id) ?? []), event]);
    };
    const check = (id: number): HTCheckDocumentResultItem => {
      const doc = documents.find((item) => item.id === id);
      const isSuccess = Boolean(doc && canCheckDocument(doc));
      if (doc && isSuccess) {
        doc.status = "Ready";
        doc.recordsCount = id * 127;
        doc.checkedAt = new Date().toISOString();
        doc.checkedBy = "Демонстрационный оператор";
        doc.checkAttempts += 1;
        addHistory(id, "CHECK", "Демонстрационная проверка завершена в памяти");
      }
      return { documentId: id, isSuccess, recordsCount: doc?.recordsCount ?? null,
        approvedCount: isSuccess ? doc?.recordsCount ?? null : null, rejectedCount: isSuccess ? 0 : null,
        checkedAt: doc?.checkedAt ?? null, errors: isSuccess ? [] : ["Документ недоступен для проверки"] };
    };
    if (path === "/health-track/documents/check-batch" && method === "post") {
      const body = typeof config.data === "string" ? JSON.parse(config.data) : config.data;
      const results = (body.documentIds as number[]).map(check);
      const successCount = results.filter((item) => item.isSuccess).length;
      return response({ results, successCount, failedCount: results.length - successCount });
    }
    const match = path.match(/^\/health-track\/documents\/(\d+)(?:\/(audit|check))?$/);
    if (match) {
      const id = Number(match[1]);
      const doc = documents.find((item) => item.id === id);
      if (!doc) return fail("Демонстрационный документ не найден", 404);
      if (method === "post" && match[2] === "check") return response(check(id));
      if (method === "delete" && !match[2]) {
        documents = documents.filter((item) => item.id !== id);
        history.delete(id);
        return response(null);
      }
      if (method === "get" && match[2] === "audit") {
        return response([{
          id: -id, createdAt: doc.uploadDate, userName: doc.uploadedBy ?? "Demo", userRole: "Demo",
          actionType: "IMPORT", actionDetail: "Документ создан для превью, файл не отправлялся на сервер",
          result: "SUCCESS", errorMessage: null,
        }, ...(history.get(id) ?? [])]);
      }
      if (method === "get" && !match[2]) return response({ ...doc });
    }
    return fail("Операция не поддерживается в превью", 404);
  };

  return {
    adapter,
    setMode: (value: DemoMode) => { mode = value; },
    setCount: (value: number) => { documents = makeDocuments(value); history.clear(); },
    setOperationError: (value: boolean) => { operationError = value; },
  };
}
