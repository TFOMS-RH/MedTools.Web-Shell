import { useRControlWorkspaceStore } from "../../../../model/store/useRControlWorkspaceStore";
import { RControlMedicalSanctionCardsGroupRoot } from "./medicalSanctions/cardsGroup/RControlMedicalSanctionCardsGroupRoot";
import { RControlDefectsTableRoot } from "./defects/table/RControlDefectsTableRoot";
import { DataState } from "../../../../../../../../shared/ui/DataState/DataState";
import styles from "./styles.module.scss";

const DefectsLive = () => {
  const { selectedMedicalCaseUid } = useRControlWorkspaceStore();

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
          <RControlDefectsTableRoot />
          <RControlMedicalSanctionCardsGroupRoot />
        </>
      )}
    </section>
  );
};

const RControlDefectsCategoryRoot = () => {
  return <DefectsLive />;
};

export default RControlDefectsCategoryRoot;
