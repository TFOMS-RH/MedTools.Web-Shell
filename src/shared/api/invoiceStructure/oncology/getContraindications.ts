import type { MedicalRegisterType } from "../../../types/TargetDbType";
import type { ContraindicationDto } from "../../../model/types/invoiceStructure/results/oncology/ContraindicationDto";
import apiClient from "../../client/apiClient";

export const getContraindications = async (
  oncologyCaseUid: number,
  registerType: MedicalRegisterType,
): Promise<ContraindicationDto[]> => {
  const response = await apiClient.get<ContraindicationDto[]>(
    `settlements/medical-register/oncology-cases/${oncologyCaseUid}/contraindications`,
    {
      params: {
        registerType: registerType,
      },
    },
  );

  return response.data;
};
