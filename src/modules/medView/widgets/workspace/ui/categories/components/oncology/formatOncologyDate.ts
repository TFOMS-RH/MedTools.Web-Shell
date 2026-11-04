import dayjs from "dayjs";

// Preserve the supplied calendar day even for ISO timestamps with a timezone offset.
export const formatOncologyDate = (value: string | null | undefined) => {
  if (typeof value !== "string") return "—";
  const source = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}(?:T(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d(?:\.\d{1,7})?)?(?:Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)?)?$/.test(source)) {
    return "—";
  }
  const calendarDate = source.slice(0, 10);
  const date = dayjs(calendarDate);
  return date.isValid() && date.format("YYYY-MM-DD") === calendarDate
    ? date.format("DD.MM.YYYY")
    : "—";
};
