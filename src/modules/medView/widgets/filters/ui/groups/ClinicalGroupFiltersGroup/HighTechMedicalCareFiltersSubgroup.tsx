import type { HighTechMedicalCareSubgroupDraft } from "../../../../workspace/model/types/FiltersDraft";
import type { FilterOption } from "../../../../workspace/model/types/FilterOptions";
import type { Dayjs } from "dayjs";
import { useState } from "react";
import { MedViewAutocompleteInput } from "../../../../../../../shared/ui/medView/inputs/MedViewAutocompleteInput/MedViewAutocompleteInput";
import { MedViewDateInput } from "../../../../../../../shared/ui/medView/inputs/MedViewDateInput/MedViewDateInput";
import { MedViewDefaultInput } from "../../../../../../../shared/ui/medView/inputs/MedViewDefaultInput/MedViewDefaultInput";
import styles from "./styles.module.scss";
import { useFilterOptionsByCodeQuery } from "../../../model/queries/useFilterOptionsQuery";

interface HighTechMedicalCareFiltersSubgroupProps {
  highTechMedicalCareFiltersSubgroupDraft: HighTechMedicalCareSubgroupDraft;
  setHighTechMedicalCareFiltersSubgroupDraft: (
    highTechMedicalCareFiltersSubgroupDraft: HighTechMedicalCareSubgroupDraft,
  ) => void;
}

export const HighTechMedicalCareFiltersSubgroup = ({
  highTechMedicalCareFiltersSubgroupDraft,
  setHighTechMedicalCareFiltersSubgroupDraft,
}: HighTechMedicalCareFiltersSubgroupProps) => {
  const [inputHighTechCareTypeValue, setInputHighTechCareTypeValue] =
    useState("");
  const [inputHighTechCareMethodValue, setInputHighTechCareMethodValue] =
    useState("");

  const { data: highTechCareTypes, isPending: highTechCareTypePending } =
    useFilterOptionsByCodeQuery(
      "V018",
      "high-tech-care-type",
      inputHighTechCareTypeValue,
    );

  const {
    data: highTechCareMethodFilterOptions,
    isPending: highTechCareMethodPending,
  } = useFilterOptionsByCodeQuery(
    "V019",
    "high-tech-care-medthod",
    inputHighTechCareMethodValue,
  );

  return (
    <div className={styles.highTechMedicalCareFiltersSubgroup}>
      <header className={styles.subgroupHeader}>
        <h3>ВМП</h3>
      </header>
      <div className={styles.groupLineGrid}>
        <div className={styles.span2}>
          <MedViewAutocompleteInput
            label="Вид ВМП"
            values={highTechMedicalCareFiltersSubgroupDraft.highTechCareTypes}
            options={highTechCareTypes ?? []}
            inputValue={inputHighTechCareTypeValue}
            onInputChange={setInputHighTechCareTypeValue}
            onChange={(newValue: FilterOption[]) =>
              setHighTechMedicalCareFiltersSubgroupDraft({
                ...highTechMedicalCareFiltersSubgroupDraft,
                highTechCareTypes: newValue,
              })
            }
            loading={highTechCareTypePending}
          />
        </div>
        <div className={styles.span10}>
          <MedViewAutocompleteInput
            label="Метод ВМП"
            values={highTechMedicalCareFiltersSubgroupDraft.highTechCareMethods}
            options={highTechCareMethodFilterOptions ?? []}
            inputValue={inputHighTechCareMethodValue}
            onInputChange={setInputHighTechCareMethodValue}
            onChange={(newValue: FilterOption[]) =>
              setHighTechMedicalCareFiltersSubgroupDraft({
                ...highTechMedicalCareFiltersSubgroupDraft,
                highTechCareMethods: newValue,
              })
            }
            loading={highTechCareMethodPending}
          />
        </div>
      </div>

      <div className={styles.groupLineGrid}>
        <div className={styles.span2}>
          <MedViewDateInput
            label="Дата выдачи талона"
            value={highTechMedicalCareFiltersSubgroupDraft.voucherIssueDate}
            handleDateInputChange={(newValue: Dayjs | null) =>
              setHighTechMedicalCareFiltersSubgroupDraft({
                ...highTechMedicalCareFiltersSubgroupDraft,
                voucherIssueDate: newValue,
              })
            }
          />
        </div>
        <div className={styles.span4}>
          <MedViewDateInput
            label="Дата планируемой госпитализации"
            value={
              highTechMedicalCareFiltersSubgroupDraft.plannedAdmissionDates
            }
            handleDateInputChange={(newValue: Dayjs | null) =>
              setHighTechMedicalCareFiltersSubgroupDraft({
                ...highTechMedicalCareFiltersSubgroupDraft,
                plannedAdmissionDates: newValue,
              })
            }
          />
        </div>
        <div className={styles.span6}>
          <MedViewDefaultInput
            label="Номер талона на ВМП"
            placeholder="00.0000.00000.000"
            value={highTechMedicalCareFiltersSubgroupDraft.voucherNumber}
            handleInputChange={(newValue: string) =>
              setHighTechMedicalCareFiltersSubgroupDraft({
                ...highTechMedicalCareFiltersSubgroupDraft,
                voucherNumber: newValue,
              })
            }
          />
        </div>
      </div>
    </div>
  );
};
