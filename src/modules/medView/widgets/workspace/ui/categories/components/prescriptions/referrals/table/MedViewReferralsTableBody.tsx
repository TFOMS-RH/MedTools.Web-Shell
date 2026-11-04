import type { ReferralDto } from "../../../../../../../../../../shared/model/types/invoiceStructure/results/prescriptions/GetReferralsResult";
import { TableSkeleton } from "../../../../../../../../../../shared/ui/TableSkeleton/TableSkeleton";
import { displayValue, formatReferralDate, renderReference } from "../../presentation";
import styles from "../../styles.module.scss";

interface MedViewReferralsTableBodyProps {
  referrals: ReferralDto[];
  isPending: boolean;
}

export const MedViewReferralsTableBody = ({
  referrals,
  isPending,
}: MedViewReferralsTableBodyProps) => (
  <div
    className={`mt-table-viewport ${styles.tableViewport}`}
    role="region"
    aria-label="Таблица направлений"
    tabIndex={0}
    aria-busy={isPending}
  >
    <table className={`mt-table ${styles.referralsTable}`} aria-labelledby="medview-referrals-heading">
      <colgroup>
        <col className={styles.organizationColumn} />
        <col className={styles.dateColumn} />
        <col className={styles.typeColumn} />
        <col className={styles.methodColumn} />
        <col />
      </colgroup>
      <thead>
        <tr>
          <th scope="col">Медицинская организация</th>
          <th scope="col">Дата направления</th>
          <th scope="col">Вид направления</th>
          <th scope="col">Метод диагностического лечения</th>
          <th scope="col">Мед. услуга в направлении</th>
        </tr>
      </thead>
      <tbody>
        {isPending ? (
          <TableSkeleton columns={5} rows={5} />
        ) : (
          referrals.map((referral) => (
            <tr key={referral.referralUid}>
              <td>{displayValue(referral.referredToMoCode)}</td>
              <td className={styles.dateValue}>{formatReferralDate(referral.referralDate)}</td>
              <td>{renderReference(referral.referralType, referral.referralTypeCode)}</td>
              <td>{renderReference(referral.diagnosticMethod, referral.diagnosticMethodCode)}</td>
              <td>{renderReference(referral.referredService, referral.referredServiceCode)}</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);
