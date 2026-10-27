export interface GetMedicalCaseListItemsResult {
  medicalCases: MedicalCaseDto[];
}

export interface MedicalCaseDto {
  medicalCaseUid: number;
  medicalProfileCode: number;
  medicalProfileName: string;
  isPediatric: boolean;
  physicianSpecialtyCode: number;
  physicianSpecialtyName: string;
  treatmentStartDate: string;
  treatmentEndDate: string;
  primaryDiagnosisCode: string;
  primaryDiagnosisName: string;
  paidUnits: number | null;
  unitRate: number | null;
  amountBilled: number;
  approvedAmount: number | null;
  insuranceCompanyApprovedAmount: number | null;
}
