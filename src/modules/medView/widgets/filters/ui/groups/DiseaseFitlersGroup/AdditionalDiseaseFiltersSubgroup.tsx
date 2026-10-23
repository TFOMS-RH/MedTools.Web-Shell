import type { AdditionalDiseaseFiltersGroupDraft } from "../../../../workspace/model/types/FiltersDraft";
import type { FilterOption } from "../../../../workspace/model/types/FilterOptions";
import { MedViewAutocompleteInput } from "../../../../../../../shared/ui/medView/inputs/MedViewAutocompleteInput/MedViewAutocompleteInput";
import { useState } from "react";
import { useFilterOptionsQuery } from "../../../../../../../shared/model/references/queries/useFilterOptionsQuery";
import { MedicalReferenceType } from "../../../../../../../shared/model/references/types/MedicalReferenceType";
import styles from "./styles.module.scss";

interface AdditionalDiseaseFiltersSubgroupProps {
  additionalDiseaseFiltersSubgroupDraft: AdditionalDiseaseFiltersGroupDraft;
  setAdditionalDiseaseFiltersSubgroupDraft: (
    additionalDiseaseFiltersSubgroupDraft: AdditionalDiseaseFiltersGroupDraft,
  ) => void;
}

export const AdditionalDiseaseFiltersSubgroup = ({
  additionalDiseaseFiltersSubgroupDraft,
  setAdditionalDiseaseFiltersSubgroupDraft,
}: AdditionalDiseaseFiltersSubgroupProps) => {
  const [initialDiagnosesInputValue, setInitialDiagnosesInputValue] =
    useState("");
  const [concomitantDiagnosesInputValue, setConcomitantDiagnosesInputValue] =
    useState("");
  const [complicationDiagnosesInputValue, setComplicationDiagnosesInputValue] =
    useState("");

  const { data: initialDiagnoses } = useFilterOptionsQuery(
    MedicalReferenceType.Diseases,
    initialDiagnosesInputValue,
  );

  const { data: concomitantDiagnoses } = useFilterOptionsQuery(
    MedicalReferenceType.Diseases,
    concomitantDiagnosesInputValue,
  );

  const { data: complicationDiagnoses } = useFilterOptionsQuery(
    MedicalReferenceType.Diseases,
    complicationDiagnosesInputValue,
  );

  return (
    <div className={styles.additionalDiseaseFiltersSubgroup}>
      <header className={styles.subgroupHeader}>
        <h3>Дополнительные болезни</h3>
      </header>
      <div className={styles.groupLineGrid}>
        <div className={styles.span12}>
          <MedViewAutocompleteInput
            label="Первичный диагноз"
            inputValue={initialDiagnosesInputValue}
            options={initialDiagnoses ?? []}
            onInputChange={setInitialDiagnosesInputValue}
            values={additionalDiseaseFiltersSubgroupDraft.initialDiagnoses}
            onChange={(newValue: FilterOption[]) =>
              setAdditionalDiseaseFiltersSubgroupDraft({
                ...additionalDiseaseFiltersSubgroupDraft,
                initialDiagnoses: newValue,
              })
            }
          />
        </div>
      </div>
      <div className={styles.groupLineGrid}>
        <div className={styles.span12}>
          <MedViewAutocompleteInput
            label="Диагноз осложнения заболевания"
            inputValue={complicationDiagnosesInputValue}
            options={complicationDiagnoses ?? []}
            onInputChange={setComplicationDiagnosesInputValue}
            values={additionalDiseaseFiltersSubgroupDraft.complicationDiagnoses}
            onChange={(newValue: FilterOption[]) =>
              setAdditionalDiseaseFiltersSubgroupDraft({
                ...additionalDiseaseFiltersSubgroupDraft,
                complicationDiagnoses: newValue,
              })
            }
          />
        </div>
      </div>
      <div className={styles.groupLineGrid}>
        <div className={styles.span12}>
          <MedViewAutocompleteInput
            label="Сопутствующие заболевания"
            inputValue={concomitantDiagnosesInputValue}
            options={concomitantDiagnoses ?? []}
            onInputChange={setConcomitantDiagnosesInputValue}
            values={additionalDiseaseFiltersSubgroupDraft.concomitantDiagnoses}
            onChange={(newValue: FilterOption[]) =>
              setAdditionalDiseaseFiltersSubgroupDraft({
                ...additionalDiseaseFiltersSubgroupDraft,
                concomitantDiagnoses: newValue,
              })
            }
          />
        </div>
      </div>
    </div>
  );
};
