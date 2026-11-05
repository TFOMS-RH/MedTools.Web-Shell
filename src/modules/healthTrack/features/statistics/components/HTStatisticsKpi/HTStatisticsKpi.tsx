// ==========================================
// modules/healthTrack/features/statistics/components/HTStatisticsKpi/HTStatisticsKpi.tsx
// ==========================================
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import PersonOffOutlinedIcon from "@mui/icons-material/PersonOffOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import TaskAltOutlinedIcon from "@mui/icons-material/TaskAltOutlined";
import StorageOutlinedIcon from "@mui/icons-material/StorageOutlined";

import { formatStatNumber, type HTStatisticsKpi as HTStatisticsKpiData } from "../../../../types/htStatistics";

import styles from "./styles.module.scss";

// ==========================================
// Пропсы.
// ==========================================
interface HTStatisticsKpiProps {
  /** Данные KPI. */
  kpi: HTStatisticsKpiData;
}

// ==========================================
// Описание плиток.
// ==========================================
interface KpiTile {
  key: keyof HTStatisticsKpiData;
  label: string;
  icon: React.ReactNode;
  accent: string; // цвет иконки
}

const TILES: KpiTile[] = [
  {
    key: "patientsTotal",
    label: "Всего пациентов",
    icon: <PeopleAltOutlinedIcon sx={{ fontSize: 22 }} />,
    accent: "var(--mt-healthtrack-accent)",
  },
  {
    key: "patientsActive",
    label: "На учёте",
    icon: <CheckCircleOutlinedIcon sx={{ fontSize: 22 }} />,
    accent: "#1a7f37",
  },
  {
    key: "patientsClosed",
    label: "Снято с учёта",
    icon: <PersonOffOutlinedIcon sx={{ fontSize: 22 }} />,
    accent: "#996600",
  },
  {
    key: "documentsTotal",
    label: "Всего документов",
    icon: <DescriptionOutlinedIcon sx={{ fontSize: 22 }} />,
    accent: "var(--mt-healthtrack-accent)",
  },
  {
    key: "documentsReady",
    label: "Готово",
    icon: <TaskAltOutlinedIcon sx={{ fontSize: 22 }} />,
    accent: "#1a7f37",
  },
  {
    key: "recordsTotal",
    label: "Всего записей",
    icon: <StorageOutlinedIcon sx={{ fontSize: 22 }} />,
    accent: "var(--mt-healthtrack-accent)",
  },
];

/**
 * KPI-плитки статистики.
 * 6 карточек в grid.
 */
export const HTStatisticsKpi = ({ kpi }: HTStatisticsKpiProps) => {
  return (
    <div className={styles.kpiRoot}>
      {TILES.map((tile) => {
        const value = kpi[tile.key];

        return (
          <div key={tile.key} className={styles.tile}>
            <div
              className={styles.tileIcon}
              style={{
                color: tile.accent,
                backgroundColor: `color-mix(in srgb, ${tile.accent} 7%, transparent)`,
              }}
            >
              {tile.icon}
            </div>

            <div className={styles.tileBody}>
              <span className={styles.tileValue}>
                {formatStatNumber(value)}
              </span>
              <span className={styles.tileLabel}>{tile.label}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};