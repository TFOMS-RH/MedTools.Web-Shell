import type { ClassificationCriterionDto } from "../../../model/types/invoiceStructure/results/clinicalGroup/ClassificationCriterionDto";
import type { MedicalRegisterType } from "../../../types/TargetDbType";
import apiClient from "../../client/apiClient";

export const getClassificationCriteria = async (
  clinicalGroupUid: number,
  registerType: MedicalRegisterType,
): Promise<ClassificationCriterionDto[]> => {
  const response = await apiClient.get<ClassificationCriterionDto[]>(
    `settlements/medical-register/clinical-groups/${clinicalGroupUid}/classification-criteria`,
    {
      params: {
        registerType: registerType,
      },
    },
  );

  return response.data;
};
