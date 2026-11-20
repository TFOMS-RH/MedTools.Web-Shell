export interface CompletedCaseListItemDto {
  completedCaseUid: number;
  medicalOrganizationCode: string | null;
  insuranceOrganizationCode: string | null;
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
  treatmentStartDate: string | null;
  treatmentEndDate: string | null;
  entryPositionNumber: number;
}
