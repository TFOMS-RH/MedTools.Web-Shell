import type { MedicalCaseDetailsDto } from "../../../../../../../../../../shared/model/types/invoiceStructure/results/medicalCases/GetMedicalCaseDetailsResult";
import { Skeleton } from "@mui/material";
import { CardField } from "../../../../../../../../../../shared/ui/CardField/CardField";
import { formatNullableValue } from "../../../../../../../../../../shared/helpers/formatNullableValue";
import styles from "../../styles.module.scss";
import dayjs from "dayjs";

interface RControlMedicalCaseDetailsCardBodyProps {
  medicalCaseDetails: MedicalCaseDetailsDto;
  isPending: boolean;
}

export const RControlMedicalCaseDetailsCardBody = ({
  medicalCaseDetails,
  isPending,
}: RControlMedicalCaseDetailsCardBodyProps) => {
  return (
    <div className={styles.groups} aria-busy={isPending}>
      <section
        className={`${styles.informationGroup} ${styles.wideGroup}`}
        aria-labelledby="rcontrol-details-diagnosis"
      >
        <h4 id="rcontrol-details-diagnosis" className={styles.groupHeading}>
          Диагноз
        </h4>
        <div className={styles.fieldGrid}>
          <div className={styles.wideField}>
            <CardField
              label="Основной диагноз"
              value={
                <span className={styles.primaryValue}>
                  {isPending ? (
                    <Skeleton />
                  ) : (
                    `${medicalCaseDetails.primaryDiagnosisCode} — ${medicalCaseDetails.primaryDiagnosisName}`
                  )}
                </span>
              }
            />
          </div>
          <CardField
            label="Первичный диагноз"
            value={
              isPending ? (
                <Skeleton />
              ) : medicalCaseDetails.initialDiagnosisCode ? (
                `${medicalCaseDetails.initialDiagnosisCode} : ${formatNullableValue(medicalCaseDetails.initialDiagnosisName)}`
              ) : (
                "—"
              )
            }
          />
          <CardField
            label="Характер основного заболевания"
            value={
              isPending ? (
                <Skeleton />
              ) : (
                formatNullableValue(medicalCaseDetails.diseaseCharacter)
              )
            }
          />
        </div>
      </section>
      <section
        className={styles.informationGroup}
        aria-labelledby="rcontrol-details-basic"
      >
        <h4 id="rcontrol-details-basic" className={styles.groupHeading}>
          Основное
        </h4>
        <div className={styles.fieldGrid}>
          <CardField
            label="Номер истории"
            value={
              isPending ? <Skeleton /> : medicalCaseDetails.medicalRecordNumber
            }
          />
          <CardField
            label="Код лечащего врача"
            value={isPending ? <Skeleton /> : medicalCaseDetails.physicianCode}
          />
          <CardField
            label="Количество"
            value={
              isPending ? (
                <Skeleton />
              ) : (
                formatNullableValue(medicalCaseDetails.paidUnits)
              )
            }
          />
          <CardField
            label="Категория"
            value={
              isPending ? (
                <Skeleton />
              ) : medicalCaseDetails.isPediatric ? (
                "Ребенок"
              ) : (
                "Взрослый"
              )
            }
          />
        </div>
      </section>
      <section
        className={styles.informationGroup}
        aria-labelledby="rcontrol-details-characteristics"
      >
        <h4
          id="rcontrol-details-characteristics"
          className={styles.groupHeading}
        >
          Медицинские характеристики
        </h4>
        <div className={styles.fieldGrid}>
          <CardField
            label="Профиль"
            value={
              isPending ? (
                <Skeleton />
              ) : (
                `${medicalCaseDetails.medicalProfileCode} : ${formatNullableValue(medicalCaseDetails.medicalProfileName)}`
              )
            }
          />
          <CardField
            label="Специальность"
            value={
              isPending ? (
                <Skeleton />
              ) : (
                `${medicalCaseDetails.physicianSpecialtyCode} : ${formatNullableValue(medicalCaseDetails.physicianSpecialtyName)}`
              )
            }
          />
          <CardField
            label="Цель посещения"
            value={
              isPending ? (
                <Skeleton />
              ) : medicalCaseDetails.visitPurposeCode ? (
                `${medicalCaseDetails.visitPurposeCode} : ${formatNullableValue(medicalCaseDetails.visitPurposeName)}`
              ) : (
                "—"
              )
            }
          />
          <CardField
            label="Уровень ЛПУ"
            value={
              isPending ? (
                <Skeleton />
              ) : (
                formatNullableValue(medicalCaseDetails.facilityLevel)
              )
            }
          />
        </div>
      </section>

      <section
        className={styles.informationGroup}
        aria-labelledby="rcontrol-details-treatment"
      >
        <h4 id="rcontrol-details-treatment" className={styles.groupHeading}>
          Лечение
        </h4>
        <div className={styles.fieldGrid}>
          <div className={styles.wideField}>
            <CardField
              label="Период лечения"
              value={
                isPending ? (
                  <Skeleton />
                ) : (
                  `${dayjs(medicalCaseDetails.treatmentStartDate).format("DD.MM.YYYY")} — ${dayjs(medicalCaseDetails.treatmentEndDate).format("DD.MM.YYYY")}`
                )
              }
            />
          </div>
          <CardField
            label="Профиль койки"
            value={
              isPending ? (
                <Skeleton />
              ) : medicalCaseDetails.bedProfileCode ? (
                `${medicalCaseDetails.bedProfileCode} : ${formatNullableValue(medicalCaseDetails.bedProfileName)}`
              ) : (
                "—"
              )
            }
          />
          <CardField
            label="Масса тела (кг)"
            value={
              isPending ? (
                <Skeleton />
              ) : (
                formatNullableValue(medicalCaseDetails.weight)
              )
            }
          />
          <CardField
            label="Реабилитация"
            value={
              isPending ? (
                <Skeleton />
              ) : medicalCaseDetails.isRehabilitation === null ? (
                "—"
              ) : medicalCaseDetails.isRehabilitation ? (
                "Да"
              ) : (
                "Нет"
              )
            }
          />
          <CardField
            label="Подозрение на ЗНО"
            value={
              isPending ? (
                <Skeleton />
              ) : medicalCaseDetails.isOncologySuspicion === null ? (
                "—"
              ) : medicalCaseDetails.isOncologySuspicion ? (
                "Да"
              ) : (
                "Нет"
              )
            }
          />
          <CardField
            label="Поступление или перевод"
            value={
              isPending ? (
                <Skeleton />
              ) : medicalCaseDetails.admissionTransferCode ? (
                `${medicalCaseDetails.admissionTransferCode} : ${formatNullableValue(medicalCaseDetails.admissionTransferName)}`
              ) : (
                "—"
              )
            }
          />
        </div>
      </section>
      <section
        className={styles.informationGroup}
        aria-labelledby="rcontrol-details-additional"
      >
        <h4 id="rcontrol-details-additional" className={styles.groupHeading}>
          Дополнительно
        </h4>
        <div className={styles.fieldGrid}>
          <CardField
            label="Подразделение"
            value={
              isPending ? (
                <Skeleton />
              ) : medicalCaseDetails.divisionNumber ? (
                `${medicalCaseDetails.divisionNumber} : ${formatNullableValue(medicalCaseDetails.divisionName)}`
              ) : (
                "—"
              )
            }
          />
          <CardField
            label="Отделение"
            value={
              isPending ? (
                <Skeleton />
              ) : medicalCaseDetails.departmentCode ? (
                `${medicalCaseDetails.departmentCode} : ${formatNullableValue(medicalCaseDetails.admissionTransferName)}`
              ) : (
                "—"
              )
            }
          />
          <div className={styles.wideField}>
            <CardField
              label="Комментарий"
              value={
                <span className={styles.comment}>
                  {isPending ? (
                    <Skeleton />
                  ) : (
                    formatNullableValue(medicalCaseDetails.internalComment)
                  )}
                </span>
              }
            />
          </div>
        </div>
      </section>
    </div>
  );
};
