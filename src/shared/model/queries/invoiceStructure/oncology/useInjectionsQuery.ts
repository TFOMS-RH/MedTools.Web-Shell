import type { MedicalRegisterType } from "../../../../types/TargetDbType";
import { useQuery } from "@tanstack/react-query";
import { getInjections } from "../../../../api/invoiceStructure/oncology/getInjections";

export const useInjectionsQuery = (
  medicationUid: number | null,
  registerType: MedicalRegisterType | null,
) => {
  const isReady = medicationUid !== null && registerType !== null;

  return useQuery({
    queryKey: ["r-control", "injections", medicationUid, registerType],
    enabled: isReady,
    queryFn: () => {
      if (medicationUid === null || registerType === null) {
        throw new Error("Невалидные параметры запроса");
      }

      return getInjections(medicationUid, registerType);
    },
  });
};
