import styles from "./styles.module.scss";
import { MedViewCompletedCasesTableBody } from "./MedViewCompletedCasesTableBody";
import { useMedViewWorkspaceStore } from "../../../../model/stores/useMedViewWorkspaceStore";
import { useMedViewFiltersStore } from "../../../../../filters/model/stores/useMedViewFiltersStore";
import { useCompletedCasesQuery } from "../../../../model/queries/useCompletedCasesQuery";
import { resolveDataState } from "../../../../../../../../shared/helpers/resolveDataState";
import { MedViewCompletedCasesTableHeader } from "./MedViewCompletedCasesTableHeader";
import { Divider } from "../../../../../../../../components/ui/Divider/Divider";
import { DataState } from "../../../../../../../../shared/ui/DataState/DataState";
import { lazy, Suspense } from "react";

const MedViewCompletedCasesTablePreview = import.meta.env.DEV
  ? lazy(() => import("./MedViewCompletedCasesTablePreview"))
  : null;

export const MedViewCompletedCasesTableRoot = () => {
  if (
    MedViewCompletedCasesTablePreview &&
    new URLSearchParams(window.location.search).get("demoTable") === "1"
  ) {
    return (
      <Suspense fallback={null}>
        <MedViewCompletedCasesTablePreview />
      </Suspense>
    );
  }

  return <MedViewCompletedCasesTable />;
};

const MedViewCompletedCasesTable = () => {
  const {
    completedCasePaginationState,
    setCompletedCasesTablePagination,
    selectedCompletedCaseUid,
    selectCompletedCase,
  } = useMedViewWorkspaceStore();

  const { appliedFilters, targetDb } = useMedViewFiltersStore();
  const {
    data: getCompletedCasesResult,
    isPending,
    isLoading,
    isError,
    isSuccess,
    isFetching,
    error,
  } = useCompletedCasesQuery(
    appliedFilters,
    completedCasePaginationState,
    targetDb,
  );

  const completedCases = getCompletedCasesResult?.completedCases ?? [];

  const dataState = resolveDataState({
    isEnabled: appliedFilters !== null,
    isEmpty: completedCases.length === 0 && !isLoading,
    isError: isError,
    isLoading: isLoading,
    isSuccess: isSuccess,
    isFetching: isFetching,
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

  return (
    <section className={styles.CompletedCasesTableRoot}>
      <MedViewCompletedCasesTableHeader
        totalCount={getCompletedCasesResult?.totalCount ?? 0}
        pagination={completedCasePaginationState}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
        disabled={isFetching}
        isLoading={isLoading}
      />
      <Divider />

      <div className={styles.content}>
        {dataState === "waiting" ? (
          <DataState
            variant="waiting"
            title="Примените фильтры"
            description="Просто укажите по каким полям будем искать случаи"
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
            description="Нет данных по текущим фильтрам"
          />
        ) : (
          <MedViewCompletedCasesTableBody
            isPending={isPending}
            completedCases={completedCases}
            totalCount={completedCasePaginationState.pageSize}
            selectCompletedCase={selectCompletedCase}
            selectedCompletedCaseUid={selectedCompletedCaseUid}
          />
        )}
      </div>
    </section>
  );
};
