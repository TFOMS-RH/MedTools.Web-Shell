import { DataState } from "../../../../../../../../shared/ui/DataState/DataState";
import { useMedViewWorkspaceStore } from "../../../../model/stores/useMedViewWorkspaceStore";
import { MedViewCompletedCaseDetailsCardRoot } from "./completedCaseDetails/card/MedViewCompletedCaseDetailsCardRoot";
import { MedViewMedicalCaseDetailsCardRoot } from "./medicalCaseDetails/card/MedViewMedicalCaseDetailsCardRoot";
import styles from "./styles.module.scss";

const MedViewMedicalCaseDetailsCategoryRoot = () => {
  const { selectedMedicalCaseUid } = useMedViewWorkspaceStore();

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
          <MedViewMedicalCaseDetailsCardRoot />
          <MedViewCompletedCaseDetailsCardRoot />
        </>
      )}
    </section>
  );
};

export default MedViewMedicalCaseDetailsCategoryRoot;
