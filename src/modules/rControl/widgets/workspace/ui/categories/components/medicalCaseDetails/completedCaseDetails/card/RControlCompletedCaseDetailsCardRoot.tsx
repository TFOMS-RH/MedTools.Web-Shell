import { resolveDataState } from "../../../../../../../../../../shared/helpers/resolveDataState";
import { DataState } from "../../../../../../../../../../shared/ui/DataState/DataState";
import { useCompletedCaseDetailsQuery } from "../../../../../../../../../../shared/model/queries/invoiceStructure/medicalCaseDetails/useCompletedCaseDetailsQuery";
import { useRControlWorkspacePanelStore } from "../../../../../../model/store/useRControlWorkspacePanelStore";
import { useRControlWorkspaceStore } from "../../../../../../model/store/useRControlWorkspaceStore";
import { RControlCompletedCaseDetailsCardHeader } from "./RControlCompletedCaseDetailsCardHeader";
import { RControlCompletedCaseDetailsCardBody } from "./RControlCompletedCaseDetailsCardBody";
import styles from "../../styles.module.scss";

export const CompletedCaseDetailsRoot = () => {
  const { targetDb } = useRControlWorkspacePanelStore();
  const { selectedCompletedCaseUid } = useRControlWorkspaceStore();
  const {
    data: completedCaseDetails,
    isLoading,
    isPending,
    isError,
    isSuccess,
    error,
  } = useCompletedCaseDetailsQuery(selectedCompletedCaseUid, targetDb);

  const dataState = resolveDataState({
    isEnabled: selectedCompletedCaseUid !== null && targetDb !== null,
    isLoading: isLoading,
    isError: isError,
    isSuccess: isSuccess,
    isEmpty: completedCaseDetails === null && isSuccess,
  });

  return (
    <section className={styles.caseSection} aria-labelledby="rcontrol-completed-details-heading">
      <RControlCompletedCaseDetailsCardHeader />
      {dataState === "error" ? (
        <DataState
          title="Ошибка данных"
          description={error?.message ?? "Неизвестная ошибка"}
          variant="error"
        />
      ) : dataState === "empty" ? (
        <DataState
          title="Данных не найдено"
          description="Медицинский случай не содержит информации о деталях законченного случая"
          variant="empty"
        />
      ) : (
        <RControlCompletedCaseDetailsCardBody
          completedCaseDetails={completedCaseDetails!}
          isPending={isPending}
        />
      )}
    </section>
  );
};
