import type { CompletedCaseListItemDto } from "../../../../../../../../shared/model/types/invoiceStructure/results/medicalCases/CompletedCaseListItemDto";
import { formatCurrency } from "../../../../../../../../shared/helpers/formatCurrency";
import { formatNullableValue } from "../../../../../../../../shared/helpers/formatNullableValue";
import { TableSkeleton } from "../../../../../../../../shared/ui/TableSkeleton/TableSkeleton";
import styles from "./styles.module.scss";
import { displayDateOnly } from "../../../../../../../rControl/widgets/workspace/ui/categories/components/prescriptions/presentation";
import { displayValue } from "../../../categories/components/oncology/presentation";

interface MedViewCompletedCasesTableBodyProps {
  completedCases: CompletedCaseListItemDto[];
  isPending: boolean;
  totalCount: number;
  selectedCompletedCaseUid: number | null;
  selectCompletedCase: (completedCaseUid: number | null) => void;
}

export const MedViewCompletedCasesTableBody = ({
  completedCases,
  isPending,
  totalCount,
  selectedCompletedCaseUid,
  selectCompletedCase,
}: MedViewCompletedCasesTableBodyProps) => {
  return (
    <div className="mt-table-viewport mt-table-viewport--scrollable">
      <table className={`mt-table ${styles.table}`}>
        <colgroup>
          <col className={styles.nameColumn} />
          <col className={styles.nameColumn} />
          <col className={styles.nameColumn} />
          <col className={styles.dateColumn} />
          <col className={styles.dateColumn} />
          <col className={styles.orgColumn} />
          <col className={styles.orgColumn} />
          <col className={styles.conditionColumn} />
          <col className={styles.seriesColumn} />
          <col className={styles.policyColumn} />
          <col className={styles.amountColumn} />
          <col className={styles.amountColumn} />
          <col className={styles.amountColumn} />
        </colgroup>
        <thead>
          <tr>
            <th scope="col" title="Фамилия пациента">
              Фамилия
            </th>
            <th scope="col" title="Имя пациента">
              Имя
            </th>
            <th scope="col" title="Отчество пациента">
              Отчество
            </th>
            <th scope="col" title="Лечение с">
              Лечение с
            </th>
            <th scope="col" title="Лечение по">
              Лечение по
            </th>
            <th scope="col" title="МО">
              Код МО
            </th>
            <th scope="col" title="СМО">
              Код СМО
            </th>
            <th scope="col" title="Условия оказания медицинской помощи">
              Усл. ок.
            </th>
            <th scope="col" title="Серия полиса">
              С. полиса
            </th>
            <th scope="col" title="Номер полиса">
              Н. полиса
            </th>
            <th
              scope="col"
              title="Предъявлено к оплате"
              className={styles.amount}
            >
              Предъявлено
            </th>
            <th scope="col" title="Принято к оплате" className={styles.amount}>
              Принято
            </th>
            <th
              scope="col"
              title="Принято страховой медицинской организацией"
              className={styles.amount}
            >
              Принято СМО
            </th>
          </tr>
        </thead>
        <tbody>
          {isPending ? (
            <TableSkeleton columns={11} rows={totalCount} />
          ) : (
            completedCases.map((completedCase) => (
              <tr
                className={`mt-table__row--interactive${
                  completedCase.completedCaseUid === selectedCompletedCaseUid
                    ? " mt-table__row--selected"
                    : ""
                }`}
                onClick={() =>
                  selectCompletedCase(completedCase.completedCaseUid)
                }
                key={completedCase.completedCaseUid}
              >
                <td className={styles.personName}>
                  {completedCase.patientLastName}
                </td>
                <td className={styles.personName}>
                  {completedCase.patientFirstName}
                </td>
                <td className={styles.personName}>
                  {completedCase.patientMiddleName}
                </td>
                <td className={styles.date}>
                  {displayDateOnly(completedCase.treatmentStartDate)}
                </td>
                <td className={styles.date}>
                  {displayDateOnly(completedCase.treatmentStartDate)}
                </td>
                <td className={styles.org}>
                  {displayValue(completedCase.medicalOrganizationCode)}
                </td>
                <td className={styles.date}>
                  {displayValue(completedCase.insuranceOrganizationCode)}
                </td>
                <td
                  className={styles.identifier}
                >{`${completedCase.medicalCareConditionsCode}`}</td>
                <td className={styles.identifier}>
                  {formatNullableValue(completedCase.insurancePolicySeries)}
                </td>
                <td className={styles.identifier}>
                  {completedCase.insurancePolicyNumber}
                </td>
                <td className={styles.amount}>
                  {formatCurrency(completedCase.amountBilled)}
                </td>
                <td className={styles.amount}>
                  {formatCurrency(completedCase.approvedAmount)}
                </td>
                <td className={styles.amount}>
                  {formatCurrency(completedCase.insuranceCompanyApprovedAmount)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
