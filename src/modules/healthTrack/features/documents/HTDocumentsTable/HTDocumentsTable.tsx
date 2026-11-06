// ==========================================
// modules/healthTrack/features/documents/HTDocumentsTable/HTDocumentsTable.tsx
// ==========================================
import { IconButton, Skeleton, Tooltip } from "@mui/material";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import { HTDocumentStatusBadge } from "../../../ui/HTDocumentStatusBadge/HTDocumentStatusBadge";
import { HTEmptyState } from "../../../ui/HTEmptyState/HTEmptyState";
import {
  canCheckDocument,
  canDownloadResponse,
  type HTDocumentListItem,
} from "../../../types/htDocuments";

import styles from "./styles.module.scss";

// ==========================================
// Пропсы.
// ==========================================
interface HTDocumentsTableProps {
  /** Строки таблицы. */
  items: HTDocumentListItem[];

  /** Текущая страница (1-based). */
  page: number;

  /** Размер страницы. */
  pageSize: number;

  /** Общее количество страниц. */
  totalPages: number;

  /** Колбэк: изменить страницу. */
  onPageChange: (page: number) => void;

  /** Колбэк: изменить размер страницы. */
  onPageSizeChange: (size: number) => void;

  /** Колбэк: проверить один документ. */
  onCheckOne: (id: number) => void;

  /** Колбэк: скачать ответный файл. */
  onDownloadResponse: (doc: HTDocumentListItem) => void;

  onOpenDetails: (doc: HTDocumentListItem) => void;

  /** Колбэк: удалить документ. */
  onDelete: (doc: HTDocumentListItem) => void;

  

  /** Есть ли у пользователя право удалять документы (роль Admin/MO/SMO). */
  canDelete: boolean;

  /** Колбэк: сбросить фильтры (используется в пустом состоянии). */
  onResetFilters?: () => void;



  /** Загрузка? */
  isLoading: boolean;
  isError: boolean;
  isRefreshing: boolean;
}

// ==========================================
// Форматирование даты в "DD.MM.YYYY HH:mm".
// ==========================================
const formatDateTime = (iso: string | null): string => {
  if (!iso) return "—";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ` +
    `${pad(d.getHours())}:${pad(d.getMinutes())}`
  );
};

// ==========================================
// Форматирование числа с разделителями.
// ==========================================
const formatNumber = (n: number | null): string => {
  if (n === null || n === undefined) return "—";
  return n.toLocaleString("ru-RU");
};

/**
 * Таблица документов.
 *
 * Особенности:
 *  - Действия — иконки с тултипами в последней колонке.
 *  - Пагинация снизу.
 */
export const HTDocumentsTable = ({
  items,
  page,
  pageSize,
  totalPages,
  onPageChange,
  onPageSizeChange,
  onCheckOne,
  onDownloadResponse,
  onOpenDetails,
  onDelete,          
  canDelete, 
  onResetFilters,   // ← добавить
  isLoading,
  isError,
  isRefreshing,
}: HTDocumentsTableProps) => {
  // ==========================================
  // Пагинация — набор номеров страниц для отображения.
  // Показываем: первая, последняя, текущая ± 1, "…" между ними.
  // Для простоты — показываем все, если <= 7 страниц.
  // ==========================================
  const getPageNumbers = (): (number | "ellipsis")[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | "ellipsis")[] = [1];

    if (page > 3) pages.push("ellipsis");

    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);
    for (let i = start; i <= end; i++) pages.push(i);

    if (page < totalPages - 2) pages.push("ellipsis");

    pages.push(totalPages);
    return pages;
  };

  // ==========================================
  // Пока данные грузятся и список пуст — показываем скелетон.
  // Если список уже есть (например, при пагинации) — рендерим таблицу.
  // ==========================================
  return (
    <div className={styles.tableRoot} aria-busy={isLoading || isRefreshing}>
      {/* ============================== */}
      {/* Таблица */}
      {/* ============================== */}
      <div className={"mt-table-viewport mt-table-viewport--scrollable " + styles.tableWrapper} tabIndex={0} role="region" aria-label="Таблица документов">
        <table className={"mt-table " + styles.table} aria-label="Документы HealthTrack">
          <thead>
            <tr>
              <th className={styles.numberCell}>№</th>
              <th>Дата загрузки</th>
              <th>Имя файла</th>
              <th>Тип</th>
              <th>Код МО</th>
              <th>Период</th>
              <th className={styles.numberCell}>Записей</th>
              <th>Статус</th>
              <th className={styles.actionsCell}>Действия</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && items.length === 0 ? (
              Array.from({ length: Math.min(pageSize, 10) }, (_, row) => (
                <tr key={row} className="noneHover" aria-hidden="true">
                  {Array.from({ length: 9 }, (_, column) => (
                    <td key={column}><Skeleton animation="wave" width={column === 2 ? "85%" : "65%"} /></td>
                  ))}
                </tr>
              ))
            ) : items.length === 0 ? (
                <tr>
                  <td colSpan={9} className={styles.emptyCell}>
                    <HTEmptyState
                      compact
                      title={isError ? "Не удалось загрузить документы" : "Документы не найдены"}
                      description={isError ? "Повторите запрос кнопкой «Обновить»." : "Попробуйте изменить фильтры или сбросить их."}
                      action={
                        !isError && onResetFilters
                          ? {
                              label: "Сбросить фильтры",
                              onClick: onResetFilters,
                            }
                          : undefined
                      }
                    />
                  </td>
                </tr>
              ) : (
              items.map((doc, index) => {
                const isCheckable = canCheckDocument(doc);
                const canDownload = canDownloadResponse(doc);

                return (
                  <tr
                    key={doc.id}
                    className="mt-table__row--interactive"
                    onClick={() => onOpenDetails(doc)}
                    title="Открыть детали документа"
                  >
                    {/* № */}
                    <td className={styles.numberCell}>
                      {(page - 1) * pageSize + index + 1}
                    </td>

                    {/* Дата загрузки */}
                    <td>{formatDateTime(doc.uploadDate)}</td>

                    {/* Имя файла */}
                    <td>
                      <button type="button" className={styles.fileName} onClick={(event) => { event.stopPropagation(); onOpenDetails(doc); }} aria-label={`Открыть документ ${doc.fileName}`}>{doc.fileName}</button>
                    </td>

                    {/* Тип */}
                    <td>
                      {doc.fileType}
                    </td>

                    {/* Код МО */}
                    <td>{doc.hospitalCode ?? "—"}</td>

                    {/* Период */}
                    <td>{doc.period}</td>

                    {/* Записей */}
                    <td className={styles.numberCell}>
                      {formatNumber(doc.recordsCount)}
                    </td>

                    {/* Статус */}
                    <td>
                      <HTDocumentStatusBadge status={doc.status} />
                    </td>

                    {/* Действия */}
                    <td
                      className={styles.actionsCell}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className={styles.actionsInner}>
                        {isCheckable && (
                          <Tooltip title="Проверить документ">
                            <IconButton
                              size="small"
                              aria-label="Проверить документ"
                              onClick={() => onCheckOne(doc.id)}
                              disabled={isLoading}
                            >
                              <FactCheckOutlinedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}

                        {canDownload && (
                          <Tooltip title="Скачать ответный файл">
                            <IconButton
                              size="small"
                              aria-label="Скачать ответный файл"
                              onClick={() => onDownloadResponse(doc)}
                              disabled={isLoading}
                            >
                              <DownloadRoundedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}

                        {/* 🆕 Удаление — если есть право и статус позволяет */}
                        {canDelete && doc.status !== "Checking" && (
                          <Tooltip title="Удалить документ">
                            <IconButton
                              size="small"
                              className={styles.deleteAction}
                              aria-label="Удалить документ"
                              onClick={() => onDelete(doc)}
                              disabled={isLoading}
                            >
                              <DeleteOutlineRoundedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}

                        {/* Заглушка "—" — если нет ни одного действия */}
                        {!isCheckable &&
                          !canDownload &&
                          (!canDelete || doc.status === "Checking") && (
                            <span className={styles.noActions}>—</span>
                          )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ============================== */}
      {/* Пагинация снизу */}
      {/* ============================== */}
      <div className={styles.paginationRow}>
        <div className={styles.pageSizeBlock}>
          <span>Показывать по:</span>
          <select
            aria-label="Документов на странице"
            className={styles.pageSizeSelect}
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.currentTarget.value))}
            disabled={isLoading}
          >
            {[25, 50, 100, 200].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.pageNumbers}>
          <IconButton
            size="small"
            aria-label="Предыдущая страница"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1 || isLoading}
          >
            <ChevronLeftIcon fontSize="small" />
          </IconButton>

          {getPageNumbers().map((num, i) =>
            num === "ellipsis" ? (
              <span key={`e-${i}`} className={styles.ellipsis}>
                …
              </span>
            ) : (
              <button
                key={num}
                type="button"
                className={`${styles.pageButton} ${
                  num === page ? styles.pageButtonActive : ""
                }`}
                aria-label={`Страница ${num}`}
                aria-current={num === page ? "page" : undefined}
                onClick={() => onPageChange(num)}
                disabled={isLoading}
              >
                {num}
              </button>
            ),
          )}

          <IconButton
            size="small"
            aria-label="Следующая страница"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages || isLoading}
          >
            <ChevronRightIcon fontSize="small" />
          </IconButton>
        </div>
      </div>
    </div>
  );
};
