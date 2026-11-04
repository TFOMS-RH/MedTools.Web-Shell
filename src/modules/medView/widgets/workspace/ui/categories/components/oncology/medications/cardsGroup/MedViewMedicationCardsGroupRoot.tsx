import { resolveDataState } from "../../../../../../../../../../shared/helpers/resolveDataState";
import { DataState } from "../../../../../../../../../../shared/ui/DataState/DataState";
import { useMedicationsQuery } from "../../../../../../../../../../shared/model/queries/invoiceStructure/oncology/useMedicationsQuery";
import { useMedViewFiltersStore } from "../../../../../../../filters/model/stores/useMedViewFiltersStore";
import { useMedViewWorkspaceStore } from "../../../../../../model/stores/useMedViewWorkspaceStore";
import { MedViewMedicationCards } from "./MedViewMedicationCards";

import { MedViewMedicationCardSkeletons } from "./MedViewMedicationCardSkeletons";

interface MedViewMedicationCardsGroupRootProps {
  selectedOncologyServiceUid: number;
  selectedMedicationUid: number | null;
}

export const MedViewMedicationCardsGroupRoot = ({
  selectedOncologyServiceUid,
  selectedMedicationUid,
}: MedViewMedicationCardsGroupRootProps) => {
  const { targetDb } = useMedViewFiltersStore();
  const { selectMedication } = useMedViewWorkspaceStore();
  const {
    data: medications,
    isLoading,
    isError,
    isSuccess,
    error,
  } = useMedicationsQuery(selectedOncologyServiceUid, targetDb);

  const dataState = resolveDataState({
    isEnabled: selectedOncologyServiceUid !== null && targetDb !== null,
    isLoading: isLoading,
    isError: isError,
    isSuccess: isSuccess,
    isEmpty: medications?.length === 0 && isSuccess,
  });

  return (
    <>
      {dataState === "error" ? (
        <DataState
          title="Ошибка данных"
          description={error?.message ?? "Неизвестная ошибка"}
          variant="error"
        />
      ) : dataState === "loading" ? (
        <MedViewMedicationCardSkeletons />
      ) : dataState === "empty" ? (
        <DataState
          title="Данных не найдено"
          description="Онкологический случай не содержит информации о лекарственных препаратах"
          variant="empty"
        />
      ) : (
        <MedViewMedicationCards
          medications={medications ?? []}
          selectMedication={selectMedication}
          selectedMedicationUid={selectedMedicationUid}
        />
      )}
    </>
  );
};
