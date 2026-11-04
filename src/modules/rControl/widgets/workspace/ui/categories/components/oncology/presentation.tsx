import styles from "./styles.module.scss";

export const displayValue = (value: string | number | null | undefined) =>
  value === null || value === undefined || String(value).trim() === ""
    ? "—"
    : String(value);

export const formatCodeNamePair = (
  codeValue: string | number | null | undefined,
  nameValue: string | null | undefined,
): string => {
  if (
    codeValue === null ||
    codeValue === undefined ||
    String(codeValue).trim() === ""
  ) {
    return "—";
  }

  if (
    nameValue === null ||
    nameValue === undefined ||
    String(nameValue).trim() === ""
  ) {
    return `${codeValue} : —`;
  }

  return `${codeValue} : ${nameValue}`;
};

export const codeDescription = (
  text: string | null | undefined,
  code: string | number | null | undefined,
) => {
  const hasText = text !== null && text !== undefined && text.trim() !== "";
  const hasCode =
    code !== null && code !== undefined && String(code).trim() !== "";
  return hasText ? (
    <>
      {text}
      {hasCode && <span className={styles.secondaryCode}>Код: {code}</span>}
    </>
  ) : (
    displayValue(code)
  );
};
