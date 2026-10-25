import { RControlOncologyLayout } from "./RControlOncologyLayout";
import { useRControlWorkspacePanelStore } from "../../../../model/store/useRControlWorkspacePanelStore";
import { useOncologyServicesQuery } from "../../../../../../../../shared/model/queries/invoiceStructure/oncology/useOncologyServicesQuery";
import { useMedicationsQuery } from "../../../../../../../../shared/model/queries/invoiceStructure/oncology/useMedicationsQuery";
import { displayValue } from "./presentation";
import { DataState } from "../../../../../../../../shared/ui/DataState/DataState";
import { useOncologyCaseQuery } from "../../../../../../../../shared/model/queries/invoiceStructure/oncology/useOncologyCaseQuery";
import { lazy, Suspense } from "react";
import { useRControlWorkspaceStore } from "../../../../model/store/useRControlWorkspaceStore";
import { RControlDiagnosticsListRoot } from "./diagnostics/list/RControlDiagnosticsListRoot";
import { RControlContraindicationsListRoot } from "./contraindications/list/RControlContraindicationsListRoot";
import { RControlConsultationsListRoot } from "./сonsultations/list/RControlConsultationsListRoot";
import { RControlInjectionDateChipsGroupRoot } from "./injections/injectionDates/chipsGroup/RControlInjectionDateChipsGroupRoot";
import { RControlInjectionsTableRoot } from "./injections/injections/table/RControlInjectionsTableRoot";
import { RControlMedicationCardsGroupRoot } from "./medications/cardsGroup/RControlMedicationCardsGroupRoot";
import { RControlOncologyCaseCardRoot } from "./oncologyCase/card/RControlOncologyCaseCardRoot";
import { RControlOncologyServiceCardsGroupRoot } from "./oncologyServices/cardsGroup/RControlOncologyServiceCardsGroupRoot";
import styles from "./styles.module.scss";

const RControlOncologyLive = () => {
  const {
    selectedMedicalCaseUid,
    selectedOncologyServiceUid,
    selectedMedicationUid,
    selectOncologyService,
  } = useRControlWorkspaceStore();
  const { targetDb } = useRControlWorkspacePanelStore();
  const oncologyCase = useOncologyCaseQuery(selectedMedicalCaseUid, targetDb);
  const oncologyCaseUid = selectedMedicalCaseUid !== null && targetDb !== null
    ? oncologyCase.data?.oncologyCaseUid ?? null
    : null;
  const { data: services } = useOncologyServicesQuery(oncologyCaseUid, targetDb);
  const service = services?.find(
    item => item.oncologyServiceUid === selectedOncologyServiceUid,
  );
  const serviceUid = oncologyCaseUid !== null ? service?.oncologyServiceUid ?? null : null;
  const { data: medications } = useMedicationsQuery(serviceUid, targetDb);
  const medication = medications?.find(
    item => item.medicamentUid === selectedMedicationUid,
  );
  const medicationUid = serviceUid !== null ? medication?.medicamentUid ?? null : null;
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
    <RControlOncologyLayout
      casePanel={
        selectedMedicalCaseUid === null ? (
          unavailable("Онкологический случай")
        ) : (
          <RControlOncologyCaseCardRoot />
        )
      }
      consultationsPanel={
        selectedMedicalCaseUid === null ? (
          unavailable("Консилиумы")
        ) : (
          <RControlConsultationsListRoot />
        )
      }
      diagnosticsPanel={
        oncologyCaseUid === null ? (
          unavailable("Диагностика")
        ) : (
          <RControlDiagnosticsListRoot oncologyCaseUid={oncologyCaseUid} />
        )
      }
      contraindicationsPanel={
        oncologyCaseUid === null ? (
          unavailable("Противопоказания")
        ) : (
          <RControlContraindicationsListRoot oncologyCaseUid={oncologyCaseUid} />
        )
      }
      services={
        oncologyCaseUid === null ? (
          dependencyState
        ) : (
          <RControlOncologyServiceCardsGroupRoot
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
          <RControlMedicationCardsGroupRoot
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
          <RControlInjectionDateChipsGroupRoot
            selectedMedicationUid={medicationUid}
          />
        )
      }
      injections={
        medicationUid === null ? null : (
          <RControlInjectionsTableRoot selectedMedicationUid={medicationUid} />
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

const OncologyPreview = import.meta.env.DEV
  ? lazy(() => import("./RControlOncologyCategoryPreview"))
  : null;

const RControlOncologyCategoryRoot = () => {
  const { selectedMedicalCaseUid } = useRControlWorkspaceStore();
  const params = new URLSearchParams(window.location.search);
  if (
    OncologyPreview &&
    params.get("demoWorkspace") === "1" &&
    params.get("demoOncology") !== "live"
  ) {
    return (
      <Suspense fallback={null}>
        <OncologyPreview key={selectedMedicalCaseUid} />
      </Suspense>
    );
  }
  return <RControlOncologyLive />;
};

export default RControlOncologyCategoryRoot;
