import type { MedicalRegisterType } from "../../../../types/TargetDbType";
import { useQuery } from "@tanstack/react-query";
import { getInvoiceSummary } from "../../../../api/invoiceStructure/invoices/getInvoiceSummary";

export const useInvoiceSummaryQuery = (
  invoiceUid: number | null,
  registerType: MedicalRegisterType | null,
) => {
  const isReady = invoiceUid !== null && registerType !== null;

  return useQuery({
    queryKey: ["r-control", "invoice-summary", invoiceUid, registerType],
    enabled: isReady,
    queryFn: () => {
      if (
        invoiceUid === null ||
        invoiceUid === undefined ||
        registerType === null
      ) {
        throw new Error("Невалидные параметры запроса");
      }

      return getInvoiceSummary(invoiceUid, registerType);
    },
  });
};
