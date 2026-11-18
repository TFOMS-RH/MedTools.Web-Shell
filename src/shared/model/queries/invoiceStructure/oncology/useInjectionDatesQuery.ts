import type { MedicalRegisterType } from "../../../../types/TargetDbType";
import { useQuery } from "@tanstack/react-query";
import { getInjectionDates } from "../../../../api/invoiceStructure/oncology/getInjectionDates";

export const useInjectionDatesQuery = (
  medicationUid: number | null,
  registerType: MedicalRegisterType | null,
) => {
  const isReady = medicationUid !== null && registerType !== null;

  return useQuery({
    queryKey: ["r-control", "injection-dates", medicationUid, registerType],
    enabled: isReady,
    queryFn: () => {
      if (medicationUid === null || registerType === null) {
        throw new Error("Невалидные параметры запроса");
      }

      return getInjectionDates(medicationUid, registerType);
    },
  });
};
