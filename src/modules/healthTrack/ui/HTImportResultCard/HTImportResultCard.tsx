// ==========================================
// modules/healthTrack/ui/HTImportResultCard/HTImportResultCard.tsx
// ==========================================
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutlineOutlined";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import RefreshIcon from "@mui/icons-material/Refresh";

import Button from "@mui/material/Button";
import { documentButtonSx } from "../../features/documents/controlsSx";

import type { HTImportDisplayResult } from "../../types/htImport";
import { HT_FILE_TYPE_LABELS } from "../../types/htDocuments";

import styles from "./styles.module.scss";

// ==========================================
// Пропсы.
// ==========================================
interface HTImportResultCardProps {
  /** Результат импорта (заполняется после завершения операции). */
  result: HTImportDisplayResult;

  /** Колбэк: перейти к документу в разделе «Документы». */
  onGoToDocument: (documentId: number) => void;

  /** Колбэк: попробовать снова (сбросить форму). */
  onRetry: () => void;
}

/**
 * Карточка результата импорта.
 * Показывает успех или ошибку операции.
 */
export const HTImportResultCard = ({
  result,
  onGoToDocument,
  onRetry,
}: HTImportResultCardProps) => {
  // ==========================================
  // Общая обёртка с классом по варианту.
  // ==========================================
  const rootClassName = [
    styles.card,
    result.status === "success" ? styles.success : "",
    result.status === "error" ? styles.error : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section className={rootClassName} role={result.status === "error" ? "alert" : "status"}>
      {/* ============================== */}
      {/* Заголовок с иконкой */}
      {/* ============================== */}
      <header className={styles.header}>
        <div className={styles.headerIcon}>
          {result.status === "success" ? (
            <CheckCircleIcon sx={{ fontSize: 32 }} />
          ) : (
            <ErrorOutlineIcon sx={{ fontSize: 32 }} />
          )}
        </div>

        <div className={styles.headerText}>
          <h3 className={styles.title}>
            {result.status === "success"
              ? "Импорт завершён"
              : "Ошибка импорта"}
          </h3>
          {result.fileName && (
            <p className={styles.fileName}>{result.fileName}</p>
          )}
        </div>
      </header>

      {/* ============================== */}
      {/* Успех */}
      {/* ============================== */}
      {result.status === "success" && (
        <>
          <div className={styles.statsBlock}>
            {result.fileType && (
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Тип</span>
                <span className={styles.statValue}>
                  {HT_FILE_TYPE_LABELS[result.fileType]}
                </span>
              </div>
            )}

            {result.recordsCount !== undefined && (
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Импортировано</span>
                <span className={styles.statValue}>
                  {result.recordsCount.toLocaleString("ru-RU")}
                </span>
              </div>
            )}

            {result.updatedCount !== undefined &&
              result.updatedCount > 0 && (
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Обновлено</span>
                  <span className={styles.statValue}>
                    {result.updatedCount.toLocaleString("ru-RU")}
                  </span>
                </div>
              )}
          </div>

          {/* Предупреждения (если есть) */}
          {result.warnings && result.warnings.length > 0 && (
            <div className={styles.warningsBlock}>
              <header className={styles.warningsHeader}>
                <WarningAmberIcon
                  sx={{ fontSize: 18, color: "#996600" }}
                />
                <span>
                  Предупреждения ({result.warnings.length})
                </span>
              </header>

              <ul className={styles.warningsList}>
                {result.warnings.map((warning, index) => (
                  <li key={index} className={styles.warningItem}>
                    {warning}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Действия */}
          <div className={styles.actions}>
            {result.documentId !== undefined && (
              <Button
                sx={documentButtonSx} variant="contained"
                size="small"
                onClick={() => onGoToDocument(result.documentId!)}
              >
                Перейти к документу
                <ChevronRightIcon sx={{ fontSize: 18, color: "var(--white)" }} />
              </Button>
            )}

            <Button sx={documentButtonSx} variant="outlined" size="small" onClick={onRetry}>
              <RefreshIcon sx={{ fontSize: 18 }} />
              Загрузить ещё
            </Button>
          </div>
        </>
      )}

      {/* ============================== */}
      {/* Ошибка */}
      {/* ============================== */}
      {result.status === "error" && (
        <>
          <div className={styles.errorBlock}>
            <p className={styles.errorMessage}>
              {result.errorMessage ?? "Произошла ошибка при импорте файла"}
            </p>
          </div>

          <div className={styles.actions}>
            <Button sx={documentButtonSx} variant="contained" size="small" onClick={onRetry}>
              <RefreshIcon sx={{ fontSize: 18, color: "var(--white)" }} />
              Попробовать снова
            </Button>
          </div>
        </>
      )}
    </section>
  );
};