// ==========================================
// modules/healthTrack/ui/HTDateRangeFilter/HTDateRangeFilter.tsx
// ==========================================
import { useState } from "react";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

import Button from "@mui/material/Button";
import { documentButtonSx } from "../../features/documents/controlsSx";

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
  if (!value) return true; // пустое — валидно
  return /^\d{4}-\d{2}$/.test(value.trim());
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
  const [localError, setLocalError] = useState<string | null>(null);

  const update = (field: keyof HTDateRangeValue, next: string) => {
    onChange({ ...value, [field]: next });
  };

  const handleSubmit = () => {
    if (!isValidPeriod(value.periodFrom)) {
      setLocalError("Формат «от»: ГГГГ-ММ (например, 2026-01)");
      return;
    }
    if (!isValidPeriod(value.periodTo)) {
      setLocalError("Формат «до»: ГГГГ-ММ (например, 2026-12)");
      return;
    }
    if (
      value.periodFrom &&
      value.periodTo &&
      value.periodFrom > value.periodTo
    ) {
      setLocalError("«От» не может быть позже «до»");
      return;
    }

    setLocalError(null);
    onSubmit(value);
  };

  const handleReset = () => {
    setLocalError(null);
    onChange({ periodFrom: "", periodTo: "" });
    onReset();
  };

  return (
    <form
      className={styles.filterRoot}
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
    >
      <div className={styles.labelBlock}>
        <CalendarMonthOutlinedIcon
          sx={{ fontSize: 18, color: "var(--text-secondary)" }}
        />
        <span className={styles.label}>{label}</span>
      </div>

      <div className={styles.inputsBlock}>
        <input
          className={styles.periodInput}
          type="text"
          placeholder="от: 2026-01"
          value={value.periodFrom}
          onChange={(e) => update("periodFrom", e.currentTarget.value)}
          disabled={disabled}
        />

        <span className={styles.dash}>—</span>

        <input
          className={styles.periodInput}
          type="text"
          placeholder="до: 2026-12"
          value={value.periodTo}
          onChange={(e) => update("periodTo", e.currentTarget.value)}
          disabled={disabled}
        />
      </div>

      <div className={styles.actionsBlock}>
        <Button sx={documentButtonSx}
          variant="contained"
          size="small"
          type="submit"
          disabled={disabled}
        >
          Применить
        </Button>

        <Button sx={documentButtonSx}
          variant="outlined"
          size="small"
          type="button"
          onClick={handleReset}
          disabled={disabled}
        >
          <RestartAltIcon sx={{ fontSize: 18 }} />
          Сбросить
        </Button>
      </div>

      {localError && (
        <div className={styles.errorBlock}>{localError}</div>
      )}
    </form>
  );
};