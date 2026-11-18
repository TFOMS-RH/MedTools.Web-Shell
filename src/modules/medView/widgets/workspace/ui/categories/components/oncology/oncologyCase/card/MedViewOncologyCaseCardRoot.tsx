import styles from "../../styles.module.scss";
import { resolveDataState } from "../../../../../../../../../../shared/helpers/resolveDataState";
import { DataState } from "../../../../../../../../../../shared/ui/DataState/DataState";
import { useOncologyCaseQuery } from "../../../../../../../../../../shared/model/queries/invoiceStructure/oncology/useOncologyCaseQuery";
import { useMedViewFiltersStore } from "../../../../../../../filters/model/stores/useMedViewFiltersStore";
import { useMedViewWorkspaceStore } from "../../../../../../model/stores/useMedViewWorkspaceStore";
import { MedViewOncologyCaseCardHeader } from "./MedViewOncologyCaseCardHeader";
import { MedViewOncologyCaseCardBody } from "./MedViewOncologyCaseCardBody";

export const MedViewOncologyCaseCardRoot = () => {
  const { registerType } = useMedViewFiltersStore();
  const { selectedMedicalCaseUid } = useMedViewWorkspaceStore();
  const {
    data: oncologyCase,
    isLoading,
    isPending,
    isError,
    isSuccess,
    error,
  } = useOncologyCaseQuery(selectedMedicalCaseUid, registerType);

  const dataState = resolveDataState({
    isEnabled: selectedMedicalCaseUid !== null && registerType !== null,
    isLoading: isLoading,
    isError: isError,
    isSuccess: isSuccess,
    isEmpty: oncologyCase === null && isSuccess,
  });

  return (
    <section className={styles.panel}>
      <MedViewOncologyCaseCardHeader />
      {dataState === "error" ? (
        <DataState
          title="Ошибка данных"
          description={error?.message ?? "Неизвестная ошибка"}
          variant="error"
        />
      ) : dataState === "empty" ? (
        <DataState
          title="Данных не найдено"
          description="Медицинский случай не содержит информации об онкологическом случае"
          variant="empty"
        />
      ) : (
        <MedViewOncologyCaseCardBody
          oncologyCase={oncologyCase!}
          isPending={isPending}
        />
      )}
    </section>
  );
};
