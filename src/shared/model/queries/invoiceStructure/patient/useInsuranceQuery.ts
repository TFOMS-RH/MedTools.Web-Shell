import type { MedicalRegisterType } from "../../../../types/TargetDbType";
import { useQuery } from "@tanstack/react-query";
import { getInsurance } from "../../../../api/invoiceStructure/patient/getInsurance";

export const useInsuranceQuery = (
  medicalCaseUid: number | null,
  registerType: MedicalRegisterType | null,
) => {
  const isReady = medicalCaseUid !== null && registerType !== null;

  return useQuery({
    queryKey: ["r-control", "insurance", medicalCaseUid, registerType],
    enabled: isReady,
    queryFn: () => {
      if (medicalCaseUid === null || registerType === null) {
        throw new Error("Невалидные параметры запроса");
      }

      return getInsurance(medicalCaseUid, registerType);
    },
  });
};
