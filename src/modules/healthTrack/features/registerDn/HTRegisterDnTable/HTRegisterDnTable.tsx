// ==========================================
// modules/healthTrack/features/registerDn/HTRegisterDnTable/HTRegisterDnTable.tsx
// ==========================================
import { Button, IconButton, Skeleton } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

import { documentButtonSx } from "../../documents/controlsSx";

import {
  formatGender,
  type HTRegisterDnItem,
} from "../../../types/htRegisterDn";

import styles from "./styles.module.scss";

// ==========================================
// Пропсы.
// ==========================================
interface HTRegisterDnTableProps {
  items: HTRegisterDnItem[];
  page: number;
  pageSize: number;
  totalPages: number;
  onOpenDetails: (item: HTRegisterDnItem) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onResetFilters?: () => void;
  isLoading: boolean;
  isFetching: boolean;
  hasAppliedFilters: boolean;
}

// ==========================================
// Форматирование даты.
// ==========================================
const formatDate = (iso: string | null): string => {
  if (!iso) return "—";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`;
};

/**
 * Таблица реестра ДН — компактный набор колонок:
 * ЕНП, ФИО, ДР, пол.
 */
export const HTRegisterDnTable = ({
  items,
  page,
  pageSize,
  totalPages,
  onOpenDetails,
  onPageChange,
  onPageSizeChange,
  onResetFilters,
  isLoading,
  isFetching,
  hasAppliedFilters,
}: HTRegisterDnTableProps) => {
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

  return (
    <div className={styles.tableRoot} aria-busy={isFetching}>
      {/* Таблица */}
      <div className={"mt-table-viewport mt-table-viewport--scrollable " + styles.tableWrapper}
        role="region" aria-label="Пациенты регистра ДН, прокручиваемая таблица" tabIndex={0}>
        <table className={"mt-table " + styles.table} aria-label="Пациенты регистра ДН">
          <thead>
            <tr>
              <th scope="col">ЕНП</th>
              <th scope="col">ФИО</th>
              <th scope="col">Дата рождения</th>
              <th scope="col">Пол</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: Math.min(pageSize, 10) }, (_, index) => (
                <tr key={index} className="noneHover">
                  {["enp", "name", "birthDate", "gender"].map(column => (
                    <td key={column}><Skeleton variant="text" width="80%" /></td>
                  ))}
                </tr>
              ))
            ) : items.length === 0 ? (
              <tr className="noneHover">
                <td colSpan={4} className={styles.emptyCell}>
                  <div className={styles.emptyState}>
                    <h3>{hasAppliedFilters ? "Пациенты не найдены" : "Регистр ДН пуст"}</h3>
                    <p>{hasAppliedFilters ? "Попробуйте изменить фильтры или сбросить их." : "В регистре пока нет пациентов."}</p>
                    {hasAppliedFilters && onResetFilters && (
                      <Button sx={documentButtonSx} variant="outlined" size="small"
                        disabled={isFetching} onClick={onResetFilters}>Сбросить фильтры</Button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr
                  key={item.enp}
                  className={isFetching ? "" : "mt-table__row--interactive"}
                  onClick={() => { if (!isFetching) onOpenDetails(item); }}
                  title="Открыть карточку пациента"
                >
                  <td>
                    <span className={styles.enpText}>{item.enp}</span>
                  </td>
                  <td><button type="button" className={styles.patientName} disabled={isFetching}
                    onClick={(event) => { event.stopPropagation(); onOpenDetails(item); }}
                    aria-label={"Открыть карточку пациента: " + (item.fullName || item.enp)}>
                    {item.fullName || "—"}
                  </button></td>
                  <td>{formatDate(item.birthDate)}</td>
                  <td>{formatGender(item.gender)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Пагинация */}
      <div className={styles.paginationRow}>
        <div className={styles.pageSizeBlock}>
          <span>Показывать по:</span>
          <select
            className={styles.pageSizeSelect}
            aria-label="Количество пациентов на странице"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.currentTarget.value))}
            disabled={isFetching}
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
            onClick={() => onPageChange(page - 1)}
            aria-label="Предыдущая страница"
            disabled={page <= 1 || isFetching}
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
                aria-label={"Страница " + num}
                aria-current={num === page ? "page" : undefined}
                type="button"
                className={`${styles.pageButton} ${
                  num === page ? styles.pageButtonActive : ""
                }`}
                onClick={() => onPageChange(num)}
                disabled={isFetching}
              >
                {num}
              </button>
            ),
          )}

          <IconButton
            size="small"
            onClick={() => onPageChange(page + 1)}
            aria-label="Следующая страница"
            disabled={page >= totalPages || isFetching}
          >
            <ChevronRightIcon fontSize="small" />
          </IconButton>
        </div>
      </div>
    </div>
  );
};
