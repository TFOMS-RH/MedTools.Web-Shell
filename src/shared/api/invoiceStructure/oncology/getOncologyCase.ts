import axios from "axios";
import type { OncologyCaseDto } from "../../../model/types/invoiceStructure/results/oncology/OncologyCaseDto";
import type { MedicalRegisterType } from "../../../types/TargetDbType";
import apiClient from "../../client/apiClient";

export const getOncologyCase = async (
  medicalCaseUid: number,
  registerType: MedicalRegisterType,
): Promise<OncologyCaseDto | null> => {
  try {
    const response = await apiClient.get<OncologyCaseDto>(
      `settlements/medical-register/medical-cases/${medicalCaseUid}/oncology-case`,
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
