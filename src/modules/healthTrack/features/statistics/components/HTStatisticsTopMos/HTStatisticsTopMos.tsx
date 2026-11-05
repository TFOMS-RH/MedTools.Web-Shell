// ==========================================
// modules/healthTrack/features/statistics/components/HTStatisticsTopMos/HTStatisticsTopMos.tsx
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
  type HTStatisticsTopMo,
} from "../../../../types/htStatistics";

import styles from "./styles.module.scss";

// ==========================================
// Пропсы.
// ==========================================
interface HTStatisticsTopMosProps {
  /** Топ-10 МО. */
  data: HTStatisticsTopMo[];

  /** Колбэк: клик по бару (код МО). */
  onMoClick?: (moCode: string) => void;

  /** Идёт ли загрузка? */
  isLoading?: boolean;
}

// ==========================================
// Кастомный тултип.
// ==========================================
interface TooltipPayloadItem {
  payload: HTStatisticsTopMo;
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
      <div className={styles.tooltipTitle}>МО: {item.moCode}</div>
      <div className={styles.tooltipValue}>
        Пациентов: <strong>{formatStatNumber(item.count)}</strong>
      </div>
    </div>
  );
};

/**
 * График топ-10 МО по количеству пациентов.
 * Горизонтальные бары (layout="vertical").
 */
export const HTStatisticsTopMos = ({
  data,
  onMoClick,
  isLoading = false,
}: HTStatisticsTopMosProps) => {
  const isEmpty = useMemo(() => data.length === 0, [data]);

  return (
    <div className={styles.card}>
      <header className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>Топ-10 МО</h3>
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
              data={data}
              layout="vertical"
              margin={{ top: 5, right: 20, left: 40, bottom: 5 }}
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
                dataKey="moCode"
                stroke="var(--text-secondary)"
                fontSize={12}
                width={70}
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
                    onMoClick &&
                    entry &&
                    typeof entry === "object" &&
                    "moCode" in entry
                  ) {
                    onMoClick((entry as { moCode: string }).moCode);
                  }
                }}
                style={{ cursor: onMoClick ? "pointer" : "default" }}
              >
                {data.map((_, index) => (
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