import type { MedicalReferenceType } from "../types/MedicalReferenceType";
import { useQuery } from "@tanstack/react-query";
import {
  getFilterOptions,
  getFilterOptionsByCode,
} from "../../../filters/api/getFilterOptions";

export const useFilterOptionsQuery = (
  endpoint: string,
  filterQueryKey: string,
) => {
  return useQuery({
    queryKey: ["med-view", "filter-options", filterQueryKey],
    queryFn: () => getFilterOptions(endpoint),
    staleTime: Infinity,
    gcTime: Infinity,
  });
};

export const useFilterOptionsByCodeQuery = (
  type: MedicalReferenceType,
  filterQueryKey: string,
  searchString?: string,
) => {
  return useQuery({
    queryKey: ["med-view", "filter-options", filterQueryKey, searchString],
    queryFn: () => getFilterOptionsByCode(type, searchString),
    staleTime: Infinity,
    gcTime: Infinity,
  });
};
