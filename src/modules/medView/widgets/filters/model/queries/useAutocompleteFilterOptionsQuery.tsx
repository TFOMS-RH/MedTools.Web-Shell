import { useQuery } from "@tanstack/react-query";
import { getAutocompleteFilterOptions } from "../../../filters/api/getAutocompleteFilterOptions";

export const useAutocompleteFilterOptionsQuery = (
  endpoint: string,
  search: string,
) => {
  console.log(search);
  return useQuery({
    queryKey: ["med-view", "filter-options", endpoint, search],
    queryFn: () => getAutocompleteFilterOptions(endpoint, search),
    staleTime: Infinity,
    gcTime: Infinity,
  });
};
