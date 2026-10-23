import type { Dayjs } from "dayjs";
import type { MedicalCaseDetailsFiltersSubgroupDraft } from "../../../../workspace/model/types/FiltersDraft";
import { MedViewDateInput } from "../../../../../../../shared/ui/medView/inputs/MedViewDateInput/MedViewDateInput";
import { MedViewDefaultInput } from "../../../../../../../shared/ui/medView/inputs/MedViewDefaultInput/MedViewDefaultInput";
import { MedViewMultipleSelectInput } from "../../../../../../../shared/ui/medView/inputs/MedViewMultipleSelectInput/MedViewMultipleSelectInput";
import { useFilterOptionsQuery } from "../../../../../../../shared/model/references/queries/useFilterOptionsQuery";
import { MedicalReferenceType } from "../../../../../../../shared/model/references/types/MedicalReferenceType";
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
  const { data: medicalCareProfiles } = useFilterOptionsQuery(
    MedicalReferenceType.MedicalCareProfiles,
  );

  const { data: bedProfiles } = useFilterOptionsQuery(
    MedicalReferenceType.BedProfiles,
  );

  const { data: visitPlaces } = useFilterOptionsQuery(
    MedicalReferenceType.VisitPlaces,
  );

  const { data: visitPurposes } = useFilterOptionsQuery(
    MedicalReferenceType.VisitPurposes,
  );

  const { data: diseaseCharacters } = useFilterOptionsQuery(
    MedicalReferenceType.DiseaseCharacters,
  );

  const { data: physicianSpecialities } = useFilterOptionsQuery(
    MedicalReferenceType.PhysicianSpecialities,
  );

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
            options={medicalCareProfiles ?? []}
            onChange={(newValue: string[]) =>
              setMedicalCaseDetailsFiltersSubgroupDraft({
                ...medicalCaseDetailsFiltersSubgroupDraft,
                medicalProfiles: newValue,
              })
            }
          />
        </div>
      </div>

      <div className={styles.groupLineGrid}>
        <div className={styles.span12}>
          <MedViewMultipleSelectInput
            label="Профиль койки"
            values={medicalCaseDetailsFiltersSubgroupDraft.bedProfiles}
            options={bedProfiles ?? []}
            onChange={(newValue: string[]) =>
              setMedicalCaseDetailsFiltersSubgroupDraft({
                ...medicalCaseDetailsFiltersSubgroupDraft,
                bedProfiles: newValue,
              })
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
            options={visitPlaces ?? []}
            onChange={(newValue: string[]) =>
              setMedicalCaseDetailsFiltersSubgroupDraft({
                ...medicalCaseDetailsFiltersSubgroupDraft,
                encounterMedicalOrganizations: newValue,
              })
            }
          />
        </div>
      </div>

      <div className={styles.groupLineGrid}>
        <div className={styles.span12}>
          <MedViewMultipleSelectInput
            label="Цель посещения"
            values={medicalCaseDetailsFiltersSubgroupDraft.visitPurposes}
            options={visitPurposes ?? []}
            onChange={(newValue: string[]) =>
              setMedicalCaseDetailsFiltersSubgroupDraft({
                ...medicalCaseDetailsFiltersSubgroupDraft,
                visitPurposes: newValue,
              })
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
            options={diseaseCharacters ?? []}
            onChange={(newValue: string[]) =>
              setMedicalCaseDetailsFiltersSubgroupDraft({
                ...medicalCaseDetailsFiltersSubgroupDraft,
                diseaseCharacters: newValue,
              })
            }
          />
        </div>
      </div>

      <div className={styles.groupLineGrid}>
        <div className={styles.span12}>
          <MedViewMultipleSelectInput
            label="Специальность лечащего врача"
            values={medicalCaseDetailsFiltersSubgroupDraft.physicianSpecialties}
            options={physicianSpecialities ?? []}
            onChange={(newValue: string[]) =>
              setMedicalCaseDetailsFiltersSubgroupDraft({
                ...medicalCaseDetailsFiltersSubgroupDraft,
                physicianSpecialties: newValue,
              })
            }
          />
        </div>
      </div>
    </div>
  );
};
