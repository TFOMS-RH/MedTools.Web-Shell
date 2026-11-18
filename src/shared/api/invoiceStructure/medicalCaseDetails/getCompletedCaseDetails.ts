import type { CompletedCaseDetailsDto } from "../../../model/types/invoiceStructure/results/medicalCases/CompletedCaseDetailsDto";
import type { MedicalRegisterType } from "../../../types/TargetDbType";
import apiClient from "../../client/apiClient";

export const getCompletedCaseDetails = async (
  completedCaseUid: number,
  registerType: MedicalRegisterType,
): Promise<CompletedCaseDetailsDto> => {
  const response = await apiClient.get<CompletedCaseDetailsDto>(
    `settlements/medical-register/completed-cases/${completedCaseUid}`,
    {
      params: {
        registerType: registerType,
      },
    },
  );

  return response.data;
};
