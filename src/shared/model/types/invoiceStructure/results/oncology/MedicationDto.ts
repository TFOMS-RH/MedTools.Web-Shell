export interface MedicationDto {
  medicamentUid: number;
  drugIdentifier: string;
  drugExtendedIdentifier: string | null;
  therapyRegimenCode: string | null;
}
