import type { ClinicalGroupsFiltersGroupDraft } from "../../../../workspace/model/types/FiltersDraft";
import { ClinicalGroupFiltersSubgroup } from "./ClinicalGroupFiltersSubgroup";
import { HighTechMedicalCareFiltersSubgroup } from "./HighTechMedicalCareFiltersSubgroup";
import styles from "./styles.module.scss";

interface ClinicalGroupFiltersGroupProps {
  clinicalGroupFiltersGroup: ClinicalGroupsFiltersGroupDraft;
  setClinicalGroupFiltersGroup: (
    clinicalGroupFiltersGroup: ClinicalGroupsFiltersGroupDraft,
  ) => void;
}

const ClinicalGroupFiltersGroup = ({
  clinicalGroupFiltersGroup,
  setClinicalGroupFiltersGroup,
}: ClinicalGroupFiltersGroupProps) => {
  return (
    <section className={styles.clinicalGroupFiltersGroup}>
      <header className={styles.clinicalGroupFiltersGroupHeader}>
        <div className={styles.titleGroup}>
          <h2>Фильтрация по клиническим группам</h2>
          <p className={styles.description}>
            Все поля, которые относятся к КСГ и ВМП случаям
          </p>
        </div>
      </header>
      <ClinicalGroupFiltersSubgroup
        clinicalGroupFiltersSubgroupDraft={
          clinicalGroupFiltersGroup.clinicalGroups
        }
        setClinicalGroupFiltersSubgroupDraft={(clinicalGroups) =>
          setClinicalGroupFiltersGroup({
            ...clinicalGroupFiltersGroup,
            clinicalGroups: clinicalGroups,
          })
        }
      />
      <HighTechMedicalCareFiltersSubgroup
        highTechMedicalCareFiltersSubgroupDraft={
          clinicalGroupFiltersGroup.highTechMedicalCare
        }
        setHighTechMedicalCareFiltersSubgroupDraft={(highTechMedicalCare) =>
          setClinicalGroupFiltersGroup({
            ...clinicalGroupFiltersGroup,
            highTechMedicalCare: highTechMedicalCare,
          })
        }
      />
    </section>
  );
};

export default ClinicalGroupFiltersGroup;
