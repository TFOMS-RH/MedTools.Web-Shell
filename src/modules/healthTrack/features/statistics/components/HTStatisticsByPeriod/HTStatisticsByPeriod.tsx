// ==========================================
// modules/healthTrack/features/statistics/components/HTStatisticsByPeriod/HTStatisticsByPeriod.tsx
// ==========================================
import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  formatStatNumber,
  type HTStatisticsByPeriod as HTStatisticsByPeriodData,
} from "../../../../types/htStatistics";

import styles from "../../styles.module.scss";

// ==========================================
// Пропсы.
// ==========================================
interface HTStatisticsByPeriodProps {
  data: HTStatisticsByPeriodData[];
  isLoading?: boolean;
}

// ==========================================
// Форматирование метки оси X: "2026-09" → "сен 26".
// ==========================================
const MONTHS_SHORT = [
  "янв", "фев", "мар", "апр", "май", "июн",
  "июл", "авг", "сен", "окт", "ноя", "дек",
];

const formatPeriodLabel = (period: string): string => {
  const parts = period.split("-");
  if (parts.length !== 2) return period;
  const monthIdx = Number(parts[1]) - 1;
  if (monthIdx < 0 || monthIdx > 11) return period;
  return `${MONTHS_SHORT[monthIdx]} ${parts[0].slice(2)}`;
};

// ==========================================
// Кастомный тултип.
// ==========================================
interface TooltipPayloadItem {
  payload: HTStatisticsByPeriodData;
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
      <div className={styles.tooltipTitle}>Период: {item.period}</div>
      <div className={styles.tooltipValue}>
        Пациентов: <strong>{formatStatNumber(item.count)}</strong>
      </div>
    </div>
  );
};

/**
 * График динамики постановок на ДН по периодам.
 * Area-chart с градиентом под линией.
 */
export const HTStatisticsByPeriod = ({
  data,
  isLoading = false,
}: HTStatisticsByPeriodProps) => {
  // Добавляем метку периода для оси X.
  const chartData = useMemo(
    () =>
      data.map((d) => ({
        ...d,
        label: formatPeriodLabel(d.period),
      })),
    [data],
  );

  const isEmpty = chartData.length === 0;

  return (
    <div className={styles.card} role="region" aria-label="Динамика по периодам">
      <header className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>Динамика по периодам</h3>
        <p className={styles.cardSubtitle}>
          Постановки на ДН по месяцам
        </p>
      </header>

      {isLoading && <div className={styles.message}>Загрузка…</div>}

      {!isLoading && isEmpty && (
        <div className={styles.message}>Нет данных за выбранный период</div>
      )}

      {!isLoading && !isEmpty && (
        <div className={styles.chartWrapper}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 20, left: 0, bottom: 5 }}
            >
              <defs>
                {/* Градиент под линией. */}
                <linearGradient id="htPeriodGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={"var(--mt-healthtrack-accent)"}
                    stopOpacity={0.25}
                  />
                  <stop
                    offset="95%"
                    stopColor={"var(--mt-healthtrack-accent)"}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border-default)"
              />

              <XAxis
                dataKey="label"
                stroke="var(--text-secondary)"
                fontSize={14}
                tickLine={false}
              />

              <YAxis
                stroke="var(--text-secondary)"
                fontSize={14}
                tickFormatter={(v: number) => formatStatNumber(v)}
                tickLine={false}
              />

              <Tooltip
                content={<CustomTooltip />}
                cursor={{ stroke: "var(--border-hover)", strokeDasharray: "3 3" }}
              />

              <Area
                isAnimationActive={false}
                type="monotone"
                dataKey="count"
                stroke={"var(--mt-healthtrack-accent)"}
                strokeWidth={2}
                fill="url(#htPeriodGradient)"
                dot={{
                  r: 3,
                  fill: "var(--mt-healthtrack-accent)",
                  strokeWidth: 0,
                }}
                activeDot={{
                  r: 5,
                  fill: "var(--mt-healthtrack-accent)",
                  stroke: "var(--card-background)",
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
      {!isLoading && !isEmpty && <details className={styles.dataDetails}>
        <summary>Данные графика — все периоды</summary>
        <div className={styles.tableViewport} tabIndex={0}>
          <table className={"mt-table " + styles.dataTable} aria-label="Динамика: данные">
            <thead><tr><th scope="col">Период</th><th scope="col">Пациентов</th></tr></thead>
            <tbody>{data.map((item, index) => <tr key={item.period + "-" + index}>
              <td>{item.period}</td><td>{formatStatNumber(item.count)}</td>
            </tr>)}</tbody>
          </table>
        </div>
      </details>}
    </div>
  );
};