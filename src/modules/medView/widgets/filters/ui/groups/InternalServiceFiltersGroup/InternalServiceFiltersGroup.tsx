import { MedViewDefaultInput } from "../../../../../../../shared/ui/medView/inputs/MedViewDefaultInput/MedViewDefaultInput";
import type { InternalServiceFiltersGroupDraft } from "../../../../workspace/model/types/FiltersDraft";
import styles from "./styles.module.scss";

interface InternalServiceFiltersGroupProps {
  internalServiceFiltersGroupDraft: InternalServiceFiltersGroupDraft;
  setInternalServiceFiltersGroupDraft: (
    internalServiceFiltersGroupDraft: InternalServiceFiltersGroupDraft,
  ) => void;
}

const InternalServiceFiltersGroup = ({
  internalServiceFiltersGroupDraft,
  setInternalServiceFiltersGroupDraft,
}: InternalServiceFiltersGroupProps) => {
  return (
    <section className={styles.internalServiceFiltersGroup}>
      <header className={styles.internalServiceFiltersGroupHeader}>
        <div className={styles.titleGroup}>
          <h2>Фильтрация по техническим полям</h2>
          <p className={styles.description}>
            Все, что относится к техническим полям
          </p>
        </div>
      </header>
      <div className={styles.internalServiceFiltersSubgroup}>
        <div className={styles.groupLineGrid}>
          <div className={styles.span12}>
            <MedViewDefaultInput
              label="UID пациента"
              placeholder="1000"
              value={internalServiceFiltersGroupDraft.patientUid}
              handleInputChange={(newValue: string) =>
                setInternalServiceFiltersGroupDraft({
                  ...internalServiceFiltersGroupDraft,
                  patientUid: newValue,
                })
              }
            />
          </div>
        </div>
        <div className={styles.groupLineGrid}>
          <div className={styles.span12}>
            <MedViewDefaultInput
              label="UID случая"
              placeholder="1000"
              value={internalServiceFiltersGroupDraft.medicalCaseUid}
              handleInputChange={(newValue: string) =>
                setInternalServiceFiltersGroupDraft({
                  ...internalServiceFiltersGroupDraft,
                  medicalCaseUid: newValue,
                })
              }
            />
          </div>
        </div>
        <div className={styles.groupLineGrid}>
          <div className={styles.span12}>
            <MedViewDefaultInput
              label="UID законченного случая"
              placeholder="1000"
              value={internalServiceFiltersGroupDraft.completedCaseUid}
              handleInputChange={(newValue: string) =>
                setInternalServiceFiltersGroupDraft({
                  ...internalServiceFiltersGroupDraft,
                  completedCaseUid: newValue,
                })
              }
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default InternalServiceFiltersGroup;
