import { MedViewOncologyLayout } from "./MedViewOncologyLayout";
import { useMedViewFiltersStore } from "../../../../../filters/model/stores/useMedViewFiltersStore";
import { useOncologyServicesQuery } from "../../../../../../../../shared/model/queries/invoiceStructure/oncology/useOncologyServicesQuery";
import { useMedicationsQuery } from "../../../../../../../../shared/model/queries/invoiceStructure/oncology/useMedicationsQuery";
import { displayValue } from "./presentation";
import { DataState } from "../../../../../../../../shared/ui/DataState/DataState";
import { useOncologySelection } from "./useOncologySelection";
import { useMedViewWorkspaceStore } from "../../../../model/stores/useMedViewWorkspaceStore";
import { MedViewDiagnosticsListRoot } from "./diagnostics/list/MedViewDiagnosticsListRoot";
import { MedViewContraindicationsListRoot } from "./contraindications/list/MedViewContraindicationsListRoot";
import { MedViewConsultationsListRoot } from "./сonsultations/list/MedViewConsultationsListRoot";
import { MedViewInjectionDateChipsGroupRoot } from "./injections/injectionDates/chipsGroup/MedViewInjectionDateChipsGroupRoot";
import { MedViewInjectionsTableRoot } from "./injections/injections/table/MedViewInjectionsTableRoot";
import { MedViewMedicationCardsGroupRoot } from "./medications/cardsGroup/MedViewMedicationCardsGroupRoot";
import { MedViewOncologyCaseCardRoot } from "./oncologyCase/card/MedViewOncologyCaseCardRoot";
import { MedViewOncologyServiceCardsGroupRoot } from "./oncologyServices/cardsGroup/MedViewOncologyServiceCardsGroupRoot";
import styles from "./styles.module.scss";

const MedViewOncologyRoot = () => {
  const { selectedMedicalCaseUid, selectOncologyService } =
    useMedViewWorkspaceStore();
  const { oncologyCase, oncologyCaseUid, serviceUid, medicationUid } =
    useOncologySelection();
  const dependencyState =
    selectedMedicalCaseUid === null ? (
      <DataState
        title="Выберите медицинский случай"
        description="Данные станут доступны после выбора медицинского случая"
        variant="waiting"
      />
    ) : oncologyCase.isError ? (
      <DataState
        title="Ошибка получения онкологического случая"
        description={oncologyCase.error?.message ?? "Неизвестная ошибка"}
        variant="error"
      />
    ) : oncologyCase.isSuccess && oncologyCase.data === null ? (
      <DataState
        title="Онкологический случай отсутствует"
        description="Для выбранного медицинского случая нет зависимых онкологических сведений"
        variant="empty"
      />
    ) : (
      <DataState
        title="Получение онкологического случая"
        description="После получения данных станут доступны зависимые сведения"
        variant="waiting"
      />
    );

  // Presentation-only observers reuse the existing keyed requests and validated IDs.
  const { targetDb } = useMedViewFiltersStore();
  const { data: services } = useOncologyServicesQuery(
    oncologyCaseUid,
    targetDb,
  );
  const { data: medications } = useMedicationsQuery(serviceUid, targetDb);
  const service = services?.find(
    (item) => item.oncologyServiceUid === serviceUid,
  );
  const medication = medications?.find(
    (item) => item.medicamentUid === medicationUid,
  );
  const unavailable = (title: string) => (
    <section className={styles.panel}>
      <h3 className={styles.groupHeading}>{title}</h3>
      {dependencyState}
    </section>
  );
  const chooseService = (
    <DataState
      title="Выберите онкологическую услугу"
      description="Нажмите на запись услуги для отображения препаратов"
      variant="waiting"
    />
  );
  const chooseMedication = (
    <DataState
      title="Выберите лекарственный препарат"
      description="Нажмите на запись препарата для отображения дат введения и инъекций"
      variant="waiting"
    />
  );

  return (
    <MedViewOncologyLayout
      casePanel={
        selectedMedicalCaseUid === null ? (
          unavailable("Онкологический случай")
        ) : (
          <MedViewOncologyCaseCardRoot />
        )
      }
      consultationsPanel={
        selectedMedicalCaseUid === null ? (
          unavailable("Консилиумы")
        ) : (
          <MedViewConsultationsListRoot />
        )
      }
      diagnosticsPanel={
        oncologyCaseUid === null ? (
          unavailable("Диагностика")
        ) : (
          <MedViewDiagnosticsListRoot oncologyCaseUid={oncologyCaseUid} />
        )
      }
      contraindicationsPanel={
        oncologyCaseUid === null ? (
          unavailable("Противопоказания")
        ) : (
          <MedViewContraindicationsListRoot oncologyCaseUid={oncologyCaseUid} />
        )
      }
      services={
        oncologyCaseUid === null ? (
          dependencyState
        ) : (
          <MedViewOncologyServiceCardsGroupRoot
            oncologyCaseUid={oncologyCaseUid}
            selectedOncologyServiceUid={serviceUid}
            selectOncologyService={selectOncologyService}
          />
        )
      }
      medications={
        oncologyCaseUid === null ? (
          dependencyState
        ) : serviceUid === null ? (
          chooseService
        ) : (
          <MedViewMedicationCardsGroupRoot
            selectedOncologyServiceUid={serviceUid}
            selectedMedicationUid={medicationUid}
          />
        )
      }
      dates={
        oncologyCaseUid === null ? (
          dependencyState
        ) : medicationUid === null ? (
          chooseMedication
        ) : (
          <MedViewInjectionDateChipsGroupRoot
            selectedMedicationUid={medicationUid}
          />
        )
      }
      injections={
        medicationUid === null ? null : (
          <MedViewInjectionsTableRoot selectedMedicationUid={medicationUid} />
        )
      }
      selection={
        service && medication
          ? {
              serviceType: displayValue(
                service.serviceType?.trim()
                  ? service.serviceType
                  : service.serviceTypeCode,
              ),
              drugIdentifier: displayValue(medication.drugIdentifier),
              therapyRegimenCode: medication.therapyRegimenCode,
            }
          : null
      }
    />
  );
};

export default MedViewOncologyRoot;
