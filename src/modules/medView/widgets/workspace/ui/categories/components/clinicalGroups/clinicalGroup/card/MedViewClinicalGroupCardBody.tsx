import type { ReactNode } from "react";
import type { ClinicalGroupDto } from "../../../../../../../../../../shared/model/types/invoiceStructure/results/clinicalGroup/GetClinicalGroupResult";
import { Skeleton } from "@mui/material";
import { displayValue } from "../../presentation";
import styles from "../../styles.module.scss";

interface MedViewClinicalGroupCardBodyProps {
  clinicalGroup: ClinicalGroupDto;
  isPending: boolean;
}

export const MedViewClinicalGroupCardBody = ({
  clinicalGroup,
  isPending,
}: MedViewClinicalGroupCardBodyProps) => {
  const identityFields: [string, ReactNode][] = [
    ["КСГ", displayValue(clinicalGroup?.clinicalStatisticalGroupNumber)],
    ["Расчётная КСГ", displayValue(clinicalGroup?.calculatedClinicalStatisticalGroupNumber)],
    ["КПГ", displayValue(clinicalGroup?.clinicalProfileGroupNumber)],
    ["Модель определения КСГ", displayValue(clinicalGroup?.clinicalStatisticalGroupModelVersion)],
    ["Использование подгруппы КСГ", clinicalGroup?.isCsgSubgroupUsed ? "Да" : "Нет"],
    ["Использование КСЛП", clinicalGroup?.isClspUsed ? "Да" : "Нет"],
  ];
  const coefficientFields: [string, ReactNode][] = [
    ["Коэффициент затратоёмкости", displayValue(clinicalGroup?.costCoefficient)],
    ["Коэффициент управления", displayValue(clinicalGroup?.managementCoefficient)],
    ["Базовая ставка", displayValue(clinicalGroup?.baseRate)],
    ["Коэффициент дифференциации", displayValue(clinicalGroup?.differentiationCoefficient)],
    ["Коэффициент уровня", displayValue(clinicalGroup?.levelCoefficient)],
    ["Применённый КСЛП", displayValue(clinicalGroup?.complexityCoefficient)],
  ];

  return (
    <div className={styles.groups} aria-busy={isPending}>
      <div className={styles.informationGroup}>
        <h4 className={styles.groupHeading}>Номера, модель и признаки</h4>
        <dl className={styles.fields}>
          {identityFields.map(([label, value]) => (
            <div key={label}><dt>{label}</dt><dd>{isPending ? <Skeleton /> : value}</dd></div>
          ))}
        </dl>
      </div>
      <div className={styles.informationGroup}>
        <h4 className={styles.groupHeading}>Коэффициенты и базовая ставка</h4>
        <dl className={styles.fields}>
          {coefficientFields.map(([label, value]) => (
            <div key={label}><dt>{label}</dt><dd>{isPending ? <Skeleton /> : value}</dd></div>
          ))}
        </dl>
      </div>
    </div>
  );
};
