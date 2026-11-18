import type { MedicalRegisterType } from "../../../../types/TargetDbType";
import { useQuery } from "@tanstack/react-query";
import { getMedicalSanctions } from "../../../../api/invoiceStructure/defects/getMedicalSanctions";

export const useMedicalSanctionsQuery = (
  medicalCaseUid: number | null,
  registerType: MedicalRegisterType | null,
) => {
  const isReady = medicalCaseUid !== null && registerType !== null;

  return useQuery({
    queryKey: ["r-control", "medical-sanctions", medicalCaseUid, registerType],
    enabled: isReady,
    queryFn: () => {
      if (medicalCaseUid === null || registerType === null) {
        throw new Error("Невалидные параметры запроса");
      }

      return getMedicalSanctions(medicalCaseUid, registerType);
    },
  });
};
