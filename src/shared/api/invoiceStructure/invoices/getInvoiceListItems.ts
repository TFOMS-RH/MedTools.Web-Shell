import type { InvoiceListItemsRequest } from "../../../model/types/invoiceStructure/params/InvoiceListItemsRequest";
import type { InvoiceListItemDto } from "../../../model/types/invoiceStructure/results/invoices/InvoiceListItemDto";
import type { PagedResult } from "../../../types/PagedResult";
import apiClient from "../../client/apiClient";

export const getInvoiceListItems = async (
  params: InvoiceListItemsRequest,
): Promise<PagedResult<InvoiceListItemDto>> => {
  const response = await apiClient.get<PagedResult<InvoiceListItemDto>>(
    "settlements/medical-register/medical-invoices",
    {
      params: {
        medicalOrganizationCode: params.medicalOrganizationCode,
        year: params.year,
        month: params.month,
        page: params.page + 1,
        pageSize: params.pageSize,
        searchString: params.searchString,
        registerType: params.registerType,
      },
    },
  );

  return response.data;
};
