// ==========================================
// modules/healthTrack/features/registerDn/HTRegisterDnTab.tsx
// ==========================================
import { useCallback, useMemo, useState } from "react";
import { Button } from "@mui/material";
import { getApiError } from "../../../../shared/helpers/getApiError";
import { documentButtonSx } from "../documents/controlsSx";

import { useRegisterDnQuery } from "../../hooks/useRegisterDnQueries";

import {
  HTRegisterDnFilters,
  type HTRegisterDnFiltersValue,
} from "./HTRegisterDnFilters/HTRegisterDnFilters";
import { HTRegisterDnTable } from "./HTRegisterDnTable/HTRegisterDnTable";
import { HTRegisterDnDrawer } from "./HTRegisterDnDrawer/HTRegisterDnDrawer";

import type {
  HTRegisterDnItem,
  HTRegisterDnQueryParams,
} from "../../types/htRegisterDn";

import styles from "./styles.module.scss";

// ==========================================
// Дефолтное состояние фильтров.
// ==========================================
const DEFAULT_FILTERS: HTRegisterDnFiltersValue = {
  searchQuery: "",
  hospitalCode: "",
  diagCode: "",
  period: "",
  status: "",
};

/**
 * Раздел «Регистр ДН».
 */
export const HTRegisterDnTab = () => {
  // ==========================================
  // Состояние UI.
  // ==========================================
  const [filters, setFilters] =
    useState<HTRegisterDnFiltersValue>(DEFAULT_FILTERS);

  const [appliedFilters, setAppliedFilters] =
    useState<HTRegisterDnFiltersValue>(DEFAULT_FILTERS);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  const [openEnp, setOpenEnp] = useState<string | null>(null);

  // ==========================================
  // Параметры запроса.
  // ==========================================
  const queryParams: HTRegisterDnQueryParams = useMemo(() => {
    return {
      searchQuery: appliedFilters.searchQuery.trim() || undefined,
      hospitalCode: appliedFilters.hospitalCode.trim() || undefined,
      diagCode: appliedFilters.diagCode.trim() || undefined,
      period: appliedFilters.period.trim() || undefined,
      status: appliedFilters.status || undefined,
      page,
      pageSize,
      sortBy: "fullName",
      sortDirection: "asc",
    };
  }, [appliedFilters, page, pageSize]);

  // ==========================================
  // Запрос.
  // ==========================================
  const { data, isLoading, isFetching, isPlaceholderData, isError, error, refetch } =
    useRegisterDnQuery(queryParams);
  const requestError = isError ? getApiError(error, "Не удалось загрузить регистр ДН.") : null;
  const hasAppliedFilters = Boolean(queryParams.searchQuery || queryParams.hospitalCode ||
    queryParams.diagCode || queryParams.period || queryParams.status);

  const items = data?.items ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = data?.totalPages ?? 1;

  // ==========================================
  // Обработчики.
  // ==========================================
  const handleApplyFilters = useCallback(() => {
    setAppliedFilters(filters);
    setPage(1);
  }, [filters]);

  const handleResetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setAppliedFilters(DEFAULT_FILTERS);
    setPage(1);
  }, []);

  const handleOpenDetails = useCallback((item: HTRegisterDnItem) => {
    setOpenEnp(item.enp);
  }, []);

  const handleCloseDetails = useCallback(() => {
    setOpenEnp(null);
  }, []);

  const handlePageChange = useCallback(
    (nextPage: number) => {
      if (nextPage < 1 || nextPage > totalPages) return;
      setPage(nextPage);
    },
    [totalPages],
  );

  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size);
    setPage(1);
  }, []);

  // ==========================================
  // Рендер.
  // ==========================================
  return (
    <section className={styles.tabRoot}>
      <header className={styles.header}>
        <div className={styles.headingRow}>
          <h2 className={styles.title}>Регистр ДН</h2>
          <span className={styles.count}>Найдено пациентов: <strong>
            {data && !isPlaceholderData && !isError ? totalCount.toLocaleString("ru-RU") : "—"}
          </strong></span>
        </div>
        <p className={styles.subtitle}>
          Сводный реестр граждан на диспансерном наблюдении
        </p>
      </header>

      <HTRegisterDnFilters
        value={filters}
        onChange={setFilters}
        onSubmit={handleApplyFilters}
        onReset={handleResetFilters}
        disabled={isFetching}
      />

      <p className={styles.requestStatus} role="status">
        {isFetching ? isLoading ? "Загрузка пациентов…" : "Обновление результатов…" : ""}
      </p>

      {requestError ? (
        <div className={styles.errorState} role="alert">
          <h3>{requestError.status === 403 ? "Нет доступа к регистру ДН" : "Не удалось загрузить регистр ДН"}</h3>
          <p>{requestError.message}</p>
          <Button sx={documentButtonSx} variant="outlined" size="small"
            onClick={() => void refetch()} disabled={isFetching}>Повторить</Button>
        </div>
      ) : <HTRegisterDnTable
        items={items}
        page={page}
        pageSize={pageSize}
        totalPages={totalPages}
        onOpenDetails={handleOpenDetails}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onResetFilters={handleResetFilters}
        isLoading={isLoading || isPlaceholderData}
        isFetching={isFetching}
        hasAppliedFilters={hasAppliedFilters}
      />}

      <HTRegisterDnDrawer enp={openEnp} onClose={handleCloseDetails} />
    </section>
  );
};