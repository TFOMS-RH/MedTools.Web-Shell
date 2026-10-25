import styles from "../../styles.module.scss";
import { resolveDataState } from "../../../../../../../../../../shared/helpers/resolveDataState";
import { DataState } from "../../../../../../../../../../shared/ui/DataState/DataState";
import { useHighTechMedicalCareQuery } from "../../../../../../../../../../shared/model/queries/invoiceStructure/clinicalGroups/useHighTechMedicalCareQuery";
import { useRControlWorkspacePanelStore } from "../../../../../../model/store/useRControlWorkspacePanelStore";
import { useRControlWorkspaceStore } from "../../../../../../model/store/useRControlWorkspaceStore";
import { RControlHighTechMedicalCareCardHeader } from "./RControlHighTechMedicalCareCardHeader";
import { RControlHighTechMedicalCareCardBody } from "./RControlHighTechMedicalCareCardBody";

export const RControlHighTechMedicalCareCardRoot = () => {
  const { targetDb } = useRControlWorkspacePanelStore();
  const { selectedMedicalCaseUid } = useRControlWorkspaceStore();
  const {
    data: highTechMedicalCare,
    isLoading,
    isPending,
    isError,
    isSuccess,
    error,
  } = useHighTechMedicalCareQuery(selectedMedicalCaseUid, targetDb);

  const dataState = resolveDataState({
    isEnabled: selectedMedicalCaseUid !== null && targetDb !== null,
    isLoading: isLoading,
    isError: isError,
    isSuccess: isSuccess,
    isEmpty: highTechMedicalCare === null && isSuccess,
  });

  return (
    <section className={styles.panel} aria-labelledby="rcontrol-vmp-heading">
      <RControlHighTechMedicalCareCardHeader />
      {dataState === "error" ? (
        <DataState
          title="Ошибка данных"
          description={error?.message ?? "Неизвестная ошибка"}
          variant="error"
        />
      ) : dataState === "empty" ? (
        <DataState
          title="Данных не найдено"
          description="Медицинский случай не содержит информации о ВМП"
          variant="empty"
        />
      ) : (
        <RControlHighTechMedicalCareCardBody
          highTechMedicalCare={highTechMedicalCare!}
          isPending={isPending}
        />
      )}
    </section>
  );
};
