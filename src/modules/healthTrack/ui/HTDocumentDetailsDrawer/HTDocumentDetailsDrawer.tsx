import { useEffect, useId, useState } from "react";
import { Button, CircularProgress, Drawer, IconButton, Tab, Tabs } from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import { documentButtonSx } from "../../features/documents/controlsSx";
import { HTDocumentStatusBadge } from "../HTDocumentStatusBadge/HTDocumentStatusBadge";
import { HTAuditTimeline } from "../HTAuditTimeline/HTAuditTimeline";
import { useDocumentAuditQuery, useDocumentDetailsQuery } from "../../hooks/useDocumentsQueries";
import { canCheckDocument, canDownloadResponse, type HTDocumentListItem } from "../../types/htDocuments";
import styles from "./styles.module.scss";

interface HTDocumentDetailsDrawerProps {
  documentId: number | null;
  onClose: () => void;
  onCheck: (id: number) => void;
  onDownloadResponse: (doc: HTDocumentListItem) => void;
  actionInProgress?: boolean;
}

const formatDateTime = (iso: string | null): string => {
  if (!iso) return "—";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ` +
    `${pad(d.getHours())}:${pad(d.getMinutes())}`
  );
};

const formatNumber = (n: number | null | undefined): string => {
  if (n === null || n === undefined) return "—";
  return n.toLocaleString("ru-RU");
};

const displayText = (value: string | null | undefined) => value?.trim() ? value : "—";

export const HTDocumentDetailsDrawer = ({ documentId, onClose, onCheck, onDownloadResponse,
  actionInProgress = false,
}: HTDocumentDetailsDrawerProps) => {
  const id = useId();
  const [activeTab, setActiveTab] = useState<"details" | "history">("details");
  useEffect(() => { setActiveTab("details"); }, [documentId]);

  const { data: doc, isLoading, isError } = useDocumentDetailsQuery(documentId);
  const { data: auditItems, isLoading: isAuditLoading, isError: isAuditError } = useDocumentAuditQuery(documentId);
  const isCheckable = doc ? canCheckDocument(doc) : false;
  const isDownloadable = doc ? canDownloadResponse(doc) : false;

  return (
    <Drawer anchor="right" open={documentId !== null} onClose={onClose}
      slotProps={{ paper: { className: styles.paper, role: "dialog", "aria-modal": true,
        "aria-labelledby": id + "-title",
        sx: { width: { xs: "100%", sm: "36rem", md: "40rem" }, maxWidth: "100%",
          borderRadius: { xs: 0, sm: "var(--mt-radius-card) 0 0 var(--mt-radius-card)" },
          background: "var(--mt-surface)", border: 0, boxShadow: "none", overflow: "hidden" },
      } }}>
      <header className={styles.header}>
        <p>Сведения о документе</p>
        <IconButton className={styles.closeButton} onClick={onClose} aria-label="Закрыть документ" size="small">
          <CloseRoundedIcon fontSize="small" />
        </IconButton>
      </header>

      <div className={styles.scrollArea}>
        <div className={styles.identity}>
          <h2 id={id + "-title"} className={styles.fileName}>{doc?.fileName || "Документ"}</h2>
          {doc && !isLoading && !isError && <div className={styles.metadata}>
            <span className={styles.fileType}>Тип документа: <strong>{doc.fileType}</strong></span>
            <HTDocumentStatusBadge status={doc.status} />
          </div>}
        </div>

        {doc && !isLoading && !isError && <Tabs className={styles.tabs} value={activeTab}
          onChange={(_, value) => setActiveTab(value)} aria-label="Разделы документа">
          <Tab label="Детали" value="details" id={id + "-tab-details"} aria-controls={id + "-panel-details"} />
          <Tab label={auditItems && auditItems.length > 0 ? "История (" + auditItems.length + ")" : "История"}
            value="history" id={id + "-tab-history"} aria-controls={id + "-panel-history"} />
        </Tabs>}

        <div className={styles.content}>
          {isLoading && <div className={styles.loadingBlock} role="status">
            <CircularProgress size={24} sx={{ color: "var(--mt-healthtrack-accent)" }} />Загрузка…
          </div>}
          {isError && !isLoading && <p className={styles.errorBlock} role="alert">Не удалось загрузить детали документа</p>}
          {doc && !isLoading && !isError && <section className={styles.tabPanel} role="tabpanel"
            id={id + "-panel-" + activeTab} aria-labelledby={id + "-tab-" + activeTab}>
            {activeTab === "details" ? <>
              <section className={styles.panel}>
                <h3>Документ</h3>
                <dl className={styles.fields}>
                  <div><dt>Период</dt><dd>{displayText(doc.period)}</dd></div>
                  <div><dt>Код МО</dt><dd>{displayText(doc.hospitalCode)}</dd></div>
                  <div><dt>Регион</dt><dd>{displayText(doc.regionCode)}</dd></div>
                  <div><dt>Дата загрузки</dt><dd>{formatDateTime(doc.uploadDate)}</dd></div>
                  <div className={styles.fullWidth}><dt>Загрузил</dt><dd>{displayText(doc.uploadedBy)}</dd></div>
                </dl>
              </section>
              <section className={styles.panel}>
                <h3>Проверка</h3>
                <dl className={styles.fields}>
                  <div className={styles.fullWidth}><dt>Проверил</dt><dd>{displayText(doc.checkedBy)}</dd></div>
                  <div><dt>Дата проверки</dt><dd>{formatDateTime(doc.checkedAt)}</dd></div>
                  <div><dt>Попыток проверки</dt><dd>{doc.checkAttempts}</dd></div>
                  <div><dt>Валиден</dt><dd className={doc.isValid ? styles.validYes : styles.validNo}>{doc.isValid ? "Да" : "Нет"}</dd></div>
                </dl>
              </section>
              <section className={styles.panel}>
                <div className={styles.records}>
                  <h3>Записи</h3>
                  <dl><div><dt>Всего</dt><dd>{formatNumber(doc.recordsCount)}</dd></div></dl>
                </div>
              </section>
              {doc.validationErrors && <section className={styles.panel}>
                <h3>Ошибки валидации</h3>
                <pre className={styles.validationErrors}>{doc.validationErrors}</pre>
              </section>}
            </> : <HTAuditTimeline items={auditItems ?? []} isLoading={isAuditLoading} isError={isAuditError} />}
          </section>}
        </div>
      </div>

      {doc && !isLoading && !isError && activeTab === "details" && <footer className={styles.footer}>
        {isCheckable && <Button sx={documentButtonSx} variant="contained" size="small" fullWidth
          startIcon={<FactCheckOutlinedIcon fontSize="small" />} onClick={() => onCheck(doc.id)}
          disabled={actionInProgress} loading={actionInProgress}>Проверить</Button>}
        {isDownloadable && <Button sx={documentButtonSx} variant={isCheckable ? "outlined" : "contained"}
          size="small" fullWidth startIcon={<DownloadRoundedIcon fontSize="small" />}
          onClick={() => onDownloadResponse(doc)} disabled={actionInProgress}>Скачать ответ</Button>}
        {!isCheckable && !isDownloadable && <p className={styles.noActions}>Действия недоступны для документов в этом статусе</p>}
      </footer>}
    </Drawer>
  );
};
