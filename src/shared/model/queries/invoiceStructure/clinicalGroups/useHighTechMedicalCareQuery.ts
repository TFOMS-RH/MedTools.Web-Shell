import { getHighTechMedicalCare } from "../../../../api/invoiceStructure/clinicalGroups/getHighTechMedicalCare";
import type { MedicalRegisterType } from "../../../../types/TargetDbType";
import { useQuery } from "@tanstack/react-query";

export const useHighTechMedicalCareQuery = (
  medicalCaseUid: number | null,
  registerType: MedicalRegisterType | null,
) => {
  const isReady = medicalCaseUid !== null && registerType !== null;

  return useQuery({
    queryKey: [
      "r-control",
      "high-tech-medical-care",
      medicalCaseUid,
      registerType,
    ],
    enabled: isReady,
    queryFn: () => {
      if (medicalCaseUid === null || registerType === null) {
        throw new Error("Невалидные параметры запроса");
      }

      return getHighTechMedicalCare(medicalCaseUid, registerType);
    },
  });
};
