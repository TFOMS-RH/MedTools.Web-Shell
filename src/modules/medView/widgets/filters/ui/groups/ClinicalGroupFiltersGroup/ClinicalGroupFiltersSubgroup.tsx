import type { FilterOption } from "../../../../workspace/model/types/FilterOptions";
import type { ClinicalGroupsFiltersSubgroupDraft } from "../../../../workspace/model/types/FiltersDraft";
import { MedViewAutocompleteInput } from "../../../../../../../shared/ui/medView/inputs/MedViewAutocompleteInput/MedViewAutocompleteInput";
import { MedViewMultipleSelectInput } from "../../../../../../../shared/ui/medView/inputs/MedViewMultipleSelectInput/MedViewMultipleSelectInput";
import { useFilterOptionsByCodeQuery } from "../../../model/queries/useFilterOptionsQuery";
import { useState } from "react";
import styles from "./styles.module.scss";

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

  const { data: complexityCoefficientNumbers } = useFilterOptionsByCodeQuery(
    "V041",
    "complexity-coefficient",
  );

  const { data: interruptedCasePaymentReasons } = useFilterOptionsByCodeQuery(
    "V042",
    "interrupted-case-payment-reason",
  );

  const { data: clinicalStatisticGroupNumbers, isPending } =
    useFilterOptionsByCodeQuery(
      "V023",
      "clinical-statistic-group-number",
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
            onChange={(newValue: string[]) =>
              setClinicalGroupFiltersSubgroupDraft({
                ...clinicalGroupFiltersSubgroupDraft,
                complexityCoefficientNumbers: newValue,
              })
            }
            options={
              complexityCoefficientNumbers?.map((option) => ({
                label: option.label,
                value: option.value,
              })) ?? []
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
            onChange={(newValue: string[]) =>
              setClinicalGroupFiltersSubgroupDraft({
                ...clinicalGroupFiltersSubgroupDraft,
                interruptedCasePaymentReasons: newValue,
              })
            }
            options={
              interruptedCasePaymentReasons?.map((option) => ({
                label: option.label,
                value: option.value,
              })) ?? []
            }
          />
        </div>
      </div>
    </div>
  );
};
