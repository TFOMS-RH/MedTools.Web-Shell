import type { MedicalRegisterType } from "../../../../types/TargetDbType";
import { getMedicalCaseListItems } from "../../../../api/invoiceStructure/medicalCases/getMedicalCaseListItems";
import { useQuery } from "@tanstack/react-query";

export const useMedicalCasesListItemsQuery = (
  completedCaseUid: number | null,
  registerType: MedicalRegisterType | null,
) => {
  const isReady = completedCaseUid !== null && registerType !== null;

  return useQuery({
    queryKey: ["r-control", "medical-cases", completedCaseUid, registerType],
    enabled: isReady,
    queryFn: () => {
      if (completedCaseUid === null || registerType === null) {
        throw new Error("Невалидные параметры запроса");
      }

      return getMedicalCaseListItems(completedCaseUid, registerType);
    },
  });
};
