import styles from "../../styles.module.scss";
import tableStyles from "./styles.module.scss";
import type { CompletedCaseListItemDto } from "../../../../../../../../shared/model/types/invoiceStructure/results/medicalCases/GetCompletedCaseListItemsResult";
import { formatCurrency } from "../../../../../../../../shared/helpers/formatCurrency";
import { formatNullableValue } from "../../../../../../../../shared/helpers/formatNullableValue";
import { TableSkeleton } from "../../../../../../../../shared/ui/TableSkeleton/TableSkeleton";

interface RControlCompletedCasesTableBodyProps {
  completedCases: CompletedCaseListItemDto[];
  isPending: boolean;
  pageSize: number;
  selectedCompletedCaseUid: number | null;
  selectCompletedCase: (completedCaseUid: number | null) => void;
}

export const RControlCompletedCasesTableBody = ({
  completedCases,
  selectedCompletedCaseUid,
  isPending,
  pageSize,
  selectCompletedCase,
}: RControlCompletedCasesTableBodyProps) => {
  return (
    <div className={tableStyles.tableContent}>
      <div className="mt-table-viewport" tabIndex={0} role="region" aria-label="Законченные случаи, прокручиваемая таблица">
        <table className={`mt-table ${tableStyles.table}`}>
          <thead>
            <tr>
              <th>№ поз.</th>
              <th>№ зап.</th>
              <th>Фамилия</th>
              <th>Имя</th>
              <th>Отчество</th>
              <th>Усл. ок.</th>
              <th>С. полиса</th>
              <th>Н. полиса</th>
              <th className={tableStyles.amount}>Предъявлено</th>
              <th className={tableStyles.amount}>Принято</th>
              <th className={tableStyles.amount}>Принято СМО</th>
            </tr>
          </thead>
          <tbody>
            {isPending ? (
              <TableSkeleton columns={11} rows={pageSize} />
            ) : (
              completedCases.map((completedCase) => (
                <tr
                  className={
                    `mt-table__row--interactive ${completedCase.completedCaseUid === selectedCompletedCaseUid
                      ? "mt-table__row--selected" : ""}`
                  }
                  key={completedCase.completedCaseUid}
                  onClick={() =>
                    selectCompletedCase(completedCase.completedCaseUid)
                  }
                >
                  <td className={tableStyles.identifier}>
                    <button
                      type="button"
                      className={styles.rowSelectButton}
                      aria-label={`Выбрать законченный случай ${completedCase.entryNumber}: ${completedCase.patientLastName} ${completedCase.patientFirstName} ${completedCase.patientMiddleName}`}
                      aria-pressed={
                        selectedCompletedCaseUid ===
                        completedCase.completedCaseUid
                      }
                      onClick={(event) => {
                        event.stopPropagation();
                        selectCompletedCase(completedCase.completedCaseUid);
                      }}
                    >
                      {completedCase.entryPositionNumber}
                    </button>
                  </td>
                  <td className={tableStyles.identifier}>{completedCase.entryNumber}</td>
                  <td className={tableStyles.personName}>{completedCase.patientLastName}</td>
                  <td className={tableStyles.personName}>{completedCase.patientFirstName}</td>
                  <td className={tableStyles.personName}>{completedCase.patientMiddleName}</td>
                  <td>{completedCase.medicalCareConditions}</td>
                  <td className={tableStyles.identifier}>
                    {formatNullableValue(completedCase.insurancePolicySeries)}
                  </td>
                  <td className={tableStyles.identifier}>{completedCase.insurancePolicyNumber}</td>
                  <td className={tableStyles.amount}>{formatCurrency(completedCase.amountBilled)}</td>
                  <td className={tableStyles.amount}>{formatCurrency(completedCase.approvedAmount)}</td>
                  <td className={tableStyles.amount}>
                    {formatCurrency(completedCase.insuranceCompanyApprovedAmount)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
