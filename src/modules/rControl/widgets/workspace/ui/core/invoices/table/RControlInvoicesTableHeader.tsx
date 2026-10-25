import { useRControlWorkspacePanelStore } from "../../../../model/store/useRControlWorkspacePanelStore";
import type { DataState } from "../../../../../../../../shared/types/DataState";
import type { PaginationState } from "../../../../../../../../shared/types/PaginationState";
import { AppTablePagination } from "../../../../../../../../shared/ui/AppTablePagination/AppTablePagination";
import { SearchInput } from "../../../../../../../../shared/ui/SearchInput/SearchInput";
import { StatusBadge } from "../../../../../../../../shared/ui/StatusBadge/StatusBadge";
import { useRControlWorkspaceStore } from "../../../../model/store/useRControlWorkspaceStore";
import { useEffect, useState } from "react";
import styles from "./styles.module.scss";

interface RControlInvoicesTableHeaderProps {
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

export const RControlInvoicesTableHeader = ({
  totalCount,
  state,
  pagination,
  onRowsPerPageChange,
  onPageChange,
  isLoading,
  disabled,
}: RControlInvoicesTableHeaderProps) => {
  const { setInvoicesSearch, invoiceTableSearchString } =
    useRControlWorkspaceStore();
  const {
    targetDb,
    selectedMedicalOrganization,
    selectedBillingYear,
    selectedBillingMonth,
  } = useRControlWorkspacePanelStore();
  const [searchValue, setSearchValue] = useState(invoiceTableSearchString);
  useEffect(
    () => setSearchValue(invoiceTableSearchString),
    [
      invoiceTableSearchString,
      targetDb,
      selectedMedicalOrganization,
      selectedBillingYear,
      selectedBillingMonth,
    ],
  );

  const onChangeSearchValue = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(event.target.value);
  };

  const onSearch = () => {
    setInvoicesSearch(searchValue);
  };

  return (
    <header className={styles.invoicesTableHeader}>
      <div className={styles.titleGroup}>
        <h3>Реестр счетов</h3>
        <StatusBadge state={state} />
      </div>
      <div className={styles.toolbar}>
        <div className={styles.search}>
          <SearchInput
            placeholder="Поиск среди счетов — Enter"
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
