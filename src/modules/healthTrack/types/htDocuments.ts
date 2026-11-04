// ==========================================
// modules/healthTrack/types/htDocuments.ts
// ==========================================

// ==========================================
// Статусы документа.
// Совпадают со строковыми значениями enum DocumentStatus на бэке
// (JsonStringEnumConverter → на фронт приходят строки).
// ==========================================
export type HTDocumentStatus =
  | "Uploaded"
  | "Checking"
  | "Ready"
  | "Error"
  | "Queued";

// ==========================================
// Типы файлов.
// Совпадают со значениями enum FileType на бэке.
// ==========================================
export type HTDocumentFileType =
  | "GST"
  | "GPT"
  | "GSM"
  | "GPM"
  | "GF"
  | "PF"
  | "DSPN"
  | "PROF";

// ==========================================
// Одна строка таблицы документов.
// Совпадает с DocumentListItemDto на бэке.
// ==========================================
export interface HTDocumentListItem {
  id: number;
  fileName: string;
  fileType: HTDocumentFileType;
  period: string; // YYYY-MM
  hospitalCode: string | null;
  regionCode: string | null;
  recordsCount: number | null;
  status: HTDocumentStatus;
  isValid: boolean;
  uploadedBy: string | null;
  uploadDate: string; // ISO 8601
  checkedAt: string | null; // ISO 8601
  checkedBy: string | null;
  checkAttempts: number;
}

export interface HTDocumentDetails extends HTDocumentListItem {
  /**
   * Ошибки валидации (если есть).
   * null/undefined, если документ валиден.
   */
  validationErrors: string | null;
}
// ==========================================
// Одна запись аудита по документу.
// Совпадает с DocumentAuditItemDto на бэке.
//
// Используется в drawer-е — вкладка «История».
// ==========================================
export interface HTDocumentAuditItem {
  /** ID записи аудита. */
  id: number;

  /** Дата/время события (ISO 8601). */
  createdAt: string;

  /** Email пользователя. */
  userName: string;

  /** Роль пользователя (Admin / MO / TFOMS / SMO). */
  userRole: string | null;

  /** Тип действия: IMPORT, CHECK, DELETE, EXPORT, LOGIN, LOGOUT, ... */
  actionType: string;

  /** Описание действия. */
  actionDetail: string | null;

  /** Результат: SUCCESS / ERROR. */
  result: string | null;

  /** Сообщение об ошибке (если result = ERROR). */
  errorMessage: string | null;
}

// ==========================================
// Тип действия в UI.
// ==========================================
export type HTAuditActionType =
  | "IMPORT"
  | "CHECK"
  | "DELETE"
  | "EXPORT"
  | "LOGIN"
  | "LOGOUT"
  | "AGGREGATE"
  | "OTHER";

// ==========================================
// Русские названия для типов действий аудита.
// ==========================================
export const HT_AUDIT_ACTION_LABELS: Record<string, string> = {
  IMPORT: "Импорт",
  CHECK: "Проверка",
  DELETE: "Удаление",
  EXPORT: "Экспорт",
  LOGIN: "Вход",
  LOGOUT: "Выход",
  AGGREGATE: "Агрегация",
};

// ==========================================
// Цвета для бейджа действия.
// ==========================================
export const HT_AUDIT_ACTION_COLORS: Record<
  string,
  { bg: string; color: string }
> = {
  IMPORT: { bg: "#e0edff", color: "#1a4fbf" },
  CHECK: { bg: "#e6f7ec", color: "#1a7f37" },
  DELETE: { bg: "var(--red-opacity)", color: "#b91c1c" },
  EXPORT: { bg: "#fff3d6", color: "#996600" },
  LOGIN: { bg: "var(--gray-200)", color: "var(--gray-900)" },
  LOGOUT: { bg: "var(--gray-200)", color: "var(--gray-900)" },
  AGGREGATE: { bg: "#f0e8ff", color: "#6633cc" },
};

/** Цвета по умолчанию — если тип действия неизвестен. */
export const HT_AUDIT_ACTION_COLORS_DEFAULT = {
  bg: "var(--gray-200)",
  color: "var(--text-default)",
};

// ==========================================
// Ответ GET /api/documents (постраничный список).
// Совпадает с PagedResult<DocumentListItemDto> на бэке.
// ==========================================
export interface HTDocumentsPagedResult {
  items: HTDocumentListItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

// ==========================================
// Метрики по статусам.
// ==========================================
export interface HTDocumentsSummaryByStatus {
  uploaded: number;
  checking: number;
  ready: number;
  error: number;
  queued: number;
}

// ==========================================
// Метрики по типам (сгруппированные).
// ==========================================
export interface HTDocumentsSummaryByType {
  gstGsm: number;
  gptGpm: number;
  dspn: number;
  prof: number;
  gf: number;
  pf: number;
}

// ==========================================
// Ответ GET /api/documents/summary.
// ==========================================
export interface HTDocumentsSummary {
  byStatus: HTDocumentsSummaryByStatus;
  byType: HTDocumentsSummaryByType;
}

// ==========================================
// Результат проверки одного документа.
// ==========================================
export interface HTCheckDocumentResultItem {
  documentId: number;
  isSuccess: boolean;
  recordsCount: number | null;
  approvedCount: number | null;
  rejectedCount: number | null;
  checkedAt: string | null;
  errors: string[];
}

// ==========================================
// Ответ POST /api/documents/check-batch.
// ==========================================
export interface HTCheckDocumentsBatchResult {
  results: HTCheckDocumentResultItem[];
  successCount: number;
  failedCount: number;
}

// ==========================================
// Параметры запроса GET /api/documents.
// Все опциональные — фрот передаёт только то, что реально фильтрует.
// ==========================================
export interface HTDocumentsQueryParams {
  searchQuery?: string;
  fileType?: HTDocumentFileType;
  status?: HTDocumentStatus;
  hospitalCode?: string;
  period?: string;
  page?: number;
  pageSize?: number;
  sortBy?: "uploadDate" | "recordsCount" | "checkedAt";
  sortDirection?: "asc" | "desc";
}

// ==========================================
// Тело POST /api/documents/check-batch.
// ==========================================
export interface HTCheckDocumentsBatchRequest {
  documentIds: number[];
}

// ==========================================
// UI-ХЕЛПЕРЫ
// ==========================================

// Русские названия статусов для отображения.
export const HT_STATUS_LABELS: Record<HTDocumentStatus, string> = {
  Uploaded: "Загружен",
  Checking: "Проверяется",
  Ready: "Готов",
  Error: "Ошибка",
  Queued: "В очереди",
};

// Цвета для badge статусов.
// Используем CSS-переменные, введённые в tokens.scss Никитки, + пара новых,
// которые определим локально в SCSS-модуле badge-компонента (если нужно).
export const HT_STATUS_COLORS: Record<
  HTDocumentStatus,
  { bg: string; color: string }
> = {
  Uploaded: { bg: "var(--blue-opacity)", color: "#0064a4" },
  Checking: { bg: "var(--gray-200)", color: "var(--gray-900)" },
  Ready: { bg: "#e6f7ec", color: "#1a7f37" },
  Error: { bg: "var(--red-opacity)", color: "#b91c1c" },
  Queued: { bg: "var(--violet-opacity)", color: "#7a1ba8" },
};

// Русские названия типов файлов (короткие, для UI).
export const HT_FILE_TYPE_LABELS: Record<HTDocumentFileType, string> = {
  GST: "GST",
  GPT: "GPT",
  GSM: "GSM",
  GPM: "GPM",
  GF: "GF",
  PF: "PF",
  DSPN: "DSPN",
  PROF: "PROF",
};

// Цвета для badge типов файлов (на скрине видно разные оттенки).
export const HT_FILE_TYPE_COLORS: Record<
  HTDocumentFileType,
  { bg: string; color: string }
> = {
  GST: { bg: "#e0edff", color: "#1a4fbf" },
  GPT: { bg: "#f0e8ff", color: "#6633cc" },
  GSM: { bg: "#e0edff", color: "#1a4fbf" },
  GPM: { bg: "#f0e8ff", color: "#6633cc" },
  GF: { bg: "#fff3d6", color: "#996600" },
  PF: { bg: "#e0f5ff", color: "#006699" },
  DSPN: { bg: "#fce8f3", color: "#a41d68" },
  PROF: { bg: "#fce8e8", color: "#a42d2d" },
};

// Хелпер: проверить, можно ли проверить документ.
// Логика совпадает с бэком: только Uploaded + (DSPN или PROF).
export const canCheckDocument = (doc: HTDocumentListItem): boolean => {
  const isCheckableType = doc.fileType === "DSPN" || doc.fileType === "PROF";
  return doc.status === "Uploaded" && isCheckableType;
};

// Хелпер: можно ли скачать ответный файл.
// Только для Ready + (DSPN или PROF).
export const canDownloadResponse = (doc: HTDocumentListItem): boolean => {
  const isResponseType = doc.fileType === "DSPN" || doc.fileType === "PROF";
  // Разрешаем скачивание для Ready и Error
  const isValidStatus = doc.status === "Ready" || doc.status === "Error";
  return isValidStatus && isResponseType;
};