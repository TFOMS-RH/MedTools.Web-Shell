import { useRControlWorkspaceStore } from "../../../../model/store/useRControlWorkspaceStore";
import { lazy, Suspense } from "react";
import { DataState } from "../../../../../../../../shared/ui/DataState/DataState";
import { RControlMedicalCaseDetailsCardRoot } from "./medicalCaseDetails/card/RControlMedicalCaseDetailsCardRoot";
import { CompletedCaseDetailsRoot } from "./completedCaseDetails/card/RControlCompletedCaseDetailsCardRoot";
import styles from "./styles.module.scss";

const CaseDetailsPreview = import.meta.env.DEV
  ? lazy(() => import("./RControlCaseDetailsCategoryPreview"))
  : null;

const RControlMedicalCaseDetailsCategoryRoot = () => {
  const { selectedMedicalCaseUid } = useRControlWorkspaceStore();
  const params = new URLSearchParams(window.location.search);
  const showPreview =
    CaseDetailsPreview &&
    params.get("demoWorkspace") === "1" &&
    params.get("demoCaseDetails") !== "live";

  return (
    <section className={styles.medicalCaseDetailsRoot}>
      {selectedMedicalCaseUid === null ? (
        <DataState
          title="Выберите медицинский случай"
          description="Нажмите на карточку медицинского случая для отображения данных о деталях законченного и медицинского случаев"
          variant="waiting"
        />
      ) : showPreview ? (
        <Suspense fallback={null}><CaseDetailsPreview key={selectedMedicalCaseUid} /></Suspense>
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
