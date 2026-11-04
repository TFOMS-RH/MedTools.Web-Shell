import styles from "../../../styles.module.scss";
import { formatDate } from "../../../../../../../../../../../shared/helpers/formatDate";
import type { InjectionDto } from "../../../../../../../../../../../shared/model/types/invoiceStructure/results/oncology/GetInjectionsResult";
import { TableSkeleton } from "../../../../../../../../../../../shared/ui/TableSkeleton/TableSkeleton";
import { formatNullableValue } from "../../../../../../../../../../../shared/helpers/formatNullableValue";
import { formatCurrency } from "../../../../../../../../../../../shared/helpers/formatCurrency";

interface RControlInjectionsTableBodyProps {
  injections: InjectionDto[];
  isPending: boolean;
}

export const RControlInjectionsTableBody = ({
  injections,
  isPending,
}: RControlInjectionsTableBodyProps) => {
  return (
    <div
      className={"mt-table-viewport " + styles.tableViewport}
      role="region"
      aria-label="Таблица инъекций"
      tabIndex={0}
    >
      <table
        className={`mt-table ${styles.injectionsTable}`}
        aria-label="Инъекции"
      >
        <thead>
          <tr>
            <th scope="col">Дата инъекции</th>
            <th scope="col" className={styles.numeric}>
              Количество введённого лекарственного препарата
            </th>
            <th scope="col" className={styles.numeric}>
              Количество израсходованного лекарственного препарата
            </th>
            <th scope="col" className={styles.numeric}>
              Фактическая стоимость лекарственного препарата
            </th>
            <th scope="col" className={styles.numeric}>
              Стоимость введённого лекарственного препарата
            </th>
            <th scope="col" className={styles.numeric}>
              Стоимость израсходованного лекарственного препарата
            </th>
            <th scope="col">Применение редукции</th>
          </tr>
        </thead>
        <tbody>
          {isPending ? (
            <TableSkeleton columns={7} rows={5} />
          ) : (
            injections.map((injection) => (
              <tr key={injection.injectionUid} className="noneHover">
                <td>{formatDate(injection.administrationDate)}</td>
                <td className={styles.numeric}>
                  {formatNullableValue(injection.administeredQuantity)}
                </td>
                <td className={styles.numeric}>
                  {formatNullableValue(injection.consumedQuantity)}
                </td>
                <td className={styles.numeric}>
                  {formatCurrency(injection.unitCost)}
                </td>
                <td className={styles.numeric}>
                  {formatCurrency(injection.administeredCost)}
                </td>
                <td className={styles.numeric}>
                  {formatCurrency(injection.consumedCost)}
                </td>
                <td>
                  {injection.isReductionApplied === null
                    ? "-"
                    : injection.isReductionApplied
                      ? "Да"
                      : "Нет"}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
