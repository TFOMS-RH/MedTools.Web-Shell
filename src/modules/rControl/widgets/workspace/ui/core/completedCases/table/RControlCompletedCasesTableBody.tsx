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
      <div
        className="mt-table-viewport mt-table-viewport--scrollable"
        tabIndex={0}
        role="region"
        aria-label="Законченные случаи, прокручиваемая таблица"
      >
        <table className={`mt-table ${tableStyles.table}`}>
          <colgroup>
            <col className={tableStyles.numberColumn} />
            <col className={tableStyles.numberColumn} />
            <col className={tableStyles.nameColumn} />
            <col className={tableStyles.nameColumn} />
            <col className={tableStyles.nameColumn} />
            <col className={tableStyles.conditionColumn} />
            <col className={tableStyles.seriesColumn} />
            <col className={tableStyles.policyColumn} />
            <col className={tableStyles.amountColumn} />
            <col className={tableStyles.amountColumn} />
            <col className={tableStyles.amountColumn} />
          </colgroup>
          <thead>
            <tr>
              <th scope="col" title="Номер позиции">
                № поз.
              </th>
              <th scope="col" title="Номер записи">
                № зап.
              </th>
              <th scope="col" title="Фамилия пациента">
                Фамилия
              </th>
              <th scope="col" title="Имя пациента">
                Имя
              </th>
              <th scope="col" title="Отчество пациента">
                Отчество
              </th>
              <th scope="col" title="Условия оказания медицинской помощи">
                Усл. ок.
              </th>
              <th scope="col" title="Серия страхового полиса">
                С. полиса
              </th>
              <th scope="col" title="Номер страхового полиса">
                Н. полиса
              </th>
              <th
                scope="col"
                title="Предъявленная сумма"
                className={tableStyles.amount}
              >
                Предъявлено
              </th>
              <th
                scope="col"
                title="Принятая сумма"
                className={tableStyles.amount}
              >
                Принято
              </th>
              <th
                scope="col"
                title="Сумма, принятая СМО"
                className={tableStyles.amount}
              >
                Принято СМО
              </th>
            </tr>
          </thead>
          <tbody>
            {isPending ? (
              <TableSkeleton columns={11} rows={pageSize} />
            ) : (
              completedCases.map((completedCase) => (
                <tr
                  className={`mt-table__row--interactive ${
                    completedCase.completedCaseUid === selectedCompletedCaseUid
                      ? "mt-table__row--selected"
                      : ""
                  }`}
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
                  <td className={tableStyles.identifier}>
                    {completedCase.entryNumber}
                  </td>
                  <td className={tableStyles.personName}>
                    {completedCase.patientLastName}
                  </td>
                  <td className={tableStyles.personName}>
                    {completedCase.patientFirstName}
                  </td>
                  <td className={tableStyles.personName}>
                    {completedCase.patientMiddleName}
                  </td>
                  <td>{`${completedCase.medicalCareConditionsCode} : ${completedCase.medicalCareConditionsName}`}</td>
                  <td className={tableStyles.identifier}>
                    {formatNullableValue(completedCase.insurancePolicySeries)}
                  </td>
                  <td className={tableStyles.identifier}>
                    {completedCase.insurancePolicyNumber}
                  </td>
                  <td className={tableStyles.amount}>
                    {formatCurrency(completedCase.amountBilled)}
                  </td>
                  <td className={tableStyles.amount}>
                    {formatCurrency(completedCase.approvedAmount)}
                  </td>
                  <td className={tableStyles.amount}>
                    {formatCurrency(
                      completedCase.insuranceCompanyApprovedAmount,
                    )}
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
