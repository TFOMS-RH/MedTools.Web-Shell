import type { MedicalRegisterType } from "../../../../../../shared/types/TargetDbType";
import { useQuery } from "@tanstack/react-query";
import { getMedicalOrganizations } from "../../api/getMedicalOrganizations";

export const useMedicalOrganizationsQuery = (
  registerType: MedicalRegisterType | null,
) => {
  return useQuery({
    queryKey: ["r-control", "medical-organizations", registerType],
    enabled: registerType !== null,
    queryFn: () => getMedicalOrganizations(registerType!),
  });
};
