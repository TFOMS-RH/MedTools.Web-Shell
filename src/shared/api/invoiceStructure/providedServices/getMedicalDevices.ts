import type { MedicalRegisterType } from "../../../types/TargetDbType";
import type { MedicalDeviceDto } from "../../../model/types/invoiceStructure/results/providedServices/MedicalDeviceDto";
import apiClient from "../../client/apiClient";

export const getMedicalDevices = async (
  providedServiceUid: number,
  registerType: MedicalRegisterType,
): Promise<MedicalDeviceDto[]> => {
  const response = await apiClient.get<MedicalDeviceDto[]>(
    `settlements/medical-register/provided-services/${providedServiceUid}/medical-devices`,
    {
      params: {
        registerType: registerType,
      },
    },
  );

  return response.data;
};
