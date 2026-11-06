// ==========================================
// modules/healthTrack/ui/HTFullPageLoader/HTFullPageLoader.tsx
// ==========================================
import { CircularProgress } from "@mui/material";
import styles from "./styles.module.scss";

interface HTFullPageLoaderProps {
  /** Подпись под спиннером. */
  text?: string;
}

/**
 * Сплэш-загрузчик для модуля HealthTrack.
 *
 * Используется:
 *  1. В HTProtectedRoute — пока идёт bootstrap (проверка refresh-токена).
 *  2. В HealthTrackApp — пока isInitialized не стало true.
 *
 * Стиль: центрирование по вертикали и горизонтали внутри контентной
 * области AppLayout. Не перекрывает шапку/подвал Никитки.
 */
export const HTFullPageLoader = ({
  text = "Загрузка…",
}: HTFullPageLoaderProps) => {
  return (
    <div className={styles.loaderRoot}>
      <CircularProgress
        size={36}
        thickness={4}
        sx={{
          // Используем CSS-переменные дизайн-системы Никитки,
          // чтобы вписаться в общую палитру.
          color: "var(--mt-healthtrack-accent)",
        }}
      />
      <p className={styles.text}>{text}</p>
    </div>
  );
};