import { Button, TextField } from "@mui/material";
// ==========================================
// modules/healthTrack/features/documents/HTDocumentsFilters/HTDocumentsFilters.tsx
// ==========================================
import SearchIcon from "@mui/icons-material/Search";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

import { documentButtonSx, documentInputSx } from "../controlsSx";

import {
  HT_FILE_TYPE_LABELS,
  HT_STATUS_LABELS,
  type HTDocumentFileType,
  type HTDocumentStatus,
} from "../../../types/htDocuments";

import styles from "./styles.module.scss";

// ==========================================
// Локальное состояние фильтров.
// ==========================================
export interface HTDocumentsFiltersValue {
  searchQuery: string;
  fileType: HTDocumentFileType | "";
  hospitalCode: string;
  period: string;
  status: HTDocumentStatus | "";
}

// ==========================================
// Пропсы.
// ==========================================
interface HTDocumentsFiltersProps {
  value: HTDocumentsFiltersValue;
  onChange: (next: HTDocumentsFiltersValue) => void;
  onSubmit: () => void;
  onReset: () => void;
  availablePeriods: string[];
  disabled?: boolean;
  hasUnappliedFilters: boolean;
}

// ==========================================
// Опции для select-ов.
// ==========================================
const FILE_TYPE_OPTIONS = [
  { label: "Все типы", value: "" },
  ...Object.entries(HT_FILE_TYPE_LABELS).map(([key, label]) => ({
    label,
    value: key,
  })),
];

const STATUS_OPTIONS = [
  { label: "Все статусы", value: "" },
  ...Object.entries(HT_STATUS_LABELS).map(([key, label]) => ({
    label,
    value: key,
  })),
];

/**
 * Панель фильтров раздела «Документы».
 * Компактные MUI-поля с постоянными подписями.
 */
export const HTDocumentsFilters = ({
  value,
  onChange,
  onSubmit,
  onReset,
  availablePeriods,
  disabled = false,
  hasUnappliedFilters,
}: HTDocumentsFiltersProps) => {
  const update = <K extends keyof HTDocumentsFiltersValue>(
    field: K,
    fieldValue: HTDocumentsFiltersValue[K],
  ) => {
    onChange({ ...value, [field]: fieldValue });
  };

  const periodOptions = [
    { label: "Все периоды", value: "" },
    ...availablePeriods.map((p) => ({ label: p, value: p })),
  ];

  const inputProps = { input: { disableUnderline: true }, inputLabel: { shrink: true } };
  const selectProps = { ...inputProps, select: { native: true } };

  return (
    <form className={styles.filtersRoot} aria-label="Фильтры документов" onSubmit={(event) => {
      event.preventDefault(); onSubmit();
    }}>
      <div className={styles.fields}>
        <div className={styles.field + " " + styles.searchField}>
<TextField id="ht-document-search" label="Поиск" sx={documentInputSx} variant="filled" fullWidth size="small"
            slotProps={inputProps} placeholder="Имя файла, код МО…" value={value.searchQuery}
            onChange={(e) => update("searchQuery", e.target.value)} disabled={disabled} />
        </div>
        <div className={styles.field}>
<TextField id="ht-document-type" label="Тип файла" sx={documentInputSx} select variant="filled" fullWidth size="small"
            slotProps={selectProps} value={value.fileType} disabled={disabled}
            onChange={(e) => update("fileType", e.target.value as HTDocumentFileType | "")}>
            {FILE_TYPE_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </TextField>
        </div>
        <div className={styles.field}>
<TextField id="ht-document-mo" label="Код МО" sx={documentInputSx} variant="filled" fullWidth size="small"
            slotProps={inputProps} placeholder="Например, 190006" value={value.hospitalCode}
            onChange={(e) => update("hospitalCode", e.target.value)} disabled={disabled} />
        </div>
        <div className={styles.field}>
<TextField id="ht-document-period" label="Период" sx={documentInputSx} select variant="filled" fullWidth size="small"
            slotProps={selectProps} value={value.period} disabled={disabled}
            onChange={(e) => update("period", e.target.value)}>
            {periodOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </TextField>
        </div>
        <div className={styles.field}>
<TextField id="ht-document-status" label="Статус" sx={documentInputSx} select variant="filled" fullWidth size="small"
            slotProps={selectProps} value={value.status} disabled={disabled}
            onChange={(e) => update("status", e.target.value as HTDocumentStatus | "")}>
            {STATUS_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </TextField>
        </div>
        <div className={styles.actions}>
          <Button sx={documentButtonSx} variant="text" type="button" onClick={onReset} disabled={disabled} startIcon={<RestartAltIcon fontSize="small" />}>Сбросить</Button>
          <Button sx={documentButtonSx} variant="contained" type="submit" disabled={disabled} startIcon={<SearchIcon fontSize="small" />}>Найти</Button>
        </div>
      </div>
      {hasUnappliedFilters && <p className={styles.pending} role="status">Есть неприменённые изменения</p>}
    </form>
  );
};
