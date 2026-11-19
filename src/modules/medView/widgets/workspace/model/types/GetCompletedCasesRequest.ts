import type { PaginationState } from "../../../../../../shared/types/PaginationState";
import type { MedicalRegisterType } from "../../../../../../shared/types/TargetDbType";
import type { AppliedFilters } from "./AppliedFilters";

export interface GetCompletedCasesRequest {
  filters: AppliedFilters;
  pagination: PaginationState;
  registerType: MedicalRegisterType;
}
