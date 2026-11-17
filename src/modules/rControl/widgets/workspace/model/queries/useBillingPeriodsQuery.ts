import type { MedicalRegisterType } from "../../../../../../shared/types/TargetDbType";
import { getBillingPeriods } from "../../api/getBillingPeriods";
import { useQuery } from "@tanstack/react-query";

export const useBillingPeriodsQuery = (
  medicalOrganizationCode: string | null,
  registerType: MedicalRegisterType | null,
) => {
  return useQuery({
    queryKey: [
      "r-control",
      "billing-periods",
      medicalOrganizationCode,
      registerType,
    ],
    enabled: registerType !== null && medicalOrganizationCode !== null,
    queryFn: () => getBillingPeriods(medicalOrganizationCode, registerType!),
  });
};
