import { useRControlWorkspacePanelStore } from "../../../../model/store/useRControlWorkspacePanelStore";
import type { PaginationState } from "../../../../../../../../shared/types/PaginationState";
import type { DataState } from "../../../../../../../../shared/types/DataState";
import { AppTablePagination } from "../../../../../../../../shared/ui/AppTablePagination/AppTablePagination";
import { useRControlWorkspaceStore } from "../../../../model/store/useRControlWorkspaceStore";
import { SearchInput } from "../../../../../../../../shared/ui/SearchInput/SearchInput";
import { StatusBadge } from "../../../../../../../../shared/ui/StatusBadge/StatusBadge";
import { useEffect, useState } from "react";
import styles from "./styles.module.scss";

interface RControlCompletedCasesTableHeaderProps {
  totalCount: number;
  state: DataState;
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

export const RControlCompletedCasesTableHeader = ({
  totalCount,
  state,
  pagination,
  onRowsPerPageChange,
  onPageChange,
  isLoading,
  disabled,
}: RControlCompletedCasesTableHeaderProps) => {
  const {
    setCompletedCasesSearch,
    completedCasesTableSearchString,
    selectedInvoiceUid,
  } = useRControlWorkspaceStore();
  const {
    targetDb,
    selectedMedicalOrganization,
    selectedBillingYear,
    selectedBillingMonth,
  } = useRControlWorkspacePanelStore();
  const [searchValue, setSearchValue] = useState(
    completedCasesTableSearchString,
  );
  useEffect(
    () => setSearchValue(completedCasesTableSearchString),
    [
      completedCasesTableSearchString,
      targetDb,
      selectedMedicalOrganization,
      selectedBillingYear,
      selectedBillingMonth,
      selectedInvoiceUid,
    ],
  );

  const onChangeSearchValue = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(event.target.value);
  };

  const onSearch = () => {
    setCompletedCasesSearch(searchValue);
  };

  return (
    <header className={styles.completedCasesTableHeader}>
      <div className={styles.titleGroup}>
        <h2 id="rcontrol-completed-heading">Законченные случаи</h2>
        <StatusBadge state={state} />
      </div>
      <div className={styles.toolbar}>
        <div className={styles.search}>
          <SearchInput
            placeholder="Поиск внутри счёта — Enter"
            searchValue={searchValue}
            onChange={onChangeSearchValue}
            onSearch={onSearch}
          />
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
      </div>
    </header>
  );
};
