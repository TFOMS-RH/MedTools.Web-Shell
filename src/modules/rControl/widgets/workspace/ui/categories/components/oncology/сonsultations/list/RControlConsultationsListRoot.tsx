import styles from "../../styles.module.scss";
import { DataState } from "../../../../../../../../../../shared/ui/DataState/DataState";
import { useConsultationsQuery } from "../../../../../../../../../../shared/model/queries/invoiceStructure/oncology/useConsultationsQuery";
import { useRControlWorkspaceStore } from "../../../../../../model/store/useRControlWorkspaceStore";
import { useRControlWorkspacePanelStore } from "../../../../../../model/store/useRControlWorkspacePanelStore";
import { RControlConsultationsListHeader } from "./RControlConsultationsListHeader";
import { RControlConsultationsListBody } from "./RControlConsultationsListBody";
import { resolveDataState } from "../../../../../../../../../../shared/helpers/resolveDataState";

export const RControlConsultationsListRoot = () => {
  const { selectedMedicalCaseUid } = useRControlWorkspaceStore();
  const { targetDb } = useRControlWorkspacePanelStore();
  const {
    data: consultations,
    isPending,
    isLoading,
    isError,
    isSuccess,
    error,
  } = useConsultationsQuery(selectedMedicalCaseUid, targetDb);

  const dataState = resolveDataState({
    isEnabled: selectedMedicalCaseUid !== null && targetDb !== null,
    isLoading: isLoading,
    isEmpty: consultations?.length === 0 && isSuccess,
    isError: isError,
    isSuccess: isSuccess,
  });

  return (
    <section className={styles.panel}>
      <RControlConsultationsListHeader />
      {dataState === "error" ? (
        <DataState
          title="Ошибка данных"
          description={error?.message ?? "Неизвестная ошибка"}
          variant="error"
        />
      ) : dataState === "empty" ? (
        <DataState
          title="Данных не найдено"
          description="Данный медицинский случай не содержит информации о консилиумах"
          variant="empty"
        />
      ) : (
        <RControlConsultationsListBody
          consultations={consultations ?? []}
          isPending={isPending}
        />
      )}
    </section>
  );
};
