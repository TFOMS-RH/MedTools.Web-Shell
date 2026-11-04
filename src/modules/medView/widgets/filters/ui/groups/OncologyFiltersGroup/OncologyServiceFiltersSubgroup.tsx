import type { OncologyServiceFiltersSubgroupDraft } from "../../../../workspace/model/types/FiltersDraft";
import { MedViewMultipleSelectInput } from "../../../../../../../shared/ui/medView/inputs/MedViewMultipleSelectInput/MedViewMultipleSelectInput";
import { useFilterOptionsQuery } from "../../../../../../../shared/model/references/queries/useFilterOptionsQuery";
import { MedicalReferenceType } from "../../../../../../../shared/model/references/types/MedicalReferenceType";
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
  const { data: oncologyServiceTypes } = useFilterOptionsQuery(
    MedicalReferenceType.OncologyServiceTypes,
  );

  const { data: surgicalTreatmentTypes } = useFilterOptionsQuery(
    MedicalReferenceType.SurgicalTreatmentTypes,
  );

  const { data: radioTherapyTypes } = useFilterOptionsQuery(
    MedicalReferenceType.RadioTherapyTypes,
  );

  const { data: drugTherapyLines } = useFilterOptionsQuery(
    MedicalReferenceType.DrugTherapyLines,
  );

  const { data: drugTherapyCycles } = useFilterOptionsQuery(
    MedicalReferenceType.DrugTherapyCycles,
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
