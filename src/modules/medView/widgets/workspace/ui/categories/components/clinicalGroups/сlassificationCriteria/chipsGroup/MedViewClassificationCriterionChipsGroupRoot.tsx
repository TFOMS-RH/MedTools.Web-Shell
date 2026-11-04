import styles from "../../styles.module.scss";
import { resolveDataState } from "../../../../../../../../../../shared/helpers/resolveDataState";
import { DataState } from "../../../../../../../../../../shared/ui/DataState/DataState";
import { useClassificationCriteriaQuery } from "../../../../../../../../../../shared/model/queries/invoiceStructure/clinicalGroups/useClassificationCriteriaQuery";
import { useMedViewFiltersStore } from "../../../../../../../filters/model/stores/useMedViewFiltersStore";
import { MedViewClassificationCriterionChipsGroupHeader } from "./MedViewClassificationCriterionChipsGroupHeader";
import { MedViewClassificationCriterionChips } from "./MedViewClassificationCriterionChips";
import { MedViewClassificationCriterionChipSkeletons } from "./MedViewClassificationCriterionChipSkeletons";

interface ClassificationCriteriaRootProps {
  clinicalGroupUid: number | null;
}

export const MedViewClassificationCriterionChipsGroupRoot = ({
  clinicalGroupUid,
}: ClassificationCriteriaRootProps) => {
  const { targetDb } = useMedViewFiltersStore();
  const {
    data: classificationCriteria,
    isLoading,
    isError,
    isSuccess,
    error,
  } = useClassificationCriteriaQuery(clinicalGroupUid, targetDb);

  const dataState = resolveDataState({
    isEnabled: clinicalGroupUid !== null && targetDb !== null,
    isLoading: isLoading,
    isError: isError,
    isSuccess: isSuccess,
    isEmpty: classificationCriteria?.length === 0 && isSuccess,
  });

  return (
    <section className={styles.panel} aria-labelledby="medview-csg-criteria-heading">
      <MedViewClassificationCriterionChipsGroupHeader />
      {dataState === "error" ? (
        <DataState
          title="Ошибка данных"
          description={error?.message ?? "Неизвестная ошибка"}
          variant="error"
        />
      ) : isLoading ? (
        <MedViewClassificationCriterionChipSkeletons />
      ) : dataState === "empty" ? (
        <DataState
          title="Данных не найдено"
          description="Клиническая группа не содержит информации о классификационных критериях"
          variant="empty"
        />
      ) : (
        <MedViewClassificationCriterionChips
          classificationCriteria={classificationCriteria ?? []}
        />
      )}
    </section>
  );
};
