import styles from "../../styles.module.scss";
import { DataState } from "../../../../../../../../../../shared/ui/DataState/DataState";
import { useConsultationsQuery } from "../../../../../../../../../../shared/model/queries/invoiceStructure/oncology/useConsultationsQuery";
import { useMedViewWorkspaceStore } from "../../../../../../model/stores/useMedViewWorkspaceStore";
import { useMedViewFiltersStore } from "../../../../../../../filters/model/stores/useMedViewFiltersStore";
import { MedViewConsultationsListHeader } from "./MedViewConsultationsListHeader";
import { MedViewConsultationsListBody } from "./MedViewConsultationsListBody";
import { resolveDataState } from "../../../../../../../../../../shared/helpers/resolveDataState";

export const MedViewConsultationsListRoot = () => {
  const { selectedMedicalCaseUid } = useMedViewWorkspaceStore();
  const { targetDb } = useMedViewFiltersStore();
  const {
    data: consultations,
    isPending,
    isLoading,
    isError,
    isSuccess,
    error,
  } = useConsultationsQuery(selectedMedicalCaseUid, targetDb);

  const dataState = resolveDataState({
    isEnabled: selectedMedicalCaseUid !== null && targetDb !== null,
    isLoading: isLoading,
    isEmpty: consultations?.length === 0 && isSuccess,
    isError: isError,
    isSuccess: isSuccess,
  });

  return (
    <section className={styles.panel}>
      <MedViewConsultationsListHeader />
      {dataState === "error" ? (
        <DataState
          title="Ошибка данных"
          description={error?.message ?? "Неизвестная ошибка"}
          variant="error"
        />
      ) : dataState === "empty" ? (
        <DataState
          title="Данных не найдено"
          description="Данный медицинский случай не содержит информации о консилиумах"
          variant="empty"
        />
      ) : (
        <MedViewConsultationsListBody
          consultations={consultations ?? []}
          isPending={isPending}
        />
      )}
    </section>
  );
};
