import type { TreatmentComplexityCoefficientDto } from "../../../../../../../../../../shared/model/types/invoiceStructure/results/clinicalGroup/GetTreatmentComplexityCoefficientsResult";
import { TableSkeleton } from "../../../../../../../../../../shared/ui/TableSkeleton/TableSkeleton";
import { displayValue } from "../../presentation";
import styles from "./styles.module.scss";

interface MedViewTreatmentCoefficientsListBodyProps {
  treatmentComplexityCoefficients: TreatmentComplexityCoefficientDto[];
  isPending: boolean;
}

export const MedViewTreatmentCoefficientsListBody = ({
  treatmentComplexityCoefficients,
  isPending,
}: MedViewTreatmentCoefficientsListBodyProps) => (
  <div className="mt-table-viewport" role="region" aria-label="Таблица коэффициентов сложности лечения" tabIndex={0} aria-busy={isPending}>
    <table className={`mt-table ${styles.coefficientsTable}`} aria-labelledby="medview-csg-coefficients-heading">
      <colgroup><col /><col className={styles.valueColumn} /></colgroup>
      <thead><tr><th scope="col">Номер</th><th scope="col" className={styles.numeric}>Значение</th></tr></thead>
      <tbody>
        {isPending ? <TableSkeleton columns={2} rows={2} /> : treatmentComplexityCoefficients.map((coefficient) => (
          <tr key={coefficient.treatmentComplexityCoefficientUid} className="noneHover">
            <td>{displayValue(coefficient.complexityCoefficientNumber)}</td>
            <td className={styles.numeric}>{displayValue(coefficient.complexityCoefficientValue)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
