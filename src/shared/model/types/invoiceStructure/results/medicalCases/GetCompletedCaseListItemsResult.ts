export interface GetCompletedCaseListItemsResult {
  completedCases: CompletedCaseListItemDto[];
  totalCount: number;
}

export interface CompletedCaseListItemDto {
  completedCaseUid: number;
  entryNumber: number;
  amountBilled: number;
  approvedAmount: number | null;
  insuranceCompanyApprovedAmount: number | null;
  medicalCareConditionsCode: number;
  medicalCareConditionsName: string;
  patientLastName: string;
  patientFirstName: string;
  patientMiddleName: string;
  insurancePolicySeries: string | null;
  insurancePolicyNumber: string;
  entryPositionNumber: number;
}
