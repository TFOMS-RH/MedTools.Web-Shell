import apiClient from "../../../../../shared/api/client/apiClient";
import type { MedicalRegisterType } from "../../../../../shared/types/TargetDbType";
import type { BillingPeriodDto } from "../model/types/BillingPeriodDto";

export const getBillingPeriods = async (
  medicalOrganizationCode: string | null,
  registerType: MedicalRegisterType,
): Promise<BillingPeriodDto[]> => {
  const response = await apiClient.get<BillingPeriodDto[]>(
    "settlements/medical-register/extraction/billing-periods",
    {
      params: {
        medicalOrganizationCode: medicalOrganizationCode,
        registerType: registerType,
      },
    },
  );

  return response.data;
};
