import { useRControlWorkspacePanelStore } from "../../../../model/store/useRControlWorkspacePanelStore";
import { useRControlWorkspaceStore } from "../../../../model/store/useRControlWorkspaceStore";
import { resolveDataState } from "../../../../../../../../shared/helpers/resolveDataState";
import { DataState } from "../../../../../../../../shared/ui/DataState/DataState";
import { useInvoiceSummaryQuery } from "../../../../../../../../shared/model/queries/invoiceStructure/invoices/useInvoiceSummaryQuery";
import { RControlInvoiceSummaryCardHeader } from "./RControlInvoiceSummaryCardHeader";
import { RControlInvoiceSummaryCardBody } from "./RControlInvoiceSummaryCardBody";

export const RControlInvoiceSummaryCardRoot = () => {
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

  return (
    <article
      className="cardRoot"
      style={{ flexDirection: "column", alignSelf: "flex-start" }}
    >
      <RControlInvoiceSummaryCardHeader />
      {dataState === "waiting" ? (
        <DataState
          title="Выберите счет"
          description="После выбора счета появится детальная информация"
          variant="waiting"
        />
      ) : dataState === "error" ? (
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
    </article>
  );
};
