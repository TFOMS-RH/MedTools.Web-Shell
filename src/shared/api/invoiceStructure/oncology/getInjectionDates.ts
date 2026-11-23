import type { MedicalRegisterType } from "../../../types/TargetDbType";
import type { InjectionDateDto } from "../../../model/types/invoiceStructure/results/oncology/InjectionDateDto";
import apiClient from "../../client/apiClient";

export const getInjectionDates = async (
  medicationUid: number | null,
  registerType: MedicalRegisterType,
): Promise<InjectionDateDto[]> => {
  const response = await apiClient.get<InjectionDateDto[]>(
    `settlements/medical-register/medications/${medicationUid}/injection-dates`,
    {
      params: {
        registerType: registerType,
      },
    },
  );

  return response.data;
};
