import styles from "../../styles.module.scss";
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
    <div className="tableContainer">
      <table>
        <thead>
          <tr>
            <th>№ счета</th>
            <th>Дата счета</th>
            <th>Сумма счета</th>
            <th>Случаев</th>
            <th className="thCenter">Статус</th>
          </tr>
        </thead>
        <tbody>
          {isPending ? (
            <TableSkeleton columns={5} rows={pageSize} />
          ) : (
            invoices.map((invoice) => (
              <tr
                className={
                  invoice.invoiceUid === selectedInvoiceUid ? "selectedRow" : ""
                }
                key={invoice.invoiceUid}
                onClick={() => selectInvoice(invoice.invoiceUid)}
              >
                <td>
                  <button
                    type="button"
                    className={styles.rowSelectButton}
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
                <td>{dayjs(invoice.billingDate).format("DD.MM.YYYY")}</td>
                <td>{formatCurrency(invoice.amount)}</td>
                <td>{invoice.medicalCasesCount}</td>
                <td className="tdCenter">{invoice.status}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
