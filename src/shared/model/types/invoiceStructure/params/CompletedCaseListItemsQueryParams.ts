import type { MedicalRegisterType } from "../../../../types/TargetDbType";

export interface CompletedCaseListItemsQueryParams {
  invoiceUid: number | null;
  page: number;
  pageSize: number;
  searchString: string;
  registerType: MedicalRegisterType | null;
}
