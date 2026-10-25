import { useEffect } from "react";
import { useMedicalOrganizationsQuery } from "../../../model/queries/useMedicalOrganizationsQuery";
import { useBillingPeriodsQuery } from "../../../model/queries/useBillingPeriodsQuery";
import { useRControlWorkspacePanelStore } from "../../../model/store/useRControlWorkspacePanelStore";
import { TargetDbToggle } from "../../../../../../../shared/ui/TargetDbToggle/TargetDbToggle";
import { MedToolsSelect } from "../../../../../../../shared/ui/medTools/inputs/MedToolsSelect";
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
    <section className={styles.filtersPanelRoot}>
      <div className={styles.sourceGroup}>
        <p className={styles.title}>Источник данных</p>
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
            <div inert={organizationDisabled}>
              <MedToolsSelect
                label="Организация"
                value={medicalOrganizations.some(item => item.medicalOrganizationCode === organizationCode)
                  ? organizationCode ?? "" : ""}
                options={medicalOrganizations.map((entity) => ({
                  label: entity.medicalOrganizationName?.trim()
                    ? `${entity.medicalOrganizationCode} — ${entity.medicalOrganizationName}`
                    : entity.medicalOrganizationCode,
                  value: entity.medicalOrganizationCode,
                }))}
                onChange={(newValue: string) => {
                  selectMedicalOrganization(newValue);
                }}
                isLoading={organizations.isLoading}
              />
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
            <div inert={yearDisabled}>
              <MedToolsSelect
                label="Год"
                value={billingPeriods.some(period => period.billingYear === billingYear)
                  ? billingYear?.toString() ?? "" : ""}
                options={billingPeriods.map((period) => ({
                  label: period.billingYear.toString(),
                  value: period.billingYear.toString(),
                }))}
                onChange={(value: string) => {
                  if (value !== "" && Number.isFinite(Number(value))) {
                    selectBillingYear(parseInt(value));
                  }
                }}
                isLoading={periods.isLoading}
              />
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
            <div inert={monthDisabled}>
              <MedToolsSelect
                label="Месяц"
                value={
                  selectedBillingMonth !== null &&
                  months.includes(selectedBillingMonth)
                    ? selectedBillingMonth.toString()
                    : ""
                }
                options={months.map((month) => ({
                  label: month.toString(),
                  value: month.toString(),
                }))}
                onChange={(value: string) => {
                  if (value !== "" && Number.isFinite(Number(value))) {
                    selectBillingMonth(parseInt(value));
                  }
                }}
                isLoading={periods.isLoading}
              />
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
    </section>
  );
};
