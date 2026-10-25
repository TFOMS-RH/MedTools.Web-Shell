import { useState } from "react";
import type { MedicalCaseDetailsDto } from "../../../../../../../../shared/model/types/invoiceStructure/results/medicalCases/GetMedicalCaseDetailsResult";
import type { CompletedCaseDetailsDto } from "../../../../../../../../shared/model/types/invoiceStructure/results/medicalCases/GetCompletedCaseDetailsResult";
import { DataState } from "../../../../../../../../shared/ui/DataState/DataState";
import { RControlMedicalCaseDetailsCardHeader } from "./medicalCaseDetails/card/RControlMedicalCaseDetailsCardHeader";
import { RControlMedicalCaseDetailsCardBody } from "./medicalCaseDetails/card/RControlMedicalCaseDetailsCardBody";
import { RControlCompletedCaseDetailsCardHeader } from "./completedCaseDetails/card/RControlCompletedCaseDetailsCardHeader";
import { RControlCompletedCaseDetailsCardBody } from "./completedCaseDetails/card/RControlCompletedCaseDetailsCardBody";
import styles from "./styles.module.scss";
import previewStyles from "./preview.module.scss";

// Synthetic data for the development preview; no API requests or real records.
const medicalCase: MedicalCaseDetailsDto = {
  medicalProfile: 77,
  physicianSpecialty: 31,
  treatmentStartDate: "2026-01-03",
  treatmentEndDate: "2026-01-15",
  primaryDiagnosis: "ТЕСТ-КОД-001",
  paidUnits: 0,
  department: "Демонстрационное подразделение",
  departmentCode: 123,
  isPediatric: false,
  visitPurpose: "ТЕСТ-ЦЕЛЬ",
  bedProfile: 66,
  medicalRecordNumber: "ТЕСТ-ИСТОРИЯ-000123",
  isAdmissionTransfer: null,
  isRehabilitation: true,
  hospitalizationDuration: null,
  facilityLevel: "ТЕСТ-УРОВЕНЬ",
  initialDiagnosis: "ТЕСТ-КОД-002",
  isOncologySuspicion: false,
  physicianCode: "ТЕСТ-ВРАЧ-009",
  weight: 77.7,
  diseaseCharacter: 9,
  internalComment: "Демонстрационный комментарий.\nДанные предназначены только для проверки интерфейса.",
};

const completedCase: CompletedCaseDetailsDto = {
  medicalOrganizationCode: "000001",
  medicalOrganizationName: "Демонстрационная медицинская организация",
  referringMedicalOrganizationCode: "000002",
  referringMedicalOrganizationName: "Демонстрационная направившая организация",
  referralDate: "2026-01-02",
  careConditions: 103,
  medicalCareType: 101,
  paymentMethodCode: 104,
  medicalCareForm: 102,
  treatmentStartDate: "2026-01-03",
  treatmentEndDate: "2026-01-20",
  hospitalizationDuration: 17,
  hospitalizationOutcome: 201,
  isIntrahospitalTransfer: true,
  screeningResult: 203,
  isRefusal: false,
  isMobileTeam: null,
  diseaseOutcome: 202,
};

const stateOptions = [
  ["ready", "Данные"],
  ["loading", "Загрузка"],
  ["empty", "Нет данных"],
  ["error", "Ошибка"],
] as const;
type PreviewState = (typeof stateOptions)[number][0];
type Dataset = "full" | "empty-fields" | "long" | "codes-only";

export default function RControlCaseDetailsCategoryPreview() {
  const [dataset, setDataset] = useState<Dataset>("full");
  const [medicalState, setMedicalState] = useState<PreviewState>("ready");
  const [completedState, setCompletedState] = useState<PreviewState>("ready");
  const medicalData = { ...medicalCase };
  const completedData = { ...completedCase };

  if (dataset === "empty-fields") {
    medicalData.paidUnits = null;
    medicalData.department = null;
    medicalData.departmentCode = null;
    medicalData.visitPurpose = null;
    medicalData.bedProfile = null;
    medicalData.isAdmissionTransfer = null;
    medicalData.isRehabilitation = null;
    medicalData.facilityLevel = null;
    medicalData.initialDiagnosis = null;
    medicalData.isOncologySuspicion = null;
    medicalData.weight = null;
    medicalData.diseaseCharacter = null;
    medicalData.internalComment = null;
    completedData.referringMedicalOrganizationCode = null;
    completedData.referringMedicalOrganizationName = null;
    completedData.referralDate = null;
    completedData.hospitalizationDuration = null;
    completedData.isIntrahospitalTransfer = null;
    completedData.screeningResult = null;
    completedData.isRefusal = null;
    completedData.isMobileTeam = null;
  }
  if (dataset === "long") {
    medicalData.medicalRecordNumber = "0000123456789012345678901234567890";
    medicalData.internalComment = "Демонстрационный длинный комментарий для проверки переноса текста. ".repeat(8);
    completedData.medicalOrganizationName = "Демонстрационная медицинская организация с длинным наименованием для проверки полного отображения данных";
    completedData.referringMedicalOrganizationName = "Демонстрационная направившая медицинская организация с длинным названием для проверки адаптивной компоновки";
  }
  if (dataset === "codes-only") {
    completedData.medicalOrganizationName = "";
    completedData.referringMedicalOrganizationName = null;
  }

  return (
    <div className={previewStyles.preview}>
      <div className={previewStyles.toolbar}>
        <p>Демонстрационные реквизиты. API не используется; коды и записи являются тестовыми.</p>
        <div className={previewStyles.controls}>
          <label>
            Набор данных
            <select value={dataset} onChange={(event) => setDataset(event.target.value as Dataset)}>
              <option value="full">Полные данные</option>
              <option value="empty-fields">Пустые значения</option>
              <option value="long">Длинные значения</option>
              <option value="codes-only">Организации без названий</option>
            </select>
          </label>
          <label>
            Медицинский случай
            <select value={medicalState} onChange={(event) => setMedicalState(event.target.value as PreviewState)}>
              {stateOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <label>
            Законченный случай
            <select value={completedState} onChange={(event) => setCompletedState(event.target.value as PreviewState)}>
              {stateOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
        </div>
      </div>
      <div className={styles.medicalCaseDetailsRoot}>
        <section className={styles.caseSection} aria-labelledby="rcontrol-medical-details-heading">
          <RControlMedicalCaseDetailsCardHeader />
          {medicalState === "empty" || medicalState === "error" ? (
            <DataState
              variant={medicalState === "error" ? "error" : "empty"}
              title={medicalState === "error" ? "Ошибка данных" : "Данных не найдено"}
              description={medicalState === "error" ? "Демонстрационная ошибка медицинского случая" : "Медицинский случай не содержит информации о деталях медицинского случая"}
            />
          ) : (
            <RControlMedicalCaseDetailsCardBody medicalCaseDetails={medicalData} isPending={medicalState === "loading"} />
          )}
        </section>
        <section className={styles.caseSection} aria-labelledby="rcontrol-completed-details-heading">
          <RControlCompletedCaseDetailsCardHeader />
          {completedState === "empty" || completedState === "error" ? (
            <DataState
              variant={completedState === "error" ? "error" : "empty"}
              title={completedState === "error" ? "Ошибка данных" : "Данных не найдено"}
              description={completedState === "error" ? "Демонстрационная ошибка законченного случая" : "Медицинский случай не содержит информации о деталях законченного случая"}
            />
          ) : (
            <RControlCompletedCaseDetailsCardBody completedCaseDetails={completedData} isPending={completedState === "loading"} />
          )}
        </section>
      </div>
    </div>
  );
}
