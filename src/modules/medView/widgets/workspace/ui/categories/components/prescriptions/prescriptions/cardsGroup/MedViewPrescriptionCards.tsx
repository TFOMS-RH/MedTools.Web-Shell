import type { PrescriptionDto } from "../../../../../../../../../../shared/model/types/invoiceStructure/results/prescriptions/GetPrescriptionsResult";
import { displayValue, formatReferralDate, renderReference } from "../../presentation";
import { MedViewPrescriptionCardSkeletons } from "./MedViewPrescriptionCardSkeletons";
import styles from "./styles.module.scss";

interface MedViewPrescriptionCardsProps {
  prescriptions: PrescriptionDto[];
  isPending: boolean;
}

export const MedViewPrescriptionCards = ({
  prescriptions,
  isPending,
}: MedViewPrescriptionCardsProps) => {
  if (isPending) return <MedViewPrescriptionCardSkeletons />;

  return (
    <div className={styles.prescriptionsCards}>
      {prescriptions.map((prescription) => (
        <article className={styles.panel} key={prescription.perscriptionUid}>
          <h4 className={styles.panelHeading}>Назначение №{prescription.sequenceNumber}</h4>
          <div className={styles.groups}>
            <div className={styles.mainGroup}>
              <dl className={styles.fields}>
                <div className={styles.wideField}>
                  <dt>Вид назначения</dt>
                  <dd className={styles.primaryValue}>
                    {renderReference(prescription.prescriptionType, prescription.prescriptionTypeCode)}
                  </dd>
                </div>
                <div>
                  <dt>Метод диагностического лечения</dt>
                  <dd>{renderReference(prescription.diagnosticMethod, prescription.diagnosticMethodCode)}</dd>
                </div>
                <div>
                  <dt>Медицинская услуга в направлении</dt>
                  <dd>{displayValue(prescription.serviceCode)}</dd>
                </div>
              </dl>
            </div>
            <div className={styles.group}>
              <h5 className={styles.groupHeading}>Направление</h5>
              <dl className={styles.fields}>
                <div>
                  <dt>Дата направления</dt>
                  <dd>{formatReferralDate(prescription.referralDate)}</dd>
                </div>
                <div>
                  <dt>Медицинская организация назначения</dt>
                  <dd>{displayValue(prescription.referredToMoCode)}</dd>
                </div>
              </dl>
            </div>
            <div className={styles.group}>
              <h5 className={styles.groupHeading}>Профиль</h5>
              <dl className={styles.fields}>
                <div>
                  <dt>Профиль МП</dt>
                  <dd>{displayValue(prescription.medicalCareProfile)}</dd>
                </div>
                <div>
                  <dt>Профиль койки</dt>
                  <dd>{displayValue(prescription.bedProfile)}</dd>
                </div>
              </dl>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
};
