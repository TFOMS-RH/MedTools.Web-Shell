import { DataState } from "../../../../../../../../../../shared/ui/DataState/DataState";
import { resolveDataState } from "../../../../../../../../../../shared/helpers/resolveDataState";
import { useMedicalDevicesQuery } from "../../../../../../../../../../shared/model/queries/invoiceStructure/providedServices/useMedicalDevicesQuery";
import { useMedViewFiltersStore } from "../../../../../../../filters/model/stores/useMedViewFiltersStore";
import { MedViewMedicalDevicesTableHeader } from "./MedViewMedicalDevicesTableHeader";
import { useMedViewWorkspaceStore } from "../../../../../../model/stores/useMedViewWorkspaceStore";
import { MedViewMedicalDevicesTableBody } from "./MedViewMedicalDevicesTableBody";
import styles from "../../styles.module.scss";

export const MedViewMedicalDevicesTableRoot = () => {
  const { targetDb } = useMedViewFiltersStore();
  const { selectedProvidedServiceUid } = useMedViewWorkspaceStore();
  const {
    data: medicalDevices,
    isLoading,
    isPending,
    isError,
    isSuccess,
    error,
  } = useMedicalDevicesQuery(selectedProvidedServiceUid, targetDb);
  const dataState = resolveDataState({
    isEnabled: selectedProvidedServiceUid !== null && targetDb !== null,
    isLoading: isLoading,
    isError: isError,
    isSuccess: isSuccess,
    isEmpty: medicalDevices?.length === 0 && isSuccess,
  });

  return (
    <section className={styles.section} aria-labelledby="medview-devices-heading">
      <MedViewMedicalDevicesTableHeader />
      {dataState === "error" ? (
        <DataState
          title="Ошибка данных"
          description={error?.message ?? "Неизвестная ошибка"}
          variant="error"
        />
      ) : dataState === "empty" ? (
        <DataState
          title="Данных не найдено"
          description="Оказанная услуга не содержит информации о медицинских изделиях"
          variant="empty"
        />
      ) : (
        <MedViewMedicalDevicesTableBody
          isPending={isPending}
          medicalDevices={medicalDevices ?? []}
        />
      )}
    </section>
  );
};
