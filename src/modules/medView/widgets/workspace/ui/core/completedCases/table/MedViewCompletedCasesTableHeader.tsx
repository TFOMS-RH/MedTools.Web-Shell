import type { PaginationState } from "../../../../../../../../shared/types/PaginationState";
import { AppTablePagination } from "../../../../../../../../shared/ui/AppTablePagination/AppTablePagination";
import styles from "./styles.module.scss";

interface MedViewCompletedCasesTableHeaderProps {
  totalCount: number;
  pagination: PaginationState;
  onRowsPerPageChange: (
    _event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  onPageChange: (
    _event: React.MouseEvent<HTMLButtonElement> | null,
    page: number,
  ) => void;
  isLoading: boolean;
  disabled: boolean;
}

export const MedViewCompletedCasesTableHeader = ({
  totalCount,
  pagination,
  onRowsPerPageChange,
  onPageChange,
  isLoading,
  disabled,
}: MedViewCompletedCasesTableHeaderProps) => {
  return (
    <header className={styles.completedCasesTableHeader}>
      <div className={styles.titleGroup}>
        <h2>Законченные случаи</h2>
      </div>
      <div className={styles.pagination}>
        <AppTablePagination
          pagination={pagination}
          totalCount={totalCount}
          onRowsPerPageChange={onRowsPerPageChange}
          onPageChange={onPageChange}
          isLoading={isLoading}
          disabled={disabled}
        />
      </div>
    </header>
  );
};
