import { DataState } from "../../../../../../../../shared/ui/DataState/DataState";
import { useMedViewWorkspaceStore } from "../../../../model/stores/useMedViewWorkspaceStore";
import { MedViewPrescriptionCardsGroupRoot } from "./prescriptions/cardsGroup/MedViewPrescriptionCardsGroupRoot";
import { MedViewReferralsTableRoot } from "./referrals/table/MedViewReferralsTableRoot";
import styles from "./styles.module.scss";

const MedViewPrescriptionsCategoryRoot = () => {
  const { selectedMedicalCaseUid } = useMedViewWorkspaceStore();

  return (
    <section className={styles.prescriptionsRoot}>
      {selectedMedicalCaseUid === null ? (
        <DataState
          title="Выберите медицинский случай"
          description="Нажмите на карточку медицинского случая для отображения данных о назначениях и направлениях"
          variant="waiting"
        />
      ) : (
        <>
          <MedViewPrescriptionCardsGroupRoot />
          <MedViewReferralsTableRoot />
        </>
      )}
    </section>
  );
};

export default MedViewPrescriptionsCategoryRoot;
