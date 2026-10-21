import { isAxiosError } from "axios";

export interface ApiErrorInfo {
  message: string;
  fields: Record<string, string>;
  status?: number;
}

export const getApiError = (error: unknown, fallback: string): ApiErrorInfo => {
  if (!isAxiosError(error)) return { message: fallback, fields: {} };
  const status = error.response?.status;
  if (status === 401) return { message: "Сессия завершена. Войдите снова.", fields: {}, status };
  if (status === 403) return { message: "Недостаточно разрешений для этой операции.", fields: {}, status };

  const data: unknown = error.response?.data;
  const fields: Record<string, string> = {};
  let message = fallback;
  if (typeof data === "string" && data.length < 1000 && !data.trim().startsWith("<")) message = data;
  if (data && typeof data === "object") {
    if ("detail" in data && typeof data.detail === "string") message = data.detail;
    else if ("title" in data && typeof data.title === "string") message = data.title;
    if ("errors" in data && data.errors && typeof data.errors === "object") {
      for (const [key, value] of Object.entries(data.errors)) {
        if (Array.isArray(value) && value.every((item) => typeof item === "string")) fields[key] = value.join(" ");
      }
    }
  }
  return { message, fields, status };
};
