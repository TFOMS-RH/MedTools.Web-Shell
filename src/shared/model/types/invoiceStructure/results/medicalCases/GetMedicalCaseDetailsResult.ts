export interface GetMedicalCaseDetailsResult {
  medicalCaseDetails: MedicalCaseDetailsDto;
}

export interface MedicalCaseDetailsDto {
  medicalProfileCode: number;
  medicalProfileName: string | null;
  physicianSpecialtyCode: number;
  physicianSpecialtyName: string | null;
  treatmentStartDate: string;
  treatmentEndDate: string;
  primaryDiagnosisCode: string;
  primaryDiagnosisName: string | null;
  paidUnits: number | null;
  divisionNumber: string | null;
  divisionName: string | null;
  departmentCode: number | null;
  isPediatric: boolean;
  visitPurposeCode: string | null;
  visitPurposeName: string | null;
  bedProfileCode: number | null;
  bedProfileName: string | null;
  medicalRecordNumber: string;
  admissionTransferCode: number | null;
  admissionTransferName: string | null;
  isRehabilitation: boolean | null;
  hospitalizationDuration: number | null;
  facilityLevel: string | null;
  initialDiagnosisCode: string | null;
  initialDiagnosisName: string | null;
  isOncologySuspicion: boolean | null;
  physicianCode: string;
  weight: number | null;
  diseaseCharacter: number | null;
  internalComment: string | null;
}
