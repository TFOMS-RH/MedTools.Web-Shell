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
    await new Promise((resolve) => window.setTimeout(resolve, mode === "loading" && !isExport && method === "get" ? 3000 : 300));
    if (config.signal?.aborted) throw new AxiosError("Превью: запрос отменён", "ERR_CANCELED", config);
    if (isExport || method !== "get") {
      if (operationError) return fail("Демонстрационная ошибка операции");
    } else if (mode === "error") return fail("Демонстрационная ошибка загрузки документов");

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
      const { page = 1, pageSize = 50 } = config.params ?? {};
      return response({ items: [], totalCount: 0, page, pageSize, totalPages: 1, hasPrevious: false, hasNext: false });
    }
    if (path === "/health-track/statistics/overview" && method === "get") {
      return response({ kpi: { patientsTotal: 0, patientsActive: 0, patientsClosed: 0,
        documentsTotal: 0, documentsReady: 0, recordsTotal: 0 },
        topMos: [], topDiagnoses: [], byPeriod: [], byAgeGroup: [], periodFrom: null, periodTo: null });
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
