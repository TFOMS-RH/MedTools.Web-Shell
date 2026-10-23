import type { AdditionalDiseaseFiltersGroupDraft } from "../../../../workspace/model/types/FiltersDraft";
import type { FilterOption } from "../../../../workspace/model/types/FilterOptions";
import { MedViewAutocompleteInput } from "../../../../../../../shared/ui/medView/inputs/MedViewAutocompleteInput/MedViewAutocompleteInput";
import { useFilterOptionsByCodeQuery } from "../../../model/queries/useFilterOptionsQuery";
import { useState } from "react";
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

  const { data: initialDiagnoses } = useFilterOptionsByCodeQuery(
    "ICD",
    "disease",
    initialDiagnosesInputValue,
  );

  const { data: concomitantDiagnoses } = useFilterOptionsByCodeQuery(
    "ICD",
    "disease",
    concomitantDiagnosesInputValue,
  );

  const { data: complicationDiagnoses } = useFilterOptionsByCodeQuery(
    "ICD",
    "disease",
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
            options={concomitantDiagnoses ?? []}
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
            options={complicationDiagnoses ?? []}
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
