import type { MedicalRegisterType } from "../../../../types/TargetDbType";
import { getMedicalCaseDetails } from "../../../../api/invoiceStructure/medicalCaseDetails/getMedicalCaseDetails";
import { useQuery } from "@tanstack/react-query";

export const useMedicalCaseDetailsQuery = (
  medicalCaseUid: number | null,
  registerType: MedicalRegisterType | null,
) => {
  const isReady = medicalCaseUid !== null && registerType !== null;

  return useQuery({
    queryKey: [
      "r-control",
      "medical-case-details",
      medicalCaseUid,
      registerType,
    ],
    enabled: isReady,
    queryFn: () => {
      if (medicalCaseUid === null || registerType === null) {
        throw new Error("Невалидные параметры запроса");
      }

      return getMedicalCaseDetails(medicalCaseUid, registerType);
    },
  });
};
