import dayjs from "dayjs";
import styles from "./styles.module.scss";

const hasValue = (value: string | number | null | undefined) =>
  value !== null && value !== undefined && String(value).trim() !== "";

export const displayValue = (value: string | number | null | undefined) =>
  hasValue(value) ? String(value) : "—";

export const displayDateOnly = (value: string | null | undefined) =>
  hasValue(value) ? dayjs(value).format("DD.MM.YYYY") : "—";

export const renderReference = (
  text: string | null | undefined,
  code: string | number | null | undefined,
) => (
  <>
    <span className={styles.referenceValue}>
      {hasValue(code)
        ? `${code} ${hasValue(text) ? `: ${text}` : ""}`
        : displayValue(code)}
    </span>
  </>
);
