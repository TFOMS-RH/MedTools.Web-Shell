import { lazy, Suspense } from "react";
import { DataState } from "../../../../../../../../shared/ui/DataState/DataState";
import { useRControlWorkspaceStore } from "../../../../model/store/useRControlWorkspaceStore";
import { RControlInsuranceCardRoot } from "./insurance/card/RControlInsuranceCardRoot";
import { RControlPatientCardRoot } from "./patient/card/RControlPatientCardRoot";
import styles from "./styles.module.scss";

const PatientPreview = import.meta.env.DEV
  ? lazy(() => import("./RControlPatientCategoryPreview")) : null;

const RControlPatientCategoryRoot = () => {
  const { selectedMedicalCaseUid } = useRControlWorkspaceStore();
  const params = new URLSearchParams(window.location.search);
  const showPreview = PatientPreview && params.get("demoWorkspace") === "1" &&
    params.get("demoPatient") !== "live";

  return (
    <section className={styles.patientCategoryRoot}>
      {selectedMedicalCaseUid === null ? (
        <DataState
          title="Выберите медицинский случай"
          description="Нажмите на карточку медицинского случая для отображения данных о пациенте и СМО"
          variant="waiting"
        />
      ) : showPreview ? (
        <Suspense fallback={null}>
          <PatientPreview key={selectedMedicalCaseUid} />
        </Suspense>
      ) : <RControlPatientCardRoot insurance={<RControlInsuranceCardRoot />} />}
    </section>
  );
};

export default RControlPatientCategoryRoot;
