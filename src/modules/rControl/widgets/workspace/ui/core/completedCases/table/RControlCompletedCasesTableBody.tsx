import styles from "../../styles.module.scss";
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
    <div className="tableContainer">
      <table>
        <colgroup>
          <col style={{ width: "1.5rem" }} />
          <col style={{ width: "1.5rem" }} />
          <col style={{ width: "3rem" }} />
          <col style={{ width: "3rem" }} />
          <col style={{ width: "3rem" }} />
          <col style={{ width: "1.5rem" }} />
          <col style={{ width: "3rem" }} />
          <col style={{ width: "3rem" }} />
          <col style={{ width: "2rem" }} />
          <col style={{ width: "2rem" }} />
          <col style={{ width: "2rem" }} />
        </colgroup>
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
            <th>Предъявлено</th>
            <th>Принято</th>
            <th>Принято СМО</th>
          </tr>
        </thead>
        <tbody>
          {isPending ? (
            <TableSkeleton columns={11} rows={pageSize} />
          ) : (
            completedCases.map((completedCase) => (
              <tr
                className={
                  completedCase.completedCaseUid === selectedCompletedCaseUid
                    ? "selectedRow"
                    : ""
                }
                key={completedCase.completedCaseUid}
                onClick={() =>
                  selectCompletedCase(completedCase.completedCaseUid)
                }
              >
                <td>
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
                <td>{completedCase.entryNumber}</td>
                <td>{completedCase.patientLastName}</td>
                <td>{completedCase.patientFirstName}</td>
                <td>{completedCase.patientMiddleName}</td>
                <td>{completedCase.medicalCareConditions}</td>
                <td>
                  {formatNullableValue(completedCase.insurancePolicySeries)}
                </td>
                <td>{completedCase.insurancePolicyNumber}</td>
                <td>{formatCurrency(completedCase.amountBilled)}</td>
                <td>{formatCurrency(completedCase.approvedAmount)}</td>
                <td>
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
