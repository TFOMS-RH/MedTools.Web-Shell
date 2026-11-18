import type { MedicalRegisterType } from "../../../../types/TargetDbType";

export interface CompletedCaseListItemsRequest {
  invoiceUid: number;
  page: number;
  pageSize: number;
  searchString: string;
  registerType: MedicalRegisterType;
}
