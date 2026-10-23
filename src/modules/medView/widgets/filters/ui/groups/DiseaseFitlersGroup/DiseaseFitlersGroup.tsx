import type { DiseaseFitlersGroupDraft } from "../../../../workspace/model/types/FiltersDraft";
import { AdditionalDiseaseFiltersSubgroup } from "./AdditionalDiseaseFiltersSubgroup";
import { BaseDiseaseFiltersSubgroup } from "./BaseDiseaseFiltersSubgroup";
import styles from "./styles.module.scss";

interface DiseaseFitlersGroupProps {
  diseaseFiltersGroupDraft: DiseaseFitlersGroupDraft;
  setDiseaseFiltersGroupDraft: (
    diseaseFiltersGroupDraft: DiseaseFitlersGroupDraft,
  ) => void;
}

export const DiseaseFitlersGroup = ({
  diseaseFiltersGroupDraft,
  setDiseaseFiltersGroupDraft,
}: DiseaseFitlersGroupProps) => {
  return (
    <section className={styles.diseaseFiltersGroup}>
      <header className={styles.diseaseFiltersGroupHeader}>
        <div className={styles.titleGroup}>
          <h2>Фильтрация по заболеваниям</h2>
          <p className={styles.description}>
            Все поля, которые относятся к заболеваниям
          </p>
        </div>
      </header>
      <BaseDiseaseFiltersSubgroup
        baseDiseaseFitlersSubgroupDraft={diseaseFiltersGroupDraft.baseDisease}
        setBaseDiseaseFitlersSubgroupDraft={(baseDisease) =>
          setDiseaseFiltersGroupDraft({
            ...diseaseFiltersGroupDraft,
            baseDisease: baseDisease,
          })
        }
      />
      <AdditionalDiseaseFiltersSubgroup
        additionalDiseaseFiltersSubgroupDraft={
          diseaseFiltersGroupDraft.additionalDisease
        }
        setAdditionalDiseaseFiltersSubgroupDraft={(additionalDisease) =>
          setDiseaseFiltersGroupDraft({
            ...diseaseFiltersGroupDraft,
            additionalDisease: additionalDisease,
          })
        }
      />
    </section>
  );
};
