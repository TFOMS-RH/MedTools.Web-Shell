import type { FilterOption } from "../../../../workspace/model/types/FilterOptions";
import type { ClinicalGroupsFiltersSubgroupDraft } from "../../../../workspace/model/types/FiltersDraft";
import { MedViewAutocompleteInput } from "../../../../../../../shared/ui/medView/inputs/MedViewAutocompleteInput/MedViewAutocompleteInput";
import { MedViewMultipleSelectInput } from "../../../../../../../shared/ui/medView/inputs/MedViewMultipleSelectInput/MedViewMultipleSelectInput";
import { useState } from "react";
import styles from "./styles.module.scss";
import { useFilterOptionsQuery } from "../../../../../../../shared/model/references/queries/useFilterOptionsQuery";
import { MedicalReferenceType } from "../../../../../../../shared/model/references/types/MedicalReferenceType";

interface ClinicalGroupFiltersSubgroupProps {
  clinicalGroupFiltersSubgroupDraft: ClinicalGroupsFiltersSubgroupDraft;
  setClinicalGroupFiltersSubgroupDraft: (
    clinicalGroupFiltersSubgroupDraft: ClinicalGroupsFiltersSubgroupDraft,
  ) => void;
}

export const ClinicalGroupFiltersSubgroup = ({
  clinicalGroupFiltersSubgroupDraft,
  setClinicalGroupFiltersSubgroupDraft,
}: ClinicalGroupFiltersSubgroupProps) => {
  const [
    inputCLinicalStatisticGroupValue,
    setInputCLinicalStatisticGroupValue,
  ] = useState("");

  const { data: complexityCoefficientNumbers } = useFilterOptionsQuery(
    MedicalReferenceType.ComplexityCoefficientNumbers,
  );

  const { data: interruptedCasePaymentReasons } = useFilterOptionsQuery(
    MedicalReferenceType.InterruptedCasePaymentReasons,
  );

  const { data: clinicalStatisticGroupNumbers, isPending } =
    useFilterOptionsQuery(
      MedicalReferenceType.ClinicalGroupNumbers,
      inputCLinicalStatisticGroupValue,
    );

  return (
    <div className={styles.clinicalGroupFiltersSubgroup}>
      <header className={styles.subgroupHeader}>
        <h3>КСГ</h3>
      </header>
      <div className={styles.groupLineGrid}>
        <div className={styles.span12}>
          <MedViewAutocompleteInput
            label="Номер КСГ"
            values={
              clinicalGroupFiltersSubgroupDraft.clinicalStatisticGroupNumbers
            }
            options={clinicalStatisticGroupNumbers ?? []}
            inputValue={inputCLinicalStatisticGroupValue}
            onInputChange={setInputCLinicalStatisticGroupValue}
            onChange={(newValue: FilterOption[]) =>
              setClinicalGroupFiltersSubgroupDraft({
                ...clinicalGroupFiltersSubgroupDraft,
                clinicalStatisticGroupNumbers: newValue,
              })
            }
            loading={isPending}
          />
        </div>
      </div>
      <div className={styles.groupLineGrid}>
        <div className={styles.span12}>
          <MedViewMultipleSelectInput
            label="Номер КСЛП"
            values={
              clinicalGroupFiltersSubgroupDraft.complexityCoefficientNumbers
            }
            options={complexityCoefficientNumbers ?? []}
            onChange={(newValue: string[]) =>
              setClinicalGroupFiltersSubgroupDraft({
                ...clinicalGroupFiltersSubgroupDraft,
                complexityCoefficientNumbers: newValue,
              })
            }
          />
        </div>
      </div>
      <div className={styles.groupLineGrid}>
        <div className={styles.span12}>
          <MedViewMultipleSelectInput
            label="Причина оплаты за прерванный случай"
            values={
              clinicalGroupFiltersSubgroupDraft.interruptedCasePaymentReasons
            }
            options={interruptedCasePaymentReasons ?? []}
            onChange={(newValue: string[]) =>
              setClinicalGroupFiltersSubgroupDraft({
                ...clinicalGroupFiltersSubgroupDraft,
                interruptedCasePaymentReasons: newValue,
              })
            }
          />
        </div>
      </div>
    </div>
  );
};
