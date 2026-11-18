import type { MedicalRegisterType } from "../../../../types/TargetDbType";
import { getMedicalDevices } from "../../../../api/invoiceStructure/providedServices/getMedicalDevices";
import { useQuery } from "@tanstack/react-query";

export const useMedicalDevicesQuery = (
  providedServiceUid: number | null,
  registerType: MedicalRegisterType | null,
) => {
  const isReady = providedServiceUid !== null && registerType !== null;

  return useQuery({
    queryKey: ["r-control", "medical-devices", providedServiceUid, registerType],
    enabled: isReady,
    queryFn: () => {
      if (providedServiceUid === null || registerType === null) {
        throw new Error("Невалидные параметры запроса");
      }

      return getMedicalDevices(providedServiceUid, registerType);
    },
  });
};
