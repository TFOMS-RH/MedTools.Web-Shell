import dayjs from "dayjs";

export const displayValue = (value: string | number | null | undefined) =>
  value === null || value === undefined || String(value).trim() === ""
    ? "—"
    : String(value);

export const formatVmpDate = (value: string | null | undefined) =>
  value ? dayjs(value).format("DD.MM.YYYY") : "—";
