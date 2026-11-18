import type { MedicalRegisterType } from "../../../types/TargetDbType";
import type { DefectDto } from "../../../model/types/invoiceStructure/results/defects/DefectDto";
import type { PagedResult } from "../../../types/PagedResult";
import apiClient from "../../client/apiClient";

export const getDefects = async (
  medicalCaseUid: number,
  registerType: MedicalRegisterType,
  page: number,
  pageSize: number,
): Promise<PagedResult<DefectDto>> => {
  const response = await apiClient.get<PagedResult<DefectDto>>(
    `settlements/medical-register/medical-cases/${medicalCaseUid}/defects`,
    {
      params: {
        registerType: registerType,
        page: page + 1,
        pageSize: pageSize,
      },
    },
  );

  return response.data;
};
