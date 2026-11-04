import { resolveDataState } from "../../../../../../../../../../shared/helpers/resolveDataState";
import { DataState } from "../../../../../../../../../../shared/ui/DataState/DataState";
import { usePrescriptionsQuery } from "../../../../../../../../../../shared/model/queries/invoiceStructure/prescriptions/usePrescriptionsQuery";
import { useRControlWorkspacePanelStore } from "../../../../../../model/store/useRControlWorkspacePanelStore";
import { useRControlWorkspaceStore } from "../../../../../../model/store/useRControlWorkspaceStore";
import { RControlPrescriptionCards } from "./RControlPrescriptionCards";
import styles from "../../styles.module.scss";

export const RControlPrescriptionCardsGroupRoot = () => {
  const { targetDb } = useRControlWorkspacePanelStore();
  const { selectedMedicalCaseUid } = useRControlWorkspaceStore();
  const {
    data: prescriptions,
    isLoading,
    isPending,
    isError,
    isSuccess,
    error,
  } = usePrescriptionsQuery(selectedMedicalCaseUid, targetDb);

  const dataState = resolveDataState({
    isEnabled: selectedMedicalCaseUid !== null && targetDb !== null,
    isLoading: isLoading,
    isError: isError,
    isSuccess: isSuccess,
    isEmpty: prescriptions?.length === 0 && isSuccess,
  });

  return (
    <section className={styles.section} aria-labelledby="rcontrol-prescriptions-heading">
      <h3 id="rcontrol-prescriptions-heading" className={styles.sectionHeading}>Назначения</h3>
      {dataState === "error" ? (
        <DataState
          title="Ошибка данных"
          description={error?.message ?? "Неизвестная ошибка"}
          variant="error"
        />
      ) : dataState === "empty" ? (
        <DataState
          title="Данных не найдено"
          description="Медицинский случай не содержит информации о назначениях"
          variant="empty"
        />
      ) : (
        <RControlPrescriptionCards
          prescriptions={prescriptions ?? []}
          isPending={isPending}
        />
      )}
    </section>
  );
};
