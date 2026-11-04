import { useCallback, useEffect, useMemo, useState } from "react";
import LinearProgress from "@mui/material/LinearProgress";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

import { AppButton } from "../../../../../components/ui/AppButton/AppButton";
import { AppInput } from "../../../../../components/ui/AppInput/AppInput";

import { HTFileDropzone } from "../../../ui/HTFileDropzone/HTFileDropzone";
import { HTImportResultCard } from "../../../ui/HTImportResultCard/HTImportResultCard";
import { HTDocumentTypeBadge } from "../../../ui/HTDocumentTypeBadge/HTDocumentTypeBadge";

import { useImportMutation } from "../../../hooks/useImportMutation";
import { useHTNotify } from "../../../hooks/useHTNotify";

import { parseHTFileName } from "../../../utils/htFileNameParser";

import type { HTImportDisplayResult } from "../../../types/htImport";

import styles from "./styles.module.scss";


interface HTImportFormProps {

  onGoToDocument: (documentId: number) => void;
}


export const HTImportForm = ({ onGoToDocument }: HTImportFormProps) => {

  const [file, setFile] = useState<File | null>(null);
  const [period, setPeriod] = useState("");
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<HTImportDisplayResult | null>(null);
  const importMutation = useImportMutation();
  const notify = useHTNotify();


  const parseResult = useMemo(() => {
    if (!file) return null;
    return parseHTFileName(file.name);
  }, [file]);


  useEffect(() => {
    if (!parseResult) return;

    if (parseResult.isValid) {
      if (parseResult.period) setPeriod(parseResult.period);
    }
  }, [parseResult]);


  const canSubmit = useMemo(() => {
    if (!file) return false;
    if (!parseResult?.isValid) return false;
    if (!period.trim()) return false;
    if (!/^\d{4}-\d{2}$/.test(period.trim())) return false;
    return true;
  }, [file, parseResult, period]);


  const handleFileChange = useCallback((selected: File | null) => {
    setFile(selected);
    setResult(null);
    setProgress(0);

    if (!selected) {
      setPeriod("");
    }
  }, []);

  const handleDropzoneError = useCallback(
    (message: string) => {
      notify.error(message);
    },
    [notify],
  );

  const handleSubmit = useCallback(() => {
    if (!file || !parseResult?.isValid) return;

    setResult({ status: "uploading" });
    setProgress(0);

    importMutation.mutate(
      {
        fileType: parseResult.fileType!,
        request: {
          file,
          period: period.trim(),
          hospitalCode: null,   // бэк возьмёт organization_code из токена
        },
        onProgress: setProgress,
      },
      {
        onSuccess: (r) => {
          setResult({
            status: "success",
            documentId: r.documentId,
            fileName: file.name,
            fileType: parseResult.fileType,
            recordsCount: r.recordsCount,
            updatedCount: r.updatedCount,
            warnings: r.warnings,
          });

          notify.success(
            `Импортировано ${r.recordsCount.toLocaleString("ru-RU")} записей`,
          );
        },
        onError: (err) => {
          setResult({
            status: "error",
            fileName: file.name,
            errorMessage: "Не удалось импортировать файл",
          });

          notify.errorFrom(err, "Ошибка импорта");
        },
      },
    );
  }, [file, parseResult, period, importMutation, notify]);

  const handleReset = useCallback(() => {
    setFile(null);
    setPeriod("");
    setProgress(0);
    setResult(null);
  }, []);


  const isUploading = importMutation.isPending && result?.status === "uploading";

  return (
    <section className={styles.formRoot}>
      <header className={styles.header}>
        <h3 className={styles.title}>Импорт файла</h3>
        <p className={styles.subtitle}>
          Загрузите XML или ZIP-архив от МО, СМО или ТФОМС. Тип файла,
          период и код МО определяются автоматически по имени файла.
        </p>
      </header>

      <HTFileDropzone
        file={file}
        onFileChange={handleFileChange}
        onError={handleDropzoneError}
        disabled={isUploading}
      />

      {file && parseResult && !parseResult.isValid && (
        <div className={styles.parseError}>
          <span>⚠</span>
          <span>{parseResult.errorMessage}</span>
        </div>
      )}

      {file && parseResult?.isValid && (
        <div className={styles.parsedInfo}>
          <div className={styles.parsedItem}>
            <span className={styles.parsedLabel}>Тип файла</span>
            <HTDocumentTypeBadge fileType={parseResult.fileType!} />
          </div>

          {parseResult.period && (
            <div className={styles.parsedItem}>
              <span className={styles.parsedLabel}>Период из имени</span>
              <span className={styles.parsedValue}>{parseResult.period}</span>
            </div>
          )}

          {parseResult.sender && (
            <div className={styles.parsedItem}>
              <span className={styles.parsedLabel}>Отправитель</span>
              <span className={styles.parsedValue}>
                {parseResult.sender === "MO"
                  ? "Медицинская организация"
                  : parseResult.sender === "SMO"
                    ? "Страховая организация"
                    : parseResult.sender === "TFOMS"
                      ? "ТФОМС"
                      : "Неизвестно"}
              </span>
            </div>
          )}
        </div>
      )}

      {file && parseResult?.isValid && (
        <div className={styles.fieldsRow}>
          <AppInput
            label="Период (ГГГГ-ММ)"
            variant="md"
            placeholder="2026-09"
            value={period}
            onChange={(e) => setPeriod(e.currentTarget.value)}
            disabled={isUploading}
          />
        </div>
      )}

      {isUploading && (
        <div className={styles.progressBlock}>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 6,
              borderRadius: "var(--radius-l)",
              backgroundColor: "var(--gray-200)",
              "& .MuiLinearProgress-bar": {
                backgroundColor: "var(--text-default)",
              },
            }}
          />
          <span className={styles.progressLabel}>
            {progress < 100
              ? `Загрузка… ${progress}%`
              : "Обработка на сервере…"}
          </span>
        </div>
      )}

      {file && parseResult?.isValid && !result && (
        <div className={styles.actions}>
          <AppButton
            variant="primary"
            size="md"
            onClick={handleSubmit}
            disabled={!canSubmit || isUploading}
          >
            <CloudUploadIcon sx={{ fontSize: 18, color: "var(--white)" }} />
            Загрузить
          </AppButton>
        </div>
      )}

      {result && result.status !== "uploading" && (
        <HTImportResultCard
          result={result}
          onGoToDocument={onGoToDocument}
          onRetry={handleReset}
        />
      )}
    </section>
  );
};