import styles from "../../styles.module.scss";
import { resolveDataState } from "../../../../../../../../../../shared/helpers/resolveDataState";
import { DataState } from "../../../../../../../../../../shared/ui/DataState/DataState";
import { useContraindicationsQuery } from "../../../../../../../../../../shared/model/queries/invoiceStructure/oncology/useContraindicationsQuery";
import { useMedViewFiltersStore } from "../../../../../../../filters/model/stores/useMedViewFiltersStore";
import { MedViewContraindicationsListBody } from "./MedViewContraindicationsListBody";
import { MedViewContraindicationsListHeader } from "./MedViewContraindicationsListHeader";

interface MedViewContraindicationsListRootProps {
  oncologyCaseUid: number | null;
}

export const MedViewContraindicationsListRoot = ({
  oncologyCaseUid,
}: MedViewContraindicationsListRootProps) => {
  const { targetDb } = useMedViewFiltersStore();
  const {
    data: contraindications,
    isLoading,
    isPending,
    isError,
    isSuccess,
    error,
  } = useContraindicationsQuery(oncologyCaseUid, targetDb);

  const dataState = resolveDataState({
    isEnabled: oncologyCaseUid !== null && targetDb !== null,
    isLoading: isLoading,
    isError: isError,
    isSuccess: isSuccess,
    isEmpty: contraindications?.length === 0 && isSuccess,
  });

  return (
    <section className={styles.panel}>
      <MedViewContraindicationsListHeader />
      {dataState === "error" ? (
        <DataState
          title="Ошибка данных"
          description={error?.message ?? "Неизвестная ошибка"}
          variant="error"
        />
      ) : dataState === "empty" ? (
        <DataState
          title="Данных не найдено"
          description="Онкологический случай не содержит информации о противопоказаниях"
          variant="empty"
        />
      ) : (
        <MedViewContraindicationsListBody
          contraindications={contraindications ?? []}
          isPending={isPending}
        />
      )}
    </section>
  );
};
