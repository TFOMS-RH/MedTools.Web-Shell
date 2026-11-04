import { resolveDataState } from "../../../../../../../../../../shared/helpers/resolveDataState";
import { DataState } from "../../../../../../../../../../shared/ui/DataState/DataState";
import { useProvidedServicesQuery } from "../../../../../../../../../../shared/model/queries/invoiceStructure/providedServices/useProvidedServicesQuery";
import { useRControlWorkspacePanelStore } from "../../../../../../model/store/useRControlWorkspacePanelStore";
import { useRControlWorkspaceStore } from "../../../../../../model/store/useRControlWorkspaceStore";
import { RControlProvidedServiceCards } from "./RControlProvidedServiceCards";
import { RControlProvidedServiceCardSkeletons } from "./RControlProvidedServiceCardSkeletons";

export const RControlProvidedServiceCardsGroupRoot = () => {
  const { targetDb } = useRControlWorkspacePanelStore();
  const {
    selectedMedicalCaseUid,
    selectedProvidedServiceUid,
    selectProvidedService,
  } = useRControlWorkspaceStore();
  const {
    data: providedServices,
    isLoading,
    isError,
    isSuccess,
    error,
  } = useProvidedServicesQuery(selectedMedicalCaseUid, targetDb);
  const dataState = resolveDataState({
    isEnabled: selectedMedicalCaseUid !== null && targetDb !== null,
    isLoading: isLoading,
    isError: isError,
    isSuccess: isSuccess,
    isEmpty: providedServices?.length === 0 && isSuccess,
  });

  return (
    <>
      {dataState === "error" ? (
        <DataState
          title="Ошибка данных"
          description={error?.message ?? "Неизсвестная ошибка"}
          variant="error"
        />
      ) : isLoading ? (
        <RControlProvidedServiceCardSkeletons />
      ) : dataState === "empty" ? (
        <DataState
          title="Данных не найдено"
          description="Медицинский случай не содержит информации о предоставленных услугах"
          variant="empty"
        />
      ) : (
        <RControlProvidedServiceCards
          providedSevices={providedServices ?? []}
          selectedProvidedServiceUid={selectedProvidedServiceUid}
          selectProvidedService={selectProvidedService}
        />
      )}
    </>
  );
};
