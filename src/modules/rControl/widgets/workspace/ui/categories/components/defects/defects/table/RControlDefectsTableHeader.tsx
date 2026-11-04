import { AppTablePagination } from "../../../../../../../../../../shared/ui/AppTablePagination/AppTablePagination";
import styles from "./styles.module.scss";
import categoryStyles from "../../styles.module.scss";

interface RControlDefectsTableHeaderProps {
  page: number;
  pageSize: number;
  totalCount: number;
  isFetching: boolean;
  onPageChange: (
    _event: React.MouseEvent<HTMLButtonElement> | null,
    page: number,
  ) => void;
  onRowsPerPageChange: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
}

export const RControlDefectsTableHeader = ({
  page,
  pageSize,
  totalCount,
  isFetching,
  onPageChange,
  onRowsPerPageChange,
}: RControlDefectsTableHeaderProps) => {
  return (
    <header className={styles.defectsHeader}>
      <h3 id="rcontrol-defects-heading" className={categoryStyles.sectionHeading}>Дефекты</h3>
      <div className={styles.pagination}>
        <AppTablePagination
          onPageChange={onPageChange}
          onRowsPerPageChange={onRowsPerPageChange}
          pagination={{
            page: page,
            pageSize: pageSize,
          }}
          totalCount={totalCount}
          disabled={isFetching}
        />
      </div>
    </header>
  );
};
