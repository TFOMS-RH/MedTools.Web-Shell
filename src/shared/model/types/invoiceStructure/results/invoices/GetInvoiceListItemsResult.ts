export interface InvoiceListItemDto {
  invoiceUid: number;
  number: string;
  billingDate: string;
  amount: number;
  medicalCasesCount: number;
  status: number;
}
