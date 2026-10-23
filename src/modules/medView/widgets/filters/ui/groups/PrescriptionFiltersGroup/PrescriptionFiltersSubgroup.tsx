import type { PrescriptionFiltersSubgroupDraft } from "../../../../workspace/model/types/FiltersDraft";
import type { FilterOption } from "../../../../workspace/model/types/FilterOptions";
import type { Dayjs } from "dayjs";
import { useFilterOptionsByCodeQuery } from "../../../model/queries/useFilterOptionsQuery";
import { MedViewDateInput } from "../../../../../../../shared/ui/medView/inputs/MedViewDateInput/MedViewDateInput";
import { MedViewMultipleSelectInput } from "../../../../../../../shared/ui/medView/inputs/MedViewMultipleSelectInput/MedViewMultipleSelectInput";
import { MedViewAutocompleteInput } from "../../../../../../../shared/ui/medView/inputs/MedViewAutocompleteInput/MedViewAutocompleteInput";
import { useState } from "react";
import styles from "./styles.module.scss";

interface PrescriptionFiltersSubgroupProps {
  prescriptionFiltersSubgroup: PrescriptionFiltersSubgroupDraft;
  setPrescriptionFiltersSubgroup: (
    prescriptionFiltersSubgroup: PrescriptionFiltersSubgroupDraft,
  ) => void;
}

export const PrescriptionFiltersSubgroup = ({
  prescriptionFiltersSubgroup,
  setPrescriptionFiltersSubgroup,
}: PrescriptionFiltersSubgroupProps) => {
  const [inputServiceValue, setInputServiceValue] = useState("");

  const { data: diagnosticMethods } = useFilterOptionsByCodeQuery(
    "V029",
    "diagnostic-method",
  );

  const { data: medicalCares } = useFilterOptionsByCodeQuery(
    "V002",
    "medical-care-profile",
  );

  const { data: bedProfiles } = useFilterOptionsByCodeQuery(
    "V020",
    "bed-profile",
  );

  const { data: medicalServices, isPending } = useFilterOptionsByCodeQuery(
    "V001",
    "medical-service",
    inputServiceValue,
  );

  return (
    <div className={styles.prescriptionSubgroup}>
      <header className={styles.subgroupHeader}>
        <h3>Назначения</h3>
      </header>
      <div className={styles.groupLineGrid}>
        <div className={styles.span2}>
          <MedViewDateInput
            label="Дата направления"
            value={prescriptionFiltersSubgroup.referralDate}
            handleDateInputChange={(newValue: Dayjs | null) =>
              setPrescriptionFiltersSubgroup({
                ...prescriptionFiltersSubgroup,
                referralDate: newValue,
              })
            }
          />
        </div>
        <div className={styles.span10}>
          <MedViewMultipleSelectInput
            label="МО направления"
            values={prescriptionFiltersSubgroup.referredToMedicalOrganizations}
            onChange={(newValue: string[]) =>
              setPrescriptionFiltersSubgroup({
                ...prescriptionFiltersSubgroup,
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
            label="Вид назначения"
            values={prescriptionFiltersSubgroup.prescriptionTypes}
            onChange={(newValue: string[]) =>
              setPrescriptionFiltersSubgroup({
                ...prescriptionFiltersSubgroup,
                prescriptionTypes: newValue,
              })
            }
            options={[
              {
                label:
                  "Направлен на консультацию в медицинскую организацию по месту прикрепления",
                value: "1",
              },
              {
                label:
                  "Направлен на консультацию в иную медицинскую организацию",
                value: "2",
              },
              {
                label: "Направлен на обследование",
                value: "3",
              },
              {
                label: "Направлен в дневной стационар",
                value: "4",
              },
              {
                label: "Направлен на госпитализацию",
                value: "5",
              },
              {
                label: "Направлен в реабилитационное отделение",
                value: "6",
              },
            ]}
          />
        </div>
      </div>

      <div className={styles.groupLineGrid}>
        <div className={styles.span12}>
          <MedViewMultipleSelectInput
            label="Метод  диагностического исследования"
            values={prescriptionFiltersSubgroup.diagnosticMethods}
            onChange={(newValue: string[]) =>
              setPrescriptionFiltersSubgroup({
                ...prescriptionFiltersSubgroup,
                diagnosticMethods: newValue,
              })
            }
            options={
              diagnosticMethods?.map((option) => ({
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
            label="Профиль медицинской помощи"
            values={prescriptionFiltersSubgroup.medicalCareProfiles}
            onChange={(newValue: string[]) =>
              setPrescriptionFiltersSubgroup({
                ...prescriptionFiltersSubgroup,
                medicalCareProfiles: newValue,
              })
            }
            options={
              medicalCares?.map((option) => ({
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
            values={prescriptionFiltersSubgroup.bedProfiles}
            onChange={(newValue: string[]) =>
              setPrescriptionFiltersSubgroup({
                ...prescriptionFiltersSubgroup,
                bedProfiles: newValue,
              })
            }
            options={
              bedProfiles?.map((option) => ({
                label: option.label,
                value: option.value,
              })) ?? []
            }
          />
        </div>
      </div>

      <div className={styles.groupLineGrid}>
        <div className={styles.span12}>
          <MedViewAutocompleteInput
            label="Услуги, указанные в направлении"
            values={prescriptionFiltersSubgroup.services}
            options={medicalServices ?? []}
            inputValue={inputServiceValue}
            onInputChange={setInputServiceValue}
            onChange={(newValue: FilterOption[]) =>
              setPrescriptionFiltersSubgroup({
                ...prescriptionFiltersSubgroup,
                services: newValue,
              })
            }
            loading={isPending}
          />
        </div>
      </div>
    </div>
  );
};
