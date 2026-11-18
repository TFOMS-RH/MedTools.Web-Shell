import type { MedicalRegisterType } from "../../../types/TargetDbType";
import type { PatientDto } from "../../../model/types/invoiceStructure/results/patient/PatientDto";
import apiClient from "../../client/apiClient";

export const getPatient = async (
  medicalCaseUid: number,
  registerType: MedicalRegisterType,
): Promise<PatientDto> => {
  const response = await apiClient.get<PatientDto>(
    `settlements/medical-register/medical-cases/${medicalCaseUid}/patient`,
    {
      params: {
        registerType: registerType,
      },
    },
  );

  return response.data;
};
