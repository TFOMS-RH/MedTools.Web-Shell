import type { MedicalRegisterType } from "../../../types/TargetDbType";
import type { PrescriptionDto } from "../../../model/types/invoiceStructure/results/prescriptions/PrescriptionDto";
import apiClient from "../../client/apiClient";

export const getPrescriptions = async (
  medicalCaseUid: number,
  registerType: MedicalRegisterType,
): Promise<PrescriptionDto[]> => {
  const response = await apiClient.get<PrescriptionDto[]>(
    `settlements/medical-register/medical-cases/${medicalCaseUid}/prescriptions`,
    {
      params: {
        registerType: registerType,
      },
    },
  );

  return response.data;
};
