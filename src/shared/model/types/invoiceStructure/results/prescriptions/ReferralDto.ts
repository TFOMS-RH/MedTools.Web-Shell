export interface ReferralDto {
  referralUid: number;
  referralDate: string;
  referredToMoCode: string | null;
  referralTypeCode: number;
  referralType: string;
  diagnosticMethodCode: number | null;
  diagnosticMethod: string | null;
  referredServiceCode: string | null;
  referredService: string | null;
}
