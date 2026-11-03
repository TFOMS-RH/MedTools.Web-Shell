import apiClient from "../../../shared/api/client/apiClient";
import {
  HT_IMPORT_ENDPOINTS,
  type HTImportFileType,
  type HTImportRequest,
  type HTImportResult,
} from "../types/htImport";

export type HTUploadProgressCallback = (percent: number) => void;

export const htImportService = {
  /**
   * Загрузить файл на бэк.
   *
   * @param fileType  Тип файла (GST, GPT, GSM, GPM, GF, PF, DSPN, PROF).
   * @param request   Объект с файлом, периодом и кодом МО.
   * @param onProgress Колбэк прогресса (0-100). Опционально.
   *
   * @returns HTImportResult — { documentId, recordsCount, warnings[] }
   */
  importFile: async (
    fileType: HTImportFileType,
    request: HTImportRequest,
    onProgress?: HTUploadProgressCallback,
  ): Promise<HTImportResult> => {
    const formData = new FormData();
    formData.append("file", request.file);
    formData.append("period", request.period);
    if (request.hospitalCode) {
      formData.append("hospitalCode", request.hospitalCode);
    }

    const endpoint = HT_IMPORT_ENDPOINTS[fileType];
    if (!endpoint) {
      throw new Error(`Неизвестный тип файла для импорта: ${fileType}`);
    }

    const response = await apiClient.post<HTImportResult>(endpoint, formData, {
      headers: {
        "Content-Type": undefined,
      },
      timeout: 20 * 60 * 1000,
      onUploadProgress: (progressEvent) => {
        if (!onProgress || !progressEvent.total) return;
        const percent = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total,
        );
        onProgress(percent);
      },
    });

    return response.data;
  },
};
