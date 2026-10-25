import { resolveDataState } from "../../../../../../../../../../shared/helpers/resolveDataState";
import { DataState } from "../../../../../../../../../../shared/ui/DataState/DataState";
import { useRControlWorkspacePanelStore } from "../../../../../../model/store/useRControlWorkspacePanelStore";
import { usePatientQuery } from "../../../../../../../../../../shared/model/queries/invoiceStructure/patient/usePatientQuery";
import { useRControlWorkspaceStore } from "../../../../../../model/store/useRControlWorkspaceStore";
import { RControlPatientCardBody } from "./RControlPatientCardBody";
import { RControlPatientCardHeader } from "./RControlPatientCardHeader";
import type { ReactNode } from "react";
import type { PatientDto } from "../../../../../../../../../../shared/model/types/invoiceStructure/results/patient/GetPatientResult";
import type { DataState as DataStateValue } from "../../../../../../../../../../shared/types/DataState";
import styles from "../../styles.module.scss";

export const RControlPatientCardRoot = ({ insurance }: { insurance: ReactNode; }) => {
  const { targetDb } = useRControlWorkspacePanelStore();
  const { selectedMedicalCaseUid } = useRControlWorkspaceStore();

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

  return <RControlPatientCardContent patient={patient} isPending={isPending}
    dataState={dataState} error={error?.message} insurance={insurance} />;
};

// Local presentation shared by the live category and its development scenarios.
export const RControlPatientCardContent = ({ patient, isPending, dataState, error, insurance }: {
  patient?: PatientDto | null;
  isPending: boolean;
  dataState: DataStateValue;
  error?: string;
  insurance: ReactNode;
}) => {
  const unavailable = dataState === "error" || dataState === "empty";
  return (
    <div className={styles.patientContent}>
      {unavailable ? (
        <section className={styles.informationGroup} aria-labelledby="rcontrol-patient-0">
          <RControlPatientCardHeader />
          <DataState title={dataState === "error" ? "Ошибка данных" : "Данных не найдено"}
            description={dataState === "error" ? error ?? "Неизвестная ошибка" : "Медицинский случай не содержит информации о пациенте"}
            variant={dataState === "error" ? "error" : "empty"} />
        </section>
      ) : <RControlPatientCardBody patient={patient!} isPending={isPending} />}
      <div className={`${styles.relatedGroups} ${unavailable ? styles.insuranceOnly : ""}`}>
        <div>
          {!unavailable && <RControlPatientCardBody patient={patient!} isPending={isPending} section="document" />}
        </div>
        {insurance}
      </div>
      {!unavailable && <RControlPatientCardBody patient={patient!} isPending={isPending} section="representative" />}
    </div>
  );
};
