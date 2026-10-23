import type { OncologyServiceFiltersSubgroupDraft } from "../../../../workspace/model/types/FiltersDraft";
import { MedViewMultipleSelectInput } from "../../../../../../../shared/ui/medView/inputs/MedViewMultipleSelectInput/MedViewMultipleSelectInput";
import { useFilterOptionsByCodeQuery } from "../../../model/queries/useFilterOptionsQuery";
import styles from "./styles.module.scss";

interface OncologyServiceFiltersSubgroupProps {
  oncologyServiceFiltersSubgroupDraft: OncologyServiceFiltersSubgroupDraft;
  setOncologyServiceFiltersSubgroupDraft: (
    oncologyServiceFiltersSubgroupDraft: OncologyServiceFiltersSubgroupDraft,
  ) => void;
}

export const OncologyServiceFiltersSubgroup = ({
  oncologyServiceFiltersSubgroupDraft,
  setOncologyServiceFiltersSubgroupDraft,
}: OncologyServiceFiltersSubgroupProps) => {
  const { data: oncologyServiceTypes } = useFilterOptionsByCodeQuery(
    "N013",
    "oncology-service-type",
  );

  const { data: surgicalTreatmentTypes } = useFilterOptionsByCodeQuery(
    "N014",
    "surgical-treatment-type",
  );

  const { data: radioTherapyTypes } = useFilterOptionsByCodeQuery(
    "N017",
    "radio-therapy-type",
  );

  const { data: drugTherapyLines } = useFilterOptionsByCodeQuery(
    "N015",
    "drug-therapy-line",
  );

  const { data: drugTherapyCycles } = useFilterOptionsByCodeQuery(
    "N016",
    "drug-therapy-cycle",
  );

  return (
    <div className={styles.oncologyServiceSubgroup}>
      <header className={styles.subgroupHeader}>
        <h3>Онкологическая услуга</h3>
      </header>
      <div className={styles.groupLineGrid}>
        <div className={styles.span12}>
          <MedViewMultipleSelectInput
            label="Тип хирургического лечения"
            values={oncologyServiceFiltersSubgroupDraft.surgicalTreatmentTypes}
            onChange={(newValue: string[]) =>
              setOncologyServiceFiltersSubgroupDraft({
                ...oncologyServiceFiltersSubgroupDraft,
                surgicalTreatmentTypes: newValue,
              })
            }
            options={
              surgicalTreatmentTypes?.map((option) => ({
                label: option.label,
                value: option.value,
              })) ?? []
            }
          />
        </div>
      </div>

      <div className={styles.groupLineGrid}>
        <div className={styles.span6}>
          <MedViewMultipleSelectInput
            label="Тип услуги"
            values={oncologyServiceFiltersSubgroupDraft.serviceTypes}
            onChange={(newValue: string[]) =>
              setOncologyServiceFiltersSubgroupDraft({
                ...oncologyServiceFiltersSubgroupDraft,
                serviceTypes: newValue,
              })
            }
            options={
              oncologyServiceTypes?.map((option) => ({
                label: option.label,
                value: option.value,
              })) ?? []
            }
          />
        </div>

        <div className={styles.span6}>
          <MedViewMultipleSelectInput
            label="Тип лучевой терапии"
            values={oncologyServiceFiltersSubgroupDraft.radioTherapyTypes}
            onChange={(newValue: string[]) =>
              setOncologyServiceFiltersSubgroupDraft({
                ...oncologyServiceFiltersSubgroupDraft,
                radioTherapyTypes: newValue,
              })
            }
            options={
              radioTherapyTypes?.map((option) => ({
                label: option.label,
                value: option.value,
              })) ?? []
            }
          />
        </div>
      </div>

      <div className={styles.groupLineGrid}>
        <div className={styles.span6}>
          <MedViewMultipleSelectInput
            label="Линия лекарственной терапии"
            values={oncologyServiceFiltersSubgroupDraft.drugTherapyLines}
            onChange={(newValue: string[]) =>
              setOncologyServiceFiltersSubgroupDraft({
                ...oncologyServiceFiltersSubgroupDraft,
                drugTherapyLines: newValue,
              })
            }
            options={
              drugTherapyLines?.map((option) => ({
                label: option.label,
                value: option.value,
              })) ?? []
            }
          />
        </div>
        <div className={styles.span6}>
          <MedViewMultipleSelectInput
            label="Цикл лекарственной терапии"
            values={oncologyServiceFiltersSubgroupDraft.drugTherapyCycles}
            onChange={(newValue: string[]) =>
              setOncologyServiceFiltersSubgroupDraft({
                ...oncologyServiceFiltersSubgroupDraft,
                drugTherapyCycles: newValue,
              })
            }
            options={
              drugTherapyCycles?.map((option) => ({
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
