import type { MedicalRegisterType } from "../../../../types/TargetDbType";
import { useQuery } from "@tanstack/react-query";
import { getOncologyServices } from "../../../../api/invoiceStructure/oncology/getOncologyServices";

export const useOncologyServicesQuery = (
  oncologyCaseUid: number | null,
  registerType: MedicalRegisterType | null,
) => {
  const isReady = oncologyCaseUid !== null && registerType !== null;

  return useQuery({
    queryKey: ["r-control", "oncology-services", oncologyCaseUid, registerType],
    enabled: isReady,
    queryFn: () => {
      if (oncologyCaseUid === null || registerType === null) {
        throw new Error("Невалидные параметры запроса");
      }

      return getOncologyServices(oncologyCaseUid, registerType);
    },
  });
};
