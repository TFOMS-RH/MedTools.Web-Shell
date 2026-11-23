import type { MedicalCaseDetailsDto } from "../../../model/types/invoiceStructure/results/medicalCases/MedicalCaseDetailsDto";
import type { MedicalRegisterType } from "../../../types/TargetDbType";
import apiClient from "../../client/apiClient";

export const getMedicalCaseDetails = async (
  medicalCaseUid: number,
  registerType: MedicalRegisterType,
): Promise<MedicalCaseDetailsDto> => {
  const response = await apiClient.get<MedicalCaseDetailsDto>(
    `settlements/medical-register/medical-cases/${medicalCaseUid}`,
    {
      params: {
        registerType: registerType,
      },
    },
  );

  return response.data;
};
