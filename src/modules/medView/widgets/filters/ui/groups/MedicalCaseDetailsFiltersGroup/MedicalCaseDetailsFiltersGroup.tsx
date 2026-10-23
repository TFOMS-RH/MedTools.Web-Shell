import type { MedicalCaseDetailsFiltersGroupDraft } from "../../../../workspace/model/types/FiltersDraft";
import { CompletedCaseDetailsFiltersSubgroup } from "./CompletedCaseDetailsFiltersSubgroup";
import { MedicalCaseDetailsFiltersSubgroup } from "./MedicalCaseDetailsFiltersSubgroup";
import styles from "./styles.module.scss";

interface MedicalCaseDetailsFiltersGroupProps {
  medicalCaseDetailsFiltersGroupDraft: MedicalCaseDetailsFiltersGroupDraft;
  setMedicalCaseDetailsFiltersGroupDraft: (
    medicalCaseDetailsFiltersGroupDraft: MedicalCaseDetailsFiltersGroupDraft,
  ) => void;
}

const MedicalCaseDetailsFiltersGroup = ({
  medicalCaseDetailsFiltersGroupDraft,
  setMedicalCaseDetailsFiltersGroupDraft,
}: MedicalCaseDetailsFiltersGroupProps) => {
  return (
    <section className={styles.medicalCaseDetailsFiltersGroup}>
      <header className={styles.medicalCaseDetailsFiltersGroupHeader}>
        <div className={styles.titleGroup}>
          <h2>Фильтрация по медицинскому случаю</h2>
          <p className={styles.description}>
            Все поля, которые относятся к данным по медицинскому и законченному
            случаям
          </p>
        </div>
      </header>

      <MedicalCaseDetailsFiltersSubgroup
        medicalCaseDetailsFiltersSubgroupDraft={
          medicalCaseDetailsFiltersGroupDraft.medicalCaseDetails
        }
        setMedicalCaseDetailsFiltersSubgroupDraft={(medicalCaseDetails) =>
          setMedicalCaseDetailsFiltersGroupDraft({
            ...medicalCaseDetailsFiltersGroupDraft,
            medicalCaseDetails: medicalCaseDetails,
          })
        }
      />

      <CompletedCaseDetailsFiltersSubgroup
        completedCaseDetailsFiltersSubgroupDraft={
          medicalCaseDetailsFiltersGroupDraft.completedCaseDetails
        }
        setCompletedCaseDetailsFiltersSubgroupDraft={(completedCaseDetails) =>
          setMedicalCaseDetailsFiltersGroupDraft({
            ...medicalCaseDetailsFiltersGroupDraft,
            completedCaseDetails: completedCaseDetails,
          })
        }
      />
    </section>
  );
};

export default MedicalCaseDetailsFiltersGroup;
