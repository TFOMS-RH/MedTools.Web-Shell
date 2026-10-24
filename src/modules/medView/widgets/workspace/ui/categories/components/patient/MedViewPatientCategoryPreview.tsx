import { useState } from "react";
import type { PatientDto } from "../../../../../../../../shared/model/types/invoiceStructure/results/patient/GetPatientResult";
import type { InsuranceDto } from "../../../../../../../../shared/model/types/invoiceStructure/results/patient/GetInsuranceResult";
import { DataState } from "../../../../../../../../shared/ui/DataState/DataState";
import { MedViewPatientCardBody } from "./patient/card/MedViewPatientCardBody";
import { MedViewPatientCardHeader } from "./patient/card/MedViewPatientCardHeader";
import { MedViewInsuranceCardBody } from "./insurance/card/MedViewInsuranceCardBody";
import { MedViewInsuranceCardHeader } from "./insurance/card/MedViewInsuranceCardHeader";
import styles from "./styles.module.scss";
import previewStyles from "./preview.module.scss";

// Synthetic fixtures. This module is loaded only by the development preview.
const patient: PatientDto = {
  patientLastName: "Демонстрационный",
  patientFirstName: "Александр",
  patientMiddleName: "Тестович",
  patientBirthDate: "1985-06-15",
  patientSex: "М",
  documentTypeName: "Паспорт гражданина Российской Федерации",
  documentTypeCode: "14",
  documentSeries: "0012",
  documentNumber: "0001234567",
  documentIssueDate: "2020-09-10",
  issuedBy: "Демонстрационное подразделение — тестовые данные",
  patientRepresentativeLastName: "Демонстрационная",
  patientRepresentativeFirstName: "Анна",
  patientRepresentativeMiddleName: "Тестовна",
  patientRepresentativeBirthday: "1960-02-20",
  patientRepresentativeSex: "Ж",
};

const insurance: InsuranceDto = {
  insuranceCompanyCode: "00001",
  insuranceCompanyName: "Демонстрационная страховая организация",
  ogrn: "0000123456789",
  okato: "00012345678",
  insurancePolicyUnifiedNumber: "0000000012345678",
  insurancePolicySeries: "0012",
  insurancePolicyNumber: "0000000087654321",
  insurancePolicyTypeCode: 3,
  insurancePolicyTypeName: "Единый полис ОМС",
};

const stateOptions = [
  ["ready", "Данные"],
  ["loading", "Загрузка"],
  ["empty", "Нет данных"],
  ["error", "Ошибка"],
] as const;
type PreviewState = (typeof stateOptions)[number][0];
type Dataset = "full" | "no-representative" | "empty-fields" | "long";

export default function MedViewPatientCategoryPreview() {
  const [dataset, setDataset] = useState<Dataset>("full");
  const [patientState, setPatientState] = useState<PreviewState>("ready");
  const [insuranceState, setInsuranceState] = useState<PreviewState>("ready");
  const patientData = { ...patient };
  const insuranceData = { ...insurance };

  if (dataset === "no-representative" || dataset === "empty-fields") {
    patientData.patientRepresentativeLastName = null;
    patientData.patientRepresentativeFirstName = null;
    patientData.patientRepresentativeMiddleName = null;
    patientData.patientRepresentativeBirthday = null;
    patientData.patientRepresentativeSex = null;
  }
  if (dataset === "empty-fields") {
    patientData.documentTypeCode = null;
    patientData.documentTypeName = "";
    patientData.documentSeries = null;
    patientData.documentNumber = null;
    patientData.documentIssueDate = null;
    patientData.issuedBy = null;
    insuranceData.insuranceCompanyCode = null;
    insuranceData.insuranceCompanyName = null;
    insuranceData.ogrn = null;
    insuranceData.okato = null;
    insuranceData.insurancePolicyUnifiedNumber = null;
    insuranceData.insurancePolicySeries = null;
  }
  if (dataset === "long") {
    patientData.patientLastName = "Демонстрационная-Длинная-Фамилия-Для-Проверки-Переноса";
    patientData.issuedBy = "Демонстрационное подразделение с длинным наименованием для проверки полного отображения реквизитов документа";
    patientData.documentNumber = "0000123456789012345678901234567890";
    insuranceData.insuranceCompanyName = "Демонстрационная страховая медицинская организация с длинным названием для проверки адаптивного отображения";
    insuranceData.insurancePolicyNumber = "0000123456789012345678901234567890";
  }

  const insurancePanel = (
    <section className={styles.insuranceGroup} aria-labelledby="medview-patient-insurance">
      <MedViewInsuranceCardHeader />
      {insuranceState === "empty" || insuranceState === "error" ? (
        <DataState
          variant={insuranceState === "error" ? "error" : "empty"}
          title={insuranceState === "error" ? "Ошибка данных" : "Данных не найдено"}
          description={insuranceState === "error" ? "Демонстрационная ошибка загрузки страхования" : "Медицинский случай не содержит информации о СМО"}
        />
      ) : (
        <MedViewInsuranceCardBody insurance={insuranceData} isPending={insuranceState === "loading"} />
      )}
    </section>
  );

  return (
    <div className={previewStyles.preview}>
      <div className={previewStyles.toolbar}>
        <p>Демонстрационные данные. API не используется.</p>
        <div className={previewStyles.controls}>
          <label>
            Набор данных
            <select value={dataset} onChange={(event) => setDataset(event.target.value as Dataset)}>
              <option value="full">Полные данные</option>
              <option value="no-representative">Без представителя</option>
              <option value="empty-fields">Пустые значения</option>
              <option value="long">Длинные значения</option>
            </select>
          </label>
          <label>
            Пациент
            <select value={patientState} onChange={(event) => setPatientState(event.target.value as PreviewState)}>
              {stateOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <label>
            Страхование
            <select value={insuranceState} onChange={(event) => setInsuranceState(event.target.value as PreviewState)}>
              {stateOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
        </div>
      </div>
      <div className={styles.patientCategoryRoot}>
        <div className={styles.patientContent}>
          {patientState === "empty" || patientState === "error" ? (
            <section className={styles.informationGroup} aria-labelledby="medview-patient-0">
              <MedViewPatientCardHeader />
              <DataState
                variant={patientState === "error" ? "error" : "empty"}
                title={patientState === "error" ? "Ошибка данных" : "Данных не найдено"}
                description={patientState === "error" ? "Демонстрационная ошибка загрузки пациента" : "Медицинский случай не содержит информации о пациенте"}
              />
            </section>
          ) : (
            <MedViewPatientCardBody patient={patientData} isPending={patientState === "loading"} />
          )}
          <div className={`${styles.relatedGroups} ${patientState === "empty" || patientState === "error" ? styles.insuranceOnly : ""}`}>
            <div>
              {patientState !== "empty" && patientState !== "error" && (
                <MedViewPatientCardBody patient={patientData} isPending={patientState === "loading"} section="document" />
              )}
            </div>
            {insurancePanel}
          </div>
          {patientState !== "empty" && patientState !== "error" && (
            <MedViewPatientCardBody patient={patientData} isPending={patientState === "loading"} section="representative" />
          )}
        </div>
      </div>
    </div>
  );
}
