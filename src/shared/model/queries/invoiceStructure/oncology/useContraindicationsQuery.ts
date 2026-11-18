import type { MedicalRegisterType } from "../../../../types/TargetDbType";
import { useQuery } from "@tanstack/react-query";
import { getContraindications } from "../../../../api/invoiceStructure/oncology/getContraindications";

export const useContraindicationsQuery = (
  oncologyCaseUid: number | null,
  registerType: MedicalRegisterType | null,
) => {
  const isReady = oncologyCaseUid !== null && registerType !== null;

  return useQuery({
    queryKey: ["r-control", "contraindications", oncologyCaseUid, registerType],
    enabled: isReady,
    queryFn: () => {
      if (oncologyCaseUid === null || registerType === null) {
        throw new Error("Невалидные параметры запроса");
      }

      return getContraindications(oncologyCaseUid, registerType);
    },
  });
};
