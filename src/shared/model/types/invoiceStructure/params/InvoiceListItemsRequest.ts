import type { MedicalRegisterType } from "../../../../types/TargetDbType";

export interface InvoiceListItemsRequest {
  medicalOrganizationCode: string;
  year: number;
  month: number;
  page: number;
  pageSize: number;
  registerType: MedicalRegisterType;
  searchString: string;
}
