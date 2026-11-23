import type { MedicalReferenceType } from "../types/MedicalReferenceType";
import { getFilterOptions } from "../../../api/references/getFilterOptions";
import { useQuery } from "@tanstack/react-query";
import { searchFilterOptions } from "../../../api/references/searchFilterOptions";

export const useFilterOptionsQuery = (
  type: MedicalReferenceType,
  searchString?: string,
) => {
  const search = searchString?.trim();

  return useQuery({
    queryKey: ["refrences", "options", type, searchString],
    queryFn: () =>
      search !== undefined && search.length > 0
        ? searchFilterOptions(type, search)
        : getFilterOptions(type),
    enabled: search === undefined || search.length > 0,
  });
};
