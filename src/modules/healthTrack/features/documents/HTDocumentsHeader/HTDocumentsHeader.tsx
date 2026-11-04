// ==========================================
// modules/healthTrack/features/documents/HTDocumentsHeader/HTDocumentsHeader.tsx
// ==========================================
import RefreshIcon from "@mui/icons-material/Refresh";
import ChecklistIcon from "@mui/icons-material/Checklist";

import { AppButton } from "../../../../../components/ui/AppButton/AppButton";

import styles from "./styles.module.scss";

interface HTDocumentsHeaderProps {
  /** Сколько документов выбрано чекбоксами. */
  selectedCount: number;

  /** Колбэк: пользователь нажал «Обновить». */
  onRefresh: () => void;

  /** Колбэк: пользователь нажал «Проверить выбранные». */
  onCheckSelected: () => void;

  /** Идёт ли сейчас какая-то из операций (для disabled). */
  isLoading: boolean;

  /** Есть ли право на проверку (permission). */
  canCheck: boolean;
}

/**
 * Хедер раздела «Документы и экспорт».
 */
export const HTDocumentsHeader = ({
  selectedCount,
  onRefresh,
  onCheckSelected,
  isLoading,
  canCheck,
}: HTDocumentsHeaderProps) => {
  const hasSelection = selectedCount > 0;

  return (
    <header className={styles.headerRoot}>
      <div className={styles.titleBlock}>
        <h2 className={styles.title}>Документы и экспорт</h2>
        <p className={styles.subtitle}>
          Управление загруженными файлами: проверка, статусы, выгрузка
        </p>
      </div>

      <div className={styles.actionsBlock}>
        <AppButton
          variant="secondary"
          size="md"
          onClick={onRefresh}
          disabled={isLoading}
        >
          <RefreshIcon sx={{ fontSize: 18 }} />
          Обновить
        </AppButton>

        {canCheck && (
          <AppButton
            variant="primary"
            size="md"
            onClick={onCheckSelected}
            disabled={!hasSelection || isLoading}
          >
            <ChecklistIcon sx={{ fontSize: 18, color: "var(--white)" }} />
            {hasSelection
              ? `Проверить выбранные (${selectedCount})`
              : "Проверить выбранные"}
          </AppButton>
        )}
      </div>
    </header>
  );
};