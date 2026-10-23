import type { Dayjs } from "dayjs";
import type { SanctionFiltersGroupDraft } from "../../../../workspace/model/types/FiltersDraft";
import type { FilterOption } from "../../../../workspace/model/types/FilterOptions";
import { MedViewDateInput } from "../../../../../../../shared/ui/medView/inputs/MedViewDateInput/MedViewDateInput";
import { MedViewDefaultInput } from "../../../../../../../shared/ui/medView/inputs/MedViewDefaultInput/MedViewDefaultInput";
import { MedViewMultipleSelectInput } from "../../../../../../../shared/ui/medView/inputs/MedViewMultipleSelectInput/MedViewMultipleSelectInput";
import { MedViewAutocompleteInput } from "../../../../../../../shared/ui/medView/inputs/MedViewAutocompleteInput/MedViewAutocompleteInput";
import { useState } from "react";
import { useFilterOptionsQuery } from "../../../../../../../shared/model/references/queries/useFilterOptionsQuery";
import { MedicalReferenceType } from "../../../../../../../shared/model/references/types/MedicalReferenceType";
import styles from "./styles.module.scss";

interface SanctionFiltersGroupProps {
  sanctionFiltersGroupDraft: SanctionFiltersGroupDraft;
  setSanctionFiltersGroupDraft: (
    sanctionFiltersGroupDraft: SanctionFiltersGroupDraft,
  ) => void;
}

const SanctionFiltersGroup = ({
  sanctionFiltersGroupDraft,
  setSanctionFiltersGroupDraft,
}: SanctionFiltersGroupProps) => {
  const [
    inputRefusalReasonCodeFilterOptions,
    setInputRefusalReasonCodeFilterOptions,
  ] = useState("");

  const { data: refusalReasonCodes, isPending } = useFilterOptionsQuery(
    MedicalReferenceType.RefusalReasonCodes,
    inputRefusalReasonCodeFilterOptions,
  );

  const { data: controlTypes } = useFilterOptionsQuery(
    MedicalReferenceType.ControlTypeCodes,
  );

  return (
    <section className={styles.sanctionFiltersGroup}>
      <header className={styles.sanctionFiltersGroupeader}>
        <div className={styles.titleGroup}>
          <h2>Фильтрация по санкциям</h2>
          <p className={styles.description}>
            Все поля, которые относятся к санкциям
          </p>
        </div>
      </header>
      <div className={styles.sanctionFiltersSubgroup}>
        <header className={styles.subgroupHeader}>
          <h3>Санкции</h3>
        </header>
        <div className={styles.groupLineGrid}>
          <div className={styles.span12}>
            <MedViewMultipleSelectInput
              label="Код вида контроля"
              values={sanctionFiltersGroupDraft.controlTypeCodes}
              options={controlTypes ?? []}
              onChange={(newValue: string[]) =>
                setSanctionFiltersGroupDraft({
                  ...sanctionFiltersGroupDraft,
                  controlTypeCodes: newValue,
                })
              }
            />
          </div>
        </div>

        <div className={styles.groupLineGrid}>
          <div className={styles.span3}>
            <MedViewDefaultInput
              label="Номер акта МЭК, МЭЭ или ЭКМП"
              placeholder="0000"
              value={sanctionFiltersGroupDraft.expertiseActNumber}
              handleInputChange={(newValue: string) =>
                setSanctionFiltersGroupDraft({
                  ...sanctionFiltersGroupDraft,
                  expertiseActNumber: newValue,
                })
              }
            />
          </div>
          <div className={styles.span3}>
            <MedViewDateInput
              label="Дата акта МЭК, МЭЭ или ЭКМП"
              value={sanctionFiltersGroupDraft.expertiseActDate}
              handleDateInputChange={(newValue: Dayjs | null) =>
                setSanctionFiltersGroupDraft({
                  ...sanctionFiltersGroupDraft,
                  expertiseActDate: newValue,
                })
              }
            />
          </div>
          <div className={styles.span6}>
            <MedViewAutocompleteInput
              label="Код причины отказа"
              values={sanctionFiltersGroupDraft.refusalReasons}
              options={refusalReasonCodes ?? []}
              inputValue={inputRefusalReasonCodeFilterOptions}
              onInputChange={setInputRefusalReasonCodeFilterOptions}
              onChange={(newValue: FilterOption[]) =>
                setSanctionFiltersGroupDraft({
                  ...sanctionFiltersGroupDraft,
                  refusalReasons: newValue,
                })
              }
              loading={isPending}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default SanctionFiltersGroup;
