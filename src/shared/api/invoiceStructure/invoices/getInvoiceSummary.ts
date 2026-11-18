import type { InvoiceSummaryDto } from "../../../model/types/invoiceStructure/results/invoices/InvoiceSummaryDto";
import type { MedicalRegisterType } from "../../../types/TargetDbType";
import apiClient from "../../client/apiClient";

export const getInvoiceSummary = async (
  invoiceUid: number,
  registerType: MedicalRegisterType,
): Promise<InvoiceSummaryDto> => {
  const response = await apiClient.get<InvoiceSummaryDto>(
    `settlements/medical-register/medical-invoices/${invoiceUid}`,
    {
      params: {
        registerType: registerType,
      },
    },
  );

  return response.data;
};
