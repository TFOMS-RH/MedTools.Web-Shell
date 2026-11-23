import type { InvoiceListItemsQueryParams } from "../../../types/invoiceStructure/params/InvoiceListItemsQueryParams";
import { getInvoiceListItems } from "../../../../api/invoiceStructure/invoices/getInvoiceListItems";
import { useQuery } from "@tanstack/react-query";

export const useInvoiceListItemsQuery = (
  params: InvoiceListItemsQueryParams,
) => {
  const isReady =
    params.medicalOrganizationCode !== null &&
    params.year !== null &&
    params.month !== null &&
    params.registerType !== null;

  return useQuery({
    queryKey: ["r-control", "invoice-list-items", params],
    enabled: isReady,
    queryFn: () => {
      if (
        params.medicalOrganizationCode === null ||
        params.year === null ||
        params.month === null ||
        params.registerType === null
      ) {
        throw new Error("Неккоректные параметры запроса");
      }

      return getInvoiceListItems({
        medicalOrganizationCode: params.medicalOrganizationCode,
        year: params.year,
        month: params.month,
        page: params.page,
        pageSize: params.pageSize,
        registerType: params.registerType,
        searchString: params.searchString,
      });
    },
  });
};
