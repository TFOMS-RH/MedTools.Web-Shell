import { resolveDataState } from "../../../../../../../../../../shared/helpers/resolveDataState";
import { DataState } from "../../../../../../../../../../shared/ui/DataState/DataState";
import { usePrescriptionsQuery } from "../../../../../../../../../../shared/model/queries/invoiceStructure/prescriptions/usePrescriptionsQuery";
import { useMedViewFiltersStore } from "../../../../../../../filters/model/stores/useMedViewFiltersStore";
import { useMedViewWorkspaceStore } from "../../../../../../model/stores/useMedViewWorkspaceStore";
import { MedViewPrescriptionCards } from "./MedViewPrescriptionCards";
import styles from "../../styles.module.scss";

export const MedViewPrescriptionCardsGroupRoot = () => {
  const { targetDb } = useMedViewFiltersStore();
  const { selectedMedicalCaseUid } = useMedViewWorkspaceStore();
  const {
    data: prescriptions,
    isLoading,
    isPending,
    isError,
    isSuccess,
    error,
  } = usePrescriptionsQuery(selectedMedicalCaseUid, targetDb);

  const dataState = resolveDataState({
    isEnabled: selectedMedicalCaseUid !== null && targetDb !== null,
    isLoading: isLoading,
    isError: isError,
    isSuccess: isSuccess,
    isEmpty: prescriptions?.length === 0 && isSuccess,
  });

  return (
    <section className={styles.section} aria-labelledby="medview-prescriptions-heading">
      <h3 id="medview-prescriptions-heading" className={styles.sectionHeading}>Назначения</h3>
      {dataState === "error" ? (
        <DataState
          title="Ошибка данных"
          description={error?.message ?? "Неизвестная ошибка"}
          variant="error"
        />
      ) : dataState === "empty" ? (
        <DataState
          title="Данных не найдено"
          description="Медицинский случай не содержит информации о назначениях"
          variant="empty"
        />
      ) : (
        <MedViewPrescriptionCards
          prescriptions={prescriptions ?? []}
          isPending={isPending}
        />
      )}
    </section>
  );
};
