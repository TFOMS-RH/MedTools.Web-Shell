import type { InsuranceFiltersSubgroupDraft } from "../../../../workspace/model/types/FiltersDraft";
import { MedViewDefaultInput } from "../../../../../../../shared/ui/medView/inputs/MedViewDefaultInput/MedViewDefaultInput";
import { MedViewMultipleSelectInput } from "../../../../../../../shared/ui/medView/inputs/MedViewMultipleSelectInput/MedViewMultipleSelectInput";
import { MedicalReferenceType } from "../../../../../../../shared/model/references/types/MedicalReferenceType";
import { useFilterOptionsQuery } from "../../../../../../../shared/model/references/queries/useFilterOptionsQuery";
import styles from "./styles.module.scss";
import { MedViewBulkAutocompleteInput } from "../../../../../../../shared/ui/medView/inputs/MedViewBulkAutocompleteInput/MedViewBulkAutocompleteInput";
import { MedViewAutocompleteInput } from "../../../../../../../shared/ui/medView/inputs/MedViewAutocompleteInput/MedViewAutocompleteInput";
import { useState } from "react";
import type { FilterOption } from "../../../../workspace/model/types/FilterOptions";

interface InsuranceFiltersSubgroupProps {
  insuranceFiltersSubgroupDraft: InsuranceFiltersSubgroupDraft;
  setInsuranceFiltersSubgroupDraft: (
    insuranceFilters: InsuranceFiltersSubgroupDraft,
  ) => void;
}

export const InsuranceFiltersSubgroup = ({
  insuranceFiltersSubgroupDraft,
  setInsuranceFiltersSubgroupDraft,
}: InsuranceFiltersSubgroupProps) => {
  const [insuranceOrgsInputValue, setInsuranceOrgsInputValue] = useState("");

  const { data: policyTypes } = useFilterOptionsQuery(
    MedicalReferenceType.PolicyTypes,
  );

  const { data: insuranceOrgOptions, isFetching } = useFilterOptionsQuery(
    MedicalReferenceType.InsuranceOrgs,
    insuranceOrgsInputValue,
  );

  return (
    <div className={styles.insuranceSubgroup}>
      <header className={styles.subgroupHeader}>
        <h3>Страхование</h3>
      </header>
      <div className={styles.groupLineGrid}>
        <div className={styles.span12}>
          <MedViewAutocompleteInput
            inputValue={insuranceOrgsInputValue}
            onInputChange={setInsuranceOrgsInputValue}
            label="СМО"
            onChange={(newValue: FilterOption[]) =>
              setInsuranceFiltersSubgroupDraft({
                ...insuranceFiltersSubgroupDraft,
                insurances: newValue,
              })
            }
            options={insuranceOrgOptions ?? []}
            values={insuranceFiltersSubgroupDraft.insurances}
            loading={isFetching}
          />
        </div>
      </div>
      <div className={styles.groupLineGrid}>
        <div className={styles.span12}>
          <MedViewMultipleSelectInput
            label="Тип полиса"
            values={insuranceFiltersSubgroupDraft.insurancePolicyTypes}
            onChange={(newValue: string[]) =>
              setInsuranceFiltersSubgroupDraft({
                ...insuranceFiltersSubgroupDraft,
                insurancePolicyTypes: newValue,
              })
            }
            options={policyTypes ?? []}
          />
        </div>
      </div>

      <div className={styles.groupLineGrid}>
        <div className={styles.span3}>
          <MedViewDefaultInput
            label="Серия полиса"
            placeholder="0000"
            value={insuranceFiltersSubgroupDraft.insurancePolicySeries}
            handleInputChange={(newValue: string) =>
              setInsuranceFiltersSubgroupDraft({
                ...insuranceFiltersSubgroupDraft,
                insurancePolicySeries: newValue,
              })
            }
          />
        </div>
        <div className={styles.span4}>
          <MedViewBulkAutocompleteInput
            label="Номер полиса"
            placeholder="Укажите номера"
            value={insuranceFiltersSubgroupDraft.insurancePolicyNumbers}
            onChange={(newValue: string[]) =>
              setInsuranceFiltersSubgroupDraft({
                ...insuranceFiltersSubgroupDraft,
                insurancePolicyNumbers: newValue,
              })
            }
          />
        </div>
        <div className={styles.span5}>
          <MedViewBulkAutocompleteInput
            label="ЕНП"
            placeholder="Укажите ЕНП"
            value={insuranceFiltersSubgroupDraft.unifiedPolicyNumbers}
            onChange={(newValue: string[]) =>
              setInsuranceFiltersSubgroupDraft({
                ...insuranceFiltersSubgroupDraft,
                unifiedPolicyNumbers: newValue,
              })
            }
          />
        </div>
      </div>
    </div>
  );
};
