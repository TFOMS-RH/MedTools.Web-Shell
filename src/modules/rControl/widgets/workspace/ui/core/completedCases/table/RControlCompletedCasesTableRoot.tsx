import { useRControlWorkspacePanelStore } from "../../../../model/store/useRControlWorkspacePanelStore";
import { useCompletedCaseListItemsQuery } from "../../../../../../../../shared/model/queries/invoiceStructure/completedCases/useCompletedCaseListItemsQuery";
import { RControlCompletedCasesTableBody } from "./RControlCompletedCasesTableBody";
import { RControlCompletedCasesTableHeader } from "./RControlCompletedCasesTableHeader";
import { useRControlWorkspaceStore } from "../../../../model/store/useRControlWorkspaceStore";
import { resolveDataState } from "../../../../../../../../shared/helpers/resolveDataState";
import { DataState } from "../../../../../../../../shared/ui/DataState/DataState";
import styles from "./styles.module.scss";

export const RControlCompletedCasesTableRoot = () => {
  const {
    completedCasesTablePagination,
    completedCasesTableSearchString,
    selectCompletedCase,
    setCompletedCasesTablePagination,
    selectedInvoiceUid,
    selectedCompletedCaseUid,
  } = useRControlWorkspaceStore();

  const { registerType } = useRControlWorkspacePanelStore();

  const {
    data: getCompletedCasesResult,
    isLoading,
    isPending,
    isFetching,
    isError,
    isSuccess,
    error,
  } = useCompletedCaseListItemsQuery({
    invoiceUid: selectedInvoiceUid,
    page: completedCasesTablePagination.page,
    pageSize: completedCasesTablePagination.pageSize,
    registerType: registerType,
    searchString: completedCasesTableSearchString,
  });

  const onPageChange = (
    _event: React.MouseEvent<HTMLButtonElement> | null,
    page: number,
  ) => {
    if (page >= 0) {
      setCompletedCasesTablePagination({
        page: page,
      });
    }
  };

  const onRowsPerPageChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const newPageSize = parseInt(event.target.value, 10);
    setCompletedCasesTablePagination({
      pageSize: newPageSize,
      page: 0,
    });
  };

  const completedCases = getCompletedCasesResult?.values ?? [];

  const dataState = resolveDataState({
    isEnabled: selectedInvoiceUid !== null && registerType !== null,
    isEmpty: completedCases.length === 0,
    isError: isError,
    isLoading: isLoading,
    isSuccess: isSuccess,
    isFetching: isFetching,
  });

  return (
    <section
      className={styles.CompletedCasesTableRoot}
      aria-labelledby="rcontrol-completed-heading"
    >
      <RControlCompletedCasesTableHeader
        totalCount={getCompletedCasesResult?.totalRecords ?? 0}
        state={dataState}
        pagination={completedCasesTablePagination}
        onRowsPerPageChange={onRowsPerPageChange}
        onPageChange={onPageChange}
        isLoading={isLoading}
        disabled={isFetching}
      />
      {dataState === "waiting" ? (
        <DataState
          variant="waiting"
          title="Выберите счет"
          description="Нажмите на строку в таблице счетов для просмотра законченных случаев"
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
          description="Законченные случаи не найдены по выбранному счету"
        />
      ) : (
        <RControlCompletedCasesTableBody
          isPending={isPending}
          pageSize={completedCasesTablePagination.pageSize}
          completedCases={completedCases}
          selectCompletedCase={selectCompletedCase}
          selectedCompletedCaseUid={selectedCompletedCaseUid}
        />
      )}
    </section>
  );
};
