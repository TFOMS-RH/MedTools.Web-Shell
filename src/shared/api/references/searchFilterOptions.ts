import type { FilterOption } from "../../../modules/medView/widgets/workspace/model/types/FilterOptions";
import { MedicalReferenceType } from "../../model/references/types/MedicalReferenceType";
import apiClient from "../client/apiClient";

export const searchFilterOptions = async (
  type: MedicalReferenceType,
  searchString: string,
) => {
  const response = await apiClient.get<FilterOption[]>(
    `/references/medical-references/${type}/options/search`,
    {
      params: {
        searchString: searchString,
      },
    },
  );

  return response.data;
};
