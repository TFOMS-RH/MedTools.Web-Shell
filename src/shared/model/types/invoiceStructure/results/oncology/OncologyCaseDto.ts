export interface OncologyCaseDto {
  oncologyCaseUid: number;
  referralReasonCode: number | null;
  referralReason: string | null;
  stageCode: number | null;
  stage: string | null;
  icdDiagnosis: string | null;
  tumorValue: number | null;
  nodusValue: number | null;
  metastasisValue: number | null;
  isMetastasisDetected: boolean | null;
  totalFocusDose: number | null;
  radiationFractionsCount: number | null;
  weight: number | null;
  height: number | null;
  bodySurfaceArea: number | null;
}
