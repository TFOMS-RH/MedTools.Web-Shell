// ==========================================
// modules/healthTrack/features/statistics/components/HTStatisticsTopDiagnoses/HTStatisticsTopDiagnoses.tsx
// ==========================================
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

import styles from "../../styles.module.scss";

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

/**
 * График топ-10 диагнозов по количеству пациентов.
 * Горизонтальные бары, метка — код + название.
 */
export const HTStatisticsTopDiagnoses = ({
  data,
  onDiagClick,
  isLoading = false,
}: HTStatisticsTopDiagnosesProps) => {
  const chartData = data;

  const isEmpty = chartData.length === 0;

  return (
    <div className={styles.card} role="region" aria-label="Топ-10 диагнозов">
      <header className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>Топ-10 диагнозов</h3>
        <p className={styles.cardSubtitle}>По количеству пациентов</p>
      </header>

      {isLoading && <div className={styles.message}>Загрузка…</div>}

      {!isLoading && isEmpty && (
        <div className={styles.message}>Нет данных за выбранный период</div>
      )}

      {!isLoading && !isEmpty && (
        <div className={styles.chartWrapper} style={{ height: Math.max(144, data.length * 36 + 52) }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 24, left: 0, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border-default)"
                horizontal={false}
              />

              <XAxis
                type="number"
                stroke="var(--text-secondary)"
                fontSize={14}
                tickFormatter={(v: number) => formatStatNumber(v)}
              />

              <YAxis
                type="category"
                dataKey="diagCode"
                stroke="var(--text-secondary)"
                fontSize={14}
                width={84}
                interval={0}
              />

              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "rgba(0,0,0,0.04)" }}
              />

              <Bar
                isAnimationActive={false}
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
      {!isLoading && !isEmpty && <details className={styles.dataDetails}>
        <summary>Данные графика — все значения</summary>
        <div className={styles.tableViewport} tabIndex={0}>
          <table className={"mt-table " + styles.dataTable + " " + styles.diagnosesData} aria-label="Топ-10 диагнозов: данные">
            <thead><tr><th scope="col">МКБ-10</th><th scope="col">Диагноз</th><th scope="col">Пациентов</th></tr></thead>
            <tbody>{data.map((item, index) => <tr key={item.diagCode + "-" + index}>
              <td>{item.diagCode}</td><td>{item.diagName ?? "—"}</td><td>{formatStatNumber(item.count)}</td>
            </tr>)}</tbody>
          </table>
        </div>
      </details>}
    </div>
  );
};
