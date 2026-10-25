import type { OncologyCaseDto } from "../../../../../../../../../../shared/model/types/invoiceStructure/results/oncology/GetOncologyCaseResult";
import { Skeleton } from "@mui/material";
import styles from "../../styles.module.scss";
import { displayValue, codeDescription } from "../../presentation";

export const RControlOncologyCaseCardBody = ({
  oncologyCase: c,
  isPending,
}: {
  oncologyCase: OncologyCaseDto;
  isPending: boolean;
}) => {
  const fields = [
    [
      "Повод обращения",
      codeDescription(c?.referralReason, c?.referralReasonCode),
    ],
    ["Стадия заболевания", codeDescription(c?.stage, c?.stageCode)],
    ["Значение Tumor", displayValue(c?.tumorValue)],
    ["Значение Nodus", displayValue(c?.nodusValue)],
    ["Значение Metastatsis", displayValue(c?.metastasisValue)],
    [
      "Выявления метастазов",
      c?.isMetastasisDetected == null
        ? "—"
        : c.isMetastasisDetected
          ? "Да"
          : "Нет",
    ],
    ["Суммарная очаговая доза", displayValue(c?.totalFocusDose)],
  ] as const;
  return (
    <dl className={styles.fields}>
      {fields.map(([label, value], index) => (
        <div key={label} className={index < 2 ? styles.wideField : undefined}>
          <dt>{label}</dt>
          <dd>{isPending ? <Skeleton /> : value}</dd>
        </div>
      ))}
    </dl>
  );
};
