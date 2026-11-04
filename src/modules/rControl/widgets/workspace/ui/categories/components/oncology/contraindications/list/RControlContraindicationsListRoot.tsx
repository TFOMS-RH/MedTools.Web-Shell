import styles from "../../styles.module.scss";
import { resolveDataState } from "../../../../../../../../../../shared/helpers/resolveDataState";
import { DataState } from "../../../../../../../../../../shared/ui/DataState/DataState";
import { useContraindicationsQuery } from "../../../../../../../../../../shared/model/queries/invoiceStructure/oncology/useContraindicationsQuery";
import { useRControlWorkspacePanelStore } from "../../../../../../model/store/useRControlWorkspacePanelStore";
import { RControlContraindicationsListBody } from "./RControlContraindicationsListBody";
import { RControlContraindicationsListHeader } from "./RControlContraindicationsListHeader";

interface RControlContraindicationsListRootProps {
  oncologyCaseUid: number | null;
}

export const RControlContraindicationsListRoot = ({
  oncologyCaseUid,
}: RControlContraindicationsListRootProps) => {
  const { targetDb } = useRControlWorkspacePanelStore();
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
      <RControlContraindicationsListHeader />
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
        <RControlContraindicationsListBody
          contraindications={contraindications ?? []}
          isPending={isPending}
        />
      )}
    </section>
  );
};
