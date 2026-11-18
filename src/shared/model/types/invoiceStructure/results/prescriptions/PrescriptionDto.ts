export interface PrescriptionDto {
  perscriptionUid: number;
  sequenceNumber: number;
  prescriptionTypeCode: number;
  prescriptionType: string;
  physicianSpecialtyCode: number | null;
  diagnosticMethodCode: number | null;
  diagnosticMethod: string | null;
  serviceCode: number | null;
  referralDate: string | null;
  referredToMoCode: string | null;
  medicalCareProfile: number | null;
  bedProfile: string | null;
}
