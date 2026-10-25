import styles from "../../styles.module.scss";
import { resolveDataState } from "../../../../../../../../../../shared/helpers/resolveDataState";
import { DataState } from "../../../../../../../../../../shared/ui/DataState/DataState";
import { useRControlWorkspacePanelStore } from "../../../../../../model/store/useRControlWorkspacePanelStore";
import { useClinicalGroupQuery } from "../../../../../../../../../../shared/model/queries/invoiceStructure/clinicalGroups/useClinicalGroupQuery";
import { useRControlWorkspaceStore } from "../../../../../../model/store/useRControlWorkspaceStore";
import { RControlClinicalGroupCardHeader } from "./RControlClinicalGroupCardHeader";
import { RControlClinicalGroupCardBody } from "./RControlClinicalGroupCardBody";

export const RControlClinicalGroupCardRoot = () => {
  const { targetDb } = useRControlWorkspacePanelStore();
  const { selectedMedicalCaseUid } = useRControlWorkspaceStore();
  const {
    data: clinicalGroup,
    isLoading,
    isPending,
    isError,
    isSuccess,
    error,
  } = useClinicalGroupQuery(selectedMedicalCaseUid, targetDb);

  const dataState = resolveDataState({
    isEnabled: selectedMedicalCaseUid !== null && targetDb !== null,
    isLoading: isLoading,
    isError: isError,
    isSuccess: isSuccess,
    isEmpty: clinicalGroup === null && isSuccess,
  });

  return (
    <section className={styles.panel} aria-labelledby="rcontrol-csg-heading">
      <RControlClinicalGroupCardHeader />
      {dataState === "error" ? (
        <DataState
          title="Ошибка данных"
          description={error?.message ?? "Неизвестная ошибка"}
          variant="error"
        />
      ) : dataState === "empty" ? (
        <DataState
          title="Данных не найдено"
          description="Медицинский случай не содержит информации о КСГ/КПГ"
          variant="empty"
        />
      ) : (
        <RControlClinicalGroupCardBody
          clinicalGroup={clinicalGroup!}
          isPending={isPending}
        />
      )}
    </section>
  );
};
