import type { MedicalRegisterType } from "../../../../../shared/types/TargetDbType";
import type { MedicalOrganizationDto } from "../model/types/MedicalOrganizationDto";
import apiClient from "../../../../../shared/api/client/apiClient";

export const getMedicalOrganizations = async (
  registerType: MedicalRegisterType,
): Promise<MedicalOrganizationDto[]> => {
  const response = await apiClient.get<MedicalOrganizationDto[]>(
    "settlements/medical-register/extraction/medical-organizations",
    {
      params: {
        registerType: registerType,
      },
    },
  );

  return response.data;
};
