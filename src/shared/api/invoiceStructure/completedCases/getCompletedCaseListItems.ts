import type { CompletedCaseListItemsRequest } from "../../../model/types/invoiceStructure/params/CompletedCaseListItemsRequest";
import type { CompletedCaseListItemDto } from "../../../model/types/invoiceStructure/results/medicalCases/CompletedCaseListItemDto";
import type { PagedResult } from "../../../types/PagedResult";
import apiClient from "../../client/apiClient";

export const getCompletedCaseListItems = async (
  params: CompletedCaseListItemsRequest,
): Promise<PagedResult<CompletedCaseListItemDto>> => {
  const response = await apiClient.get<PagedResult<CompletedCaseListItemDto>>(
    `settlements/medical-register/medical-invoices/${params.invoiceUid}/completed-cases`,
    {
      params: {
        page: params.page + 1,
        pageSize: params.pageSize,
        searchString: params.searchString,
        registerType: params.registerType,
      },
    },
  );

  return response.data;
};
