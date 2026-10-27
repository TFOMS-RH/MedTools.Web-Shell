export interface GetMedicalSanctionsResult {
  medicalSanctions: MedicalSanctionDto[];
}

export interface MedicalSanctionDto {
  medicalSanctionUid: number;
  sanctionCode: string;
  sanctionAmount: number;
  controlTypeCode: string;
  controlTypeName: string | null;
  refusalReasonCode: number;
  refusalReasonName: string | null;
  comment: string | null;
  source: number;
  unitsRemoved: number;
  expertiseActDate: string;
  expertiseActNumber: string;
  expertCode: string | null;
  filename: string;
  year: number | null;
  month: number | null;
  uploadDate: string | null;
}
