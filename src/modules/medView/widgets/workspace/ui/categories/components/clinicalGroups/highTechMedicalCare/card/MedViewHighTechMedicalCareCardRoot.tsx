import styles from "../../styles.module.scss";
import { resolveDataState } from "../../../../../../../../../../shared/helpers/resolveDataState";
import { DataState } from "../../../../../../../../../../shared/ui/DataState/DataState";
import { useHighTechMedicalCareQuery } from "../../../../../../../../../../shared/model/queries/invoiceStructure/clinicalGroups/useHighTechMedicalCareQuery";
import { useMedViewFiltersStore } from "../../../../../../../filters/model/stores/useMedViewFiltersStore";
import { useMedViewWorkspaceStore } from "../../../../../../model/stores/useMedViewWorkspaceStore";
import { MedViewHighTechMedicalCareCardHeader } from "./MedViewHighTechMedicalCareCardHeader";
import { MedViewHighTechMedicalCareCardBody } from "./MedViewHighTechMedicalCareCardBody";

export const MedViewHighTechMedicalCareCardRoot = () => {
  const { targetDb } = useMedViewFiltersStore();
  const { selectedMedicalCaseUid } = useMedViewWorkspaceStore();
  const {
    data: highTechMedicalCare,
    isLoading,
    isPending,
    isError,
    isSuccess,
    error,
  } = useHighTechMedicalCareQuery(selectedMedicalCaseUid, targetDb);

  const dataState = resolveDataState({
    isEnabled: selectedMedicalCaseUid !== null && targetDb !== null,
    isLoading: isLoading,
    isError: isError,
    isSuccess: isSuccess,
    isEmpty: highTechMedicalCare === null && isSuccess,
  });

  return (
    <section className={styles.panel} aria-labelledby="medview-vmp-heading">
      <MedViewHighTechMedicalCareCardHeader />
      {dataState === "error" ? (
        <DataState
          title="Ошибка данных"
          description={error?.message ?? "Неизвестная ошибка"}
          variant="error"
        />
      ) : dataState === "empty" ? (
        <DataState
          title="Данных не найдено"
          description="Медицинский случай не содержит информации о ВМП"
          variant="empty"
        />
      ) : (
        <MedViewHighTechMedicalCareCardBody
          highTechMedicalCare={highTechMedicalCare!}
          isPending={isPending}
        />
      )}
    </section>
  );
};
