import apiClient from "../../../../../shared/api/client/apiClient";
import type { ResultResponse } from "../../../../../shared/types/ResultResponse";
import type { MedicalReferenceType } from "../model/types/MedicalReferenceType";
import type {
  FilterOption,
  FilterOptionsResponse,
} from "../../workspace/model/types/FilterOptions";

export const getFilterOptions = async (
  endpoint: string,
): Promise<FilterOption[]> => {
  const response =
    await apiClient.get<ResultResponse<FilterOptionsResponse>>(endpoint);

  if (response.data.isFailure) {
    throw new Error(response.data.error);
  }

  if (!response.data.value?.filterOptions) {
    throw new Error("Отсутствуют параметры фильтрации");
  }

  return response.data.value.filterOptions;
};

export const getFilterOptionsByCode = async (
  type: MedicalReferenceType,
  searchString?: string,
): Promise<FilterOption[]> => {
  const response = await apiClient.get<FilterOption[]>(
    `/references/medical-references/${type}/options`,
    {
      params: searchString ? { searchString } : undefined,
    },
  );

  console.log(response);

  return response.data;
};
