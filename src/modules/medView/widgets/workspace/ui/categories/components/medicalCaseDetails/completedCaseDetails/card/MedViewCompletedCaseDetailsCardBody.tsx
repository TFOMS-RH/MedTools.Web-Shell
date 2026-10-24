import type { CompletedCaseDetailsDto } from "../../../../../../../../../../shared/model/types/invoiceStructure/results/medicalCases/GetCompletedCaseDetailsResult";
import { CardField } from "../../../../../../../../../../shared/ui/CardField/CardField";
import { Skeleton } from "@mui/material";
import { formatNullableValue } from "../../../../../../../../../../shared/helpers/formatNullableValue";
import { formatDate } from "../../../../../../../../../../shared/helpers/formatDate";
import dayjs from "dayjs";
import styles from "../../styles.module.scss";

interface MedViewCompletedCaseDetailsCardBodyProps {
  completedCaseDetails: CompletedCaseDetailsDto;
  isPending: boolean;
}

export const MedViewCompletedCaseDetailsCardBody = ({
  completedCaseDetails,
  isPending,
}: MedViewCompletedCaseDetailsCardBodyProps) => {
  const organizationName = isPending ? null : completedCaseDetails.medicalOrganizationName;
  const organizationCode = isPending ? null : completedCaseDetails.medicalOrganizationCode;
  const referringName = isPending ? null : completedCaseDetails.referringMedicalOrganizationName;
  const referringCode = isPending ? null : completedCaseDetails.referringMedicalOrganizationCode;

  return (
    <div className={styles.groups} aria-busy={isPending}>
      <section className={`${styles.informationGroup} ${styles.wideGroup}`} aria-labelledby="medview-completed-organizations">
        <h4 id="medview-completed-organizations" className={styles.groupHeading}>ЛПУ и направление</h4>
        <div className={styles.organizationGrid}>
          <CardField
            label="Наименование ЛПУ"
            value={isPending ? <Skeleton /> : (
              <>
                <span className={styles.referenceName}>{organizationName?.trim() ? organizationName : organizationCode?.trim() ? organizationCode : "—"}</span>
                {organizationName?.trim() && organizationCode?.trim() ? (
                  <span className={styles.referenceCode}>Код ЛПУ: {organizationCode}</span>
                ) : null}
              </>
            )}
          />
          <div className={styles.referral}>
            <CardField
              label="Наименование направившей МО"
              value={isPending ? <Skeleton /> : (
                <>
                  <span className={styles.referenceName}>{referringName?.trim() ? referringName : referringCode?.trim() ? referringCode : "—"}</span>
                  {referringName?.trim() && referringCode?.trim() ? (
                    <span className={styles.referenceCode}>Код направившей МО: {referringCode}</span>
                  ) : null}
                </>
              )}
            />
            <CardField label="Дата направления" value={isPending ? <Skeleton /> : formatDate(completedCaseDetails.referralDate)} />
          </div>
        </div>
      </section>
      <section className={styles.informationGroup} aria-labelledby="medview-completed-care">
        <h4 id="medview-completed-care" className={styles.groupHeading}>Медицинская помощь</h4>
        <div className={styles.fieldGrid}>
          <CardField
            label="Вид медицинской помощи"
            value={isPending ? <Skeleton /> : completedCaseDetails.medicalCareType}
          />
          <CardField
            label="Форма медицинской помощи"
            value={isPending ? <Skeleton /> : completedCaseDetails.medicalCareForm}
          />
          <CardField
            label="Условия оказания мед. помощи"
            value={isPending ? <Skeleton /> : completedCaseDetails.careConditions}
          />
          <CardField
            label="Способ оплаты"
            value={isPending ? <Skeleton /> : completedCaseDetails.paymentMethodCode}
          />
        </div>
      </section>
      <section className={styles.informationGroup} aria-labelledby="medview-completed-treatment">
        <h4 id="medview-completed-treatment" className={styles.groupHeading}>Лечение</h4>
        <div className={styles.fieldGrid}>
          <div className={styles.wideField}>
            <CardField
              label="Период лечения"
              value={isPending ? <Skeleton /> : `${dayjs(completedCaseDetails.treatmentStartDate).format("DD.MM.YYYY")} — ${dayjs(completedCaseDetails.treatmentEndDate).format("DD.MM.YYYY")}`}
            />
          </div>
          <CardField
            label="Койко-дни / пациенто-дни"
            value={isPending ? <Skeleton /> : formatNullableValue(completedCaseDetails.hospitalizationDuration)}
          />
          <CardField
            label="Внутрибольничный перевод"
            value={isPending ? <Skeleton /> : completedCaseDetails.isIntrahospitalTransfer === null ? "—" : completedCaseDetails.isIntrahospitalTransfer ? "Да" : "Нет"}
          />
        </div>
      </section>
      <section className={`${styles.informationGroup} ${styles.wideGroup}`} aria-labelledby="medview-completed-outcome">
        <h4 id="medview-completed-outcome" className={styles.groupHeading}>Результат</h4>
        <div className={styles.fieldGrid}>
          <CardField
            label="Результат"
            value={isPending ? <Skeleton /> : completedCaseDetails.hospitalizationOutcome}
          />
          <CardField
            label="Исход"
            value={isPending ? <Skeleton /> : completedCaseDetails.diseaseOutcome}
          />
          <CardField
            label="Результат диспансеризации"
            value={isPending ? <Skeleton /> : formatNullableValue(completedCaseDetails.screeningResult)}
          />
          <CardField
            label="Отказ от диспансеризации"
            value={isPending ? <Skeleton /> : completedCaseDetails.isRefusal === null ? "—" : completedCaseDetails.isRefusal ? "Да" : "Нет"}
          />
          <CardField
            label="Мобильная бригада"
            value={isPending ? <Skeleton /> : completedCaseDetails.isMobileTeam === null ? "—" : completedCaseDetails.isMobileTeam ? "Да" : "Нет"}
          />
        </div>
      </section>
    </div>
  );
};
