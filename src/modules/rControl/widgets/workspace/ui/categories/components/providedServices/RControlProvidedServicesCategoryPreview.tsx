import { useState } from "react";
import type { ProvidedServiceDto } from "../../../../../../../../shared/model/types/invoiceStructure/results/providedServices/GetProvidedServicesResult";
import type { MedicalDeviceDto } from "../../../../../../../../shared/model/types/invoiceStructure/results/providedServices/GetMedicalDevicesResult";
import { DataState } from "../../../../../../../../shared/ui/DataState/DataState";
import { RControlProvidedServiceCards } from "./providedServices/cardsGroup/RControlProvidedServiceCards";
import { RControlProvidedServiceCardSkeletons } from "./providedServices/cardsGroup/RControlProvidedServiceCardSkeletons";
import { RControlMedicalDevicesTableBody } from "./medicalDevices/table/RControlMedicalDevicesTableBody";
import { RControlMedicalDevicesTableHeader } from "./medicalDevices/table/RControlMedicalDevicesTableHeader";
import styles from "./styles.module.scss";
import previewStyles from "./preview.module.scss";

const stateOptions = [
  ["ready", "Данные"],
  ["loading", "Загрузка"],
  ["empty", "Нет данных"],
  ["error", "Ошибка"],
] as const;
type PreviewState = (typeof stateOptions)[number][0];
type Dataset = "full" | "long" | "empty-fields" | "codes-only";
const counts = [0, 1, 2, 10, 40];

// Synthetic development fixtures, never loaded in production.
const createService = (uid: number, dataset: Dataset): ProvidedServiceDto => {
  const empty = dataset === "empty-fields";
  const codesOnly = dataset === "codes-only";
  const long = dataset === "long";
  return {
    providedServiceUid: uid,
    serviceCode: long ? "ТЕСТ-УСЛУГА-000123456789".repeat(5) : "ТЕСТ-УСЛУГА-" + uid,
    service: empty || codesOnly ? " " : long
      ? "Демонстрационное длинное наименование оказанной услуги. ".repeat(6)
      : "Демонстрационная услуга " + uid,
    medicalInterventionType: empty ? null : long
      ? "Тестовое описание медицинского вмешательства для проверки переноса. ".repeat(5)
      : "Тестовое вмешательство",
    medicalProfileCode: 0,
    medicalProfile: empty || codesOnly ? "" : "Демонстрационный профиль",
    physicianSpecialtyCode: 31,
    physicianSpecialty: empty || codesOnly ? "" : "Демонстрационная специальность",
    isPediatric: uid % 2 === 0,
    serviceStartDate: empty ? "" : "2026-01-03T00:00:00+14:00",
    serviceEndDate: "2026-01-05T23:30:00-12:00",
    diagnosis: empty ? "" : long ? "ТЕСТ-КОД-ДИАГНОЗА-".repeat(10) : "ТЕСТ-КОД",
    serviceQuantity: 0,
    unitRate: empty ? null : 1225.5,
    amountBilled: long ? 1234567890.567 : 2451,
    internalComment: empty ? null : long
      ? ("Тестовый длинный комментарий для проверки полного отображения. ".repeat(12) + "\nВторая строка комментария.")
      : "Демонстрационный комментарий.\nПеренос строки сохраняется.",
  };
};

const createDevice = (uid: number, index: number, dataset: Dataset): MedicalDeviceDto => ({
  medicalDeviceUid: uid * 100 + index,
  implantationDate: dataset === "empty-fields" ? "" : "2026-01-04T00:00:00+14:00",
  medicalDeviceTypeCode: index === 0 ? 0 : 1234567890,
  serialNumber: dataset === "empty-fields" ? "" : dataset === "long"
    ? ("0000123456789".repeat(16) + "-ТЕСТ-" + uid)
    : "00000-ТЕСТ-" + uid + "-" + (index + 1),
});

export default function RControlProvidedServicesCategoryPreview() {
  const [serviceCount, setServiceCount] = useState(2);
  const [deviceCount, setDeviceCount] = useState(2);
  const [dataset, setDataset] = useState<Dataset>("full");
  const [serviceState, setServiceState] = useState<PreviewState>("ready");
  const [deviceState, setDeviceState] = useState<PreviewState>("ready");
  const [caseNumber, setCaseNumber] = useState(1);
  const [selectedUid, setSelectedUid] = useState<number | null>(null);
  const services = Array.from({ length: serviceCount }, (_, index) => createService(caseNumber * 1000 + index + 1, dataset));
  const devices = selectedUid === null ? [] : Array.from({ length: deviceCount }, (_, index) => createDevice(selectedUid, index, dataset));

  return (
    <div className={previewStyles.preview}>
      <div className={previewStyles.toolbar}>
        <p>Демонстрационные услуги и изделия. API не используется; все записи и коды тестовые.</p>
        <div className={previewStyles.controls}>
          <label>
            Количество услуг
            <select value={serviceCount} onChange={(event) => setServiceCount(Number(event.target.value))}>
              {counts.map((count) => <option key={count} value={count}>{count}</option>)}
            </select>
          </label>
          <label>
            Количество изделий
            <select value={deviceCount} onChange={(event) => setDeviceCount(Number(event.target.value))}>
              {counts.map((count) => <option key={count} value={count}>{count}</option>)}
            </select>
          </label>
          <label>
            Набор данных
            <select value={dataset} onChange={(event) => setDataset(event.target.value as Dataset)}>
              <option value="full">Полные данные</option>
              <option value="long">Длинные значения</option>
              <option value="empty-fields">Пустые значения и даты</option>
              <option value="codes-only">Коды без расшифровок</option>
            </select>
          </label>
          <label>
            Услуги
            <select value={serviceState} onChange={(event) => setServiceState(event.target.value as PreviewState)}>
              {stateOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <label>
            Изделия
            <select value={deviceState} onChange={(event) => setDeviceState(event.target.value as PreviewState)}>
              {stateOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <button type="button" onClick={() => { setCaseNumber((value) => value + 1); setSelectedUid(null); }}>
            Сменить медицинский случай (тест)
          </button>
        </div>
      </div>
      <div className={styles.providedServicesRoot}>
        <section className={styles.section} aria-labelledby="rcontrol-services-heading">
          <h3 id="rcontrol-services-heading" className={styles.sectionHeading}>Оказанные услуги</h3>
          {serviceState === "error" ? (
            <DataState title="Ошибка данных" description="Демонстрационная ошибка услуг" variant="error" />
          ) : serviceState === "loading" ? (
            <RControlProvidedServiceCardSkeletons />
          ) : serviceState === "empty" || serviceCount === 0 ? (
            <DataState title="Данных не найдено" description="Медицинский случай не содержит информации о предоставленных услугах" variant="empty" />
          ) : (
            <RControlProvidedServiceCards providedSevices={services} selectedProvidedServiceUid={selectedUid} selectProvidedService={setSelectedUid} />
          )}
        </section>
        <section className={styles.section} aria-labelledby="rcontrol-devices-heading">
          <RControlMedicalDevicesTableHeader />
          {selectedUid === null ? (
            <DataState title="Выберите оказанную услугу" description="Выберите услугу в таблице для просмотра медицинских изделий" variant="waiting" />
          ) : deviceState === "error" ? (
            <DataState title="Ошибка данных" description="Демонстрационная ошибка изделий" variant="error" />
          ) : deviceState === "empty" || (deviceState === "ready" && deviceCount === 0) ? (
            <DataState title="Данных не найдено" description="Оказанная услуга не содержит информации о медицинских изделиях" variant="empty" />
          ) : (
            <RControlMedicalDevicesTableBody medicalDevices={devices} isPending={deviceState === "loading"} />
          )}
        </section>
      </div>
    </div>
  );
}
