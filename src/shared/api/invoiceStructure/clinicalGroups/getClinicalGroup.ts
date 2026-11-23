import type { ClinicalGroupDto } from "../../../model/types/invoiceStructure/results/clinicalGroup/ClinicalGroupDto";
import type { MedicalRegisterType } from "../../../types/TargetDbType";
import apiClient from "../../client/apiClient";
import axios from "axios";

export const getClinicalGroup = async (
  medicalCaseUid: number,
  registerType: MedicalRegisterType,
): Promise<ClinicalGroupDto | null> => {
  try {
    const response = await apiClient.get<ClinicalGroupDto | null>(
      `settlements/medical-register/medical-cases/${medicalCaseUid}/clinical-group`,
      {
        params: {
          registerType: registerType,
        },
      },
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        return null;
      }
    }

    throw error;
  }
};
