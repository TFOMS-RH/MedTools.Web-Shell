import styles from "../../styles.module.scss";
import { resolveDataState } from "../../../../../../../../../../shared/helpers/resolveDataState";
import { DataState } from "../../../../../../../../../../shared/ui/DataState/DataState";
import { useTreatmentComplexityCoefficientsQuery } from "../../../../../../../../../../shared/model/queries/invoiceStructure/clinicalGroups/useTreatmentComplexityCoefficientsQuery";
import { useMedViewFiltersStore } from "../../../../../../../filters/model/stores/useMedViewFiltersStore";
import { MedViewTreatmentCoefficientsListHeader } from "./MedViewTreatmentCoefficientsListHeader";
import { MedViewTreatmentCoefficientsListBody } from "./MedViewTreatmentCoefficientsListBody";

interface TreatmentComplexityCoefficientsRootProps {
  clinicalGroupUid: number | null;
}

export const MedViewTreatmentCoefficientsListRoot = ({
  clinicalGroupUid,
}: TreatmentComplexityCoefficientsRootProps) => {
  const { targetDb } = useMedViewFiltersStore();
  const {
    data: treatmentComplexityCoefficients,
    isLoading,
    isPending,
    isError,
    isSuccess,
    error,
  } = useTreatmentComplexityCoefficientsQuery(clinicalGroupUid, targetDb);

  const dataState = resolveDataState({
    isEnabled: clinicalGroupUid !== null && targetDb !== null,
    isLoading: isLoading,
    isError: isError,
    isSuccess: isSuccess,
    isEmpty: treatmentComplexityCoefficients?.length === 0 && isSuccess,
  });

  return (
    <section className={styles.panel} aria-labelledby="medview-csg-coefficients-heading">
      <MedViewTreatmentCoefficientsListHeader />
      {dataState === "error" ? (
        <DataState
          title="Ошибка данных"
          description={error?.message ?? "Неизвестная ошибка"}
          variant="error"
        />
      ) : dataState === "empty" ? (
        <DataState
          title="Данных не найдено"
          description="Клиническая группа не содержит информации о КСЛП"
          variant="empty"
        />
      ) : (
        <MedViewTreatmentCoefficientsListBody
          treatmentComplexityCoefficients={
            treatmentComplexityCoefficients ?? []
          }
          isPending={isPending}
        />
      )}
    </section>
  );
};
