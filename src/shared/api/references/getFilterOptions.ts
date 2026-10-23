import type { FilterOption } from "../../../modules/medView/widgets/workspace/model/types/FilterOptions";
import type { MedicalReferenceType } from "../../model/references/types/MedicalReferenceType";
import apiClient from "../client/apiClient";

export const getFilterOptions = async (
  type: MedicalReferenceType,
  searchString = "",
): Promise<FilterOption[]> => {
  const response = await apiClient.get<FilterOption[]>(
    `/references/medical-references/${type}/options`,
    {
      params: {
        searchString: searchString,
      },
    },
  );

  return response.data;
};
