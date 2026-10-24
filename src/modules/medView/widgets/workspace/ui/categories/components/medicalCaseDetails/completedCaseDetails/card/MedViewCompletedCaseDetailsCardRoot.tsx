import { resolveDataState } from "../../../../../../../../../../shared/helpers/resolveDataState";
import { DataState } from "../../../../../../../../../../shared/ui/DataState/DataState";
import { useCompletedCaseDetailsQuery } from "../../../../../../../../../../shared/model/queries/invoiceStructure/medicalCaseDetails/useCompletedCaseDetailsQuery";
import { useMedViewFiltersStore } from "../../../../../../../filters/model/stores/useMedViewFiltersStore";
import { useMedViewWorkspaceStore } from "../../../../../../model/stores/useMedViewWorkspaceStore";
import { MedViewCompletedCaseDetailsCardHeader } from "./MedViewCompletedCaseDetailsCardHeader";
import { MedViewCompletedCaseDetailsCardBody } from "./MedViewCompletedCaseDetailsCardBody";
import styles from "../../styles.module.scss";

export const MedViewCompletedCaseDetailsCardRoot = () => {
  const { targetDb } = useMedViewFiltersStore();
  const { selectedCompletedCaseUid } = useMedViewWorkspaceStore();
  const {
    data: completedCaseDetails,
    isLoading,
    isPending,
    isError,
    isSuccess,
    error,
  } = useCompletedCaseDetailsQuery(selectedCompletedCaseUid, targetDb);

  const dataState = resolveDataState({
    isEnabled: selectedCompletedCaseUid !== null && targetDb !== null,
    isLoading: isLoading,
    isError: isError,
    isSuccess: isSuccess,
    isEmpty: completedCaseDetails === null && isSuccess,
  });

  return (
    <section className={styles.caseSection} aria-labelledby="medview-completed-details-heading">
      <MedViewCompletedCaseDetailsCardHeader />
      {dataState === "error" ? (
        <DataState
          title="Ошибка данных"
          description={error?.message ?? "Неизвестная ошибка"}
          variant="error"
        />
      ) : dataState === "empty" ? (
        <DataState
          title="Данных не найдено"
          description="Медицинский случай не содержит информации о деталях законченного случая"
          variant="empty"
        />
      ) : (
        <MedViewCompletedCaseDetailsCardBody
          completedCaseDetails={completedCaseDetails!}
          isPending={isPending}
        />
      )}
    </section>
  );
};
