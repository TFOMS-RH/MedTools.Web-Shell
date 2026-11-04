import { Skeleton } from "@mui/material";
import { CardField } from "../../../../../../../../../../shared/ui/CardField/CardField";
import dayjs from "dayjs";
import { formatNullableValue } from "../../../../../../../../../../shared/helpers/formatNullableValue";
import type { MedicalCaseDetailsDto } from "../../../../../../../../../../shared/model/types/invoiceStructure/results/medicalCases/GetMedicalCaseDetailsResult";
import styles from "../../styles.module.scss";

interface MedViewMedicalCaseDetailsCardBodyProps {
  medicalCaseDetails: MedicalCaseDetailsDto;
  isPending: boolean;
}

export const MedViewMedicalCaseDetailsCardBody = ({
  medicalCaseDetails,
  isPending,
}: MedViewMedicalCaseDetailsCardBodyProps) => {
  return (
    <div className={styles.groups} aria-busy={isPending}>
      <section className={styles.informationGroup} aria-labelledby="medview-details-basic">
        <h4 id="medview-details-basic" className={styles.groupHeading}>Основное</h4>
        <div className={styles.fieldGrid}>
          <CardField
            label="Номер истории"
            value={isPending ? <Skeleton /> : medicalCaseDetails.medicalRecordNumber}
          />
          <CardField
            label="Код лечащего врача"
            value={isPending ? <Skeleton /> : medicalCaseDetails.physicianCode}
          />
          <CardField
            label="Количество"
            value={isPending ? <Skeleton /> : formatNullableValue(medicalCaseDetails.paidUnits)}
          />
          <CardField
            label="Категория"
            value={isPending ? <Skeleton /> : medicalCaseDetails.isPediatric ? "Ребенок" : "Взрослый"}
          />
        </div>
      </section>
      <section className={styles.informationGroup} aria-labelledby="medview-details-characteristics">
        <h4 id="medview-details-characteristics" className={styles.groupHeading}>Медицинские характеристики</h4>
        <div className={styles.fieldGrid}>
          <CardField
            label="Профиль"
            value={isPending ? <Skeleton /> : medicalCaseDetails.medicalProfile}
          />
          <CardField
            label="Специальность"
            value={isPending ? <Skeleton /> : medicalCaseDetails.physicianSpecialty}
          />
          <CardField
            label="Цель посещения"
            value={isPending ? <Skeleton /> : formatNullableValue(medicalCaseDetails.visitPurpose)}
          />
          <CardField
            label="Уровень ЛПУ"
            value={isPending ? <Skeleton /> : formatNullableValue(medicalCaseDetails.facilityLevel)}
          />
        </div>
      </section>
      <section className={`${styles.informationGroup} ${styles.wideGroup}`} aria-labelledby="medview-details-diagnosis">
        <h4 id="medview-details-diagnosis" className={styles.groupHeading}>Диагноз</h4>
        <div className={styles.fieldGrid}>
          <div className={styles.wideField}>
            <CardField
              label="Основной диагноз"
              value={<span className={styles.primaryValue}>{isPending ? <Skeleton /> : medicalCaseDetails.primaryDiagnosis}</span>}
            />
          </div>
          <CardField
            label="Первичный диагноз"
            value={isPending ? <Skeleton /> : formatNullableValue(medicalCaseDetails.initialDiagnosis)}
          />
          <CardField
            label="Характер основного заболевания"
            value={isPending ? <Skeleton /> : formatNullableValue(medicalCaseDetails.diseaseCharacter)}
          />
        </div>
      </section>
      <section className={styles.informationGroup} aria-labelledby="medview-details-treatment">
        <h4 id="medview-details-treatment" className={styles.groupHeading}>Лечение</h4>
        <div className={styles.fieldGrid}>
          <div className={styles.wideField}>
            <CardField
              label="Период лечения"
              value={isPending ? <Skeleton /> : `${dayjs(medicalCaseDetails.treatmentStartDate).format("DD.MM.YYYY")} — ${dayjs(medicalCaseDetails.treatmentEndDate).format("DD.MM.YYYY")}`}
            />
          </div>
          <CardField
            label="Профиль койки"
            value={isPending ? <Skeleton /> : formatNullableValue(medicalCaseDetails.bedProfile)}
          />
          <CardField
            label="Масса тела (кг)"
            value={isPending ? <Skeleton /> : formatNullableValue(medicalCaseDetails.weight)}
          />
          <CardField
            label="Реабилитация"
            value={isPending ? <Skeleton /> : medicalCaseDetails.isRehabilitation === null ? "—" : medicalCaseDetails.isRehabilitation ? "Да" : "Нет"}
          />
          <CardField
            label="Подозрение на ЗНО"
            value={isPending ? <Skeleton /> : medicalCaseDetails.isOncologySuspicion === null ? "—" : medicalCaseDetails.isOncologySuspicion ? "Да" : "Нет"}
          />
          <CardField
            label="Поступление или перевод"
            value={isPending ? <Skeleton /> : medicalCaseDetails.isAdmissionTransfer === null ? "—" : medicalCaseDetails.isAdmissionTransfer ? "Да" : "Нет"}
          />
        </div>
      </section>
      <section className={styles.informationGroup} aria-labelledby="medview-details-additional">
        <h4 id="medview-details-additional" className={styles.groupHeading}>Дополнительно</h4>
        <div className={styles.fieldGrid}>
          <CardField
            label="Подразделение"
            value={isPending ? <Skeleton /> : formatNullableValue(medicalCaseDetails.department)}
          />
          <CardField
            label="Отделение"
            value={isPending ? <Skeleton /> : formatNullableValue(medicalCaseDetails.departmentCode)}
          />
          <div className={styles.wideField}>
            <CardField
              label="Комментарий"
              value={<span className={styles.comment}>{isPending ? <Skeleton /> : formatNullableValue(medicalCaseDetails.internalComment)}</span>}
            />
          </div>
        </div>
      </section>
    </div>
  );
};
