import styles from "./styles.module.scss";
import commonStyles from "../../styles.module.scss";
import type { InvoiceListItemDto } from "../../../../../../../../shared/model/types/invoiceStructure/results/invoices/GetInvoiceListItemsResult";
import { formatCurrency } from "../../../../../../../../shared/helpers/formatCurrency";
import { TableSkeleton } from "../../../../../../../../shared/ui/TableSkeleton/TableSkeleton";
import dayjs from "dayjs";

interface RControlInvoicesTableBodyProps {
  invoices: InvoiceListItemDto[];
  selectedInvoiceUid: number | null;
  isPending: boolean;
  pageSize: number;
  selectInvoice: (invoiceUid: number | null) => void;
}

export const RControlInvoicesTableBody = ({
  invoices,
  selectedInvoiceUid,
  isPending,
  pageSize,
  selectInvoice,
}: RControlInvoicesTableBodyProps) => {
  return (
    <div className={styles.tableContent}>
      <div className="mt-table-viewport mt-table-viewport--scrollable" tabIndex={0} role="region" aria-label="Реестр счетов, прокручиваемая таблица">
        <table className={`mt-table ${styles.table}`}>
          <thead>
            <tr>
              <th>№ счета</th>
              <th>Дата счета</th>
              <th className={styles.amount}>Сумма счета</th>
              <th className={styles.center}>Случаев</th>
              <th className={styles.center}>Статус</th>
            </tr>
          </thead>
          <tbody>
            {isPending ? (
              <TableSkeleton columns={5} rows={pageSize} />
            ) : (
              invoices.map((invoice) => (
                <tr
                  className={
                    `mt-table__row--interactive ${invoice.invoiceUid === selectedInvoiceUid ? "mt-table__row--selected" : ""}`
                  }
                  key={invoice.invoiceUid}
                  onClick={() => selectInvoice(invoice.invoiceUid)}
                >
                  <td className={styles.identifier}>
                    <button
                      type="button"
                      className={commonStyles.rowSelectButton}
                      aria-label={`Выбрать счёт ${invoice.number} от ${dayjs(invoice.billingDate).format("DD.MM.YYYY")}`}
                      aria-pressed={selectedInvoiceUid === invoice.invoiceUid}
                      onClick={(event) => {
                        event.stopPropagation();
                        selectInvoice(invoice.invoiceUid);
                      }}
                    >
                      {invoice.number}
                    </button>
                  </td>
                  <td className={styles.identifier}>{dayjs(invoice.billingDate).format("DD.MM.YYYY")}</td>
                  <td className={styles.amount}>{formatCurrency(invoice.amount)}</td>
                  <td className={styles.center}>{invoice.medicalCasesCount}</td>
                  <td className={styles.center}>{invoice.status}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
