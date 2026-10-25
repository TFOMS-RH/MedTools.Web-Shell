import styles from "../../../styles.module.scss";
import { RControlInjectionDateChipSkeletons } from "./RControlInjectionDateChipSkeletons";
import { resolveDataState } from "../../../../../../../../../../../shared/helpers/resolveDataState";
import { DataState } from "../../../../../../../../../../../shared/ui/DataState/DataState";
import { useInjectionDatesQuery } from "../../../../../../../../../../../shared/model/queries/invoiceStructure/oncology/useInjectionDatesQuery";
import { useRControlWorkspacePanelStore } from "../../../../../../../model/store/useRControlWorkspacePanelStore";
import { RControlInjectionDateChipsGroupHeader } from "./RControlInjectionDateChipsGroupHeader";
import { RControlInjectionDateChips } from "./RControlInjectionDateChips";

export const RControlInjectionDateChipsGroupRoot = ({
  selectedMedicationUid,
}: {
  selectedMedicationUid: number;
}) => {
  const { targetDb } = useRControlWorkspacePanelStore();
  const {
    data: injectionDates,
    isLoading,
    isSuccess,
    isError,
    error,
  } = useInjectionDatesQuery(selectedMedicationUid, targetDb);

  const dataState = resolveDataState({
    isEnabled: selectedMedicationUid !== null && targetDb !== null,
    isLoading: isLoading,
    isError: isError,
    isSuccess: isSuccess,
    isEmpty: injectionDates?.length === 0 && isSuccess,
  });

  return (
    <section className={styles.panel}>
      <RControlInjectionDateChipsGroupHeader />
      {dataState === "error" ? (
        <DataState
          title="Ошибка данных"
          description={error?.message ?? "Неизвестная ошибка"}
          variant="error"
        />
      ) : dataState === "loading" ? (
        <RControlInjectionDateChipSkeletons />
      ) : dataState === "empty" ? (
        <DataState
          title="Данных не найдено"
          description="Лекарственный препарат не содержит сведений о датах введения"
          variant="empty"
        />
      ) : (
        <RControlInjectionDateChips injectionDates={injectionDates ?? []} />
      )}
    </section>
  );
};
