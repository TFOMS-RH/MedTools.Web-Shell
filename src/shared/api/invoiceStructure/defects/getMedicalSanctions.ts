import type { MedicalRegisterType } from "../../../types/TargetDbType";
import type { MedicalSanctionDto } from "../../../model/types/invoiceStructure/results/defects/MedicalSanctionDto";
import apiClient from "../../client/apiClient";

export const getMedicalSanctions = async (
  medicalCaseUid: number,
  registerType: MedicalRegisterType,
): Promise<MedicalSanctionDto[]> => {
  const response = await apiClient.get<MedicalSanctionDto[]>(
    `settlements/medical-register/medical-cases/${medicalCaseUid}/medical-sanctions`,
    {
      params: {
        registerType: registerType,
      },
    },
  );

  return response.data;
};
