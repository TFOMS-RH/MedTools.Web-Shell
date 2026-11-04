import type { ReactNode } from "react";
import { resolveDataState } from "../../../../../../../../../../shared/helpers/resolveDataState";
import { DataState } from "../../../../../../../../../../shared/ui/DataState/DataState";
import { usePatientQuery } from "../../../../../../../../../../shared/model/queries/invoiceStructure/patient/usePatientQuery";
import { useMedViewFiltersStore } from "../../../../../../../filters/model/stores/useMedViewFiltersStore";
import { useMedViewWorkspaceStore } from "../../../../../../model/stores/useMedViewWorkspaceStore";
import { MedViewPatientCardHeader } from "./MedViewPatientCardHeader";
import { MedViewPatientCardBody } from "./MedViewPatientCardBody";
import styles from "../../styles.module.scss";

export const MedViewPatientCardRoot = ({ insurance }: { insurance: ReactNode }) => {
  const { targetDb } = useMedViewFiltersStore();
  const { selectedMedicalCaseUid } = useMedViewWorkspaceStore();

  const {
    data: patient,
    isLoading,
    isPending,
    isError,
    isSuccess,
    error,
  } = usePatientQuery(selectedMedicalCaseUid, targetDb);

  const dataState = resolveDataState({
    isEnabled: selectedMedicalCaseUid !== null && targetDb !== null,
    isLoading: isLoading,
    isError: isError,
    isSuccess: isSuccess,
    isEmpty: patient === null && isSuccess,
  });

  const hasPatientState = dataState === "error" || dataState === "empty";

  return (
    <div className={styles.patientContent}>
      {hasPatientState ? (
        <section className={styles.informationGroup} aria-labelledby="medview-patient-0">
          <MedViewPatientCardHeader />
          <DataState
            title={dataState === "error" ? "Ошибка данных" : "Данных не найдено"}
            description={dataState === "error"
              ? error?.message ?? "Неизвестная ошибка"
              : "Медицинский случай не содержит информации о пациенте"}
            variant={dataState === "error" ? "error" : "empty"}
          />
        </section>
      ) : (
        <MedViewPatientCardBody patient={patient!} isPending={isPending} />
      )}
      <div className={`${styles.relatedGroups} ${hasPatientState ? styles.insuranceOnly : ""}`}>
        <div>
          {!hasPatientState && (
            <MedViewPatientCardBody patient={patient!} isPending={isPending} section="document" />
          )}
        </div>
        {insurance}
      </div>
      {!hasPatientState && (
        <MedViewPatientCardBody patient={patient!} isPending={isPending} section="representative" />
      )}
    </div>
  );
};
