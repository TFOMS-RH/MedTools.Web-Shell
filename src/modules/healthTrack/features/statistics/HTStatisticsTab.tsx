// ==========================================
// modules/healthTrack/features/statistics/HTStatisticsTab.tsx
// ==========================================
import { useCallback, useMemo, useState } from "react";
import { Button, CircularProgress } from "@mui/material";
import { documentButtonSx } from "../documents/controlsSx";
import { getApiError } from "../../../../shared/helpers/getApiError";

import {
  HTDateRangeFilter,
  type HTDateRangeValue,
} from "../../ui/HTDateRangeFilter/HTDateRangeFilter";
import { HTStatisticsKpi } from "./components/HTStatisticsKpi/HTStatisticsKpi";
import { HTStatisticsTopMos } from "./components/HTStatisticsTopMos/HTStatisticsTopMos";
import { HTStatisticsTopDiagnoses } from "./components/HTStatisticsTopDiagnoses/HTStatisticsTopDiagnoses";
import { HTStatisticsByPeriod } from "./components/HTStatisticsByPeriod/HTStatisticsByPeriod";
import { HTStatisticsByAge } from "./components/HTStatisticsByAge/HTStatisticsByAge";

import { useStatisticsOverviewQuery } from "../../hooks/useStatisticsQuery";

import type { HTStatisticsQueryParams } from "../../types/htStatistics";

import styles from "./styles.module.scss";

// ==========================================
// Дефолтный фильтр.
// ==========================================
const DEFAULT_FILTER: HTDateRangeValue = {
  periodFrom: "",
  periodTo: "",
};

/**
 * Раздел «Статистика».
 *
 * Дашборд с аналитикой по региону:
 *  - KPI-плитки;
 *  - топ-10 МО;
 *  - топ-10 диагнозов;
 *  - динамика по периодам;
 *  - распределение по возрастным группам.
 *
 * Роли: Admin + TFOMS.
 */
export const HTStatisticsTab = () => {
  // ==========================================
  // Состояние фильтра.
  // ==========================================
  const [filter, setFilter] = useState<HTDateRangeValue>(DEFAULT_FILTER);
  const [appliedFilter, setAppliedFilter] =
    useState<HTDateRangeValue>(DEFAULT_FILTER);

  // ==========================================
  // Параметры запроса.
  // ==========================================
  const queryParams: HTStatisticsQueryParams = useMemo(() => {
    return {
      periodFrom: appliedFilter.periodFrom.trim() || undefined,
      periodTo: appliedFilter.periodTo.trim() || undefined,
    };
  }, [appliedFilter]);

  // ==========================================
  // Запрос.
  // ==========================================
  const { data, isLoading, isFetching, isPlaceholderData, isError, error, refetch } =
    useStatisticsOverviewQuery(queryParams);
  const displayedData = !isPlaceholderData && !isError ? data : undefined;
  const requestError = isError ? getApiError(error, "Не удалось загрузить статистику.") : null;

  // ==========================================
  // Обработчики.
  // ==========================================
  const handleApplyFilter = useCallback((value: HTDateRangeValue) => {
    setAppliedFilter(value);
  }, []);

  const handleResetFilter = useCallback(() => {
    setFilter(DEFAULT_FILTER);
    setAppliedFilter(DEFAULT_FILTER);
  }, []);

  // ==========================================
  // Рендер.
  // ==========================================
  return (
    <section className={styles.tabRoot} aria-busy={isFetching}>
      <section className={styles.surface} aria-labelledby="ht-statistics-heading">
        <header className={styles.header}>
          <h2 id="ht-statistics-heading" className={styles.title}>Статистика</h2>
          <p className={styles.subtitle}>Аналитика по регистру ДН и загруженным документам</p>
        </header>
        <HTDateRangeFilter value={filter} onChange={setFilter} onSubmit={handleApplyFilter}
          onReset={handleResetFilter} disabled={isFetching} />
        {displayedData && <p className={styles.range} data-statistics-range>
          {displayedData.periodFrom && displayedData.periodTo
            ? "Период данных: " + displayedData.periodFrom + " — " + displayedData.periodTo
            : displayedData.periodFrom ? "Период данных: с " + displayedData.periodFrom
            : displayedData.periodTo ? "Период данных: по " + displayedData.periodTo
            : "Диапазон данных не указан сервером."}
        </p>}
        <div className={styles.requestStatus} role="status">
          {isFetching && <><CircularProgress size={18} sx={{ color: "var(--mt-healthtrack-accent)" }} />
            {isLoading ? "Загрузка статистики…" : isPlaceholderData
              ? "Загрузка статистики за выбранный период…" : "Обновление статистики…"}
          </>}
        </div>
        {requestError && <div className={styles.errorState} role="alert">
          <h3>Не удалось загрузить статистику</h3><p>{requestError.message}</p>
          <Button sx={documentButtonSx} variant="outlined" size="small" disabled={isFetching}
            onClick={() => void refetch()}>Повторить</Button>
        </div>}
      </section>

      {displayedData && <>
        <HTStatisticsKpi kpi={displayedData.kpi} />
        <div className={styles.chartsGrid}>
          <HTStatisticsTopMos data={displayedData.topMos} />
          <HTStatisticsTopDiagnoses data={displayedData.topDiagnoses} />
          <HTStatisticsByPeriod data={displayedData.byPeriod} />
          <HTStatisticsByAge data={displayedData.byAgeGroup} />
        </div>
      </>}
    </section>
  );
};
