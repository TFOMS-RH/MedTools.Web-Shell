// ==========================================
// modules/healthTrack/utils/downloadBlob.ts
// ==========================================
import apiClient from "../../../shared/api/client/apiClient";

// ==========================================
// Результат скачивания.
// ==========================================
export interface DownloadBlobResult {
  /** Успешно ли скачали файл. */
  success: boolean;

  /** Имя файла (если удалось определить). */
  fileName?: string;

  /** Сообщение об ошибке (если success = false). */
  errorMessage?: string;
}

// ==========================================
// Опции.
// ==========================================
interface DownloadBlobOptions {
  /** URL для скачивания (относительный, без /api). */
  url: string;

  /** Имя файла по умолчанию, если в заголовке его нет. */
  fallbackFileName: string;
}

// ==========================================
// Парсер ошибок.
// Пытается извлечь текст из ProblemDetails.
// ==========================================
const parseErrorResponse = (data: unknown): string | undefined => {
  if (!data) return undefined;

  if (typeof data === "string") return data;

  if (typeof data === "object" && data !== null) {
    const obj = data as Record<string, unknown>;

    // ProblemDetails: { errors: [...] }
    if (Array.isArray(obj.errors) && obj.errors.length > 0) {
      return obj.errors.join("; ");
    }

    // ProblemDetails: { title: "..." }
    if (typeof obj.title === "string") {
      return obj.title;
    }

    // { message: "..." }
    if (typeof obj.message === "string") {
      return obj.message;
    }
  }

  return undefined;
};

// ==========================================
// Главный хелпер.
// ==========================================
/**
 * Скачать файл по URL и сохранить его в браузере.
 *
 * Использует apiClient (Bearer, baseURL, 401-обработка).
 *
 * Использование:
 *   const result = await downloadBlob({
 *     url: `/export/dspn/${docId}/response`,
 *     fallbackFileName: "response.zip",
 *   });
 *
 *   if (result.success) {
 *     notify.success(`Файл ${result.fileName} скачан`);
 *   } else {
 *     notify.error(result.errorMessage);
 *   }
 */
export const downloadBlob = async (
  options: DownloadBlobOptions,
): Promise<DownloadBlobResult> => {
  const { url, fallbackFileName } = options;

  try {
    // ==========================================
    // 1. Запрос через apiClient (Bearer + baseURL).
    // ==========================================
    const response = await apiClient.get(url, {
      responseType: "blob",
    });

    // ==========================================
    // 2. Получаем blob.
    // ==========================================
    const blob = response.data as Blob;

    // ==========================================
    // 3. Определяем имя файла.
    // ==========================================
    let fileName = fallbackFileName;

    const disposition = response.headers["content-disposition"];
    if (typeof disposition === "string") {
      const match = /filename\*?=(?:UTF-8'')?["']?([^"';]+)/i.exec(disposition);
      if (match && match[1]) {
        try {
          fileName = decodeURIComponent(match[1]);
        } catch {
          // Некорректная кодировка — оставляем fallback
        }
      }
    }

    // ==========================================
    // 4. Сохраняем blob как файл.
    // ==========================================
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(blobUrl);

    return {
      success: true,
      fileName,
    };
  } catch (err) {
    // ==========================================
    // 5. Обработка ошибок.
    //    axios: err.response.data — может быть Blob (не JSON).
    //    Надо прочитать Blob как текст, потом распарсить.
    // ==========================================
    let errorMessage = "Ошибка скачивания файла";

    if (typeof err === "object" && err !== null && "response" in err) {
      const response = (
        err as {
          response?: { data?: unknown; status?: number };
        }
      ).response;

      const status = response?.status;
      const data = response?.data;

      // Blob (при responseType: 'blob' ошибка тоже может прийти Blob'ом).
      if (data instanceof Blob) {
        try {
          const text = await data.text();
          const parsed = JSON.parse(text);
          const parsedMessage = parseErrorResponse(parsed);
          if (parsedMessage) errorMessage = parsedMessage;
          else errorMessage = `Ошибка ${status ?? ""}`.trim();
        } catch {
          errorMessage = `Ошибка ${status ?? ""}`.trim();
        }
      } else if (data) {
        const parsedMessage = parseErrorResponse(data);
        if (parsedMessage) errorMessage = parsedMessage;
        else errorMessage = `Ошибка ${status ?? ""}`.trim();
      }
    } else if (err instanceof Error) {
      errorMessage = err.message;
    }

    return {
      success: false,
      errorMessage,
    };
  }
};