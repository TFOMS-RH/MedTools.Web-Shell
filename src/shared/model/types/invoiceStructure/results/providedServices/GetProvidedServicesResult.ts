export interface GetProvidedServicesResult {
  providedServices: ProvidedServiceDto[];
}

export interface ProvidedServiceDto {
  providedServiceUid: number;
  serviceCode: string;
  serviceName: string | null;
  medicalInterventionType: string | null;
  medicalProfileCode: number;
  medicalProfile: string;
  physicianSpecialtyCode: number;
  physicianSpecialty: string;
  isPediatric: boolean;
  serviceStartDate: string;
  serviceEndDate: string;
  diagnosisCode: string;
  diagnosisName: string | null;
  serviceQuantity: number;
  unitRate: number | null;
  amountBilled: number;
  internalComment: string | null;
}
