import { lazy, Suspense } from "react";
import { DataState } from "../../../../../../../../shared/ui/DataState/DataState";
import { useRControlWorkspaceStore } from "../../../../model/store/useRControlWorkspaceStore";
import { RControlPrescriptionCardsGroupRoot } from "./prescriptions/cardsGroup/RControlPrescriptionCardsGroupRoot";
import { RControlReferralsTableRoot } from "./referrals/table/RControlReferralsTableRoot";
import styles from "./styles.module.scss";

const PrescriptionsPreview = import.meta.env.DEV
  ? lazy(() => import("./RControlPrescriptionsCategoryPreview"))
  : null;

const RControlPrescriptionsCategoryRoot = () => {
  const { selectedMedicalCaseUid } = useRControlWorkspaceStore();

  const params = new URLSearchParams(window.location.search);
  const showPreview =
    PrescriptionsPreview &&
    params.get("demoWorkspace") === "1" &&
    params.get("demoPrescriptions") !== "live";

  return (
    <section className={styles.prescriptionsRoot}>
      {selectedMedicalCaseUid === null ? (
        <DataState
          title="Выберите медицинский случай"
          description="Нажмите на карточку медицинского случая для отображения данных о назначениях и направлениях"
          variant="waiting"
        />
      ) : showPreview ? (
        <Suspense fallback={null}>
          <PrescriptionsPreview key={selectedMedicalCaseUid} />
        </Suspense>
      ) : (
        <>
          <RControlPrescriptionCardsGroupRoot />
          <RControlReferralsTableRoot />
        </>
      )}
    </section>
  );
};

export default RControlPrescriptionsCategoryRoot;
