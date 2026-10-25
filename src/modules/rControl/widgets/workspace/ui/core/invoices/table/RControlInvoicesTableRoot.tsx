import { useRControlWorkspacePanelStore } from "../../../../model/store/useRControlWorkspacePanelStore";
import { useInvoiceListItemsQuery } from "../../../../../../../../shared/model/queries/invoiceStructure/invoices/useInvoiceListItemsQuery";
import { resolveDataState } from "../../../../../../../../shared/helpers/resolveDataState";
import { DataState } from "../../../../../../../../shared/ui/DataState/DataState";
import { Divider } from "../../../../../../../../components/ui/Divider/Divider";
import { useRControlWorkspaceStore } from "../../../../model/store/useRControlWorkspaceStore";
import { RControlInvoicesTableHeader } from "./RControlInvoicesTableHeader";
import { RControlInvoicesTableBody } from "./RControlInvoicesTableBody";
import styles from "./styles.module.scss";

export const RControlInvoicesTableRoot = () => {
  const {
    invoiceTableSearchString,
    invoicesTablePagination,
    setInvoicesTablePagination,
    selectInvoice,
    selectedInvoiceUid,
  } = useRControlWorkspaceStore();
  const {
    targetDb,
    selectedMedicalOrganization,
    selectedBillingYear,
    selectedBillingMonth,
  } = useRControlWorkspacePanelStore();

  const {
    data: getInvoicesResult,
    isPending,
    isLoading,
    isError,
    isSuccess,
    isFetching,
    error,
  } = useInvoiceListItemsQuery({
    medicalOrganizationCode: selectedMedicalOrganization,
    year: selectedBillingYear,
    month: selectedBillingMonth,
    page: invoicesTablePagination.page,
    pageSize: invoicesTablePagination.pageSize,
    targetDb: targetDb,
    searchString: invoiceTableSearchString,
  });

  const onPageChange = (
    _event: React.MouseEvent<HTMLButtonElement> | null,
    page: number,
  ) => {
    if (page >= 0) {
      setInvoicesTablePagination({ page: page });
    }
  };

  const onRowsPerPageChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const newPageSize = parseInt(event.target.value, 10);
    setInvoicesTablePagination({
      pageSize: newPageSize,
      page: 0,
    });
  };

  const invoices = getInvoicesResult?.invoices ?? [];

  const dataState = resolveDataState({
    isEnabled:
      selectedMedicalOrganization !== null &&
      selectedBillingYear !== null &&
      selectedBillingMonth !== null &&
      targetDb !== null,
    isLoading: isLoading,
    isFetching: isFetching,
    isError: isError,
    isSuccess: isSuccess,
    isEmpty: invoices.length === 0,
  });

  return (
    <section className={styles.invoicesTableRoot}>
      <RControlInvoicesTableHeader
        totalCount={getInvoicesResult?.recordsCount ?? 0}
        state={dataState}
        pagination={invoicesTablePagination}
        onRowsPerPageChange={onRowsPerPageChange}
        onPageChange={onPageChange}
        isLoading={isLoading}
        disabled={isFetching}
      />

      <Divider />

      {dataState === "waiting" ? (
        <DataState
          variant="waiting"
          title="Выберите источник данных и период"
          description="После выбора станет доступна таблица счетов"
        />
      ) : dataState === "error" ? (
        <DataState
          variant="error"
          title="Ошибка данных"
          description={error?.message ?? "Неизвестная ошибка"}
        />
      ) : dataState === "empty" ? (
        <DataState
          variant="empty"
          title="Данных не найдено"
          description="Нет найденных счетов за выбранный период"
        />
      ) : (
        <RControlInvoicesTableBody
          isPending={isPending}
          pageSize={invoicesTablePagination.pageSize}
          invoices={invoices}
          selectInvoice={selectInvoice}
          selectedInvoiceUid={selectedInvoiceUid}
        />
      )}
    </section>
  );
};
