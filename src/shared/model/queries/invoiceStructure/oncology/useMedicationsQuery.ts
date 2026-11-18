import type { MedicalRegisterType } from "../../../../types/TargetDbType";
import { useQuery } from "@tanstack/react-query";
import { getMedications } from "../../../../api/invoiceStructure/oncology/getMedications";

export const useMedicationsQuery = (
  oncologyServiceUid: number | null,
  registerType: MedicalRegisterType | null,
) => {
  const isReady = oncologyServiceUid !== null && registerType !== null;

  return useQuery({
    queryKey: ["r-control", "medications", oncologyServiceUid, registerType],
    enabled: isReady,
    queryFn: () => {
      if (oncologyServiceUid === null || registerType === null) {
        throw new Error("Невалидные параметры запроса");
      }

      return getMedications(oncologyServiceUid, registerType);
    },
  });
};
