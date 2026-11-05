import { useRControlWorkspaceStore } from "../../../../model/store/useRControlWorkspaceStore";
import { DataState } from "../../../../../../../../shared/ui/DataState/DataState";
import { RControlMedicalCaseDetailsCardRoot } from "./medicalCaseDetails/card/RControlMedicalCaseDetailsCardRoot";
import { CompletedCaseDetailsRoot } from "./completedCaseDetails/card/RControlCompletedCaseDetailsCardRoot";
import styles from "./styles.module.scss";

const RControlMedicalCaseDetailsCategoryRoot = () => {
  const { selectedMedicalCaseUid } = useRControlWorkspaceStore();

  return (
    <section className={styles.medicalCaseDetailsRoot}>
      {selectedMedicalCaseUid === null ? (
        <DataState
          title="Выберите медицинский случай"
          description="Нажмите на карточку медицинского случая для отображения данных о деталях законченного и медицинского случаев"
          variant="waiting"
        />
      ) : (
        <>
          <RControlMedicalCaseDetailsCardRoot />
          <CompletedCaseDetailsRoot />
        </>
      )}
    </section>
  );
};

export default RControlMedicalCaseDetailsCategoryRoot;
