import type { MedicalCaseDto } from "../../../model/types/invoiceStructure/results/medicalCases/MedicalCaseDto";
import type { MedicalRegisterType } from "../../../types/TargetDbType";
import apiClient from "../../client/apiClient";

export const getMedicalCaseListItems = async (
  completedCaseUid: number,
  registerType: MedicalRegisterType,
): Promise<MedicalCaseDto[]> => {
  const response = await apiClient.get<MedicalCaseDto[]>(
    `settlements/medical-register/completed-cases/${completedCaseUid}/medical-cases`,
    {
      params: {
        registerType: registerType,
      },
    },
  );

  return response.data;
};
