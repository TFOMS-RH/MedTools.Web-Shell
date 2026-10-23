import type { FiltersDraft } from "../../../workspace/model/types/FiltersDraft";
import { countActiveFilters } from "../../../../../../shared/helpers/isFilterActive";
import { Divider } from "../../../../../../components/ui/Divider/Divider";
import { MedViewButton } from "../../../../../../shared/ui/medView/buttons/MedViewButton";
import { useMedViewFiltersStore } from "../../model/stores/useMedViewFiltersStore";
import { useMedViewWorkspaceStore } from "../../../workspace/model/stores/useMedViewWorkspaceStore";
import { TargetDbToggle } from "../../../../../../shared/ui/TargetDbToggle/TargetDbToggle";
import styles from "./styles.module.scss";

interface FiltersPanelProps {
  filtersDraft: FiltersDraft;
}

export const MedViewFiltersPanel = ({ filtersDraft }: FiltersPanelProps) => {
  const { resetWorkspace } = useMedViewWorkspaceStore();
  const {
    applyFilters,
    selectFilterGroup,
    selectTargetDb,
    selectedfilterGroupId,
    targetDb,
  } = useMedViewFiltersStore();

  const personalGroupActiveFiltersCount = countActiveFilters(
    filtersDraft.person,
  );

  const medicalCaseDetailsGroupActiveFiltersCount = countActiveFilters(
    filtersDraft.medicalCaseDetails,
  );

  const oncologyGroupActiveFiltersCount = countActiveFilters(
    filtersDraft.oncology,
  );

  const prescriptionGroupActiveFilters = countActiveFilters(
    filtersDraft.prescription,
  );

  const clinicalGroupActiveFiltersCount = countActiveFilters(
    filtersDraft.clinicalGroups,
  );

  const providedServicesGroupActiveFiltersCount = countActiveFilters(
    filtersDraft.providedServices,
  );

  const sanctionGroupActiveFiltersCount = countActiveFilters(
    filtersDraft.sanction,
  );

  const diseaseGroupActiveFilterCount = countActiveFilters(
    filtersDraft.diseases,
  );

  const internalGroupActiveFiltersCount = countActiveFilters(
    filtersDraft.inrernalService,
  );

  const handleToggleChange = (
    _event: React.MouseEvent<HTMLElement>,
    newValue: string,
  ) => {
    if (newValue === "SMODB18" || newValue === "INOGOROD18") {
      resetWorkspace();
      selectTargetDb(newValue);
    }
  };

  return (
    <section className={styles.filtersPanelRoot}>
      <div className={styles.filtersGroup}>
        <div className={styles.sourceToggle}>
          <header className={styles.sourceToggleHeader}>
            <h2>Источник данных</h2>
          </header>
          <TargetDbToggle
            value={targetDb ?? ""}
            onChange={handleToggleChange}
          />
        </div>
        <Divider />
        <div className={styles.filtersList}>
          <header className={styles.filtersListHeader}>
            <h2>Группы фильтров</h2>
          </header>
          <ul>
            <li>
              <button
                type="button"
                className={
                  selectedfilterGroupId === "persons"
                    ? styles.selectedRow
                    : undefined
                }
                onClick={() => selectFilterGroup("persons")}
                aria-current={
                  selectedfilterGroupId === "persons" ? "true" : undefined
                }
              >
                <span className={styles.namingGroup}>Персональные данные</span>
                {personalGroupActiveFiltersCount > 0 && (
                  <span className={styles.counter}>
                    {personalGroupActiveFiltersCount}
                  </span>
                )}
              </button>
            </li>

            <li>
              <button
                type="button"
                className={
                  selectedfilterGroupId === "case-details"
                    ? styles.selectedRow
                    : undefined
                }
                onClick={() => selectFilterGroup("case-details")}
                aria-current={
                  selectedfilterGroupId === "case-details" ? "true" : undefined
                }
              >
                <span className={styles.namingGroup}>Детали медицинского случая</span>
                {medicalCaseDetailsGroupActiveFiltersCount > 0 && (
                  <span className={styles.counter}>
                    {medicalCaseDetailsGroupActiveFiltersCount}
                  </span>
                )}
              </button>
            </li>

            <li>
              <button
                type="button"
                className={
                  selectedfilterGroupId === "oncology"
                    ? styles.selectedRow
                    : undefined
                }
                onClick={() => selectFilterGroup("oncology")}
                aria-current={
                  selectedfilterGroupId === "oncology" ? "true" : undefined
                }
              >
                <span className={styles.namingGroup}>Онкология</span>
                {oncologyGroupActiveFiltersCount > 0 && (
                  <span className={styles.counter}>
                    {oncologyGroupActiveFiltersCount}
                  </span>
                )}
              </button>
            </li>
            <li>
              <button
                type="button"
                className={
                  selectedfilterGroupId === "prescriptions"
                    ? styles.selectedRow
                    : undefined
                }
                onClick={() => selectFilterGroup("prescriptions")}
                aria-current={
                  selectedfilterGroupId === "prescriptions" ? "true" : undefined
                }
              >
                <span className={styles.namingGroup}>Назначения и направления</span>
                {prescriptionGroupActiveFilters > 0 && (
                  <span className={styles.counter}>
                    {prescriptionGroupActiveFilters}
                  </span>
                )}
              </button>
            </li>
            <li>
              <button
                type="button"
                className={
                  selectedfilterGroupId === "clinical-groups"
                    ? styles.selectedRow
                    : undefined
                }
                onClick={() => selectFilterGroup("clinical-groups")}
                aria-current={
                  selectedfilterGroupId === "clinical-groups" ? "true" : undefined
                }
              >
                <span className={styles.namingGroup}>Клинические группы и ВМП</span>
                {clinicalGroupActiveFiltersCount > 0 && (
                  <span className={styles.counter}>
                    {clinicalGroupActiveFiltersCount}
                  </span>
                )}
              </button>
            </li>
            <li>
              <button
                type="button"
                className={
                  selectedfilterGroupId === "provided-services"
                    ? styles.selectedRow
                    : undefined
                }
                onClick={() => selectFilterGroup("provided-services")}
                aria-current={
                  selectedfilterGroupId === "provided-services" ? "true" : undefined
                }
              >
                <span className={styles.namingGroup}>Оказанные услуги</span>
                {providedServicesGroupActiveFiltersCount > 0 && (
                  <span className={styles.counter}>
                    {providedServicesGroupActiveFiltersCount}
                  </span>
                )}
              </button>
            </li>
            <li>
              <button
                type="button"
                className={
                  selectedfilterGroupId === "sanctions"
                    ? styles.selectedRow
                    : undefined
                }
                onClick={() => selectFilterGroup("sanctions")}
                aria-current={
                  selectedfilterGroupId === "sanctions" ? "true" : undefined
                }
              >
                <span className={styles.namingGroup}>Санкции</span>
                {sanctionGroupActiveFiltersCount > 0 && (
                  <span className={styles.counter}>
                    {sanctionGroupActiveFiltersCount}
                  </span>
                )}
              </button>
            </li>
            <li>
              <button
                type="button"
                className={
                  selectedfilterGroupId === "ICD"
                    ? styles.selectedRow
                    : undefined
                }
                onClick={() => selectFilterGroup("ICD")}
                aria-current={
                  selectedfilterGroupId === "ICD" ? "true" : undefined
                }
              >
                <span className={styles.namingGroup}>МКБ</span>
                {diseaseGroupActiveFilterCount > 0 && (
                  <span className={styles.counter}>
                    {diseaseGroupActiveFilterCount}
                  </span>
                )}
              </button>
            </li>
            <li>
              <button
                type="button"
                className={
                  selectedfilterGroupId === "internal-service"
                    ? styles.selectedRow
                    : undefined
                }
                onClick={() => selectFilterGroup("internal-service")}
                aria-current={
                  selectedfilterGroupId === "internal-service" ? "true" : undefined
                }
              >
                <span className={styles.namingGroup}>Служебная информация</span>
                {internalGroupActiveFiltersCount > 0 && (
                  <span className={styles.counter}>
                    {internalGroupActiveFiltersCount}
                  </span>
                )}
              </button>
            </li>
          </ul>
        </div>
      </div>
      <div className={styles.actions}>
        <Divider />
        <div className={styles.actionsField}>
          <MedViewButton
            text="Применить фильтры"
            variant="contained"
            onClick={() => {
              resetWorkspace();
              applyFilters(filtersDraft);
            }}
            disabled={targetDb === null}
          />
        </div>
      </div>
    </section>
  );
};
