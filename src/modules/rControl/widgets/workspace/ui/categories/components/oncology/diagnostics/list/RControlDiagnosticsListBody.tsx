import type { DiagnosticListItemDto } from "../../../../../../../../../../shared/model/types/invoiceStructure/results/oncology/GetDiagnosticsResult";
import { TableSkeleton } from "../../../../../../../../../../shared/ui/TableSkeleton/TableSkeleton";
import { formatDate } from "../../../../../../../../../../shared/helpers/formatDate";
import { displayValue } from "../../presentation";
import styles from "../../styles.module.scss";

export const RControlDiagnosticsListBody = ({
  diagnosticRecords,
  isPending,
}: {
  diagnosticRecords: DiagnosticListItemDto[];
  isPending: boolean;
}) => (
  <div
    className={"mt-table-viewport " + styles.tableViewport}
    role="region"
    aria-label="Таблица диагностики"
    tabIndex={0}
  >
    <table
      className={"mt-table " + styles.diagnosticsTable}
      aria-label="Диагностика"
    >
      <thead>
        <tr>
          {[
            "Дата взятия материала",
            "Тип диагностики",
            "Код диагностики",
            "Код результата",
            "Результат",
          ].map((label) => (
            <th scope="col" key={label}>
              {label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {isPending ? (
          <TableSkeleton columns={5} rows={5} />
        ) : (
          diagnosticRecords.map((record) => (
            <tr key={record.diagnosticsUid}>
              <td>{formatDate(record.specimenCollectionDate)}</td>
              <td>{displayValue(record.diagnosticType)}</td>
              <td>{displayValue(record.diagnosticCode)}</td>
              <td>{displayValue(record.diagnosticResultCode)}</td>
              <td>
                {record.isResultReceived === null
                  ? "—"
                  : record.isResultReceived
                    ? "Положительный"
                    : "Отрицательный"}
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);
