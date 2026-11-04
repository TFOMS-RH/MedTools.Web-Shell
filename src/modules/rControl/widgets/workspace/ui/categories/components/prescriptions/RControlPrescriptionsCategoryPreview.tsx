import { useState } from "react";
import type { PrescriptionDto } from "../../../../../../../../shared/model/types/invoiceStructure/results/prescriptions/GetPrescriptionsResult";
import type { ReferralDto } from "../../../../../../../../shared/model/types/invoiceStructure/results/prescriptions/GetReferralsResult";
import { DataState } from "../../../../../../../../shared/ui/DataState/DataState";
import { RControlPrescriptionCards } from "./prescriptions/cardsGroup/RControlPrescriptionCards";
import { RControlReferralsTableHeader } from "./referrals/table/RControlReferralsTableHeader";
import { RControlReferralsTableBody } from "./referrals/table/RControlReferralsTableBody";
import styles from "./styles.module.scss";
import previewStyles from "./preview.module.scss";

const stateOptions = [
  ["ready", "Данные"],
  ["loading", "Загрузка"],
  ["empty", "Нет данных"],
  ["error", "Ошибка"],
] as const;
type PreviewState = (typeof stateOptions)[number][0];
type Dataset = "full" | "long" | "codes-only" | "empty-fields";

// Synthetic development records. This module is excluded from production.
const createPrescription = (index: number, dataset: Dataset): PrescriptionDto => {
  const empty = dataset === "empty-fields";
  const codesOnly = dataset === "codes-only";
  const long = dataset === "long";
  return {
    perscriptionUid: index + 1,
    sequenceNumber: index + 1,
    prescriptionTypeCode: index === 0 ? 0 : 101,
    prescriptionType: empty || codesOnly ? " " : long
      ? "Демонстрационное длинное наименование назначения для проверки переноса текста. ".repeat(4)
      : "Демонстрационное назначение",
    physicianSpecialtyCode: null,
    diagnosticMethodCode: empty ? null : 202,
    diagnosticMethod: empty || codesOnly ? null : long
      ? "Демонстрационное описание метода для проверки полного отображения. ".repeat(5)
      : "Демонстрационный метод",
    serviceCode: empty ? null : 1234567890123,
    referralDate: empty ? null : "2026-01-03T00:00:00+14:00",
    referredToMoCode: empty ? null : long ? "000123456789".repeat(8) : "000123",
    medicalCareProfile: empty ? null : 0,
    bedProfile: empty ? null : long ? "ТЕСТ-ПРОФИЛЬ-".repeat(12) : "ТЕСТ-77",
  };
};

const createReferral = (index: number, dataset: Dataset): ReferralDto => {
  const empty = dataset === "empty-fields";
  const codesOnly = dataset === "codes-only";
  const long = dataset === "long";
  return {
    referralUid: index + 1,
    referralDate: empty ? "" : "2026-01-03T23:30:00-12:00",
    referredToMoCode: empty ? null : long ? "000123456789".repeat(8) : "000123",
    referralTypeCode: index === 0 ? 0 : 301,
    referralType: empty || codesOnly ? "" : long
      ? "Демонстрационное длинное наименование направления. ".repeat(5)
      : "Демонстрационное направление",
    diagnosticMethodCode: empty ? null : 202,
    diagnosticMethod: empty || codesOnly ? null : long
      ? "Демонстрационное описание метода для проверки переноса. ".repeat(5)
      : "Демонстрационный метод",
    referredServiceCode: empty ? null : "0000404",
    referredService: empty || codesOnly ? " " : long
      ? "Демонстрационное длинное название услуги. ".repeat(6)
      : "Демонстрационная услуга",
  };
};

export default function RControlPrescriptionsCategoryPreview() {
  const [count, setCount] = useState(2);
  const [dataset, setDataset] = useState<Dataset>("full");
  const [prescriptionState, setPrescriptionState] = useState<PreviewState>("ready");
  const [referralState, setReferralState] = useState<PreviewState>("ready");
  const prescriptions = Array.from({ length: count }, (_, index) => createPrescription(index, dataset));
  const referrals = Array.from({ length: count }, (_, index) => createReferral(index, dataset));

  return (
    <div className={previewStyles.preview}>
      <div className={previewStyles.toolbar}>
        <p>Демонстрационные назначения и направления. API не используется; все записи и коды тестовые.</p>
        <div className={previewStyles.controls}>
          <label>
            Записей в каждой секции
            <select value={count} onChange={(event) => setCount(Number(event.target.value))}>
              {[0, 1, 2, 10, 40].map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
          </label>
          <label>
            Набор данных
            <select value={dataset} onChange={(event) => setDataset(event.target.value as Dataset)}>
              <option value="full">Полные данные</option>
              <option value="long">Длинные значения</option>
              <option value="codes-only">Коды без расшифровок</option>
              <option value="empty-fields">Пустые значения</option>
            </select>
          </label>
          <label>
            Назначения
            <select value={prescriptionState} onChange={(event) => setPrescriptionState(event.target.value as PreviewState)}>
              {stateOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <label>
            Направления
            <select value={referralState} onChange={(event) => setReferralState(event.target.value as PreviewState)}>
              {stateOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
        </div>
      </div>
      <div className={styles.prescriptionsRoot}>
        <section className={styles.section} aria-labelledby="rcontrol-prescriptions-heading">
          <h3 id="rcontrol-prescriptions-heading" className={styles.sectionHeading}>Назначения</h3>
          {prescriptionState === "error" ? (
            <DataState title="Ошибка данных" description="Демонстрационная ошибка назначений" variant="error" />
          ) : prescriptionState === "empty" || (prescriptionState === "ready" && count === 0) ? (
            <DataState title="Данных не найдено" description="Медицинский случай не содержит информации о назначениях" variant="empty" />
          ) : (
            <RControlPrescriptionCards prescriptions={prescriptions} isPending={prescriptionState === "loading"} />
          )}
        </section>
        <section className={styles.section} aria-labelledby="rcontrol-referrals-heading">
          <RControlReferralsTableHeader />
          {referralState === "error" ? (
            <DataState title="Ошибка данных" description="Демонстрационная ошибка направлений" variant="error" />
          ) : referralState === "empty" || (referralState === "ready" && count === 0) ? (
            <DataState title="Данных не найдено" description="Медицинский случай не содержит информации о направлениях" variant="empty" />
          ) : (
            <RControlReferralsTableBody referrals={referrals} isPending={referralState === "loading"} />
          )}
        </section>
      </div>
    </div>
  );
}
