// ==========================================
// modules/healthTrack/features/registerDn/HTRegisterDnTable/HTRegisterDnTable.tsx
// ==========================================
import { IconButton } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

import { HTEmptyState } from "../../../ui/HTEmptyState/HTEmptyState";
import { HTTableSkeleton } from "../../../ui/HTTableSkeleton/HTTableSkeleton";

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
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  onOpenDetails: (item: HTRegisterDnItem) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onResetFilters?: () => void;
  isLoading: boolean;
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
  totalCount,
  page,
  pageSize,
  totalPages,
  onOpenDetails,
  onPageChange,
  onPageSizeChange,
  onResetFilters,
  isLoading,
}: HTRegisterDnTableProps) => {
  // Пока грузится и списка нет — скелетон.
  if (isLoading && items.length === 0) {
    return <HTTableSkeleton rows={Math.min(pageSize, 10)} />;
  }

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
    <div className={styles.tableRoot}>
      {/* Инфо-строка */}
      <div className={styles.topBar}>
        <span className={styles.totalLabel}>
          Найдено пациентов:{" "}
          <strong>{totalCount.toLocaleString("ru-RU")}</strong>
        </span>
      </div>

      {/* Таблица */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ЕНП</th>
              <th>ФИО</th>
              <th>Дата рождения</th>
              <th>Пол</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={4} className={styles.emptyCell}>
                  <HTEmptyState
                    compact
                    title="Пациенты не найдены"
                    description="Попробуйте изменить фильтры или сбросить их."
                    action={
                      onResetFilters
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
              items.map((item) => (
                <tr
                  key={item.enp}
                  className={styles.clickableRow}
                  onClick={() => onOpenDetails(item)}
                  title="Открыть карточку пациента"
                >
                  <td>
                    <span className={styles.enpText}>{item.enp}</span>
                  </td>
                  <td>{item.fullName || "—"}</td>
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
                onClick={() => onPageChange(num)}
                disabled={isLoading}
              >
                {num}
              </button>
            ),
          )}

          <IconButton
            size="small"
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
