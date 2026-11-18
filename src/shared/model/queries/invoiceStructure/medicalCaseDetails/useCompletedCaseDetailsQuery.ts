import type { MedicalRegisterType } from "../../../../types/TargetDbType";
import { useQuery } from "@tanstack/react-query";
import { getCompletedCaseDetails } from "../../../../api/invoiceStructure/medicalCaseDetails/getCompletedCaseDetails";

export const useCompletedCaseDetailsQuery = (
  completedCaseUid: number | null,
  registerType: MedicalRegisterType | null,
) => {
  const isReady = completedCaseUid !== null && registerType !== null;

  return useQuery({
    queryKey: [
      "r-control",
      "completed-case-details",
      completedCaseUid,
      registerType,
    ],
    enabled: isReady,
    queryFn: () => {
      if (completedCaseUid === null || registerType === null) {
        throw new Error("Невалидные параметры запроса");
      }

      return getCompletedCaseDetails(completedCaseUid, registerType);
    },
  });
};
