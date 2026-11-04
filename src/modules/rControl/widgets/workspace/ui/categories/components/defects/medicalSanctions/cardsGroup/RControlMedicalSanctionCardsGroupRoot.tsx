import { resolveDataState } from "../../../../../../../../../../shared/helpers/resolveDataState";
import { DataState } from "../../../../../../../../../../shared/ui/DataState/DataState";
import { useMedicalSanctionsQuery } from "../../../../../../../../../../shared/model/queries/invoiceStructure/defects/useMedicalSanctionsQuery";
import { useRControlWorkspacePanelStore } from "../../../../../../model/store/useRControlWorkspacePanelStore";
import { useRControlWorkspaceStore } from "../../../../../../model/store/useRControlWorkspaceStore";
import { RControlMedicalSanctionCards } from "./RControlMedicalSanctionCards";
import { RControlMedicalSanctionCardSkeletons } from "./RControlMedicalSanctionCardSkeletons";
import styles from "../../styles.module.scss";

export const RControlMedicalSanctionCardsGroupRoot = () => {
  const { targetDb } = useRControlWorkspacePanelStore();
  const { selectedMedicalCaseUid } = useRControlWorkspaceStore();
  const {
    data: medicalSanctions,
    isLoading,
    isPending,
    isError,
    isSuccess,
    error,
  } = useMedicalSanctionsQuery(selectedMedicalCaseUid, targetDb);

  const dataState = resolveDataState({
    isEnabled: selectedMedicalCaseUid !== null && targetDb !== null,
    isLoading: isLoading,
    isError: isError,
    isSuccess: isSuccess,
    isEmpty: medicalSanctions?.length === 0 && isSuccess,
  });

  return (
    <section
      className={styles.section}
      aria-labelledby="rcontrol-sanctions-heading"
    >
      <h3 id="rcontrol-sanctions-heading" className={styles.sectionHeading}>
        Санкции
      </h3>
      {dataState === "error" ? (
        <DataState
          title="Ошибка данных"
          description={error?.message ?? "Неизвестная ошибка"}
          variant="error"
        />
      ) : isLoading ? (
        <RControlMedicalSanctionCardSkeletons />
      ) : dataState === "empty" ? (
        <DataState
          title="Данных не найдено"
          description="Медицинский случай не содержит санкции"
          variant="empty"
        />
      ) : (
        <RControlMedicalSanctionCards
          isPending={isPending}
          medicalSanctions={medicalSanctions ?? []}
        />
      )}
    </section>
  );
};
