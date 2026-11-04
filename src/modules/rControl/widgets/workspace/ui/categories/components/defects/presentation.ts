import dayjs from "dayjs";

export const displayValue = (value: string | number | null | undefined) =>
  value === null || value === undefined || String(value).trim() === "" ? "—" : String(value);

// Keep the existing RControl date formatting and timezone handling.
export const formatSanctionDate = (value: string | null | undefined) =>
  value ? dayjs(value).format("DD.MM.YYYY") : "—";
