import { resolveDataState } from "../../../../../../../../../../shared/helpers/resolveDataState";
import { DataState } from "../../../../../../../../../../shared/ui/DataState/DataState";
import { useDefectsQuery } from "../../../../../../../../../../shared/model/queries/invoiceStructure/defects/useDefectsQuery";
import { useRControlWorkspacePanelStore } from "../../../../../../model/store/useRControlWorkspacePanelStore";
import { useRControlWorkspaceStore } from "../../../../../../model/store/useRControlWorkspaceStore";
import { RControlDefectsTableHeader } from "./RControlDefectsTableHeader";
import { RControlDefectsTableBody } from "./RControlDefectsTableBody";
import styles from "../../styles.module.scss";

export const RControlDefectsTableRoot = () => {
  const { targetDb } = useRControlWorkspacePanelStore();
  const {
    selectedMedicalCaseUid,
    defectsTablePagination,
    setDefectsTablePagination,
  } = useRControlWorkspaceStore();
  const {
    data: getDefectsResult,
    isLoading,
    isPending,
    isFetching,
    isError,
    isSuccess,
    error,
  } = useDefectsQuery(
    selectedMedicalCaseUid,
    targetDb,
    defectsTablePagination.page,
    defectsTablePagination.pageSize,
  );

  const onPageChange = (
    _event: React.MouseEvent<HTMLButtonElement> | null,
    page: number,
  ) => {
    if (page >= 0) {
      setDefectsTablePagination({ page: page });
    }
  };

  const onRowsPerPageChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const pageSize = parseInt(event.target.value, 10);

    setDefectsTablePagination({
      pageSize: pageSize,
    });
  };

  const totalCount = getDefectsResult?.totalCount ?? 0;
  const defects = getDefectsResult?.defects ?? [];

  const dataState = resolveDataState({
    isEnabled: selectedMedicalCaseUid !== null && targetDb !== null,
    isLoading: isLoading,
    isError: isError,
    isSuccess: isSuccess,
    isEmpty: defects.length === 0 && isSuccess,
  });

  return (
    <section className={styles.section} aria-labelledby="rcontrol-defects-heading">
      <RControlDefectsTableHeader
        page={defectsTablePagination.page}
        pageSize={defectsTablePagination.pageSize}
        totalCount={totalCount}
        isFetching={isFetching}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
      />
      {dataState === "error" ? (
        <DataState
          title="Ошибка данных"
          description={error?.message ?? "Неизвестная ошибка"}
          variant="error"
        />
      ) : dataState === "empty" ? (
        <DataState
          title="Данных не найдено"
          description="Медицинский случай не содержит дефектов"
          variant="empty"
        />
      ) : (
        <RControlDefectsTableBody
          defects={defects}
          isPending={isPending}
          pageSize={defectsTablePagination.pageSize}
        />
      )}
    </section>
  );
};
