import apiClient from "../../../shared/api/client/apiClient";
// Результат скачивания.

export interface DownloadBlobResult {
  success: boolean;
  fileName?: string;
  errorMessage?: string;
}


// Опции.

interface DownloadBlobOptions {
  url: string;
  fallbackFileName: string;
}


// Парсер ошибок.
// Пытается извлечь текст из ProblemDetails.

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
const parseFileNameFromDisposition = (
  disposition: string | undefined,
): string | undefined => {
  if (!disposition) return undefined;

  // Сначала ищем filename* (расширенный формат)
  const extendedMatch = /filename\*\s*=\s*UTF-8''([^;]+)/i.exec(disposition);
  if (extendedMatch && extendedMatch[1]) {
    try {
      return decodeURIComponent(extendedMatch[1].trim().replace(/^["']|["']$/g, ""));
    } catch {
      // ignore
    }
  }

  // Потом обычный filename
  const match = /filename\s*=\s*["']?([^"';]+)["']?/i.exec(disposition);
  if (match && match[1]) {
    return match[1].trim();
  }

  return undefined;
};

export const downloadBlob = async (
  options: DownloadBlobOptions,
): Promise<DownloadBlobResult> => {
  const { url, fallbackFileName } = options;

  try {

    // 1. Запрос через apiClient.
    //    Cache-Control + _t — обходим кеш Vite-прокси.

    const response = await apiClient.get<Blob>(url, {
      responseType: "blob",
      transformResponse: [(data) => data],
      headers: {
        "Cache-Control": "no-cache, no-store",
        Pragma: "no-cache",
      },
      params: {
        _t: Date.now(),
      },
    });

    const blob = response.data;

    // 2. Проверки.

    if (!(blob instanceof Blob)) {
      return {
        success: false,
        errorMessage: "Сервер вернул не файл",
      };
    }

    if (blob.size === 0) {
      return {
        success: false,
        errorMessage: "Пустой файл",
      };
    }

    // Если внезапно вернулся JSON — это ошибка (в обход status 200).
    if (blob.type.includes("application/json")) {
      try {
        const text = await blob.text();
        const parsed = JSON.parse(text);
        const message =
          parseErrorResponse(parsed) ??
          "Сервер вернул ошибку вместо файла";
        return { success: false, errorMessage: message };
      } catch {
        return {
          success: false,
          errorMessage: "Сервер вернул ошибку вместо файла",
        };
      }
    }


    // 3. Имя файла из Content-Disposition.

    const disposition = response.headers["content-disposition"] as
      | string
      | undefined;
    const fileName =
      parseFileNameFromDisposition(disposition) ?? fallbackFileName;


    // 4. Сохраняем blob как файл.

    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);

    return {
      success: true,
      fileName,
    };
  } catch (err) {

    // 5. Обработка ошибок.
    let errorMessage = "Ошибка скачивания файла";

    if (typeof err === "object" && err !== null && "response" in err) {
      const response = (
        err as {
          response?: { data?: unknown; status?: number };
        }
      ).response;
      const status = response?.status;
      const data = response?.data;
      if (data instanceof Blob) {
        try {
          const text = await data.text();
          const parsed = JSON.parse(text);
          const parsedMessage = parseErrorResponse(parsed);
          errorMessage = parsedMessage ?? `Ошибка ${status ?? ""}`.trim();
        } catch {
          errorMessage = `Ошибка ${status ?? ""}`.trim();
        }
      } else if (data) {
        const parsedMessage = parseErrorResponse(data);
        errorMessage = parsedMessage ?? `Ошибка ${status ?? ""}`.trim();
      } else if (status) {
        errorMessage = `Ошибка ${status}`;
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