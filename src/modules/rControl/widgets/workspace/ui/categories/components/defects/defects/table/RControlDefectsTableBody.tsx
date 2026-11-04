import type { DefectDto } from "../../../../../../../../../../shared/model/types/invoiceStructure/results/defects/GetDefectsResult";
import { TableSkeleton } from "../../../../../../../../../../shared/ui/TableSkeleton/TableSkeleton";
import { displayValue } from "../../presentation";
import styles from "./styles.module.scss";

interface RControlDefectsTableBodyProps {
  defects: DefectDto[];
  pageSize: number;
  isPending: boolean;
}

export const RControlDefectsTableBody = ({
  defects,
  pageSize,
  isPending,
}: RControlDefectsTableBodyProps) => (
  <div className="mt-table-viewport" role="region" aria-label="Таблица дефектов" tabIndex={0} aria-busy={isPending}>
    <table className={`mt-table ${styles.defectsTable}`} aria-labelledby="rcontrol-defects-heading">
      <colgroup>
        <col className={styles.codeColumn} />
        <col />
      </colgroup>
      <thead>
        <tr>
          <th scope="col">Код</th>
          <th scope="col">Комментарий</th>
        </tr>
      </thead>
      <tbody>
        {isPending ? <TableSkeleton columns={2} rows={pageSize} /> : defects.map((defect) => (
          <tr key={defect.defectUid} className="noneHover">
            <td>{displayValue(defect.code)}</td>
            <td className={styles.comment}>{displayValue(defect.comment)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
