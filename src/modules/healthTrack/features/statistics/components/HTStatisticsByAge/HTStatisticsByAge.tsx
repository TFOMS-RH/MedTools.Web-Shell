// ==========================================
// modules/healthTrack/features/statistics/components/HTStatisticsByAge/HTStatisticsByAge.tsx
// ==========================================
import { useMemo } from "react";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import {
  HT_AGE_GROUP_COLORS,
  formatStatNumber,
  type HTStatisticsByAgeGroup,
} from "../../../../types/htStatistics";

import styles from "../../styles.module.scss";

// ==========================================
// Пропсы.
// ==========================================
interface HTStatisticsByAgeProps {
  data: HTStatisticsByAgeGroup[];
  onAgeGroupClick?: (group: string) => void;
  isLoading?: boolean;
}

// ==========================================
// Цвет для группы (fallback, если нет в карте).
// ==========================================
const FALLBACK_COLORS = [
  "#1a4fbf",
  "#1a7f37",
  "#996600",
  "#b91c1c",
  "#6633cc",
];

const formatAgeLabel = (group: string) => /^\d+([-–]\d+|\+)$/.test(group) ? group + " лет" : group;

const getGroupColor = (group: string, index: number): string => {
  return HT_AGE_GROUP_COLORS[group] ?? FALLBACK_COLORS[index % FALLBACK_COLORS.length];
};

// ==========================================
// Кастомный тултип.
// ==========================================
interface TooltipPayloadItem {
  payload: HTStatisticsByAgeGroup & { percent: number };
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
      <div className={styles.tooltipTitle}>{formatAgeLabel(item.group)}</div>
      <div className={styles.tooltipValue}>
        Пациентов: <strong>{formatStatNumber(item.count)}</strong>
      </div>
      <div className={styles.tooltipPercent}>
        {(item.percent * 100).toFixed(1)}%
      </div>
    </div>
  );
};

/**
 * Donut-chart распределения по возрастным группам.
 * Легенда — справа (компактная).
 */
export const HTStatisticsByAge = ({
  data,
  onAgeGroupClick,
  isLoading = false,
}: HTStatisticsByAgeProps) => {
  // ==========================================
  // Считаем total и проценты.
  // ==========================================
  const { chartData, total } = useMemo(() => {
    const t = data.reduce((sum, d) => sum + d.count, 0);

    const cd = data.map((d, idx) => ({
      ...d,
      percent: t > 0 ? d.count / t : 0,
      color: getGroupColor(d.group, idx),
    }));

    return { chartData: cd, total: t };
  }, [data]);

  const isEmpty = total === 0;

  return (
    <div className={styles.card} role="region" aria-label="По возрасту">
      <header className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>По возрасту</h3>
        <p className={styles.cardSubtitle}>Распределение пациентов</p>
      </header>

      {isLoading && <div className={styles.message}>Загрузка…</div>}

      {!isLoading && isEmpty && (
        <div className={styles.message}>{data.length === 0
          ? "Нет данных за выбранный период"
          : "Во всех полученных возрастных группах — 0 пациентов."}</div>
      )}

      {!isLoading && !isEmpty && (
        <div className={styles.chartRow}>
          {/* ============================== */}
          {/* Donut */}
          {/* ============================== */}
          <div className={styles.ageChartWrapper}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                isAnimationActive={false}
                  data={chartData}
                  dataKey="count"
                  nameKey="group"
                  cx="50%"
                  cy="50%"
                  innerRadius="58%"
                  outerRadius="85%"
                  paddingAngle={2}
                  stroke="none"
                  onClick={(entry) => {
                    if (
                      onAgeGroupClick &&
                      entry &&
                      typeof entry === "object" &&
                      "group" in entry
                    ) {
                      onAgeGroupClick(
                        (entry as { group: string }).group,
                      );
                    }
                  }}
                  style={{ cursor: onAgeGroupClick ? "pointer" : "default" }}
                >
                  {chartData.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={entry.color} />
                  ))}
                </Pie>

                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            {/* Центральный label */}
            <div className={styles.centerLabel}>
              <span className={styles.centerValue}>
                {formatStatNumber(total)}
              </span>
              <span className={styles.centerCaption}>всего</span>
            </div>
          </div>

          {/* ============================== */}
          {/* Легенда */}
          {/* ============================== */}
          <ul className={styles.legend}>
            {chartData.map((entry) => (
                <li
                    key={entry.group}
                    className={styles.legendItem}
                    onClick={() => onAgeGroupClick?.(entry.group)}
                    style={{ cursor: onAgeGroupClick ? "pointer" : "default" }}
                >
                <span
                  className={styles.legendDot}
                  style={{ backgroundColor: entry.color }}
                />
                <span className={styles.legendLabel}>
                  {formatAgeLabel(entry.group)}
                </span>
                <span className={styles.legendValue}>
                  {formatStatNumber(entry.count)}
                </span>
                <span className={styles.legendPercent}>
                  {(entry.percent * 100).toFixed(1)}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
