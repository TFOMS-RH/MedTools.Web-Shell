export interface InsuranceDto {
  insuranceCompanyCode: string | null;
  insuranceCompanyName: string | null;
  ogrn: string | null;
  okato: string | null;
  insurancePolicyUnifiedNumber: string | null;
  insurancePolicySeries: string | null;
  insurancePolicyNumber: string;
  insurancePolicyTypeCode: number;
  insurancePolicyTypeName: string;
}
