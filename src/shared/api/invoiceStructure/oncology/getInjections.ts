import type { MedicalRegisterType } from "../../../types/TargetDbType";
import type { InjectionDto } from "../../../model/types/invoiceStructure/results/oncology/InjectionDto";
import apiClient from "../../client/apiClient";

export const getInjections = async (
  medicationUid: number,
  registerType: MedicalRegisterType,
): Promise<InjectionDto[]> => {
  const response = await apiClient.get<InjectionDto[]>(
    `settlements/medical-register/medications/${medicationUid}/injections`,
    {
      params: {
        registerType: registerType,
      },
    },
  );

  return response.data;
};
