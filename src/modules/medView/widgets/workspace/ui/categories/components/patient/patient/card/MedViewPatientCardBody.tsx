import type { PatientDto } from "../../../../../../../../../../shared/model/types/invoiceStructure/results/patient/GetPatientResult";
import { CardField } from "../../../../../../../../../../shared/ui/CardField/CardField";
import { Skeleton } from "@mui/material";
import { formatNullableValue } from "../../../../../../../../../../shared/helpers/formatNullableValue";
import { formatDate } from "../../../../../../../../../../shared/helpers/formatDate";

import { MedViewPatientCardHeader } from "./MedViewPatientCardHeader";
import styles from "../../styles.module.scss";

interface MedViewPatientCardBodyProps {
  patient: PatientDto;
  isPending: boolean;
  section?: "profile" | "document" | "representative";
}

export const MedViewPatientCardBody = ({
  patient,
  isPending,
  section = "profile",
}: MedViewPatientCardBodyProps) => {
  if (section === "document") {
    return (
      <section className={styles.informationGroup} aria-labelledby="medview-patient-1">
        <h3 id="medview-patient-1" className={styles.groupHeading}>Удостоверение личности</h3>
        <div className={styles.fieldGrid}>
          <div className={styles.wideField}>
            <CardField
              label="Тип"
              value={isPending ? <Skeleton /> : `${formatNullableValue(patient.documentTypeCode)} ${patient.documentTypeName}`}
            />
          </div>
          <CardField
            label="Серия"
            value={isPending ? <Skeleton /> : formatNullableValue(patient.documentSeries)}
          />
          <CardField
            label="Номер"
            value={isPending ? <Skeleton /> : formatNullableValue(patient.documentNumber)}
          />
          <CardField
            label="Дата выдачи"
            value={isPending ? <Skeleton /> : formatDate(patient.documentIssueDate)}
          />
          <div className={styles.wideField}>
            <CardField
              label="Кем выдан"
              value={isPending ? <Skeleton /> : formatNullableValue(patient.issuedBy)}
            />
          </div>
        </div>
      </section>
    );
  }

  const representative = section === "representative";
  const fullName = isPending ? "" : (representative
    ? [patient.patientRepresentativeLastName, patient.patientRepresentativeFirstName, patient.patientRepresentativeMiddleName]
    : [patient.patientLastName, patient.patientFirstName, patient.patientMiddleName])
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(" ");

  return (
    <section
      className={representative ? styles.representative : styles.profile}
      aria-labelledby={representative ? "medview-patient-2" : "medview-patient-0"}
      aria-busy={isPending}
    >
      {representative ? (
        <h3 id="medview-patient-2" className={styles.groupHeading}>Представитель</h3>
      ) : <MedViewPatientCardHeader />}
      <p className={representative ? styles.representativeName : styles.patientName}>
        {isPending ? <Skeleton /> : fullName || "—"}
      </p>
      <div className={styles.identityAttributes}>
        <CardField
          label={representative ? "Дата рождения представителя" : "Дата рождения"}
          value={isPending ? <Skeleton /> : formatDate(representative ? patient.patientRepresentativeBirthday : patient.patientBirthDate)}
        />
        <CardField
          label={representative ? "Пол представителя" : "Пол"}
          value={isPending ? <Skeleton /> : formatNullableValue(representative ? patient.patientRepresentativeSex : patient.patientSex)}
        />
      </div>
    </section>
  );
};
