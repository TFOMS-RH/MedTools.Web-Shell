import type { GetCompletedCasesRequest } from "../model/types/GetCompletedCasesRequest";
import type { CompletedCaseListItemDto } from "../../../../../shared/model/types/invoiceStructure/results/medicalCases/CompletedCaseListItemDto";
import type { PagedResult } from "../../../../../shared/types/PagedResult";
import apiClient from "../../../../../shared/api/client/apiClient";

export const getCompletedCases = async (
  request: GetCompletedCasesRequest,
): Promise<PagedResult<CompletedCaseListItemDto>> => {
  const response = await apiClient.post<PagedResult<CompletedCaseListItemDto>>(
    "settlements/medical-register/completed-cases",
    {
      filters: request.filters,
      page: request.pagination.page,
      pageSize: request.pagination.pageSize,
      registerType: request.registerType,
    },
  );

  return response.data;
};
