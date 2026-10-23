import type { Dayjs } from "dayjs";
import type { MedicalCaseDetailsFiltersSubgroupDraft } from "../../../../workspace/model/types/FiltersDraft";
import { useFilterOptionsByCodeQuery } from "../../../model/queries/useFilterOptionsQuery";
import { MedViewDateInput } from "../../../../../../../shared/ui/medView/inputs/MedViewDateInput/MedViewDateInput";
import { MedViewDefaultInput } from "../../../../../../../shared/ui/medView/inputs/MedViewDefaultInput/MedViewDefaultInput";
import { MedViewMultipleSelectInput } from "../../../../../../../shared/ui/medView/inputs/MedViewMultipleSelectInput/MedViewMultipleSelectInput";
import styles from "./styles.module.scss";

interface MedicalCaseDetailsFiltersSubgroupProps {
  medicalCaseDetailsFiltersSubgroupDraft: MedicalCaseDetailsFiltersSubgroupDraft;
  setMedicalCaseDetailsFiltersSubgroupDraft: (
    medicalCaseDetailsFiltersSubgroupDraft: MedicalCaseDetailsFiltersSubgroupDraft,
  ) => void;
}

export const MedicalCaseDetailsFiltersSubgroup = ({
  medicalCaseDetailsFiltersSubgroupDraft,
  setMedicalCaseDetailsFiltersSubgroupDraft,
}: MedicalCaseDetailsFiltersSubgroupProps) => {
  const { data: medicalCareFilterOptions } = useFilterOptionsByCodeQuery(
    "V002",
    "medical-care-profile",
  );

  const { data: bedProfileFilterOptions } = useFilterOptionsByCodeQuery(
    "V020",
    "bed-profile",
  );

  const { data: visitPlaceFilterOptions } = useFilterOptionsByCodeQuery(
    "V040",
    "visit-place",
  );

  const { data: visitPurposeFilterOptions } = useFilterOptionsByCodeQuery(
    "V025",
    "visit-purpose",
  );

  const { data: diseaseCharacterFilterOptions } = useFilterOptionsByCodeQuery(
    "V027",
    "disease-character",
  );

  const { data: physicianSpecialitiesFilterOptions } =
    useFilterOptionsByCodeQuery("V021", "physician-speciality");

  return (
    <div className={styles.medicalCaseDetailsSubgroup}>
      <header className={styles.subgroupHeader}>
        <h3>Детали медицинского случая</h3>
      </header>

      <div className={styles.groupLineGrid}>
        <div className={styles.span2}>
          <MedViewDateInput
            label="Начало лечения"
            value={medicalCaseDetailsFiltersSubgroupDraft.treatmentStartDate}
            handleDateInputChange={(newValue: Dayjs | null) =>
              setMedicalCaseDetailsFiltersSubgroupDraft({
                ...medicalCaseDetailsFiltersSubgroupDraft,
                treatmentStartDate: newValue,
              })
            }
          />
        </div>
        <div className={styles.span2}>
          <MedViewDateInput
            label="Окончание лечения"
            value={medicalCaseDetailsFiltersSubgroupDraft.treatmentEndDate}
            handleDateInputChange={(newValue: Dayjs | null) =>
              setMedicalCaseDetailsFiltersSubgroupDraft({
                ...medicalCaseDetailsFiltersSubgroupDraft,
                treatmentEndDate: newValue,
              })
            }
          />
        </div>
        <div className={styles.span4}>
          <MedViewDefaultInput
            label="Структурное подразделение"
            placeholder="01202600100001005"
            handleInputChange={(newValue: string) =>
              setMedicalCaseDetailsFiltersSubgroupDraft({
                ...medicalCaseDetailsFiltersSubgroupDraft,
                division: newValue,
              })
            }
            value={medicalCaseDetailsFiltersSubgroupDraft.division}
          />
        </div>
        <div className={styles.span4}>
          <MedViewDefaultInput
            label="Номер истории"
            placeholder="Номер истории"
            value={medicalCaseDetailsFiltersSubgroupDraft.medicalRecordNumber}
            handleInputChange={(newValue: string) =>
              setMedicalCaseDetailsFiltersSubgroupDraft({
                ...medicalCaseDetailsFiltersSubgroupDraft,
                medicalRecordNumber: newValue,
              })
            }
          />
        </div>
      </div>

      <div className={styles.groupLineGrid}>
        <div className={styles.span12}>
          <MedViewMultipleSelectInput
            label="Профиль медицинской помощи"
            values={medicalCaseDetailsFiltersSubgroupDraft.medicalProfiles}
            onChange={(newValue: string[]) =>
              setMedicalCaseDetailsFiltersSubgroupDraft({
                ...medicalCaseDetailsFiltersSubgroupDraft,
                medicalProfiles: newValue,
              })
            }
            options={
              medicalCareFilterOptions?.map((option) => ({
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
            label="Профиль койки"
            values={medicalCaseDetailsFiltersSubgroupDraft.bedProfiles}
            onChange={(newValue: string[]) =>
              setMedicalCaseDetailsFiltersSubgroupDraft({
                ...medicalCaseDetailsFiltersSubgroupDraft,
                bedProfiles: newValue,
              })
            }
            options={
              bedProfileFilterOptions?.map((option) => ({
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
            label="Место обращения"
            values={
              medicalCaseDetailsFiltersSubgroupDraft.encounterMedicalOrganizations
            }
            onChange={(newValue: string[]) =>
              setMedicalCaseDetailsFiltersSubgroupDraft({
                ...medicalCaseDetailsFiltersSubgroupDraft,
                encounterMedicalOrganizations: newValue,
              })
            }
            options={
              visitPlaceFilterOptions?.map((option) => ({
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
            label="Цель посещения"
            values={medicalCaseDetailsFiltersSubgroupDraft.visitPurposes}
            onChange={(newValue: string[]) =>
              setMedicalCaseDetailsFiltersSubgroupDraft({
                ...medicalCaseDetailsFiltersSubgroupDraft,
                visitPurposes: newValue,
              })
            }
            options={
              visitPurposeFilterOptions?.map((option) => ({
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
            label="Место проведения профилактического мероприятия"
            values={medicalCaseDetailsFiltersSubgroupDraft.preventiveCarePlaces}
            options={[
              { label: "В медицинской организации", value: "1" },
              { label: "По месту работы", value: "2" },
              { label: "По месту учебы", value: "3" },
              { label: "В стационарном учреждении", value: "4" },
            ]}
            onChange={(newValue: string[]) =>
              setMedicalCaseDetailsFiltersSubgroupDraft({
                ...medicalCaseDetailsFiltersSubgroupDraft,
                preventiveCarePlaces: newValue,
              })
            }
          />
        </div>
        <div className={styles.span6}>
          <MedViewMultipleSelectInput
            label="Характер основного заболевания"
            values={medicalCaseDetailsFiltersSubgroupDraft.diseaseCharacters}
            onChange={(newValue: string[]) =>
              setMedicalCaseDetailsFiltersSubgroupDraft({
                ...medicalCaseDetailsFiltersSubgroupDraft,
                diseaseCharacters: newValue,
              })
            }
            options={
              diseaseCharacterFilterOptions?.map((option) => ({
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
            label="Специальность лечащего врача"
            values={medicalCaseDetailsFiltersSubgroupDraft.physicianSpecialties}
            onChange={(newValue: string[]) =>
              setMedicalCaseDetailsFiltersSubgroupDraft({
                ...medicalCaseDetailsFiltersSubgroupDraft,
                physicianSpecialties: newValue,
              })
            }
            options={
              physicianSpecialitiesFilterOptions?.map((option) => ({
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
