import type { MedicalRegisterType } from "../../../../types/TargetDbType";
import { useQuery } from "@tanstack/react-query";
import { getPrescriptions } from "../../../../api/invoiceStructure/prescriptions/getPrescriptions";

export const usePrescriptionsQuery = (
  medicalCaseUid: number | null,
  registerType: MedicalRegisterType | null,
) => {
  const isReady = medicalCaseUid !== null && registerType !== null;

  return useQuery({
    queryKey: ["r-control", "prescriptions", medicalCaseUid, registerType],
    enabled: isReady,
    queryFn: () => {
      if (medicalCaseUid === null || registerType === null) {
        throw new Error("Невалидные параметры запроса");
      }

      return getPrescriptions(medicalCaseUid, registerType);
    },
  });
};
