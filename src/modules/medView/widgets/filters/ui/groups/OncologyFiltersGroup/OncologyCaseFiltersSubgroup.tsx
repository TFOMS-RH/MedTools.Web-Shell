import type { OncologyCaseFiltersSubgroupDraft } from "../../../../workspace/model/types/FiltersDraft";
import type { FilterOption } from "../../../../workspace/model/types/FilterOptions";
import { MedViewMultipleSelectInput } from "../../../../../../../shared/ui/medView/inputs/MedViewMultipleSelectInput/MedViewMultipleSelectInput";
import { MedViewAutocompleteInput } from "../../../../../../../shared/ui/medView/inputs/MedViewAutocompleteInput/MedViewAutocompleteInput";
import { useState } from "react";
import { useFilterOptionsQuery } from "../../../../../../../shared/model/references/queries/useFilterOptionsQuery";
import { MedicalReferenceType } from "../../../../../../../shared/model/references/types/MedicalReferenceType";
import styles from "./styles.module.scss";

interface OncologyCaseFiltersSubgroupProps {
  oncologyCaseFiltersSubgroupDraft: OncologyCaseFiltersSubgroupDraft;
  setOncologyCaseFiltersSubgroupDraft: (
    oncologyCaseFiltersSubgroupDraft: OncologyCaseFiltersSubgroupDraft,
  ) => void;
}

export const OncologyCaseFiltersSubgroup = ({
  oncologyCaseFiltersSubgroupDraft,
  setOncologyCaseFiltersSubgroupDraft,
}: OncologyCaseFiltersSubgroupProps) => {
  const [inputStageValue, setInputStageValue] = useState("");

  const { data: referralReasons } = useFilterOptionsQuery(
    MedicalReferenceType.ReferralReasons,
  );

  const { data: diseaseStages, isPending } = useFilterOptionsQuery(
    MedicalReferenceType.DiseaseStages,
    inputStageValue,
  );

  return (
    <div className={styles.oncologyCaseSubgroup}>
      <header className={styles.subgroupHeader}>
        <h3>Онкологический случай</h3>
      </header>
      <div className={styles.groupLineGrid}>
        <div className={styles.span8}>
          <MedViewMultipleSelectInput
            label="Повод обращения"
            values={oncologyCaseFiltersSubgroupDraft.referralReasons}
            onChange={(newValue: string[]) =>
              setOncologyCaseFiltersSubgroupDraft({
                ...oncologyCaseFiltersSubgroupDraft,
                referralReasons: newValue,
              })
            }
            options={referralReasons ?? []}
          />
        </div>

        <div className={styles.span4}>
          <MedViewAutocompleteInput
            label="Стадии заболевания"
            values={oncologyCaseFiltersSubgroupDraft.stages}
            options={diseaseStages ?? []}
            inputValue={inputStageValue}
            onInputChange={setInputStageValue}
            onChange={(newValue: FilterOption[]) =>
              setOncologyCaseFiltersSubgroupDraft({
                ...oncologyCaseFiltersSubgroupDraft,
                stages: newValue,
              })
            }
            loading={isPending}
          />
        </div>
      </div>
    </div>
  );
};
