// ==========================================
// modules/healthTrack/ui/HTConfirmDialog/HTConfirmDialog.tsx
// ==========================================
import type { ReactNode } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

import Button from "@mui/material/Button";
import { documentButtonSx } from "../../features/documents/controlsSx";

import styles from "./styles.module.scss";

// ==========================================
// Пропсы.
// ==========================================
interface HTConfirmDialogProps {
  /** Открыт ли диалог. */
  open: boolean;

  /** Заголовок диалога. */
  title: string;

  /** Описание — что произойдёт. Может быть ReactNode для форматирования. */
  description?: ReactNode;

  /** Текст на кнопке подтверждения. По умолчанию «Подтвердить». */
  confirmLabel?: string;

  /** Текст на кнопке отмены. По умолчанию «Отмена». */
  cancelLabel?: string;

  /**
   * Тип действия — влияет на цвет кнопки подтверждения.
   *  - "danger"  — красная (для удаления).
   *  - "primary" — брендовая (обычное подтверждение).
   */
  variant?: "danger" | "primary";

  /** Заблокировать кнопки (например, во время запроса). */
  loading?: boolean;

  /** Колбэк при подтверждении. */
  onConfirm: () => void;

  /** Колбэк при отмене (или закрытии через крестик / Esc / клик вне). */
  onCancel: () => void;
}

/**
 * Универсальный диалог подтверждения.
 *
 * Пример:
 *   <HTConfirmDialog
 *     open={open}
 *     title="Удалить документ?"
 *     description="Все связанные записи будут удалены безвозвратно."
 *     variant="danger"
 *     confirmLabel="Удалить"
 *     onConfirm={handleDelete}
 *     onCancel={handleClose}
 *   />
 */
export const HTConfirmDialog = ({
  open,
  title,
  description,
  confirmLabel = "Подтвердить",
  cancelLabel = "Отмена",
  variant = "primary",
  loading = false,
  onConfirm,
  onCancel,
}: HTConfirmDialogProps) => {
  return (
    <Dialog
        open={open}
        onClose={loading ? undefined : onCancel}
        maxWidth="sm"
        fullWidth
        slotProps={{
            paper: {
            sx: {
                borderRadius: "var(--radius-xl)",
                border: "1px solid var(--border-default)",
                background: "var(--card-background)",
                padding: 0,
            },
            },
        }}
    >
      {/* ============================== */}
      {/* Заголовок */}
      {/* ============================== */}
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          gap: "var(--space-3)",
          padding: "var(--space-7) var(--space-8) var(--space-4)",
        }}
      >
        {variant === "danger" && (
          <WarningAmberIcon
            sx={{
              fontSize: 24,
              color: "#b91c1c",
              flexShrink: 0,
            }}
          />
        )}

        <span
          style={{
            flex: 1,
            fontFamily: "var(--inter)",
            fontSize: "var(--fs-h4)",
            fontWeight: "var(--fw-semibold)",
            color: "var(--text-default)",
          }}
        >
          {title}
        </span>

        <IconButton
          onClick={onCancel}
          disabled={loading}
          size="small"
          sx={{
            color: "var(--text-secondary)",
            "&:hover": { background: "var(--gray-100)" },
          }}
        >
          <CloseIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </DialogTitle>

      {/* ============================== */}
      {/* Описание */}
      {/* ============================== */}
      {description && (
        <DialogContent
          sx={{
            padding: "0 var(--space-8) var(--space-5)",
            fontFamily: "var(--inter)",
            fontSize: "var(--fs-body1)",
            color: "var(--text-secondary)",
            lineHeight: 1.5,
          }}
        >
          {description}
        </DialogContent>
      )}

      {/* ============================== */}
      {/* Действия */}
      {/* ============================== */}
      <DialogActions
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "var(--space-3)",
          padding: "var(--space-4) var(--space-8) var(--space-7)",
        }}
      >
        <Button sx={documentButtonSx}
          variant="outlined"
          size="small"
          onClick={onCancel}
          disabled={loading}
        >
          {cancelLabel}
        </Button>

        <button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className={`${styles.confirmButton} ${
            variant === "danger" ? styles.danger : ""
          }`}
        >
          {loading ? "Обработка…" : confirmLabel}
        </button>
      </DialogActions>
    </Dialog>
  );
};