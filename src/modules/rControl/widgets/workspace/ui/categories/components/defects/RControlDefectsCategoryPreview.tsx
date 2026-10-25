import { useState } from "react";
import type { DefectDto } from "../../../../../../../../shared/model/types/invoiceStructure/results/defects/GetDefectsResult";
import type { MedicalSanctionDto } from "../../../../../../../../shared/model/types/invoiceStructure/results/defects/GetMedicalSanctionsResult";
import { DataState } from "../../../../../../../../shared/ui/DataState/DataState";
import { RControlDefectsTableHeader } from "./defects/table/RControlDefectsTableHeader";
import { RControlDefectsTableBody } from "./defects/table/RControlDefectsTableBody";
import { RControlMedicalSanctionCards } from "./medicalSanctions/cardsGroup/RControlMedicalSanctionCards";
import { RControlMedicalSanctionCardSkeletons } from "./medicalSanctions/cardsGroup/RControlMedicalSanctionCardSkeletons";
import styles from "./styles.module.scss";
import previewStyles from "./preview.module.scss";

const stateOptions = [
  ["ready", "Данные"],
  ["loading", "Загрузка"],
  ["empty", "Нет данных"],
  ["error", "Ошибка"],
] as const;
type PreviewState = (typeof stateOptions)[number][0];
type Dataset = "full" | "long" | "empty-fields" | "financial";
const counts = [0, 1, 2, 10, 40];

// Synthetic development records, excluded from production.
const createDefect = (index: number, caseNumber: number, dataset: Dataset): DefectDto => ({
  defectUid: caseNumber * 1000 + index,
  code: dataset === "empty-fields" ? null : index === 0 ? 0 : 1234567890,
  comment: dataset === "empty-fields" ? " " : dataset === "long"
    ? "Тестовый длинный комментарий дефекта для проверки переноса. ".repeat(12) + "\nВторая строка комментария."
    : "Демонстрационный дефект " + (index + 1) + "\nТестовый случай " + caseNumber,
});

const createSanction = (index: number, caseNumber: number, dataset: Dataset): MedicalSanctionDto => {
  const empty = dataset === "empty-fields";
  const long = dataset === "long";
  return {
    medicalSanctionUid: caseNumber * 1000 + index,
    sanctionCode: empty ? "" : long ? "ТЕСТ-САНКЦИЯ-0000123456789".repeat(8) : "ТЕСТ-САНКЦИЯ-" + (index + 1),
    sanctionAmount: dataset === "financial" ? (index % 2 === 0 ? 0 : -1234.567) : long ? 1234567890.567 : 2450,
    controlTypeCode: "ТЕСТ-СКРЫТЫЙ-КОНТРОЛЬ",
    refusalReasonCode: index === 0 ? 0 : 1234567890,
    comment: empty ? null : long
      ? "Тестовый длинный комментарий санкции для проверки переноса. ".repeat(12) + "\nВторая строка комментария."
      : "Демонстрационный комментарий санкции.\nПеренос строки сохраняется.",
    source: 999,
    unitsRemoved: index === 0 ? 0 : 2,
    expertiseActDate: empty ? "" : "2026-01-03T00:00:00+14:00",
    expertiseActNumber: empty ? "" : long ? "0000-ТЕСТ-АКТ-".repeat(12) : "0000-ТЕСТ-АКТ-" + (index + 1),
    expertCode: empty ? null : "ТЕСТ-ЭКСПЕРТ",
    filename: empty ? "" : long ? "ТЕСТ-ДЛИННОЕ-ИМЯ-ФАЙЛА-".repeat(14) + ".xml" : "ТЕСТ-" + caseNumber + ".xml",
    year: empty ? null : 2026,
    month: empty ? null : 1,
    uploadDate: empty ? null : "2026-01-05T23:30:00-12:00",
  };
};

export default function RControlDefectsCategoryPreview() {
  const [defectCount, setDefectCount] = useState(2);
  const [sanctionCount, setSanctionCount] = useState(2);
  const [dataset, setDataset] = useState<Dataset>("full");
  const [defectState, setDefectState] = useState<PreviewState>("ready");
  const [sanctionState, setSanctionState] = useState<PreviewState>("ready");
  const [pagination, setPagination] = useState({ page: 0, pageSize: 10 });
  const [caseNumber, setCaseNumber] = useState(1);
  const allDefects = Array.from({ length: defectCount }, (_, index) => createDefect(index, caseNumber, dataset));
  const defects = allDefects.slice(pagination.page * pagination.pageSize, (pagination.page + 1) * pagination.pageSize);
  const sanctions = Array.from({ length: sanctionCount }, (_, index) => createSanction(index, caseNumber, dataset));

  return (
    <div className={previewStyles.preview}>
      <div className={previewStyles.toolbar}>
        <p>Демонстрационные дефекты и санкции. API не используется; все записи и коды тестовые.</p>
        <div className={previewStyles.controls}>
          <label>
            Всего дефектов
            <select value={defectCount} onChange={(event) => { setDefectCount(Number(event.target.value)); setPagination((value) => ({ ...value, page: 0 })); }}>
              {counts.map((count) => <option key={count} value={count}>{count}</option>)}
            </select>
          </label>
          <label>
            Количество санкций
            <select value={sanctionCount} onChange={(event) => setSanctionCount(Number(event.target.value))}>
              {counts.map((count) => <option key={count} value={count}>{count}</option>)}
            </select>
          </label>
          <label>
            Набор данных
            <select value={dataset} onChange={(event) => setDataset(event.target.value as Dataset)}>
              <option value="full">Полные данные</option>
              <option value="long">Длинные значения</option>
              <option value="empty-fields">Пустые значения и даты</option>
              <option value="financial">Нулевая и отрицательная сумма</option>
            </select>
          </label>
          <label>
            Дефекты
            <select value={defectState} onChange={(event) => setDefectState(event.target.value as PreviewState)}>
              {stateOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <label>
            Санкции
            <select value={sanctionState} onChange={(event) => setSanctionState(event.target.value as PreviewState)}>
              {stateOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <button type="button" onClick={() => { setCaseNumber((value) => value + 1); setPagination((value) => ({ ...value, page: 0 })); }}>
            Сменить медицинский случай (тест)
          </button>
        </div>
      </div>
      <div className={styles.defectsRoot}>
        <section className={styles.section} aria-labelledby="rcontrol-defects-heading">
          <RControlDefectsTableHeader
            page={pagination.page}
            pageSize={pagination.pageSize}
            totalCount={defectState === "empty" ? 0 : defectCount}
            isFetching={defectState === "loading"}
            onPageChange={(_event, page) => { if (page >= 0) setPagination((value) => ({ ...value, page })); }}
            onRowsPerPageChange={(event) => setPagination((value) => ({ ...value, pageSize: parseInt(event.target.value, 10) }))}
          />
          {defectState === "error" ? (
            <DataState title="Ошибка данных" description="Демонстрационная ошибка дефектов" variant="error" />
          ) : defectState === "empty" || (defectState === "ready" && defects.length === 0) ? (
            <DataState title="Данных не найдено" description="Медицинский случай не содержит дефектов" variant="empty" />
          ) : (
            <RControlDefectsTableBody defects={defects} pageSize={pagination.pageSize} isPending={defectState === "loading"} />
          )}
        </section>
        <section className={styles.section} aria-labelledby="rcontrol-sanctions-heading">
          <h3 id="rcontrol-sanctions-heading" className={styles.sectionHeading}>Санкции</h3>
          {sanctionState === "error" ? (
            <DataState title="Ошибка данных" description="Демонстрационная ошибка санкций" variant="error" />
          ) : sanctionState === "loading" ? (
            <RControlMedicalSanctionCardSkeletons />
          ) : sanctionState === "empty" || sanctionCount === 0 ? (
            <DataState title="Данных не найдено" description="Медицинский случай не содержит санкции" variant="empty" />
          ) : (
            <RControlMedicalSanctionCards medicalSanctions={sanctions} isPending={false} />
          )}
        </section>
      </div>
    </div>
  );
}
