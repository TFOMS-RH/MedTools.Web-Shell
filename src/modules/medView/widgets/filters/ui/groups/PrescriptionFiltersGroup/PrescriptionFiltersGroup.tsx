import type { PrescriptionFiltersGroupDraft } from "../../../../workspace/model/types/FiltersDraft";
import { PrescriptionFiltersSubgroup } from "./PrescriptionFiltersSubgroup";
import { ReferralFiltersSubgroup } from "./ReferralFiltersSubgroup";
import styles from "./styles.module.scss";

interface PrescriptionFiltersGroupProps {
  prescriptionFiltersGroupDraft: PrescriptionFiltersGroupDraft;
  setPrescriptionFiltersGroupDraft: (
    prescriptionFiltersGroupDraft: PrescriptionFiltersGroupDraft,
  ) => void;
}

const PrescriptionFiltersGroup = ({
  prescriptionFiltersGroupDraft,
  setPrescriptionFiltersGroupDraft,
}: PrescriptionFiltersGroupProps) => {
  return (
    <section className={styles.prescriptionFiltersGroup}>
      <header className={styles.prescriptionFiltersGroupHeader}>
        <div className={styles.titleGroup}>
          <h2>Фильтрация по назначениям и направлениям</h2>
          <p className={styles.description}>
            Все поля, которые относятся к назначениям и направлениям
          </p>
        </div>
      </header>
      <PrescriptionFiltersSubgroup
        prescriptionFiltersSubgroup={prescriptionFiltersGroupDraft.prescription}
        setPrescriptionFiltersSubgroup={(prescription) =>
          setPrescriptionFiltersGroupDraft({
            ...prescriptionFiltersGroupDraft,
            prescription: prescription,
          })
        }
      />
      <ReferralFiltersSubgroup
        referralsFiltersSubgroupDraft={prescriptionFiltersGroupDraft.referral}
        setReferralsFiltersSubgroupDraft={(referral) =>
          setPrescriptionFiltersGroupDraft({
            ...prescriptionFiltersGroupDraft,
            referral: referral,
          })
        }
      />
    </section>
  );
};

export default PrescriptionFiltersGroup;
