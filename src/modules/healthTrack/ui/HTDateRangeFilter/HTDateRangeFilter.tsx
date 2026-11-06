// ==========================================
// modules/healthTrack/ui/HTDateRangeFilter/HTDateRangeFilter.tsx
// ==========================================
import { useId, useState } from "react";
import TextField from "@mui/material/TextField";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

import Button from "@mui/material/Button";
import { documentButtonSx, documentInputSx } from "../../features/documents/controlsSx";

import styles from "./styles.module.scss";

// ==========================================
// Значение фильтра.
// ==========================================
export interface HTDateRangeValue {
  /** Период от в формате ГГГГ-ММ. Пустая строка = не задан. */
  periodFrom: string;

  /** Период до в формате ГГГГ-ММ. Пустая строка = не задан. */
  periodTo: string;
}

// ==========================================
// Пропсы.
// ==========================================
interface HTDateRangeFilterProps {
  /** Текущее значение. */
  value: HTDateRangeValue;

  /** Колбэк при изменении. */
  onChange: (next: HTDateRangeValue) => void;

  /** Колбэк кнопки «Применить». */
  onSubmit: (value: HTDateRangeValue) => void;

  /** Колбэк кнопки «Сбросить». */
  onReset: () => void;

  /** Заблокировать контролы. */
  disabled?: boolean;

  /** Подпись слева (по умолчанию «Период»). */
  label?: string;
}

// ==========================================
// Валидация периода "ГГГГ-ММ".
// ==========================================
const isValidPeriod = (value: string): boolean => {
  if (!value.trim()) return true; // пустое — валидно
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(value.trim());
};

/**
 * Фильтр по диапазону периодов (ГГГГ-ММ — ГГГГ-ММ).
 *
 * Используется в разделе «Статистика» для выбора окна отчёта.
 * Универсальный — можно переиспользовать в других местах.
 */
export const HTDateRangeFilter = ({
  value,
  onChange,
  onSubmit,
  onReset,
  disabled = false,
  label = "Период",
}: HTDateRangeFilterProps) => {
  const id = useId();
  const [localError, setLocalError] = useState<string | null>(null);

  const update = (field: keyof HTDateRangeValue, next: string) => {
    onChange({ ...value, [field]: next });
  };

  const handleSubmit = () => {
    const from = value.periodFrom.trim(), to = value.periodTo.trim();
    if (!isValidPeriod(from)) {
      setLocalError("Укажите «От» в формате ГГГГ-ММ, месяц от 01 до 12.");
      return;
    }
    if (!isValidPeriod(to)) {
      setLocalError("Укажите «До» в формате ГГГГ-ММ, месяц от 01 до 12.");
      return;
    }
    if (
      from && to && from > to
    ) {
      setLocalError("«От» не может быть позже «до»");
      return;
    }

    setLocalError(null);
    onSubmit({ periodFrom: from, periodTo: to });
  };

  const handleReset = () => {
    setLocalError(null);
    onChange({ periodFrom: "", periodTo: "" });
    onReset();
  };

  const inputProps = { input: { disableUnderline: true }, inputLabel: { shrink: true },
    htmlInput: { "aria-describedby": localError ? id + "-error" : undefined } };
  return (
    <form className={styles.filterRoot} aria-label="Период статистики"
      onSubmit={(event) => { event.preventDefault(); handleSubmit(); }}>
      <p className={styles.label}>{label}</p>
      <div className={styles.fields}>
        <TextField id={id + "-from"} label="От" placeholder="2026-01" sx={documentInputSx}
          variant="filled" fullWidth size="small" slotProps={inputProps}
          value={value.periodFrom} onChange={(e) => update("periodFrom", e.target.value)}
          disabled={disabled} error={Boolean(localError)} />
        <TextField id={id + "-to"} label="До" placeholder="2026-12" sx={documentInputSx}
          variant="filled" fullWidth size="small" slotProps={inputProps}
          value={value.periodTo} onChange={(e) => update("periodTo", e.target.value)}
          disabled={disabled} error={Boolean(localError)} />
        <div className={styles.actionsBlock}>
          <Button sx={documentButtonSx} variant="text" size="small" type="button"
            onClick={handleReset} disabled={disabled} startIcon={<RestartAltIcon fontSize="small" />}>Сбросить</Button>
          <Button sx={documentButtonSx} variant="contained" size="small" type="submit"
            disabled={disabled}>Применить</Button>
        </div>
      </div>
      {localError && <p id={id + "-error"} className={styles.errorBlock} role="alert">{localError}</p>}
    </form>
  );
};
