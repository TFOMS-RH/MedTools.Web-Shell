import type { InsuranceFiltersSubgroupDraft } from "../../../../workspace/model/types/FiltersDraft";
import { MedViewDefaultInput } from "../../../../../../../shared/ui/medView/inputs/MedViewDefaultInput/MedViewDefaultInput";
import { MedViewMultipleSelectInput } from "../../../../../../../shared/ui/medView/inputs/MedViewMultipleSelectInput/MedViewMultipleSelectInput";
import { MedicalReferenceType } from "../../../../../../../shared/model/references/types/MedicalReferenceType";
import { useFilterOptionsQuery } from "../../../../../../../shared/model/references/queries/useFilterOptionsQuery";
import styles from "./styles.module.scss";

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
  const { data: policyTypes } = useFilterOptionsQuery(
    MedicalReferenceType.PolicyTypes,
  );

  return (
    <div className={styles.insuranceSubgroup}>
      <header className={styles.subgroupHeader}>
        <h3>Страхование</h3>
      </header>
      <div className={styles.groupLineGrid}>
        <div className={styles.span12}>
          <MedViewMultipleSelectInput
            label="Страховая медицинская организация"
            values={insuranceFiltersSubgroupDraft.insurances}
            onChange={(newValue: string[]) =>
              setInsuranceFiltersSubgroupDraft({
                ...insuranceFiltersSubgroupDraft,
                insurances: newValue,
              })
            }
            options={[]}
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
          <MedViewDefaultInput
            label="Номер полиса"
            placeholder="00000000"
            value={insuranceFiltersSubgroupDraft.insurancePolicyNumber}
            handleInputChange={(newValue: string) =>
              setInsuranceFiltersSubgroupDraft({
                ...insuranceFiltersSubgroupDraft,
                insurancePolicyNumber: newValue,
              })
            }
          />
        </div>
        <div className={styles.span5}>
          <MedViewDefaultInput
            label="ЕНП"
            placeholder="0000000000000000"
            value={insuranceFiltersSubgroupDraft.unifiedPolicyNumber}
            handleInputChange={(newValue: string) =>
              setInsuranceFiltersSubgroupDraft({
                ...insuranceFiltersSubgroupDraft,
                unifiedPolicyNumber: newValue,
              })
            }
          />
        </div>
      </div>
    </div>
  );
};
