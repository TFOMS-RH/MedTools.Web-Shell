import { useMedViewWorkspaceStore } from "../../../../model/stores/useMedViewWorkspaceStore";
import { MedViewMedicalSanctionCardsGroupRoot } from "./medicalSanctions/cardsGroup/MedViewMedicalSanctionCardsGroupRoot";
import { MedViewDefectsTableRoot } from "./defects/table/MedViewDefectsTableRoot";
import { DataState } from "../../../../../../../../shared/ui/DataState/DataState";
import styles from "./styles.module.scss";

const MedViewDefectsCategoryRoot = () => {
  const { selectedMedicalCaseUid } = useMedViewWorkspaceStore();

  return (
    <section className={styles.defectsRoot}>
      {selectedMedicalCaseUid === null ? (
        <DataState
          title="Выберите медицинский случай"
          description="Нажмите на карточку медицинского случая для отображения данных о дефектах и санкциях"
          variant="waiting"
        />
      ) : (
        <>
          <MedViewDefectsTableRoot />
          <MedViewMedicalSanctionCardsGroupRoot />
        </>
      )}
    </section>
  );
};

export default MedViewDefectsCategoryRoot;
