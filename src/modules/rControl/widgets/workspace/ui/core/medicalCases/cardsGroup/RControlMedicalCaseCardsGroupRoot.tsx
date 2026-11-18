import { useEffect } from "react";
import { useRControlWorkspacePanelStore } from "../../../../model/store/useRControlWorkspacePanelStore";
import { useMedicalCasesListItemsQuery } from "../../../../../../../../shared/model/queries/invoiceStructure/medicalCases/useMedicalCasesListItemsQuery";
import { RControlMedicalCaseCardSkeletons } from "./RControlMedicalCaseCardSkeletons";
import { useRControlWorkspaceStore } from "../../../../model/store/useRControlWorkspaceStore";
import { resolveDataState } from "../../../../../../../../shared/helpers/resolveDataState";
import { RControlMedicalCaseCards } from "./RControlMedicalCaseCards";
import { DataState } from "../../../../../../../../shared/ui/DataState/DataState";

export const RControlMedicalCaseCardsGroupRoot = () => {
  const { registerType } = useRControlWorkspacePanelStore();
  const {
    selectedCompletedCaseUid,
    selectedMedicalCaseUid,
    selectMedicalCase,
  } = useRControlWorkspaceStore();
  const {
    data: medicalCases,
    isLoading,
    isError,
    isSuccess,
    isFetching,
    error,
  } = useMedicalCasesListItemsQuery(selectedCompletedCaseUid, registerType);

  useEffect(() => {
    if (
      !isSuccess ||
      isFetching ||
      !medicalCases ||
      selectedCompletedCaseUid === null
    )
      return;
    const current = useRControlWorkspaceStore.getState();
    if (
      current.selectedCompletedCaseUid !== selectedCompletedCaseUid ||
      useRControlWorkspacePanelStore.getState().registerType !== registerType
    )
      return;
    if (
      medicalCases.some(
        (item) => item.medicalCaseUid === current.selectedMedicalCaseUid,
      )
    )
      return;
    const nextUid = medicalCases[0]?.medicalCaseUid ?? null;
    if (nextUid !== current.selectedMedicalCaseUid)
      current.selectMedicalCase(nextUid);
  }, [
    medicalCases,
    isSuccess,
    isFetching,
    selectedCompletedCaseUid,
    selectedMedicalCaseUid,
    registerType,
  ]);

  const dataState = resolveDataState({
    isEnabled: selectedCompletedCaseUid !== null && registerType !== null,
    isLoading: isLoading,
    isError: isError,
    isEmpty: medicalCases?.length === 0 && isSuccess,
    isSuccess: isSuccess,
  });

  return (
    <>
      {dataState === "waiting" ? (
        <DataState
          title="Выберите законченный случай"
          description="Нажмите на строку в таблице законченных случаев для просмотра медицинских случаев"
          variant="waiting"
        />
      ) : dataState === "error" ? (
        <DataState
          title="Ошибка данных"
          description={error?.message ?? "Неизвестная ошибка"}
          variant="error"
        />
      ) : dataState === "loading" ? (
        <RControlMedicalCaseCardSkeletons />
      ) : dataState === "empty" ? (
        <DataState
          title="Данных не найдено"
          description="Медицинские случаи не найдены по выбранному законченному случаю"
          variant="empty"
        />
      ) : (
        <RControlMedicalCaseCards
          medicalCases={medicalCases ?? []}
          selectedMedicalCaseUid={selectedMedicalCaseUid}
          selectMedicalCase={selectMedicalCase}
        />
      )}
    </>
  );
};
