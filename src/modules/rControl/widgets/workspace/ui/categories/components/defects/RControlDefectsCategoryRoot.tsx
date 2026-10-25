import { lazy, Suspense } from "react";
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

const DefectsPreview = import.meta.env.DEV
  ? lazy(() => import("./RControlDefectsCategoryPreview"))
  : null;

const RControlDefectsCategoryRoot = () => {
  const { selectedMedicalCaseUid } = useRControlWorkspaceStore();
  const params = new URLSearchParams(window.location.search);
  if (
    DefectsPreview &&
    params.get("demoWorkspace") === "1" &&
    params.get("demoDefects") !== "live"
  ) {
    return (
      <Suspense fallback={null}>
        <DefectsPreview key={selectedMedicalCaseUid} />
      </Suspense>
    );
  }
  return <DefectsLive />;
};

export default RControlDefectsCategoryRoot;
