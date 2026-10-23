import type { MedicationFiltersSubgroupDraft } from "../../../../workspace/model/types/FiltersDraft";
import type { FilterOption } from "../../../../workspace/model/types/FilterOptions";
import { MedViewAutocompleteInput } from "../../../../../../../shared/ui/medView/inputs/MedViewAutocompleteInput/MedViewAutocompleteInput";
import { useFilterOptionsByCodeQuery } from "../../../model/queries/useFilterOptionsQuery";
import { useState } from "react";
import styles from "./styles.module.scss";

interface MedicationFiltersSubgroupProps {
  medicationFiltersSubgroupDraft: MedicationFiltersSubgroupDraft;
  setMedicationFiltersSubgroupDraft: (
    medicationFiltersSubgroupDraft: MedicationFiltersSubgroupDraft,
  ) => void;
}

export const MedicationFiltersSubgroup = ({
  medicationFiltersSubgroupDraft,
  setMedicationFiltersSubgroupDraft,
}: MedicationFiltersSubgroupProps) => {
  const [inputIdenitifierValue, setInputIdenitifierValue] = useState("");
  const [inputRegimenValue, setInputRegimenValue] = useState("");

  const { data: drugIdentifiers, isPending } = useFilterOptionsByCodeQuery(
    "N020",
    "drug-identifier",
    inputIdenitifierValue,
  );

  const { data: therapyRegimens } = useFilterOptionsByCodeQuery(
    "V024",
    "therapy-identifier",
    inputRegimenValue,
  );

  return (
    <div className={styles.medicationSubgroup}>
      <header className={styles.subgroupHeader}>
        <h3>Лекарственный препарат</h3>
      </header>
      <div className={styles.groupLineGrid}>
        <div className={styles.span8}>
          <MedViewAutocompleteInput
            label="Идентификатор лекарственного препарата"
            values={medicationFiltersSubgroupDraft.drugIdentifiers}
            options={drugIdentifiers ?? []}
            inputValue={inputIdenitifierValue}
            onInputChange={setInputIdenitifierValue}
            onChange={(newValue: FilterOption[]) =>
              setMedicationFiltersSubgroupDraft({
                ...medicationFiltersSubgroupDraft,
                drugIdentifiers: newValue,
              })
            }
            loading={isPending}
          />
        </div>

        <div className={styles.span4}>
          <MedViewAutocompleteInput
            label="Cхема лекарственной терапии"
            values={medicationFiltersSubgroupDraft.therapyRegimens}
            options={therapyRegimens ?? []}
            inputValue={inputRegimenValue}
            onInputChange={setInputRegimenValue}
            onChange={(newValue: FilterOption[]) =>
              setMedicationFiltersSubgroupDraft({
                ...medicationFiltersSubgroupDraft,
                therapyRegimens: newValue,
              })
            }
            loading={isPending}
          />
        </div>
      </div>
    </div>
  );
};
