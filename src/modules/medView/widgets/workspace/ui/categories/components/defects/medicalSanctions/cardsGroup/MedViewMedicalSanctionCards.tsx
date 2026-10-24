import type { ReactNode } from "react";
import type { MedicalSanctionDto } from "../../../../../../../../../../shared/model/types/invoiceStructure/results/defects/GetMedicalSanctionsResult";
import { formatCurrency } from "../../../../../../../../../../shared/helpers/formatCurrency";
import { displayValue, formatSanctionDate } from "../../presentation";
import styles from "./styles.module.scss";

interface MedViewMedicalSanctionCardsProps {
  medicalSanctions: MedicalSanctionDto[];
  isPending: boolean;
}

// Local shell keeps loaded records and skeleton columns aligned.
export const MedViewMedicalSanctionsTable = ({
  children,
  isPending = false,
}: { children: ReactNode; isPending?: boolean }) => (
  <div
    className={`mt-table-viewport ${styles.viewport}`}
    role="region"
    aria-label="Таблица санкций"
    tabIndex={0}
    aria-busy={isPending}
  >
    <table className={`mt-table ${styles.sanctionsTable}`} aria-labelledby="medview-sanctions-heading">
      <colgroup>
        <col />
        <col className={styles.refusalColumn} />
        <col className={styles.quantityColumn} />
        <col className={styles.amountColumn} />
        <col className={styles.actColumn} />
      </colgroup>
      <thead>
        <tr>
          <th scope="col">Тип санкции</th>
          <th scope="col">Код отказа</th>
          <th scope="col" className={styles.numeric}>Количество</th>
          <th scope="col" className={styles.numeric}>Сумма</th>
          <th scope="col">Акт экспертизы</th>
        </tr>
      </thead>
      {children}
    </table>
  </div>
);

export const MedViewMedicalSanctionCards = ({
  medicalSanctions,
}: MedViewMedicalSanctionCardsProps) => (
  <MedViewMedicalSanctionsTable>
    {medicalSanctions.map((sanction) => (
      <tbody key={sanction.medicalSanctionUid}>
        <tr className={`noneHover ${styles.mainRow}`}>
          <td>{displayValue(sanction.sanctionCode)}</td>
          <td>{displayValue(sanction.refusalReasonCode)}</td>
          <td className={styles.numeric}>{displayValue(sanction.unitsRemoved)}</td>
          <td className={styles.amount}>{formatCurrency(sanction.sanctionAmount)}</td>
          <td>
            <span className={styles.actNumber}>{displayValue(sanction.expertiseActNumber)}</span>
            <span className={styles.actDate}>{formatSanctionDate(sanction.expertiseActDate)}</span>
          </td>
        </tr>
        <tr className={`noneHover ${styles.detailsRow}`}>
          <td colSpan={5}>
            <div className={styles.detailsContent}>
              <dl className={styles.detailsGrid}>
                <div><dt>Год</dt><dd>{displayValue(sanction.year)}</dd></div>
                <div><dt>Месяц</dt><dd>{displayValue(sanction.month)}</dd></div>
                <div><dt>Дата загрузки</dt><dd>{formatSanctionDate(sanction.uploadDate)}</dd></div>
                <div><dt>Код врача</dt><dd>{displayValue(sanction.expertCode)}</dd></div>
              </dl>
              <dl className={styles.textFields}>
                <div><dt>Имя файла</dt><dd>{displayValue(sanction.filename)}</dd></div>
                <div className={styles.comment}><dt>Комментарий</dt><dd>{displayValue(sanction.comment)}</dd></div>
              </dl>
            </div>
          </td>
        </tr>
      </tbody>
    ))}
  </MedViewMedicalSanctionsTable>
);
