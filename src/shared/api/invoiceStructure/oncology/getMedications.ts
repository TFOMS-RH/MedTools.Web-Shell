import type { MedicalRegisterType } from "../../../types/TargetDbType";
import type { MedicationDto } from "../../../model/types/invoiceStructure/results/oncology/MedicationDto";
import apiClient from "../../client/apiClient";
export const getMedications = async (
  oncologyServiceUid: number,
  registerType: MedicalRegisterType,
): Promise<MedicationDto[]> => {
  const response = await apiClient.get<MedicationDto[]>(
    `settlements/medical-register/oncology-services/${oncologyServiceUid}/medications`,
    {
      params: {
        registerType: registerType,
      },
    },
  );

  return response.data;
};
