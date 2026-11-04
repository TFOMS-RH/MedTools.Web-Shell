import type { MedicalCaseDto } from "../../../../../../../../shared/model/types/invoiceStructure/results/medicalCases/GetMedicalCaseListItemsResult";
import { formatNullableValue } from "../../../../../../../../shared/helpers/formatNullableValue";
import { formatCurrency } from "../../../../../../../../shared/helpers/formatCurrency";
import styles from "./styles.module.scss";
import dayjs from "dayjs";

interface RControlMedicalCaseCardsProps {
  medicalCases: MedicalCaseDto[];
  selectedMedicalCaseUid: number | null;
  selectMedicalCase: (medicalCaseUid: number | null) => void;
}

const formatTreatmentDate = (value: string) => {
  const date = value ? dayjs(value) : null;
  return date?.isValid() ? date.format("DD.MM.YYYY") : "—";
};

export const RControlMedicalCaseCards = ({
  medicalCases,
  selectedMedicalCaseUid,
  selectMedicalCase,
}: RControlMedicalCaseCardsProps) => {
  return (
    <section
      className={styles.medicalCasesCards}
      aria-label="Медицинские случаи"
    >
      <ul className={styles.list}>
        {medicalCases.map((medicalCase, index) => (
          <li key={medicalCase.medicalCaseUid}>
            <article
              onClick={() => selectMedicalCase(medicalCase.medicalCaseUid)}
              className={`${styles.card} ${
                selectedMedicalCaseUid === medicalCase.medicalCaseUid
                  ? styles.selected
                  : ""
              }`}
            >
              <div className={styles.identity}>
                <h3 className={styles.heading}>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      selectMedicalCase(medicalCase.medicalCaseUid);
                    }}
                    className={styles.selectButton}
                    aria-label={`Выбрать медицинский случай ${index + 1} из ${medicalCases.length}`}
                    aria-pressed={
                      selectedMedicalCaseUid === medicalCase.medicalCaseUid
                    }
                  >
                    Медицинский случай
                  </button>
                </h3>
                <p className={styles.period}>
                  <span className={styles.periodLabel}>Период лечения</span>
                  <span>
                    {formatTreatmentDate(medicalCase.treatmentStartDate)} —{" "}
                    {formatTreatmentDate(medicalCase.treatmentEndDate)}
                  </span>
                </p>
                <dl className={styles.facts}>
                  <div>
                    <dt>Категория</dt>
                    <dd>{medicalCase.isPediatric ? "Ребенок" : "Взрослый"}</dd>
                  </div>
                  <div>
                    <dt>Количество</dt>
                    <dd>{formatNullableValue(medicalCase.paidUnits)}</dd>
                  </div>
                </dl>
              </div>

              <section
                className={styles.medicalInfo}
                aria-label="Медицинская информация"
              >
                <div className={styles.diagnosis}>
                  <h4 className={styles.diagnosisLabel}>Основной диагноз</h4>
                  <p className={styles.diagnosisCode}>
                    {`${medicalCase.primaryDiagnosisCode} — ${medicalCase.primaryDiagnosisName} `}
                  </p>
                </div>
                <dl className={styles.medicalDetails}>
                  <div>
                    <dt>Профиль медицинской помощи</dt>
                    <dd>
                      <span>
                        {`${medicalCase.medicalProfileCode} : ${medicalCase.medicalProfileName}`}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt>Специальность врача</dt>
                    <dd>
                      <span>
                        {`${medicalCase.physicianSpecialtyCode} : ${medicalCase.physicianSpecialtyName}`}
                      </span>
                    </dd>
                  </div>
                </dl>
              </section>

              <dl
                className={styles.finances}
                aria-label="Финансовые показатели"
              >
                <div>
                  <dt>Тариф</dt>
                  <dd>{formatCurrency(medicalCase.unitRate)}</dd>
                </div>
                <div>
                  <dt>Предъявлено</dt>
                  <dd>{formatCurrency(medicalCase.amountBilled)}</dd>
                </div>
                <div>
                  <dt>Принято</dt>
                  <dd>{formatCurrency(medicalCase.approvedAmount)}</dd>
                </div>
                <div>
                  <dt>Принято СМО</dt>
                  <dd>
                    {formatCurrency(medicalCase.insuranceCompanyApprovedAmount)}
                  </dd>
                </div>
              </dl>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
};
