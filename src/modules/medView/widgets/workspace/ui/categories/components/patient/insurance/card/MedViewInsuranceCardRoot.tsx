import { resolveDataState } from "../../../../../../../../../../shared/helpers/resolveDataState";
import { DataState } from "../../../../../../../../../../shared/ui/DataState/DataState";
import { useInsuranceQuery } from "../../../../../../../../../../shared/model/queries/invoiceStructure/patient/useInsuranceQuery";
import { useMedViewFiltersStore } from "../../../../../../../filters/model/stores/useMedViewFiltersStore";
import { MedViewInsuranceCardHeader } from "./MedViewInsuranceCardHeader";
import { useMedViewWorkspaceStore } from "../../../../../../model/stores/useMedViewWorkspaceStore";
import { MedViewInsuranceCardBody } from "./MedViewInsuranceCardBody";
import styles from "../../styles.module.scss";

export const MedViewInsuranceCardRoot = () => {
  const { targetDb } = useMedViewFiltersStore();
  const { selectedMedicalCaseUid } = useMedViewWorkspaceStore();
  const {
    data: insurance,
    isLoading,
    isPending,
    isError,
    isSuccess,
    error,
  } = useInsuranceQuery(selectedMedicalCaseUid, targetDb);

  const dataState = resolveDataState({
    isEnabled: selectedMedicalCaseUid !== null && targetDb !== null,
    isLoading: isLoading,
    isError: isError,
    isSuccess: isSuccess,
    isEmpty: insurance === null && isSuccess,
  });

  return (
    <section className={styles.insuranceGroup} aria-labelledby="medview-patient-insurance">
      <MedViewInsuranceCardHeader />
      {dataState === "error" ? (
        <DataState
          title="Ошибка данных"
          description={error?.message ?? "Неизвестная ошибка"}
          variant="error"
        />
      ) : dataState === "empty" ? (
        <DataState
          title="Данных не найдено"
          description="Медицинский случай не содержит информации о СМО"
          variant="empty"
        />
      ) : (
        <MedViewInsuranceCardBody
          insurance={insurance!}
          isPending={isPending}
        />
      )}
    </section>
  );
};
