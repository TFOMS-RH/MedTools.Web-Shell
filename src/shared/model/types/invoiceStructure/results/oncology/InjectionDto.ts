export interface InjectionDto {
  injectionUid: number;
  administrationDate: string;
  administeredQuantity: number | null;
  consumedQuantity: number | null;
  unitCost: number | null;
  administeredCost: number | null;
  consumedCost: number | null;
  isReductionApplied: boolean | null;
}
