import styles from "../../styles.module.scss";
import { resolveDataState } from "../../../../../../../../../../shared/helpers/resolveDataState";
import { DataState } from "../../../../../../../../../../shared/ui/DataState/DataState";
import { useClassificationCriteriaQuery } from "../../../../../../../../../../shared/model/queries/invoiceStructure/clinicalGroups/useClassificationCriteriaQuery";
import { useRControlWorkspacePanelStore } from "../../../../../../model/store/useRControlWorkspacePanelStore";
import { RControlClassificationCriterionChipsGroupHeader } from "./RControlClassificationCriterionChipsGroupHeader";
import { RControlClassificationCriterionChips } from "./RControlClassificationCriterionChips";
import { RControlClassificationCriterionChipSkeletons } from "./RControlClassificationCriterionChipSkeletons";

interface ClassificationCriteriaRootProps {
  clinicalGroupUid: number | null;
}

export const RControlClassificationCriterionChipsGroupRoot = ({
  clinicalGroupUid,
}: ClassificationCriteriaRootProps) => {
  const { targetDb } = useRControlWorkspacePanelStore();
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
    <section className={styles.panel} aria-labelledby="rcontrol-csg-criteria-heading">
      <RControlClassificationCriterionChipsGroupHeader />
      {dataState === "error" ? (
        <DataState
          title="Ошибка данных"
          description={error?.message ?? "Неизвестная ошибка"}
          variant="error"
        />
      ) : isLoading ? (
        <RControlClassificationCriterionChipSkeletons />
      ) : dataState === "empty" ? (
        <DataState
          title="Данных не найдено"
          description="Клиническая группа не содержит информации о классификационных критериях"
          variant="empty"
        />
      ) : (
        <RControlClassificationCriterionChips
          classificationCriteria={classificationCriteria ?? []}
        />
      )}
    </section>
  );
};
