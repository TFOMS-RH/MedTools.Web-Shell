export interface GetHighTechMedicalCareResult {
  highTechMedicalCare: HighTechMedicalCareDto;
}

export interface HighTechMedicalCareDto {
  highTechCareTypeCode: string | null;
  highTechCareTypeName: string | null;
  highTechCareMethodCode: string | null;
  highTechCareMethodName: string | null;
  voucherIssueDate: string | null;
  voucherNumber: string | null;
  plannedAdmissionDate: string | null;
}
