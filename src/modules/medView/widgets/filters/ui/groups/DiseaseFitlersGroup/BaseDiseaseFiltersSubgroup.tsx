import type { BaseDiseaseFiltersGroupDraft } from "../../../../workspace/model/types/FiltersDraft";
import type { FilterOption } from "../../../../workspace/model/types/FilterOptions";
import { MedViewAutocompleteInput } from "../../../../../../../shared/ui/medView/inputs/MedViewAutocompleteInput/MedViewAutocompleteInput";
import { MedViewMultipleSelectInput } from "../../../../../../../shared/ui/medView/inputs/MedViewMultipleSelectInput/MedViewMultipleSelectInput";
import { useState } from "react";
import { useFilterOptionsQuery } from "../../../../../../../shared/model/references/queries/useFilterOptionsQuery";
import { MedicalReferenceType } from "../../../../../../../shared/model/references/types/MedicalReferenceType";
import styles from "./styles.module.scss";

interface BaseDiseaseFiltersSubgroupProps {
  baseDiseaseFitlersSubgroupDraft: BaseDiseaseFiltersGroupDraft;
  setBaseDiseaseFitlersSubgroupDraft: (
    baseDiseaseFitlersSubgroupDraft: BaseDiseaseFiltersGroupDraft,
  ) => void;
}

export const BaseDiseaseFiltersSubgroup = ({
  baseDiseaseFitlersSubgroupDraft,
  setBaseDiseaseFitlersSubgroupDraft,
}: BaseDiseaseFiltersSubgroupProps) => {
  const [primaryDiagnosisInputValue, setPrimaryDiagnosisInputValue] =
    useState("");

  const { data: icdClasses } = useFilterOptionsQuery(
    MedicalReferenceType.DiseaseClasses,
  );

  const { data: icdSubClasses } = useFilterOptionsQuery(
    MedicalReferenceType.DiseaseSubClasses,
  );

  const { data: primaryDiagnosis } = useFilterOptionsQuery(
    MedicalReferenceType.Diseases,
    primaryDiagnosisInputValue,
  );

  return (
    <div className={styles.baseDiseaseFiltersSubgroup}>
      <header className={styles.subgroupHeader}>
        <h3>Основное</h3>
      </header>
      <div className={styles.groupLineGrid}>
        <div className={styles.span12}>
          <MedViewAutocompleteInput
            label="Основное заболевание"
            inputValue={primaryDiagnosisInputValue}
            options={primaryDiagnosis ?? []}
            values={baseDiseaseFitlersSubgroupDraft.primaryDiagnoses}
            onInputChange={setPrimaryDiagnosisInputValue}
            onChange={(newValue: FilterOption[]) =>
              setBaseDiseaseFitlersSubgroupDraft({
                ...baseDiseaseFitlersSubgroupDraft,
                primaryDiagnoses: newValue,
              })
            }
          />
        </div>
      </div>

      <div className={styles.groupLineGrid}>
        <div className={styles.span12}>
          <MedViewMultipleSelectInput
            label="Классы МКБ"
            options={icdClasses ?? []}
            values={baseDiseaseFitlersSubgroupDraft.diagnosisClasses}
            onChange={(newValue: string[]) =>
              setBaseDiseaseFitlersSubgroupDraft({
                ...baseDiseaseFitlersSubgroupDraft,
                diagnosisClasses: newValue,
              })
            }
          />
        </div>
      </div>
      <div className={styles.groupLineGrid}>
        <div className={styles.span12}>
          <MedViewMultipleSelectInput
            label="Подклассы МКБ"
            options={icdSubClasses ?? []}
            values={baseDiseaseFitlersSubgroupDraft.diagnosisSubClasses}
            onChange={(newValue: string[]) =>
              setBaseDiseaseFitlersSubgroupDraft({
                ...baseDiseaseFitlersSubgroupDraft,
                diagnosisSubClasses: newValue,
              })
            }
          />
        </div>
      </div>
    </div>
  );
};
