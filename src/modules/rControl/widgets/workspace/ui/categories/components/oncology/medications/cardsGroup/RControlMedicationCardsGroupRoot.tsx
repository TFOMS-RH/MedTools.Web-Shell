import { resolveDataState } from "../../../../../../../../../../shared/helpers/resolveDataState";
import { DataState } from "../../../../../../../../../../shared/ui/DataState/DataState";
import { useMedicationsQuery } from "../../../../../../../../../../shared/model/queries/invoiceStructure/oncology/useMedicationsQuery";
import { useRControlWorkspacePanelStore } from "../../../../../../model/store/useRControlWorkspacePanelStore";
import { useRControlWorkspaceStore } from "../../../../../../model/store/useRControlWorkspaceStore";
import { RControlMedicationCards } from "./RControlMedicationCards";

import { RControlMedicationCardSkeletons } from "./RControlMedicationCardSkeletons";

interface RControlMedicationCardsGroupRootProps {
  selectedOncologyServiceUid: number;
  selectedMedicationUid: number | null;
}

export const RControlMedicationCardsGroupRoot = ({
  selectedOncologyServiceUid,
  selectedMedicationUid,
}: RControlMedicationCardsGroupRootProps) => {
  const { targetDb } = useRControlWorkspacePanelStore();
  const { selectMedication } = useRControlWorkspaceStore();
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
        <RControlMedicationCardSkeletons />
      ) : dataState === "empty" ? (
        <DataState
          title="Данных не найдено"
          description="Онкологический случай не содержит информации о лекарственных препаратах"
          variant="empty"
        />
      ) : (
        <RControlMedicationCards
          medications={medications ?? []}
          selectMedication={selectMedication}
          selectedMedicationUid={selectedMedicationUid}
        />
      )}
    </>
  );
};
