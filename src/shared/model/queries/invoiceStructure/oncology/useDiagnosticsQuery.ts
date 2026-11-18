import type { MedicalRegisterType } from "../../../../types/TargetDbType";
import { useQuery } from "@tanstack/react-query";
import { getDiagnostics } from "../../../../api/invoiceStructure/oncology/getDiagnostics";

export const useDiagnosticsQuery = (
  oncologyCaseUid: number | null,
  registerType: MedicalRegisterType | null,
) => {
  const isReady = oncologyCaseUid !== null && registerType !== null;

  return useQuery({
    queryKey: ["r-control", "diagnostics", oncologyCaseUid, registerType],
    enabled: isReady,
    queryFn: () => {
      if (oncologyCaseUid === null || registerType === null) {
        throw new Error("Невалидные параметры запроса");
      }

      return getDiagnostics(oncologyCaseUid, registerType);
    },
  });
};
