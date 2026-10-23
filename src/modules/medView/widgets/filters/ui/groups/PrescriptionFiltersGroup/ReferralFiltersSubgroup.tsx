import type { Dayjs } from "dayjs";
import type { FilterOption } from "../../../../workspace/model/types/FilterOptions";
import type { ReferralFiltersSubgroupDraft } from "../../../../workspace/model/types/FiltersDraft";
import { MedViewDateInput } from "../../../../../../../shared/ui/medView/inputs/MedViewDateInput/MedViewDateInput";
import { MedViewMultipleSelectInput } from "../../../../../../../shared/ui/medView/inputs/MedViewMultipleSelectInput/MedViewMultipleSelectInput";
import { MedViewAutocompleteInput } from "../../../../../../../shared/ui/medView/inputs/MedViewAutocompleteInput/MedViewAutocompleteInput";
import { useFilterOptionsQuery } from "../../../../../../../shared/model/references/queries/useFilterOptionsQuery";
import { MedicalReferenceType } from "../../../../../../../shared/model/references/types/MedicalReferenceType";
import { useState } from "react";
import styles from "./styles.module.scss";

interface ReferralFiltersSubgroupProps {
  referralsFiltersSubgroupDraft: ReferralFiltersSubgroupDraft;
  setReferralsFiltersSubgroupDraft: (
    referralsFiltersSubgroupDraft: ReferralFiltersSubgroupDraft,
  ) => void;
}

export const ReferralFiltersSubgroup = ({
  referralsFiltersSubgroupDraft,
  setReferralsFiltersSubgroupDraft,
}: ReferralFiltersSubgroupProps) => {
  const [inputServiceValue, setInputServiceValue] = useState("");

  const { data: referralTypes } = useFilterOptionsQuery(
    MedicalReferenceType.ReferralTypes,
  );

  const { data: diagnosticMethods } = useFilterOptionsQuery(
    MedicalReferenceType.DiagnosticMethods,
  );

  const { data: medicalServices, isPending } = useFilterOptionsQuery(
    MedicalReferenceType.MedicalServices,
    inputServiceValue,
  );

  return (
    <div className={styles.referralSubgroup}>
      <header className={styles.subgroupHeader}>
        <h3>Направления</h3>
      </header>

      <div className={styles.groupLineGrid}>
        <div className={styles.span4}>
          <MedViewDateInput
            label="Дата направления"
            value={referralsFiltersSubgroupDraft.referralDate}
            handleDateInputChange={(newValue: Dayjs | null) =>
              setReferralsFiltersSubgroupDraft({
                ...referralsFiltersSubgroupDraft,
                referralDate: newValue,
              })
            }
          />
        </div>
        <div className={styles.span8}>
          <MedViewMultipleSelectInput
            label="МО направления"
            values={
              referralsFiltersSubgroupDraft.referredToMedicalOrganizations
            }
            onChange={(newValue: string[]) =>
              setReferralsFiltersSubgroupDraft({
                ...referralsFiltersSubgroupDraft,
                referredToMedicalOrganizations: newValue,
              })
            }
            options={[]}
          />
        </div>
      </div>

      <div className={styles.groupLineGrid}>
        <div className={styles.span12}>
          <MedViewMultipleSelectInput
            label="Вид направления"
            values={referralsFiltersSubgroupDraft.refferalTypes}
            options={referralTypes ?? []}
            onChange={(newValue: string[]) =>
              setReferralsFiltersSubgroupDraft({
                ...referralsFiltersSubgroupDraft,
                refferalTypes: newValue,
              })
            }
          />
        </div>
      </div>

      <div className={styles.groupLineGrid}>
        <div className={styles.span12}>
          <MedViewMultipleSelectInput
            label="Метод  диагностического исследования"
            values={referralsFiltersSubgroupDraft.diagnosticMethods}
            options={diagnosticMethods ?? []}
            onChange={(newValue: string[]) =>
              setReferralsFiltersSubgroupDraft({
                ...referralsFiltersSubgroupDraft,
                diagnosticMethods: newValue,
              })
            }
          />
        </div>
      </div>

      <div className={styles.groupLineGrid}>
        <div className={styles.span12}>
          <MedViewAutocompleteInput
            label="Услуги, указанные в направлении"
            values={referralsFiltersSubgroupDraft.referredServices}
            options={medicalServices ?? []}
            inputValue={inputServiceValue}
            onInputChange={setInputServiceValue}
            onChange={(newValue: FilterOption[]) =>
              setReferralsFiltersSubgroupDraft({
                ...referralsFiltersSubgroupDraft,
                referredServices: newValue,
              })
            }
            loading={isPending}
          />
        </div>
      </div>
    </div>
  );
};
