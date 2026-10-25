import { DataState } from "../../../../../../../../../../shared/ui/DataState/DataState";
import { resolveDataState } from "../../../../../../../../../../shared/helpers/resolveDataState";
import { useMedicalDevicesQuery } from "../../../../../../../../../../shared/model/queries/invoiceStructure/providedServices/useMedicalDevicesQuery";
import { useRControlWorkspacePanelStore } from "../../../../../../model/store/useRControlWorkspacePanelStore";
import { RControlMedicalDevicesTableHeader } from "./RControlMedicalDevicesTableHeader";
import { useRControlWorkspaceStore } from "../../../../../../model/store/useRControlWorkspaceStore";
import { RControlMedicalDevicesTableBody } from "./RControlMedicalDevicesTableBody";
import styles from "../../styles.module.scss";

export const RControlMedicalDevicesTableRoot = () => {
  const { targetDb } = useRControlWorkspacePanelStore();
  const { selectedProvidedServiceUid } = useRControlWorkspaceStore();
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
    <section className={styles.section} aria-labelledby="rcontrol-devices-heading">
      <RControlMedicalDevicesTableHeader />
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
        <RControlMedicalDevicesTableBody
          isPending={isPending}
          medicalDevices={medicalDevices ?? []}
        />
      )}
    </section>
  );
};
