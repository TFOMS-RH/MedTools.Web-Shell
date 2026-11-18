import type { MedicalRegisterType } from "../../../types/TargetDbType";
import type { ReferralDto } from "../../../model/types/invoiceStructure/results/prescriptions/ReferralDto";
import apiClient from "../../client/apiClient";

export const getReferrals = async (
  medicalCaseUid: number,
  registerType: MedicalRegisterType,
): Promise<ReferralDto[]> => {
  const response = await apiClient.get<ReferralDto[]>(
    `settlements/medical-register/medical-cases/${medicalCaseUid}/referrals`,
    {
      params: {
        registerType: registerType,
      },
    },
  );

  return response.data;
};
