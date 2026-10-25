import { useEffect } from "react";
import { useMedicalOrganizationsQuery } from "../../../model/queries/useMedicalOrganizationsQuery";
import { useBillingPeriodsQuery } from "../../../model/queries/useBillingPeriodsQuery";
import { useRControlWorkspacePanelStore } from "../../../model/store/useRControlWorkspacePanelStore";
import { TargetDbToggle } from "../../../../../../../shared/ui/TargetDbToggle/TargetDbToggle";
import { MenuItem, Select } from "@mui/material";
import styles from "./styles.module.scss";

export const RControlWorkspacePanel = () => {
  const {
    targetDb,
    selectedMedicalOrganization: organizationCode,
    selectedBillingYear: billingYear,
    selectedBillingMonth,
    selectTargetDb,
    selectMedicalOrganization,
    selectBillingYear,
    selectBillingMonth,
  } = useRControlWorkspacePanelStore();

  const organizations = useMedicalOrganizationsQuery(targetDb);
  const periods = useBillingPeriodsQuery(organizationCode, targetDb);

  useEffect(() => {
    if (!organizations.isSuccess || organizations.isFetching || organizationCode === null)
      return;
    const current = useRControlWorkspacePanelStore.getState();
    if (current.targetDb !== targetDb || current.selectedMedicalOrganization !== organizationCode)
      return;
    if (!organizations.data.some(item => item.medicalOrganizationCode === organizationCode)) {
      current.selectTargetDb(targetDb);
    }
  }, [organizations.data, organizations.isSuccess, organizations.isFetching,
    organizationCode, targetDb]);

  useEffect(() => {
    if (!periods.isSuccess || periods.isFetching || organizationCode === null || billingYear === null)
      return;
    const current = useRControlWorkspacePanelStore.getState();
    if (
      current.targetDb !== targetDb || current.selectedMedicalOrganization !== organizationCode ||
      current.selectedBillingYear !== billingYear || current.selectedBillingMonth !== selectedBillingMonth
    ) return;
    const period = periods.data.find(item => item.billingYear === billingYear);
    if (!period) current.selectMedicalOrganization(organizationCode);
    else if (selectedBillingMonth !== null && !period.billingMonths.includes(selectedBillingMonth)) {
      current.selectBillingYear(billingYear);
    }
  }, [periods.data, periods.isSuccess, periods.isFetching, organizationCode,
    billingYear, selectedBillingMonth, targetDb]);
  const medicalOrganizations = organizations.data ?? [];
  const billingPeriods = periods.data ?? [];
  const months =
    billingYear === null
      ? []
      : (billingPeriods.find((period) => period.billingYear === billingYear)
        ?.billingMonths ?? []);
  const organizationHint =
    targetDb === null
      ? "Сначала выберите источник данных."
      : organizations.isLoading
        ? "Загрузка организаций…"
        : organizations.isError
          ? "Не удалось загрузить организации: " +
          (organizations.error?.message ?? "Неизвестная ошибка")
          : organizations.isFetching
            ? "Обновление организаций…"
            : medicalOrganizations.length === 0
              ? "В выбранном источнике нет организаций."
              : undefined;
  const periodHint =
    organizationCode === null
      ? "Сначала выберите организацию."
      : periods.isLoading
        ? "Загрузка доступных периодов…"
        : periods.isError
          ? "Не удалось загрузить периоды: " +
          (periods.error?.message ?? "Неизвестная ошибка")
          : periods.isFetching
            ? "Обновление доступных периодов…"
            : billingPeriods.length === 0
              ? "Для выбранной организации нет доступных периодов."
              : undefined;
  const monthHint =
    organizationCode === null
      ? "Сначала выберите организацию."
      : periods.isLoading
        ? "Загрузка доступных периодов…"
        : periods.isError
          ? "Не удалось загрузить месяцы: " +
          (periods.error?.message ?? "Неизвестная ошибка")
          : periods.isFetching
            ? "Обновление доступных периодов…"
            : billingYear === null
              ? "Сначала выберите год."
              : months.length === 0
                ? "Для выбранного года нет доступных месяцев."
                : undefined;
  const organizationDisabled =
    targetDb === null || medicalOrganizations.length === 0;
  const yearDisabled = organizationCode === null || billingPeriods.length === 0;
  const monthDisabled = billingYear === null || months.length === 0;

  return (
    <section className={styles.filtersPanelRoot} aria-labelledby="rcontrol-context-title">
      <header className={styles.header}>
        <h3 id="rcontrol-context-title">Рабочий контекст</h3>
        <p>Выберите источник, организацию и расчётный период для просмотра счетов.</p>
      </header>
      <div className={styles.controls}>
        <div className={styles.sourceGroup}>
          <p className={styles.label}>Источник данных</p>
          <div className={styles.sourceControl}>
            <TargetDbToggle
              value={targetDb ?? ""}
              onChange={(
                _event: React.MouseEvent<HTMLElement>,
                newValue: string,
              ) => {
                if (newValue === "SMODB18" || newValue === "INOGOROD18") {
                  selectTargetDb(newValue);
                }
              }}
            />
          </div>
        </div>
        <div className={styles.actions}>
          <div className={styles.selectsGroup}>
            <div
              className={styles.lookupField}
              role="group"
              aria-label="Организация"
              aria-disabled={organizationDisabled}
              aria-busy={organizations.isFetching}
              aria-describedby={
                organizationHint ? "rcontrol-organizations-state" : undefined
              }
            >
              <label id="rcontrol-organization-label" htmlFor="rcontrol-organization" className={styles.label}>Организация</label>
              <div inert={organizationDisabled}>
                <Select
                  id="rcontrol-organization"
                  labelId="rcontrol-organization-label"
                  fullWidth
                  displayEmpty
                  disabled={organizationDisabled}
                  error={organizations.isError}
                  className={styles.select}
                  title={medicalOrganizations.find(item => item.medicalOrganizationCode === organizationCode)?.medicalOrganizationName ?? undefined}
                  inputProps={{ "aria-describedby": organizationHint ? "rcontrol-organizations-state" : undefined }}
                  MenuProps={{ slotProps: { paper: { className: styles.options } } }}
                  value={medicalOrganizations.some(item => item.medicalOrganizationCode === organizationCode)
                    ? organizationCode ?? "" : ""}
                  onChange={(event) => {
                    selectMedicalOrganization(event.target.value);
                  }}
                >
                  <MenuItem value="" disabled>Выберите организацию</MenuItem>
                  {medicalOrganizations.map(entity => (
                    <MenuItem value={entity.medicalOrganizationCode} key={entity.medicalOrganizationCode}>
                      {entity.medicalOrganizationName?.trim()
                        ? `${entity.medicalOrganizationCode} — ${entity.medicalOrganizationName}`
                        : entity.medicalOrganizationCode}
                    </MenuItem>
                  ))}
                </Select>
              </div>
              {organizationHint && (
                <p
                  id="rcontrol-organizations-state"
                  role={organizations.isError ? "alert" : "status"}
                  className={
                    organizations.isError ? styles.lookupError : styles.lookupHint
                  }
                >
                  {organizationHint}
                </p>
              )}
            </div>

            <div
              className={styles.lookupField}
              role="group"
              aria-label="Год"
              aria-disabled={yearDisabled}
              aria-busy={periods.isFetching}
              aria-describedby={periodHint ? "rcontrol-periods-state" : undefined}
            >
              <label id="rcontrol-year-label" htmlFor="rcontrol-year" className={styles.label}>Год</label>
              <div inert={yearDisabled}>
                <Select
                  id="rcontrol-year"
                  labelId="rcontrol-year-label"
                  fullWidth
                  displayEmpty
                  disabled={yearDisabled}
                  error={periods.isError}
                  className={styles.select}
                  inputProps={{ "aria-describedby": periodHint ? "rcontrol-periods-state" : undefined }}
                  MenuProps={{ slotProps: { paper: { className: styles.options } } }}
                  value={billingPeriods.some(period => period.billingYear === billingYear)
                    ? billingYear?.toString() ?? "" : ""}
                  onChange={(event) => {
                    const value = event.target.value;
                    if (value !== "" && Number.isFinite(Number(value))) {
                      selectBillingYear(parseInt(value));
                    }
                  }}
                >
                  <MenuItem value="" disabled>Выберите год</MenuItem>
                  {billingPeriods.map(period => <MenuItem key={period.billingYear} value={period.billingYear.toString()}>{period.billingYear}</MenuItem>)}
                </Select>
              </div>
              {periodHint && (
                <p
                  id="rcontrol-periods-state"
                  role={periods.isError ? "alert" : "status"}
                  className={
                    periods.isError ? styles.lookupError : styles.lookupHint
                  }
                >
                  {periodHint}
                </p>
              )}
            </div>

            <div
              className={styles.lookupField}
              role="group"
              aria-label="Месяц"
              aria-disabled={monthDisabled}
              aria-busy={periods.isFetching}
              aria-describedby={monthHint ? "rcontrol-months-state" : undefined}
            >
              <label id="rcontrol-month-label" htmlFor="rcontrol-month" className={styles.label}>Месяц</label>
              <div inert={monthDisabled}>
                <Select
                  id="rcontrol-month"
                  labelId="rcontrol-month-label"
                  fullWidth
                  displayEmpty
                  disabled={monthDisabled}
                  error={periods.isError}
                  className={styles.select}
                  inputProps={{ "aria-describedby": monthHint ? "rcontrol-months-state" : undefined }}
                  MenuProps={{ slotProps: { paper: { className: styles.options } } }}
                  value={
                    selectedBillingMonth !== null &&
                      months.includes(selectedBillingMonth)
                      ? selectedBillingMonth.toString()
                      : ""
                  }
                  onChange={(event) => {
                    const value = event.target.value;
                    if (value !== "" && Number.isFinite(Number(value))) {
                      selectBillingMonth(parseInt(value));
                    }
                  }}
                >
                  <MenuItem value="" disabled>Выберите месяц</MenuItem>
                  {months.map(month => <MenuItem key={month} value={month.toString()}>{month}</MenuItem>)}
                </Select>
              </div>
              {monthHint && (
                <p
                  id="rcontrol-months-state"
                  role={periods.isError ? "alert" : "status"}
                  className={
                    periods.isError ? styles.lookupError : styles.lookupHint
                  }
                >
                  {monthHint}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
