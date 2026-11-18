import type { CompletedCaseListItemDto } from "../../../../../shared/model/types/invoiceStructure/results/medicalCases/CompletedCaseListItemDto";
import type { GetCompletedCasesRequest } from "../model/types/GetCompletedCasesRequest";
import apiClient from "../../../../../shared/api/client/apiClient";
import type { PagedResult } from "../../../../../shared/types/PagedResult";

export const getCompletedCases = async (
  request: GetCompletedCasesRequest,
): Promise<PagedResult<CompletedCaseListItemDto>> => {
  const response = await apiClient.post<PagedResult<CompletedCaseListItemDto>>(
    "med-tools/med-view/completed-cases",
    request,
  );

  return response.data;
};
