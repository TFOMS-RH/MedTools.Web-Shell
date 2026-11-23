export interface InvoiceSummaryDto {
  invoiceUid: number;
  filename: string;
  invoiceUploadDate: string;
  invoiceAmount: number;
  approvedAmount: number;
  medicalEconomicControlPenalty: number;
  medicalEconomicExpertisePenalty: number;
  medicalCareQualityExpertisePenalty: number;
  insuranceCompanyApprovedAmount: number;
  insuranceCompanyMedicalEconomicControlPenalty: number;
  insuranceCompanyMedicalEconomicExpertisePenalty: number;
  insuranceCompanyMedicalCareQualityExpertisePenalty: number;
}
