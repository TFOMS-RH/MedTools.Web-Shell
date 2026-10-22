import { getApiError } from "../../../shared/helpers/getApiError.ts";

export const getAdminApiError = (error: unknown, fallback: string) => {
  const info = getApiError(error, fallback);
  return {
    ...info,
    fields: Object.fromEntries(Object.entries(info.fields).map(([field, message]) => [
      field.charAt(0).toLowerCase() + field.slice(1), message,
    ])),
  };
};
