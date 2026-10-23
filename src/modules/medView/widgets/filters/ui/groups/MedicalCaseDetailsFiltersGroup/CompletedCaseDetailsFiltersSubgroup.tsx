import type { Dayjs } from "dayjs";
import type { CompletedCaseDetailsFiltersSubgroupDraft } from "../../../../workspace/model/types/FiltersDraft";
import { MedViewMultipleSelectInput } from "../../../../../../../shared/ui/medView/inputs/MedViewMultipleSelectInput/MedViewMultipleSelectInput";
import { useFilterOptionsQuery } from "../../../../../../../shared/model/references/queries/useFilterOptionsQuery";
import { MedicalReferenceType } from "../../../../../../../shared/model/references/types/MedicalReferenceType";
import { MedViewDateInput } from "../../../../../../../shared/ui/medView/inputs/MedViewDateInput/MedViewDateInput";
import styles from "./styles.module.scss";

interface CompletedCaseDetailsFiltersSubgroupProps {
  completedCaseDetailsFiltersSubgroupDraft: CompletedCaseDetailsFiltersSubgroupDraft;
  setCompletedCaseDetailsFiltersSubgroupDraft: (
    completedCaseDetailsFiltersSubgroupDraft: CompletedCaseDetailsFiltersSubgroupDraft,
  ) => void;
}

export const CompletedCaseDetailsFiltersSubgroup = ({
  completedCaseDetailsFiltersSubgroupDraft,
  setCompletedCaseDetailsFiltersSubgroupDraft,
}: CompletedCaseDetailsFiltersSubgroupProps) => {
  const { data: careConditionFilterOptions } = useFilterOptionsQuery(
    MedicalReferenceType.MedicalCareConditions,
  );

  const { data: medicalCareTypeFilterOptions } = useFilterOptionsQuery(
    MedicalReferenceType.MedicalCareTypes,
  );

  const { data: medicalCareFormFilterOptions } = useFilterOptionsQuery(
    MedicalReferenceType.MedicalCareForms,
  );

  const { data: diseaseOutcomeFilterOptions } = useFilterOptionsQuery(
    MedicalReferenceType.DiseaseOutcomes,
  );

  const { data: screeningResultFilterOptions } = useFilterOptionsQuery(
    MedicalReferenceType.ScreeningResults,
  );

  const { data: hospitalizationOutcomeFilterOptions } = useFilterOptionsQuery(
    MedicalReferenceType.HospitalizationOutcomes,
  );

  const { data: paymentMethodFilterOptions } = useFilterOptionsQuery(
    MedicalReferenceType.PaymentMethods,
  );

  return (
    <div className={styles.medicalCaseDetailsSubgroup}>
      <header className={styles.subgroupHeader}>
        <h3>Детали законченного случая</h3>
      </header>

      <div className={styles.groupLineGrid}>
        <div className={styles.span3}>
          <MedViewDateInput
            value={completedCaseDetailsFiltersSubgroupDraft.treatmentStartDate}
            handleDateInputChange={(newValue: Dayjs | null) =>
              setCompletedCaseDetailsFiltersSubgroupDraft({
                ...completedCaseDetailsFiltersSubgroupDraft,
                treatmentStartDate: newValue,
              })
            }
            label="Начало лечения"
          />
        </div>
        <div className={styles.span3}>
          <MedViewDateInput
            value={completedCaseDetailsFiltersSubgroupDraft.treatmentEndDate}
            handleDateInputChange={(newValue: Dayjs | null) =>
              setCompletedCaseDetailsFiltersSubgroupDraft({
                ...completedCaseDetailsFiltersSubgroupDraft,
                treatmentEndDate: newValue,
              })
            }
            label="Окончание лечения"
          />
        </div>
        <div className={styles.span3}>
          <MedViewMultipleSelectInput
            label="Условия оказания медицинской помощи"
            values={completedCaseDetailsFiltersSubgroupDraft.careConditions}
            onChange={(newValue: string[]) =>
              setCompletedCaseDetailsFiltersSubgroupDraft({
                ...completedCaseDetailsFiltersSubgroupDraft,
                careConditions: newValue,
              })
            }
            options={
              careConditionFilterOptions?.map((option) => ({
                label: option.label,
                value: option.value,
              })) ?? []
            }
          />
        </div>
        <div className={styles.span3}>
          <MedViewMultipleSelectInput
            label="Форма оказания медицинской помощи"
            values={completedCaseDetailsFiltersSubgroupDraft.careForms}
            onChange={(newValue: string[]) =>
              setCompletedCaseDetailsFiltersSubgroupDraft({
                ...completedCaseDetailsFiltersSubgroupDraft,
                careForms: newValue,
              })
            }
            options={
              medicalCareFormFilterOptions?.map((option) => ({
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
            label="Вид медицинской помощи"
            values={completedCaseDetailsFiltersSubgroupDraft.medicalCareTypes}
            onChange={(newValue: string[]) =>
              setCompletedCaseDetailsFiltersSubgroupDraft({
                ...completedCaseDetailsFiltersSubgroupDraft,
                medicalCareTypes: newValue,
              })
            }
            options={
              medicalCareTypeFilterOptions?.map((option) => ({
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
            label="Медицинская организация"
            values={
              completedCaseDetailsFiltersSubgroupDraft.medicalOrganizations
            }
            onChange={(newValue: string[]) =>
              setCompletedCaseDetailsFiltersSubgroupDraft({
                ...completedCaseDetailsFiltersSubgroupDraft,
                medicalOrganizations: newValue,
              })
            }
            options={[]}
          />
        </div>
      </div>

      <div className={styles.groupLineGrid}>
        <div className={styles.span12}>
          <MedViewMultipleSelectInput
            label="Направившая медицинская организация"
            values={
              completedCaseDetailsFiltersSubgroupDraft.referringMedicalOrganizations
            }
            onChange={(newValue: string[]) =>
              setCompletedCaseDetailsFiltersSubgroupDraft({
                ...completedCaseDetailsFiltersSubgroupDraft,
                referringMedicalOrganizations: newValue,
              })
            }
            options={[]}
          />
        </div>
      </div>

      <div className={styles.groupLineGrid}>
        <div className={styles.span12}>
          <MedViewMultipleSelectInput
            label="Результат диспансеризации"
            values={completedCaseDetailsFiltersSubgroupDraft.screeningResults}
            onChange={(newValue: string[]) =>
              setCompletedCaseDetailsFiltersSubgroupDraft({
                ...completedCaseDetailsFiltersSubgroupDraft,
                screeningResults: newValue,
              })
            }
            options={
              screeningResultFilterOptions?.map((option) => ({
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
            label="Результат обращения / госпитализации"
            values={
              completedCaseDetailsFiltersSubgroupDraft.hospitalizationOutcomes
            }
            onChange={(newValue: string[]) =>
              setCompletedCaseDetailsFiltersSubgroupDraft({
                ...completedCaseDetailsFiltersSubgroupDraft,
                hospitalizationOutcomes: newValue,
              })
            }
            options={
              hospitalizationOutcomeFilterOptions?.map((option) => ({
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
            label="Код способа оплаты"
            values={completedCaseDetailsFiltersSubgroupDraft.paymentMethods}
            onChange={(newValue: string[]) =>
              setCompletedCaseDetailsFiltersSubgroupDraft({
                ...completedCaseDetailsFiltersSubgroupDraft,
                paymentMethods: newValue,
              })
            }
            options={
              paymentMethodFilterOptions?.map((option) => ({
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
            label="Исход заболевания"
            values={completedCaseDetailsFiltersSubgroupDraft.diseaseOutcomes}
            onChange={(newValue: string[]) =>
              setCompletedCaseDetailsFiltersSubgroupDraft({
                ...completedCaseDetailsFiltersSubgroupDraft,
                diseaseOutcomes: newValue,
              })
            }
            options={
              diseaseOutcomeFilterOptions?.map((option) => ({
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
