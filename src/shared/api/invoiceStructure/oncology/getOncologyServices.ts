import type { MedicalRegisterType } from "../../../types/TargetDbType";
import type { OncologyServiceDto } from "../../../model/types/invoiceStructure/results/oncology/GetOncologyServicesResult";
import apiClient from "../../client/apiClient";

export const getOncologyServices = async (
  oncologyCaseUid: number,
  registerType: MedicalRegisterType,
): Promise<OncologyServiceDto[]> => {
  const response = await apiClient.get<OncologyServiceDto[]>(
    `settlements/medical-register/oncology-cases/${oncologyCaseUid}/oncology-services`,
    {
      params: {
        registerType: registerType,
      },
    },
  );

  return response.data;
};
