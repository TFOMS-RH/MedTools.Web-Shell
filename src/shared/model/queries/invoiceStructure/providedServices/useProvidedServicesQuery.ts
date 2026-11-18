import type { MedicalRegisterType } from "../../../../types/TargetDbType";
import { useQuery } from "@tanstack/react-query";
import { getProvidedServices } from "../../../../api/invoiceStructure/providedServices/getProvidedServices";

export const useProvidedServicesQuery = (
  medicalCaseUid: number | null,
  registerType: MedicalRegisterType | null,
) => {
  const isReady = medicalCaseUid !== null && registerType !== null;

  return useQuery({
    queryKey: ["r-control", "provided-services", medicalCaseUid, registerType],
    enabled: isReady,
    queryFn: () => {
      if (medicalCaseUid === null || registerType === null) {
        throw new Error("Невалидные параметры запроса");
      }

      return getProvidedServices(medicalCaseUid, registerType);
    },
  });
};
