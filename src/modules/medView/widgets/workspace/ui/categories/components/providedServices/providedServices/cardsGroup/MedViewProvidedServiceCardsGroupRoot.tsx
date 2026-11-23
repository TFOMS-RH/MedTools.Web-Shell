import { resolveDataState } from "../../../../../../../../../../shared/helpers/resolveDataState";
import { DataState } from "../../../../../../../../../../shared/ui/DataState/DataState";
import { useProvidedServicesQuery } from "../../../../../../../../../../shared/model/queries/invoiceStructure/providedServices/useProvidedServicesQuery";
import { useMedViewFiltersStore } from "../../../../../../../filters/model/stores/useMedViewFiltersStore";
import { useMedViewWorkspaceStore } from "../../../../../../model/stores/useMedViewWorkspaceStore";
import { MedViewProvidedServiceCards } from "./MedViewProvidedServiceCards";
import { MedViewProvidedServiceCardSkeletons } from "./MedViewProvidedServiceCardSkeletons";

export const MedViewProvidedServiceCardsGroupRoot = () => {
  const { registerType } = useMedViewFiltersStore();
  const {
    selectedMedicalCaseUid,
    selectedProvidedServiceUid,
    selectProvidedService,
  } = useMedViewWorkspaceStore();
  const {
    data: providedServices,
    isLoading,
    isError,
    isSuccess,
    error,
  } = useProvidedServicesQuery(selectedMedicalCaseUid, registerType);
  const dataState = resolveDataState({
    isEnabled: selectedMedicalCaseUid !== null && registerType !== null,
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
        <MedViewProvidedServiceCardSkeletons />
      ) : dataState === "empty" ? (
        <DataState
          title="Данных не найдено"
          description="Медицинский случай не содержит информации о предоставленных услугах"
          variant="empty"
        />
      ) : (
        <MedViewProvidedServiceCards
          providedSevices={providedServices ?? []}
          selectedProvidedServiceUid={selectedProvidedServiceUid}
          selectProvidedService={selectProvidedService}
        />
      )}
    </>
  );
};
