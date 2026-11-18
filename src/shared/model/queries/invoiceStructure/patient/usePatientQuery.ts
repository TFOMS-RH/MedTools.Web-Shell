import type { MedicalRegisterType } from "../../../../types/TargetDbType";
import { useQuery } from "@tanstack/react-query";
import { getPatient } from "../../../../api/invoiceStructure/patient/getPatient";

export const usePatientQuery = (
  medicalCaseUid: number | null,
  registerType: MedicalRegisterType | null,
) => {
  const isReady = medicalCaseUid !== null && registerType !== null;

  return useQuery({
    queryKey: ["r-control", "patient", medicalCaseUid, registerType],
    enabled: isReady,
    queryFn: () => {
      if (medicalCaseUid === null || registerType === null) {
        throw new Error("Невалидные параметры запроса");
      }

      return getPatient(medicalCaseUid, registerType);
    },
  });
};
