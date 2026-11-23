import type { MedicalRegisterType } from "../../../../types/TargetDbType";

export interface InvoiceListItemsQueryParams {
  medicalOrganizationCode: string | null;
  year: number | null;
  month: number | null;
  page: number;
  pageSize: number;
  registerType: MedicalRegisterType | null;
  searchString: string;
}
