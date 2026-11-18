import type { HighTechMedicalCareDto } from "../../../model/types/invoiceStructure/results/clinicalGroup/HighTechMedicalCareDto";
import type { MedicalRegisterType } from "../../../types/TargetDbType";
import apiClient from "../../client/apiClient";

export const getHighTechMedicalCare = async (
  medicalCaseUid: number,
  registerType: MedicalRegisterType,
): Promise<HighTechMedicalCareDto> => {
  const response = await apiClient.get<HighTechMedicalCareDto>(
    `settlements/medical-register/medical-cases/${medicalCaseUid}/high-tech-medical-care`,
    {
      params: {
        registerType: registerType,
      },
    },
  );

  return response.data;
};
