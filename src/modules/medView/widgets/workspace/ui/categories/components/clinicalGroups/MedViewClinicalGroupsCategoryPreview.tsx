import { useState } from "react";
import type { ClinicalGroupDto } from "../../../../../../../../shared/model/types/invoiceStructure/results/clinicalGroup/GetClinicalGroupResult";
import type { HighTechMedicalCareDto } from "../../../../../../../../shared/model/types/invoiceStructure/results/clinicalGroup/GetHighTechMedicalCareResult";
import type { ClassificationCriterionDto } from "../../../../../../../../shared/model/types/invoiceStructure/results/clinicalGroup/GetClassificationCriteriaResult";
import type { TreatmentComplexityCoefficientDto } from "../../../../../../../../shared/model/types/invoiceStructure/results/clinicalGroup/GetTreatmentComplexityCoefficientsResult";
import { DataState } from "../../../../../../../../shared/ui/DataState/DataState";
import { MedViewClinicalGroupCardHeader } from "./clinicalGroup/card/MedViewClinicalGroupCardHeader";
import { MedViewClinicalGroupCardBody } from "./clinicalGroup/card/MedViewClinicalGroupCardBody";
import { MedViewHighTechMedicalCareCardHeader } from "./highTechMedicalCare/card/MedViewHighTechMedicalCareCardHeader";
import { MedViewHighTechMedicalCareCardBody } from "./highTechMedicalCare/card/MedViewHighTechMedicalCareCardBody";
import { MedViewClassificationCriterionChipsGroupHeader } from "./сlassificationCriteria/chipsGroup/MedViewClassificationCriterionChipsGroupHeader";
import { MedViewClassificationCriterionChips } from "./сlassificationCriteria/chipsGroup/MedViewClassificationCriterionChips";
import { MedViewClassificationCriterionChipSkeletons } from "./сlassificationCriteria/chipsGroup/MedViewClassificationCriterionChipSkeletons";
import { MedViewTreatmentCoefficientsListHeader } from "./treatmentCoefficients/list/MedViewTreatmentCoefficientsListHeader";
import { MedViewTreatmentCoefficientsListBody } from "./treatmentCoefficients/list/MedViewTreatmentCoefficientsListBody";
import styles from "./styles.module.scss";
import previewStyles from "./preview.module.scss";

const stateOptions = [
  ["ready", "Данные"], ["loading", "Загрузка"], ["empty", "Нет данных"], ["error", "Ошибка"],
] as const;
type PreviewState = (typeof stateOptions)[number][0];
type Dataset = "full" | "nullable" | "zeros" | "long" | "invalid-dates";
const counts = [0, 1, 2, 10, 40];

// Synthetic development fixtures, excluded from production.
export default function MedViewClinicalGroupsCategoryPreview() {
  const [dataset, setDataset] = useState<Dataset>("full");
  const [criteriaCount, setCriteriaCount] = useState(2);
  const [coefficientCount, setCoefficientCount] = useState(2);
  const [csgState, setCsgState] = useState<PreviewState>("ready");
  const [vmpState, setVmpState] = useState<PreviewState>("ready");
  const [criteriaState, setCriteriaState] = useState<PreviewState>("ready");
  const [coefficientState, setCoefficientState] = useState<PreviewState>("ready");
  const [caseNumber, setCaseNumber] = useState(1);
  const [source, setSource] = useState("SMODB18");
  const nullable = dataset === "nullable";
  const zero = dataset === "zeros";
  const long = dataset === "long";
  const token = source + "-" + caseNumber;
  const group: ClinicalGroupDto = {
    clinicalGroupUid: caseNumber,
    clinicalStatisticalGroupNumber: long ? "0000-ТЕСТ-КСГ-".repeat(18) : "0000-ТЕСТ-КСГ-" + token,
    calculatedClinicalStatisticalGroupNumber: nullable ? null : "0000-ТЕСТ-РАСЧЁТ",
    clinicalStatisticalGroupModelVersion: zero ? 0 : 2026,
    isCsgSubgroupUsed: false,
    clinicalProfileGroupNumber: nullable ? null : "0000-ТЕСТ-КПГ",
    costCoefficient: zero ? 0 : 1.23456789,
    managementCoefficient: zero ? 0 : 1.12345678,
    baseRate: zero ? 0 : 12345.6789,
    differentiationCoefficient: zero ? 0 : 1.3456789,
    levelCoefficient: zero ? 0 : 1.456789,
    wageTargetCoefficient: null,
    isClspUsed: false,
    complexityCoefficient: nullable ? null : zero ? 0 : 1.56789,
  };
  const vmp: HighTechMedicalCareDto = {
    highTechCareTypeCode: nullable ? null : long ? "ТЕСТ-ВИД-0000".repeat(18) : "ТЕСТ-ВИД-" + token,
    highTechCareMethodCode: nullable ? null : "0000-ТЕСТ-МЕТОД",
    voucherNumber: nullable ? null : long ? "0000-ТЕСТ-ТАЛОН-".repeat(18) : "0000-ТЕСТ-ТАЛОН",
    voucherIssueDate: nullable ? null : dataset === "invalid-dates" ? "2026-02-30" : "2026-01-03T23:30:00-12:00",
    plannedAdmissionDate: nullable ? null : dataset === "invalid-dates" ? "not-a-date" : "2026-01-05T00:00:00Z",
  };
  const criteria: ClassificationCriterionDto[] = Array.from({ length: criteriaCount }, (_, index) => ({
    classificationCriterionUid: caseNumber * 1000 + index,
    classificationCriterion: long
      ? (index % 2 === 0 ? "ТЕСТКРИТЕРИЙ0000123456789".repeat(24) : "Демонстрационная длинная строка критерия. ".repeat(12))
      : "Тестовый критерий " + (index + 1) + " — " + token,
  }));
  const coefficients: TreatmentComplexityCoefficientDto[] = Array.from({ length: coefficientCount }, (_, index) => ({
    treatmentComplexityCoefficientUid: caseNumber * 1000 + index,
    complexityCoefficientNumber: nullable && index === 0 ? null : long ? "0000-ТЕСТ-КОЭФФИЦИЕНТ-".repeat(18) : "0000-ТЕСТ-" + (index + 1),
    complexityCoefficientValue: zero || index === 0 ? 0 : 1.23456789,
  }));

  return (
    <div className={previewStyles.preview}>
      <div className={previewStyles.toolbar}>
        <p>Демонстрационные КСГ и ВМП. API не используется; все записи и коды тестовые.</p>
        <div className={previewStyles.controls}>
          <label>Набор данных
            <select value={dataset} onChange={(event) => setDataset(event.target.value as Dataset)}>
              <option value="full">Полные данные</option>
              <option value="nullable">Nullable-поля / ВМП с null</option>
              <option value="zeros">Нулевые значения</option>
              <option value="long">Длинные значения</option>
              <option value="invalid-dates">Некорректные даты</option>
            </select>
          </label>
          <label>Критериев
            <select value={criteriaCount} onChange={(event) => setCriteriaCount(Number(event.target.value))}>
              {counts.map((count) => <option key={count} value={count}>{count}</option>)}
            </select>
          </label>
          <label>Коэффициентов
            <select value={coefficientCount} onChange={(event) => setCoefficientCount(Number(event.target.value))}>
              {counts.map((count) => <option key={count} value={count}>{count}</option>)}
            </select>
          </label>
          <label>КСГ
            <select value={csgState} onChange={(event) => setCsgState(event.target.value as PreviewState)}>
              {stateOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <label>ВМП
            <select value={vmpState} onChange={(event) => setVmpState(event.target.value as PreviewState)}>
              {stateOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <label>Состояние критериев
            <select value={criteriaState} onChange={(event) => setCriteriaState(event.target.value as PreviewState)}>
              {stateOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <label>Состояние коэффициентов
            <select value={coefficientState} onChange={(event) => setCoefficientState(event.target.value as PreviewState)}>
              {stateOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <label>Источник (тест)
            <select value={source} onChange={(event) => setSource(event.target.value)}>
              <option value="SMODB18">SMODB18</option>
              <option value="INOGOROD18">INOGOROD18</option>
            </select>
          </label>
          <button type="button" onClick={() => setCaseNumber((value) => value + 1)}>Сменить медицинский случай (тест)</button>
        </div>
      </div>
      <div className={styles.clinicalGroupsRoot}>
        <div className={styles.topGrid}>
          <section className={styles.panel} aria-labelledby="medview-csg-heading">
            <MedViewClinicalGroupCardHeader />
            {csgState === "error" ? (
              <DataState title="Ошибка данных" description="Демонстрационная ошибка КСГ" variant="error" />
            ) : csgState === "empty" ? (
              <DataState title="Данных не найдено" description="Медицинский случай не содержит информации о КСГ/КПГ" variant="empty" />
            ) : <MedViewClinicalGroupCardBody clinicalGroup={group} isPending={csgState === "loading"} />}
          </section>
          <section className={styles.panel} aria-labelledby="medview-vmp-heading">
            <MedViewHighTechMedicalCareCardHeader />
            {vmpState === "error" ? (
              <DataState title="Ошибка данных" description="Демонстрационная ошибка ВМП" variant="error" />
            ) : vmpState === "empty" ? (
              <DataState title="Данных не найдено" description="Медицинский случай не содержит информации о ВМП" variant="empty" />
            ) : <MedViewHighTechMedicalCareCardBody highTechMedicalCare={vmp} isPending={vmpState === "loading"} />}
          </section>
        </div>
        <section className={styles.relatedSection} aria-labelledby="medview-csg-related-heading">
          <h3 id="medview-csg-related-heading" className={styles.sectionHeading}>Связанные сведения КСГ</h3>
          {csgState === "error" ? (
            <DataState title="Связанные сведения КСГ недоступны" description="Не удалось получить клиническую группу. Классификационные критерии и КСЛП недоступны." variant="error" />
          ) : csgState === "empty" ? (
            <DataState title="Клиническая группа отсутствует" description="Для этого медицинского случая нет КСГ; классификационные критерии и КСЛП недоступны." variant="empty" />
          ) : csgState === "loading" ? (
            <DataState title="Получение клинической группы" description="После получения данных станут доступны классификационные критерии и КСЛП" variant="waiting" />
          ) : (
            <div className={styles.relatedGrid}>
              <section className={styles.panel} aria-labelledby="medview-csg-criteria-heading">
                <MedViewClassificationCriterionChipsGroupHeader />
                {criteriaState === "error" ? (
                  <DataState title="Ошибка данных" description="Демонстрационная ошибка критериев" variant="error" />
                ) : criteriaState === "loading" ? <MedViewClassificationCriterionChipSkeletons /> : criteriaState === "empty" || criteriaCount === 0 ? (
                  <DataState title="Данных не найдено" description="Клиническая группа не содержит информации о классификационных критериях" variant="empty" />
                ) : <MedViewClassificationCriterionChips classificationCriteria={criteria} />}
              </section>
              <section className={styles.panel} aria-labelledby="medview-csg-coefficients-heading">
                <MedViewTreatmentCoefficientsListHeader />
                {coefficientState === "error" ? (
                  <DataState title="Ошибка данных" description="Демонстрационная ошибка коэффициентов" variant="error" />
                ) : coefficientState === "empty" || (coefficientState === "ready" && coefficientCount === 0) ? (
                  <DataState title="Данных не найдено" description="Клиническая группа не содержит информации о КСЛП" variant="empty" />
                ) : <MedViewTreatmentCoefficientsListBody treatmentComplexityCoefficients={coefficients} isPending={coefficientState === "loading"} />}
              </section>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
