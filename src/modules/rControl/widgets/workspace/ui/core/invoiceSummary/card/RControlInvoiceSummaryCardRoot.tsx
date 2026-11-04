import { useRControlWorkspacePanelStore } from "../../../../model/store/useRControlWorkspacePanelStore";
import { useRControlWorkspaceStore } from "../../../../model/store/useRControlWorkspaceStore";
import { resolveDataState } from "../../../../../../../../shared/helpers/resolveDataState";
import { DataState } from "../../../../../../../../shared/ui/DataState/DataState";
import { useInvoiceSummaryQuery } from "../../../../../../../../shared/model/queries/invoiceStructure/invoices/useInvoiceSummaryQuery";
import { RControlInvoiceSummaryCardHeader } from "./RControlInvoiceSummaryCardHeader";
import { RControlInvoiceSummaryCardBody } from "./RControlInvoiceSummaryCardBody";
import styles from "./styles.module.scss";

export const RControlInvoiceSummaryCardRoot = ({ invoiceNumber }: { invoiceNumber?: string; }) => {
  const { targetDb } = useRControlWorkspacePanelStore();
  const { selectedInvoiceUid } = useRControlWorkspaceStore();
  const {
    data: invoiceSummary,
    isLoading,
    isPending,
    isError,
    isSuccess,
    error,
  } = useInvoiceSummaryQuery(selectedInvoiceUid, targetDb);

  const dataState = resolveDataState({
    isEnabled: selectedInvoiceUid !== null && targetDb !== null,
    isError,
    isLoading,
    isSuccess,
    isEmpty: invoiceSummary === null && isSuccess,
  });

  if (selectedInvoiceUid === null) return null;

  return (
    <section className={styles.summary} aria-labelledby="rcontrol-invoice-summary-title" aria-busy={isLoading}>
      <RControlInvoiceSummaryCardHeader invoiceNumber={invoiceNumber} invoiceUid={selectedInvoiceUid} />
      {dataState === "error" ? (
        <DataState
          title="Ошибка данных"
          description={error?.message ?? "Неизвестная ошибка"}
          variant="error"
        />
      ) : dataState === "empty" ? (
        <DataState
          title="Данных не найдено"
          description="Подробных данных о счете не найдено"
          variant="empty"
        />
      ) : (
        <RControlInvoiceSummaryCardBody
          invoiceSummary={invoiceSummary!}
          isPending={isPending}
        />
      )}
    </section>
  );
};
