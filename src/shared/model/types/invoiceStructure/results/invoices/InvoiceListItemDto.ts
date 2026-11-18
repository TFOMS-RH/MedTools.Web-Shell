export interface InvoiceListItemDto {
  uid: number;
  number: string;
  billingDate: string;
  amount: number;
  medicalCasesCount: number;
  status: number;
}
