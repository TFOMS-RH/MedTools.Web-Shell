import type { MedicalReferenceType } from "../types/MedicalReferenceType";
import { getFilterOptions } from "../../../api/references/getFilterOptions";
import { useQuery } from "@tanstack/react-query";

export const useFilterOptionsQuery = (
  type: MedicalReferenceType,
  searchString = "",
) => {
  return useQuery({
    queryKey: ["refrences", "options", type, searchString],
    queryFn: () => getFilterOptions(type, searchString),
  });
};
