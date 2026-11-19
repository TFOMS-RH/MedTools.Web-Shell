import type { MedicalReferenceType } from "../types/MedicalReferenceType";
import { getFilterOptions } from "../../../api/references/getFilterOptions";
import { useQuery } from "@tanstack/react-query";

export const useFilterOptionsQuery = (
  type: MedicalReferenceType,
  searchString?: string,
) => {
  
  const search = searchString?.trim();

  return useQuery({
    queryKey: ["refrences", "options", type, searchString],
    queryFn: () => getFilterOptions(type, searchString),
    enabled: search === undefined || search.length > 0,
  });
};
