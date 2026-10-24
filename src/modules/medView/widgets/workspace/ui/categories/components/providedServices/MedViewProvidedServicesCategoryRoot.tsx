import { DataState } from "../../../../../../../../shared/ui/DataState/DataState";
import { useMedViewWorkspaceStore } from "../../../../model/stores/useMedViewWorkspaceStore";
import { MedViewMedicalDevicesTableRoot } from "./medicalDevices/table/MedViewMedicalDevicesTableRoot";
import { MedViewMedicalDevicesTableHeader } from "./medicalDevices/table/MedViewMedicalDevicesTableHeader";
import { MedViewProvidedServiceCardsGroupRoot } from "./providedServices/cardsGroup/MedViewProvidedServiceCardsGroupRoot";
import styles from "./styles.module.scss";

const MedViewProvidedServicesCategoryRoot = () => {
  const { selectedProvidedServiceUid, selectedMedicalCaseUid } = useMedViewWorkspaceStore();

  return (
    <section className={styles.providedServicesRoot}>
      <section className={styles.section} aria-labelledby="medview-services-heading">
        <h3 id="medview-services-heading" className={styles.sectionHeading}>Оказанные услуги</h3>
        {selectedMedicalCaseUid === null ? (
          <DataState
            title="Выберите медицинский случай"
            description="Выберите медицинский случай для отображения данных об оказанных услугах"
            variant="waiting"
          />
        ) : <MedViewProvidedServiceCardsGroupRoot />}
      </section>
      {selectedProvidedServiceUid === null ? (
        <section className={styles.section} aria-labelledby="medview-devices-heading">
          <MedViewMedicalDevicesTableHeader />
          <DataState
            title="Выберите оказанную услугу"
            description="Выберите услугу в таблице для отображения данных о медицинских изделиях"
            variant="waiting"
          />
        </section>
      ) : <MedViewMedicalDevicesTableRoot />}
    </section>
  );
};

export default MedViewProvidedServicesCategoryRoot;
