import type { MedicalRegisterType } from "../../../../types/TargetDbType";
import { getTreatmentComplexityCoefficients } from "../../../../api/invoiceStructure/clinicalGroups/getTreatmentComplexityCoefficients";
import { useQuery } from "@tanstack/react-query";

export const useTreatmentComplexityCoefficientsQuery = (
  clinicalGroupUid: number | null,
  registerType: MedicalRegisterType | null,
) => {
  const isReady = clinicalGroupUid !== null && registerType !== null;

  return useQuery({
    queryKey: [
      "r-control",
      "treatment-complexity-coefficients",
      clinicalGroupUid,
      registerType,
    ],
    enabled: isReady,
    queryFn: () => {
      if (clinicalGroupUid === null || registerType === null) {
        throw new Error("Невалидные параметры запроса");
      }

      return getTreatmentComplexityCoefficients(clinicalGroupUid, registerType);
    },
  });
};
