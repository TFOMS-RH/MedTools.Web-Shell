export interface GetCompletedCaseDetailsResult {
  completedCaseDetails: CompletedCaseDetailsDto;
}

export interface CompletedCaseDetailsDto {
  medicalOrganizationCode: string;
  medicalOrganizationName: string;
  referringMedicalOrganizationCode: string | null;
  referringMedicalOrganizationName: string | null;
  referralDate: string | null;
  careConditionCode: number;
  careConditionName: string | null;
  medicalCareTypeCode: number;
  medicalCareTypeName: string | null;
  paymentMethodCode: number;
  paymentMethodName: string | null;
  medicalCareFormCode: number;
  medicalCareFormName: string | null;
  treatmentStartDate: string;
  treatmentEndDate: string;
  hospitalizationDuration: number | null;
  hospitalizationOutcomeCode: number;
  hospitalizationOutcomeName: string | null;
  isIntrahospitalTransfer: boolean | null;
  screeningResult: number | null;
  isRefusal: boolean | null;
  isMobileTeam: boolean | null;
  diseaseOutcomeCode: number;
  diseaseOutcomeName: string | null;
}
