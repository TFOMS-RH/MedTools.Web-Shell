// ==========================================
// modules/healthTrack/features/statistics/components/HTStatisticsTopDiagnoses/HTStatisticsTopDiagnoses.tsx
// ==========================================
import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";

import {
  formatStatNumber,
  type HTStatisticsTopDiagnosis,
} from "../../../../types/htStatistics";

import styles from "./styles.module.scss";

// ==========================================
// Пропсы.
// ==========================================
interface HTStatisticsTopDiagnosesProps {
  /** Топ-10 диагнозов. */
  data: HTStatisticsTopDiagnosis[];

  /** Колбэк: клик по бару (код диагноза). */
  onDiagClick?: (diagCode: string) => void;

  /** Идёт ли загрузка? */
  isLoading?: boolean;
}

// ==========================================
// Кастомный тултип.
// ==========================================
interface TooltipPayloadItem {
  payload: HTStatisticsTopDiagnosis;
  value: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (!active || !payload || payload.length === 0) return null;

  const item = payload[0].payload;

  return (
    <div className={styles.tooltip}>
      <div className={styles.tooltipTitle}>
        {item.diagCode}
        {item.diagName ? ` — ${item.diagName}` : ""}
      </div>
      <div className={styles.tooltipValue}>
        Пациентов: <strong>{formatStatNumber(item.count)}</strong>
      </div>
    </div>
  );
};

// ==========================================
// Сокращение длинного названия диагноза.
// Показываем максимум 30 символов.
// ==========================================
const shortDiagLabel = (item: HTStatisticsTopDiagnosis): string => {
  const code = item.diagCode ?? "";
  const name = item.diagName ?? "";

  if (name.length <= 22) return `${code} ${name}`.trim();
  return `${code} ${name.slice(0, 22)}…`;
};

/**
 * График топ-10 диагнозов по количеству пациентов.
 * Горизонтальные бары, метка — код + название.
 */
export const HTStatisticsTopDiagnoses = ({
  data,
  onDiagClick,
  isLoading = false,
}: HTStatisticsTopDiagnosesProps) => {
  // ==========================================
  // Для графика добавляем короткое название в каждую точку.
  // Recharts использует dataKey для метки оси Y.
  // ==========================================
  const chartData = useMemo(() => {
    return data.map((d) => ({
      ...d,
      shortLabel: shortDiagLabel(d),
    }));
  }, [data]);

  const isEmpty = chartData.length === 0;

  return (
    <div className={styles.card}>
      <header className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>Топ-10 диагнозов</h3>
        <p className={styles.cardSubtitle}>По количеству пациентов</p>
      </header>

      {isLoading && <div className={styles.message}>Загрузка…</div>}

      {!isLoading && isEmpty && (
        <div className={styles.message}>Нет данных за выбранный период</div>
      )}

      {!isLoading && !isEmpty && (
        <div className={styles.chartWrapper}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border-default)"
                horizontal={false}
              />

              <XAxis
                type="number"
                stroke="var(--text-secondary)"
                fontSize={12}
                tickFormatter={(v: number) => formatStatNumber(v)}
              />

              <YAxis
                type="category"
                dataKey="shortLabel"
                stroke="var(--text-secondary)"
                fontSize={11}
                width={180}
              />

              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "rgba(0,0,0,0.04)" }}
              />

              <Bar
                dataKey="count"
                radius={[0, 4, 4, 0]}
                onClick={(entry) => {
                  if (
                    onDiagClick &&
                    entry &&
                    typeof entry === "object" &&
                    "diagCode" in entry
                  ) {
                    onDiagClick(
                      (entry as { diagCode: string }).diagCode,
                    );
                  }
                }}
                style={{ cursor: onDiagClick ? "pointer" : "default" }}
              >
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={"var(--mt-healthtrack-accent)"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};