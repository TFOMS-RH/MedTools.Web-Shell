import type { MedicationDto } from "../../../../../../../../../../shared/model/types/invoiceStructure/results/oncology/GetMedicationsResult";
import { displayValue } from "../../presentation";
import styles from "../../styles.module.scss";
interface MedViewMedicationCardsProps {
  medications: MedicationDto[];
  selectedMedicationUid: number | null;
  selectMedication: (uid: number | null) => void;
}
export const MedViewMedicationCards = ({
  medications,
  selectedMedicationUid,
  selectMedication,
}: MedViewMedicationCardsProps) => (
  <div
    className={[
      styles.selectionList,
      medications.length > 3 ? styles.selectionListLong : "",
    ].join(" ")}
    aria-label="Выбор лекарственного препарата"
    role="group"
  >
    {medications.map((medication) => (
      <article
        key={medication.medicamentUid}
        data-oncology-medication
        role="button"
        tabIndex={0}
        aria-pressed={selectedMedicationUid === medication.medicamentUid}
        className={styles.selectionCard}
        onClick={() => selectMedication(medication.medicamentUid)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            if (!event.repeat) selectMedication(medication.medicamentUid);
          }
        }}
      >
        <span className={styles.detailLabel}>Регистрационный номер</span>
        <h4 className={styles.selectionTitle}>
          {displayValue(medication.drugIdentifier)}
        </h4>
        {medication.therapyRegimenCode?.trim() && (
          <p className={styles.recordText}>
            <span className={styles.detailLabel}>Код схемы терапии: </span>
            {medication.therapyRegimenCode}
          </p>
        )}
      </article>
    ))}
  </div>
);
