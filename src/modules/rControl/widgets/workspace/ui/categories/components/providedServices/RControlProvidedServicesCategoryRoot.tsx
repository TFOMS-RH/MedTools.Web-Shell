import { lazy, Suspense } from "react";
import { DataState } from "../../../../../../../../shared/ui/DataState/DataState";
import { useRControlWorkspaceStore } from "../../../../model/store/useRControlWorkspaceStore";
import { RControlMedicalDevicesTableRoot } from "./medicalDevices/table/RControlMedicalDevicesTableRoot";
import { RControlMedicalDevicesTableHeader } from "./medicalDevices/table/RControlMedicalDevicesTableHeader";
import { RControlProvidedServiceCardsGroupRoot } from "./providedServices/cardsGroup/RControlProvidedServiceCardsGroupRoot";
import styles from "./styles.module.scss";

const ProvidedServicesLive = () => {
  const { selectedProvidedServiceUid, selectedMedicalCaseUid } = useRControlWorkspaceStore();

  return (
    <section className={styles.providedServicesRoot}>
      <section className={styles.section} aria-labelledby="rcontrol-services-heading">
        <h3 id="rcontrol-services-heading" className={styles.sectionHeading}>Оказанные услуги</h3>
        {selectedMedicalCaseUid === null ? (
          <DataState
            title="Выберите медицинский случай"
            description="Выберите медицинский случай для отображения данных об оказанных услугах"
            variant="waiting"
          />
        ) : <RControlProvidedServiceCardsGroupRoot />}
      </section>
      {selectedProvidedServiceUid === null ? (
        <section className={styles.section} aria-labelledby="rcontrol-devices-heading">
          <RControlMedicalDevicesTableHeader />
          <DataState
            title="Выберите оказанную услугу"
            description="Выберите услугу в таблице для отображения данных о медицинских изделиях"
            variant="waiting"
          />
        </section>
      ) : <RControlMedicalDevicesTableRoot />}
    </section>
  );
};

const ServicesPreview = import.meta.env.DEV
  ? lazy(() => import("./RControlProvidedServicesCategoryPreview"))
  : null;

const RControlProvidedServicesCategoryRoot = () => {
  const { selectedMedicalCaseUid } = useRControlWorkspaceStore();
  const params = new URLSearchParams(window.location.search);
  if (
    ServicesPreview &&
    params.get("demoWorkspace") === "1" &&
    params.get("demoProvidedServices") !== "live"
  ) {
    return (
      <Suspense fallback={null}>
        <ServicesPreview key={selectedMedicalCaseUid} />
      </Suspense>
    );
  }
  return <ProvidedServicesLive />;
};

export default RControlProvidedServicesCategoryRoot;
