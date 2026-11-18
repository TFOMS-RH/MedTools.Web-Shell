import type { MedicalRegisterType } from "../../../types/TargetDbType";
import type { ConsultationDto } from "../../../model/types/invoiceStructure/results/oncology/ConsultationDto";
import apiClient from "../../client/apiClient";

export const getConsultations = async (
  medicalCaseUid: number,
  registerType: MedicalRegisterType,
): Promise<ConsultationDto[]> => {
  const response = await apiClient.get<ConsultationDto[]>(
    `settlements/medical-register/medical-cases/${medicalCaseUid}/consultations`,
    {
      params: {
        registerType: registerType,
      },
    },
  );

  return response.data;
};
