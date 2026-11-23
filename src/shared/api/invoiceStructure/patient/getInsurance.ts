import type { MedicalRegisterType } from "../../../types/TargetDbType";
import type { InsuranceDto } from "../../../model/types/invoiceStructure/results/patient/InsuranceDto";
import apiClient from "../../client/apiClient";

export const getInsurance = async (
  medicalCaseUid: number,
  registerType: MedicalRegisterType,
): Promise<InsuranceDto> => {
  const response = await apiClient.get<InsuranceDto>(
    `settlements/medical-register/medical-cases/${medicalCaseUid}/insurance`,
    {
      params: {
        registerType: registerType,
      },
    },
  );

  return response.data;
};
