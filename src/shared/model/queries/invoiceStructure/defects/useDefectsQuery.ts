import type { MedicalRegisterType } from "../../../../types/TargetDbType";
import { useQuery } from "@tanstack/react-query";
import { getDefects } from "../../../../api/invoiceStructure/defects/getDefects";

export const useDefectsQuery = (
  medicalCaseUid: number | null,
  registerType: MedicalRegisterType | null,
  page: number,
  pageSize: number,
) => {
  const isReady = medicalCaseUid !== null && registerType !== null;

  return useQuery({
    queryKey: [
      "r-control",
      "defects",
      medicalCaseUid,
      registerType,
      page,
      pageSize,
    ],
    enabled: isReady,
    queryFn: () => {
      if (medicalCaseUid === null || registerType === null) {
        throw new Error("Невалидные параметры запроса");
      }

      return getDefects(medicalCaseUid, registerType, page, pageSize);
    },
  });
};
