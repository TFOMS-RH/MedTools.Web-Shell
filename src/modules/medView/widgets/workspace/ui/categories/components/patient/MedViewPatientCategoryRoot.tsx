import { DataState } from "../../../../../../../../shared/ui/DataState/DataState";
import { useMedViewWorkspaceStore } from "../../../../model/stores/useMedViewWorkspaceStore";
import { MedViewInsuranceCardRoot } from "./insurance/card/MedViewInsuranceCardRoot";
import { MedViewPatientCardRoot } from "./patient/card/MedViewPatientCardRoot";
import styles from "./styles.module.scss";

const Patient = () => {
  const { selectedMedicalCaseUid } = useMedViewWorkspaceStore();

  return (
    <section className={styles.patientCategoryRoot}>
      {selectedMedicalCaseUid === null ? (
        <DataState
          title="Выберите медицинский случай"
          description="Нажмите на карточку медицинского случая для отображения данных о пациенте и СМО"
          variant="waiting"
        />
      ) : (
        <MedViewPatientCardRoot insurance={<MedViewInsuranceCardRoot />} />
      )}
    </section>
  );
};

export default Patient;
