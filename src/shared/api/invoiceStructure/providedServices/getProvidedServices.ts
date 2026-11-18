import type { MedicalRegisterType } from "../../../types/TargetDbType";
import type { ProvidedServiceDto } from "../../../model/types/invoiceStructure/results/providedServices/ProvidedServiceDto";
import apiClient from "../../client/apiClient";

export const getProvidedServices = async (
  medicalCaseUid: number,
  registerType: MedicalRegisterType,
): Promise<ProvidedServiceDto[]> => {
  const response = await apiClient.get<ProvidedServiceDto[]>(
    `settlements/medical-register/medical-cases/${medicalCaseUid}/provided-services`,
    {
      params: {
        registerType: registerType,
      },
    },
  );

  return response.data;
};
