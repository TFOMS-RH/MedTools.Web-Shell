import dayjs from "dayjs";
import styles from "./styles.module.scss";

const hasValue = (value: string | number | null | undefined) =>
  value !== null && value !== undefined && String(value).trim() !== "";

export const displayValue = (value: string | number | null | undefined) =>
  hasValue(value) ? String(value) : "—";

export const renderReference = (
  text: string | null | undefined,
  code: string | number | null | undefined,
) => (
  <>
    <span className={styles.referenceValue}>
      {hasValue(text) ? text : displayValue(code)}
    </span>
    {hasValue(text) && hasValue(code) && (
      <span className={styles.referenceCode}>Код: {code}</span>
    )}
  </>
);

// Preserve the supplied calendar day even for ISO timestamps with a timezone offset.
export const formatReferralDate = (value: string | null | undefined) => {
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
