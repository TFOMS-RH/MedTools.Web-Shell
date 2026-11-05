// ==========================================
// modules/healthTrack/ui/HTFileDropzone/HTFileDropzone.tsx
// ==========================================
import { useCallback, useRef, useState } from "react";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";

import {
  HT_IMPORT_ACCEPT_ATTR,
  HT_IMPORT_ALLOWED_EXTENSIONS,
  HT_IMPORT_MAX_FILE_SIZE,
} from "../../types/htImport";

import styles from "./styles.module.scss";

// ==========================================
// Пропсы.
// ==========================================
interface HTFileDropzoneProps {
  /** Выбранный файл (null — ничего не выбрано). */
  file: File | null;

  /** Колбэк при выборе файла. Передаём null чтобы сбросить. */
  onFileChange: (file: File | null) => void;

  /** Колбэк при ошибке валидации. */
  onError: (message: string) => void;

  /** Заблокировать зону (например, во время загрузки). */
  disabled?: boolean;
}

// ==========================================
// Валидация файла.
// ==========================================
const validateFile = (file: File): string | null => {
  // 1. Проверка расширения.
  const lowerName = file.name.toLowerCase();
  const hasValidExt = HT_IMPORT_ALLOWED_EXTENSIONS.some((ext) =>
    lowerName.endsWith(ext),
  );
  if (!hasValidExt) {
    return `Поддерживаются только файлы: ${HT_IMPORT_ALLOWED_EXTENSIONS.join(", ")}`;
  }

  // 2. Проверка размера.
  if (file.size > HT_IMPORT_MAX_FILE_SIZE) {
    const maxMb = (HT_IMPORT_MAX_FILE_SIZE / (1024 * 1024)).toFixed(0);
    return `Размер файла превышает ${maxMb} МБ`;
  }

  return null;
};

// ==========================================
// Форматирование размера файла.
// ==========================================
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} Б`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} КБ`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} МБ`;
};

/**
 * Зона загрузки файла с поддержкой drag&drop и клика.
 *
 * Если файл выбран — показывает имя и размер файла + иконку "удалить".
 * Если не выбран — показывает приглашение "перетащите файл или нажмите".
 */
export const HTFileDropzone = ({
  file,
  onFileChange,
  onError,
  disabled = false,
}: HTFileDropzoneProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragDepth = useRef(0);

  // ==========================================
  // Общий обработчик выбора файла.
  // ==========================================
  const handleFile = useCallback(
    (selected: File | null) => {
      if (!selected) {
        onFileChange(null);
        return;
      }

      const error = validateFile(selected);
      if (error) {
        onError(error);
        return;
      }

      onFileChange(selected);
    },
    [onFileChange, onError],
  );

  // ==========================================
  // Обработчики drag&drop.
  // ==========================================
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    dragDepth.current += 1;
    setIsDragOver(true);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    dragDepth.current = Math.max(0, dragDepth.current - 1);
    if (dragDepth.current === 0) setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragDepth.current = 0;
    setIsDragOver(false);
    if (disabled) return;

    const dropped = e.dataTransfer.files?.[0];
    if (dropped) handleFile(dropped);
  };

  // ==========================================
  // Клик по зоне → открываем диалог выбора.
  // ==========================================
  const handleClick = () => {
    if (disabled) return;
    inputRef.current?.click();
  };

  // ==========================================
  // Изменение выбора в нативном input.
  // ==========================================
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.currentTarget.files?.[0] ?? null;
    handleFile(selected);
    // Сбрасываем input, чтобы можно было выбрать тот же файл повторно.
    e.currentTarget.value = "";
  };

  // ==========================================
  // Удаление выбранного файла.
  // ==========================================
  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    onFileChange(null);
  };

  // ==========================================
  // Собираем className.
  // ==========================================
  const rootClassName = [
    styles.dropzone,
    isDragOver ? styles.dragOver : "",
    file ? styles.hasFile : "",
    disabled ? styles.disabled : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={rootClassName}
      onDragEnter={handleDragEnter} onDragOver={handleDragOver}
      onDragLeave={handleDragLeave} onDrop={handleDrop}>
      <input ref={inputRef} type="file" accept={HT_IMPORT_ACCEPT_ATTR}
        onChange={handleInputChange} disabled={disabled} hidden />
      <button type="button" className={styles.chooseFile} onClick={handleClick}
        disabled={disabled} aria-label={file ? "Выбрать другой файл" : "Выбрать файл XML или ZIP"}>
        {file ? (
          <span className={styles.fileChosen}>
            <span className={styles.fileIcon}><InsertDriveFileOutlinedIcon sx={{ fontSize: 24 }} /></span>
            <span className={styles.fileInfo}>
              <span className={styles.fileName}>{file.name}</span>
              <span className={styles.fileSize}>
                {formatFileSize(file.size)} · {file.name.split(".").pop()?.toUpperCase()}
              </span>
            </span>
          </span>
        ) : (
          <span className={styles.prompt}>
            <span className={styles.promptIcon}><UploadFileOutlinedIcon sx={{ fontSize: 28 }} /></span>
            <span className={styles.promptTitle}>Перетащите файл сюда или нажмите для выбора</span>
            <span className={styles.promptHint}>Поддерживаются файлы XML и ZIP</span>
          </span>
        )}
      </button>
      {file && <IconButton className={styles.removeFile} onClick={handleRemoveFile}
        disabled={disabled} aria-label="Удалить файл" title="Удалить файл">
        <CloseIcon sx={{ fontSize: 20 }} />
      </IconButton>}
    </div>
  );
};
