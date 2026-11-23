import type { MedicalRegisterType } from "../../../../types/TargetDbType";
import { getClassificationCriteria } from "../../../../api/invoiceStructure/clinicalGroups/getClassificationCriteria";
import { useQuery } from "@tanstack/react-query";

export const useClassificationCriteriaQuery = (
  clinicalGroupUid: number | null,
  registerType: MedicalRegisterType | null,
) => {
  const isReady = clinicalGroupUid !== null && registerType !== null;

  return useQuery({
    queryKey: [
      "r-control",
      "classification-criteria",
      clinicalGroupUid,
      registerType,
    ],
    enabled: isReady,
    queryFn: () => {
      if (clinicalGroupUid === null || registerType === null) {
        throw new Error("Невалидные параметры запроса");
      }

      return getClassificationCriteria(clinicalGroupUid, registerType);
    },
  });
};
