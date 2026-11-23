import type { TreatmentComplexityCoefficientDto } from "../../../model/types/invoiceStructure/results/clinicalGroup/TreatmentComplexityCoefficientDto";
import type { MedicalRegisterType } from "../../../types/TargetDbType";
import apiClient from "../../client/apiClient";

export const getTreatmentComplexityCoefficients = async (
  clinicalGroupUid: number,
  registerType: MedicalRegisterType,
): Promise<TreatmentComplexityCoefficientDto[]> => {
  const response = await apiClient.get<TreatmentComplexityCoefficientDto[]>(
    `settlements/medical-register/clinical-groups/${clinicalGroupUid}/treatment-complexity-coefficients`,
    {
      params: {
        registerType: registerType,
      },
    },
  );

  return response.data;
};
