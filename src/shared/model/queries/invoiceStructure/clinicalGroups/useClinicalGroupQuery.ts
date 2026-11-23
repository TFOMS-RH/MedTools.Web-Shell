import type { MedicalRegisterType } from "../../../../types/TargetDbType";
import { getClinicalGroup } from "../../../../api/invoiceStructure/clinicalGroups/getClinicalGroup";
import { useQuery } from "@tanstack/react-query";

export const useClinicalGroupQuery = (
  medicalCaseUid: number | null,
  registerType: MedicalRegisterType | null,
) => {
  const isReady = medicalCaseUid !== null && registerType !== null;

  return useQuery({
    queryKey: ["r-control", "clinical-group", medicalCaseUid, registerType],
    enabled: isReady,
    queryFn: () => {
      if (medicalCaseUid === null || registerType === null) {
        throw new Error("Невалидные параметры запроса");
      }

      return getClinicalGroup(medicalCaseUid, registerType);
    },
  });
};
