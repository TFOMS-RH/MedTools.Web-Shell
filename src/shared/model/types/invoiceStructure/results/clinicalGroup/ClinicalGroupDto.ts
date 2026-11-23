export interface ClinicalGroupDto {
  clinicalGroupUid: number;
  clinicalStatisticalGroupNumber: string;
  calculatedClinicalStatisticalGroupNumber: string | null;
  clinicalStatisticalGroupModelVersion: number;
  isCsgSubgroupUsed: boolean;
  clinicalProfileGroupNumber?: string | null;
  costCoefficient: number;
  managementCoefficient: number;
  baseRate: number;
  differentiationCoefficient: number;
  levelCoefficient: number;
  wageTargetCoefficient: number | null;
  isClspUsed: boolean;
  complexityCoefficient: number | null;
}
