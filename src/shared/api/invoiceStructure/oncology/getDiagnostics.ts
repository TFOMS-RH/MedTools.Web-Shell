import type { MedicalRegisterType } from "../../../types/TargetDbType";
import type { DiagnosticListItemDto } from "../../../model/types/invoiceStructure/results/oncology/GetDiagnosticsResult";
import apiClient from "../../client/apiClient";

export const getDiagnostics = async (
  oncologyCaseUid: number,
  registerType: MedicalRegisterType,
): Promise<DiagnosticListItemDto[]> => {
  const response = await apiClient.get<DiagnosticListItemDto[]>(
    `settlements/medical-register/oncology-cases/${oncologyCaseUid}/diagnostics`,
    {
      params: {
        registerType: registerType,
      },
    },
  );

  return response.data;
};
