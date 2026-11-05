// ==========================================
// modules/healthTrack/features/registerDn/HTRegisterDnFilters/HTRegisterDnFilters.tsx
// ==========================================
import SearchIcon from "@mui/icons-material/Search";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

import { Button, TextField } from "@mui/material";
import { documentButtonSx, documentInputSx } from "../../documents/controlsSx";

import styles from "./styles.module.scss";

// ==========================================
// Локальное состояние фильтров.
// ==========================================
export interface HTRegisterDnFiltersValue {
  searchQuery: string;
  hospitalCode: string;
  diagCode: string;
  period: string;
  status: "" | "active" | "closed";
}

// ==========================================
// Пропсы.
// ==========================================
interface HTRegisterDnFiltersProps {
  value: HTRegisterDnFiltersValue;
  onChange: (next: HTRegisterDnFiltersValue) => void;
  onSubmit: () => void;
  onReset: () => void;
  disabled?: boolean;
}

/**
 * Панель фильтров реестра ДН.
 * Компактные поля с постоянными подписями в адаптивной сетке.
 */
export const HTRegisterDnFilters = ({
  value,
  onChange,
  onSubmit,
  onReset,
  disabled = false,
}: HTRegisterDnFiltersProps) => {
  const update = <K extends keyof HTRegisterDnFiltersValue>(
    field: K,
    fieldValue: HTRegisterDnFiltersValue[K],
  ) => {
    onChange({ ...value, [field]: fieldValue });
  };

  const inputProps = { input: { disableUnderline: true }, inputLabel: { shrink: true } };
  return (
    <form className={styles.filtersRoot} aria-label="Фильтры регистра ДН"
      onSubmit={(event) => { event.preventDefault(); onSubmit(); }}>
      <div className={styles.fields}>
        <div className={styles.searchField}>
          <TextField id="ht-register-search" label="Поиск" placeholder="ФИО или ЕНП…"
            sx={documentInputSx} variant="filled" fullWidth size="small" slotProps={inputProps}
            value={value.searchQuery} onChange={(e) => update("searchQuery", e.target.value)} disabled={disabled} />
        </div>
        <TextField id="ht-register-mo" label="Код МО" placeholder="Например, 190006"
          sx={documentInputSx} variant="filled" fullWidth size="small" slotProps={inputProps}
          value={value.hospitalCode} onChange={(e) => update("hospitalCode", e.target.value)} disabled={disabled} />
        <TextField id="ht-register-diagnosis" label="Диагноз (МКБ-10)" placeholder="Код диагноза"
          sx={documentInputSx} variant="filled" fullWidth size="small" slotProps={inputProps}
          value={value.diagCode} onChange={(e) => update("diagCode", e.target.value)} disabled={disabled} />
        <TextField id="ht-register-period" label="Период" placeholder="2026-09"
          sx={documentInputSx} variant="filled" fullWidth size="small" slotProps={inputProps}
          value={value.period} onChange={(e) => update("period", e.target.value)} disabled={disabled} />
        <TextField id="ht-register-status" label="Статус" select
          sx={documentInputSx} variant="filled" fullWidth size="small"
          slotProps={{ ...inputProps, select: { native: true } }}
          value={value.status} onChange={(e) => update("status", e.target.value as HTRegisterDnFiltersValue["status"])} disabled={disabled}>
          <option value="">Все статусы</option><option value="active">На учёте</option><option value="closed">Снят</option>
        </TextField>
        <div className={styles.actions}>
          <Button sx={documentButtonSx} variant="text" type="button" onClick={onReset}
            disabled={disabled} startIcon={<RestartAltIcon fontSize="small" />}>Сбросить</Button>
          <Button sx={documentButtonSx} variant="contained" type="submit"
            disabled={disabled} startIcon={<SearchIcon fontSize="small" />}>Найти</Button>
        </div>
      </div>
    </form>
  );
};
