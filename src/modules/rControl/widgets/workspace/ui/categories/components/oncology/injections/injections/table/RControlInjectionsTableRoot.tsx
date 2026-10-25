import styles from "../../../styles.module.scss";
import { resolveDataState } from "../../../../../../../../../../../shared/helpers/resolveDataState";
import { DataState } from "../../../../../../../../../../../shared/ui/DataState/DataState";
import { useInjectionsQuery } from "../../../../../../../../../../../shared/model/queries/invoiceStructure/oncology/useInjectionsQuery";
import { useRControlWorkspacePanelStore } from "../../../../../../../model/store/useRControlWorkspacePanelStore";
import { RControlInjectionsTableBody } from "./RControlInjectionsTableBody";
import { RControlInjectionsTableHeader } from "./RControlInjectionsTableHeader";

export const RControlInjectionsTableRoot = ({
  selectedMedicationUid,
}: {
  selectedMedicationUid: number;
}) => {
  const { targetDb } = useRControlWorkspacePanelStore();
  const {
    data: injections,
    isLoading,
    isPending,
    isError,
    isSuccess,
    error,
  } = useInjectionsQuery(selectedMedicationUid, targetDb);

  const dataState = resolveDataState({
    isEnabled: selectedMedicationUid !== null && targetDb !== null,
    isLoading: isLoading,
    isError: isError,
    isSuccess: isSuccess,
    isEmpty: injections?.length === 0 && isSuccess,
  });

  return (
    <section className={styles.panel}>
      <RControlInjectionsTableHeader />
      {dataState === "error" ? (
        <DataState
          title="Ошибка данных"
          description={error?.message ?? "Неизвестная ошибка"}
          variant="error"
        />
      ) : dataState === "empty" ? (
        <DataState
          title="Данных не найдено"
          description="Лекарственный препарат не содержит информации о инъекциях"
          variant="empty"
        />
      ) : (
        <RControlInjectionsTableBody
          injections={injections ?? []}
          isPending={isPending}
        />
      )}
    </section>
  );
};
