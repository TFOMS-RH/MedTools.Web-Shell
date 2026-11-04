import { RControlOncologyLayout } from "./RControlOncologyLayout";
import { useState, type ReactNode } from "react";
import type { OncologyCaseDto } from "../../../../../../../../shared/model/types/invoiceStructure/results/oncology/GetOncologyCaseResult";
import { DataState } from "../../../../../../../../shared/ui/DataState/DataState";
import { RControlOncologyCaseCardHeader } from "./oncologyCase/card/RControlOncologyCaseCardHeader";
import { RControlOncologyCaseCardBody } from "./oncologyCase/card/RControlOncologyCaseCardBody";
import { RControlConsultationsListHeader } from "./сonsultations/list/RControlConsultationsListHeader";
import { RControlConsultationsListBody } from "./сonsultations/list/RControlConsultationsListBody";
import { RControlDiagnosticsListHeader } from "./diagnostics/list/RControlDiagnosticsListHeader";
import { RControlDiagnosticsListBody } from "./diagnostics/list/RControlDiagnosticsListBody";
import { RControlContraindicationsListHeader } from "./contraindications/list/RControlContraindicationsListHeader";
import { RControlContraindicationsListBody } from "./contraindications/list/RControlContraindicationsListBody";
import { RControlOncologyServiceCards } from "./oncologyServices/cardsGroup/RControlOncologyServiceCards";
import { RControlOncologyServiceCardSkeletons } from "./oncologyServices/cardsGroup/RControlOncologyServiceCardSkeletons";
import { RControlMedicationCards } from "./medications/cardsGroup/RControlMedicationCards";
import { RControlMedicationCardSkeletons } from "./medications/cardsGroup/RControlMedicationCardSkeletons";
import { RControlInjectionDateChipsGroupHeader } from "./injections/injectionDates/chipsGroup/RControlInjectionDateChipsGroupHeader";
import { RControlInjectionDateChips } from "./injections/injectionDates/chipsGroup/RControlInjectionDateChips";
import { RControlInjectionDateChipSkeletons } from "./injections/injectionDates/chipsGroup/RControlInjectionDateChipSkeletons";
import { RControlInjectionsTableHeader } from "./injections/injections/table/RControlInjectionsTableHeader";
import { RControlInjectionsTableBody } from "./injections/injections/table/RControlInjectionsTableBody";
import styles from "./styles.module.scss";
import previewStyles from "./preview.module.scss";

const areas = [
  ["case", "Онкологический случай"],
  ["consultations", "Консилиумы"],
  ["diagnostics", "Диагностика"],
  ["contraindications", "Противопоказания"],
  ["services", "Услуги"],
  ["medications", "Препараты"],
  ["dates", "Даты введения"],
  ["injections", "Инъекции"],
] as const;
type Area = (typeof areas)[number][0];
type PreviewState = "ready" | "loading" | "empty" | "error";
type Dataset = "full" | "nullable" | "long";
const initialStates: Record<Area, PreviewState> = {
  case: "ready",
  consultations: "ready",
  diagnostics: "ready",
  contraindications: "ready",
  services: "ready",
  medications: "ready",
  dates: "ready",
  injections: "ready",
};

// Development-only visual fixtures. Query/store reconciliation is tested separately.
export default function RControlOncologyCategoryPreview() {
  const [states, setStates] = useState(initialStates);
  const [dataset, setDataset] = useState<Dataset>("full");
  const [count, setCount] = useState(2);
  const [serviceUid, setServiceUid] = useState<number | null>(null);
  const [medicationUid, setMedicationUid] = useState<number | null>(null);
  const nullable = dataset === "nullable";
  const long = dataset === "long";
  const date = "2026-01-03";
  const rows = Array.from({ length: count }, (_, i) => i + 1);
  const oncologyCase: OncologyCaseDto = {
    oncologyCaseUid: 1,
    referralReasonCode: null,
    referralReason: nullable
      ? null
      : long
        ? "Демонстрационная длинная строка повода обращения. ".repeat(8)
        : "Тестовый повод обращения",
    stageCode: null,
    stage: nullable ? null : "Тестовая стадия",
    icdDiagnosis: null,
    tumorValue: nullable ? null : 0,
    nodusValue: null,
    metastasisValue: null,
    isMetastasisDetected: nullable ? null : false,
    totalFocusDose: nullable ? null : 0,
    radiationFractionsCount: null,
    weight: null,
    height: null,
    bodySurfaceArea: null,
  };
  const selectService = (uid: number | null) => {
    setServiceUid(uid);
    setMedicationUid(null);
  };
  const stateContent = (area: Area, content: ReactNode) =>
    states[area] === "error" ? (
      <DataState
        title="Ошибка данных"
        description={`Демонстрационная ошибка: ${areas.find(([key]) => key === area)?.[1]}`}
        variant="error"
      />
    ) : states[area] === "empty" ||
      (area !== "case" && count === 0 && states[area] === "ready") ? (
      <DataState
        title="Данных не найдено"
        description="Демонстрационное пустое состояние"
        variant="empty"
      />
    ) : (
      content
    );
  const dependencyState =
    states.case === "loading" ? (
      <DataState
        title="Получение онкологического случая"
        description="Демонстрация загрузки зависимых сведений"
        variant="waiting"
      />
    ) : states.case === "error" ? (
      <DataState
        title="Ошибка получения онкологического случая"
        description="Консилиумы отображаются независимо"
        variant="error"
      />
    ) : (
      <DataState
        title="Онкологический случай отсутствует"
        description="Зависимые сведения отсутствуют"
        variant="empty"
      />
    );

  const serviceRows = rows.map((uid) => ({
    oncologyServiceUid: uid,
    serviceTypeCode: 0,
    serviceType: long
      ? "Демонстрационная длинная строка услуги. ".repeat(8)
      : "Тестовая услуга " + uid,
    surgicalTreatmentTypeCode: nullable ? null : 0,
    surgicalTreatmentType: nullable
      ? null
      : "Тестовый тип хирургического лечения",
    drugTherapyLineCode: nullable ? null : 0,
    drugTherapyLine: nullable ? null : "Тестовая линия терапии",
    drugTherapyCycleCode: null,
    drugTherapyCycle: null,
    isAntiemeticProphylaxis: nullable ? null : false,
    radioTherapyTypeCode: nullable ? null : 0,
    radiotherapyType: nullable ? null : "Тестовый тип лучевой терапии",
  }));
  const medicationRows = rows.map((uid) => ({
    medicamentUid: (serviceUid ?? 0) * 100 + uid,
    drugIdentifier: long
      ? "0000-ТЕСТ-ПРЕПАРАТ-".repeat(18)
      : "0000-ТЕСТ-" + serviceUid + "-" + uid,
    drugExtendedIdentifier: null,
    therapyRegimenCode: nullable ? null : "ТЕСТ-СХЕМА",
  }));
  const selectedService = serviceRows.find(
    (item) => item.oncologyServiceUid === serviceUid,
  );
  const selectedMedication = medicationRows.find(
    (item) => item.medicamentUid === medicationUid,
  );
  const unavailable = (title: string) => (
    <section className={styles.panel}>
      <h3 className={styles.groupHeading}>{title}</h3>
      {dependencyState}
    </section>
  );
  const chooseMedication = (
    <DataState
      title="Выберите лекарственный препарат"
      description="Нажмите на запись препарата для отображения дат введения и инъекций"
      variant="waiting"
    />
  );
  return (
    <div>
      <div className={previewStyles.toolbar}>
        <p>
          <strong>Демонстрационная онкология.</strong> Синтетические данные без
          API. Это визуальный стенд; гонки запросов проверяются отдельным
          браузерным тестом.
        </p>
        <div className={previewStyles.controls}>
          <label>
            Набор данных
            <select
              value={dataset}
              onChange={(event) => setDataset(event.target.value as Dataset)}
            >
              <option value="full">Полные</option>
              <option value="nullable">Пустые значения</option>
              <option value="long">Длинные строки</option>
            </select>
          </label>
          <label>
            Количество элементов
            <select
              value={count}
              onChange={(event) => {
                setCount(Number(event.target.value));
                selectService(null);
              }}
            >
              {[0, 1, 2, 10, 40].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          {areas.map(([area, label]) => (
            <label key={area}>
              {label}
              <select
                value={states[area]}
                onChange={(event) => {
                  const value = event.target.value as PreviewState;
                  setStates({ ...states, [area]: value });
                  if (
                    value === "empty" &&
                    (area === "case" || area === "services")
                  )
                    selectService(null);
                  if (value === "empty" && area === "medications")
                    setMedicationUid(null);
                }}
              >
                <option value="ready">Данные</option>
                <option value="loading">Загрузка</option>
                <option value="empty">Нет данных</option>
                <option value="error">Ошибка</option>
              </select>
            </label>
          ))}
          <button type="button" onClick={() => selectService(null)}>
            Сбросить выбор
          </button>
        </div>
      </div>
      <RControlOncologyLayout
        casePanel={
          <section className={styles.panel}>
            <RControlOncologyCaseCardHeader />
            {stateContent(
              "case",
              <RControlOncologyCaseCardBody
                oncologyCase={oncologyCase}
                isPending={states.case === "loading"}
              />,
            )}
          </section>
        }
        consultationsPanel={
          <section className={styles.panel}>
            <RControlConsultationsListHeader />
            {stateContent(
              "consultations",
              <RControlConsultationsListBody
                isPending={states.consultations === "loading"}
                consultations={rows.map((uid) => ({
                  consultationUid: uid,
                  consultationPurposeCode: 0,
                  consultationPurpose: long
                    ? "Демонстрационная длинная строка консилиума. ".repeat(8)
                    : "Тестовый консилиум " + uid,
                  consultationDate: nullable ? null : date,
                }))}
              />,
            )}
          </section>
        }
        diagnosticsPanel={
          states.case !== "ready" ? (
            unavailable("Диагностика")
          ) : (
            <section className={styles.panel}>
              <RControlDiagnosticsListHeader />
              {stateContent(
                "diagnostics",
                <RControlDiagnosticsListBody
                  isPending={states.diagnostics === "loading"}
                  diagnosticRecords={rows.map((uid) => ({
                    diagnosticsUid: uid,
                    specimenCollectionDate: nullable ? null : date,
                    diagnosticType: nullable ? null : 0,
                    diagnosticCode: nullable ? null : 0,
                    diagnosticResultCode: nullable ? null : 0,
                    isResultReceived: nullable ? null : uid % 2 === 0,
                  }))}
                />,
              )}
            </section>
          )
        }
        contraindicationsPanel={
          states.case !== "ready" ? (
            unavailable("Противопоказания")
          ) : (
            <section className={styles.panel}>
              <RControlContraindicationsListHeader />
              {stateContent(
                "contraindications",
                <RControlContraindicationsListBody
                  isPending={states.contraindications === "loading"}
                  contraindications={rows.map((uid) => ({
                    contraindicationUid: uid,
                    contraindicationCode: 0,
                    contraindicationDate: date,
                    contraindication: long
                      ? "Демонстрационная длинная строка противопоказания. ".repeat(
                          8,
                        )
                      : "Тестовая запись " + uid,
                  }))}
                />,
              )}
            </section>
          )
        }
        services={
          states.case !== "ready"
            ? dependencyState
            : stateContent(
                "services",
                states.services === "loading" ? (
                  <RControlOncologyServiceCardSkeletons />
                ) : (
                  <RControlOncologyServiceCards
                    oncologyServices={serviceRows}
                    selectedOncologyServiceUid={serviceUid}
                    selectOncologyService={selectService}
                  />
                ),
              )
        }
        medications={
          states.case !== "ready" ? (
            dependencyState
          ) : serviceUid === null ? (
            <DataState
              title="Выберите онкологическую услугу"
              description="Нажмите на запись услуги для отображения препаратов"
              variant="waiting"
            />
          ) : (
            stateContent(
              "medications",
              states.medications === "loading" ? (
                <RControlMedicationCardSkeletons />
              ) : (
                <RControlMedicationCards
                  medications={medicationRows}
                  selectedMedicationUid={medicationUid}
                  selectMedication={setMedicationUid}
                />
              ),
            )
          )
        }
        dates={
          states.case !== "ready" ? (
            dependencyState
          ) : medicationUid === null ? (
            chooseMedication
          ) : (
            <section className={styles.panel}>
              <RControlInjectionDateChipsGroupHeader />
              {stateContent(
                "dates",
                states.dates === "loading" ? (
                  <RControlInjectionDateChipSkeletons />
                ) : (
                  <RControlInjectionDateChips
                    injectionDates={rows.map((uid) => ({
                      injectionDateUid: uid,
                      administrationDate: date,
                    }))}
                  />
                ),
              )}
            </section>
          )
        }
        injections={
          states.case !== "ready" || medicationUid === null ? null : (
            <section className={styles.panel}>
              <RControlInjectionsTableHeader />
              {stateContent(
                "injections",
                <RControlInjectionsTableBody
                  isPending={states.injections === "loading"}
                  injections={rows.map((uid) => ({
                    injectionUid: uid,
                    administrationDate: date,
                    administeredQuantity: nullable ? null : uid,
                    consumedQuantity: nullable ? null : 0,
                    unitCost: nullable ? null : 1234.56,
                    administeredCost: nullable ? null : 1234.56 * uid,
                    consumedCost: nullable ? null : 0,
                    isReductionApplied: nullable ? null : false,
                  }))}
                />,
              )}
            </section>
          )
        }
        selection={
          states.case === "ready" && selectedService && selectedMedication
            ? {
                serviceType: selectedService.serviceType,
                drugIdentifier: selectedMedication.drugIdentifier,
                therapyRegimenCode: selectedMedication.therapyRegimenCode,
              }
            : null
        }
      />
    </div>
  );
}
