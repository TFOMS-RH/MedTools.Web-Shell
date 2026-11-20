import { useId } from "react";
import { Button } from "@mui/material";
import ReplayRoundedIcon from "@mui/icons-material/ReplayRounded";
import type { FiltersDraft } from "../../../workspace/model/types/FiltersDraft";
import type { FilterGroupId } from "../../../workspace/model/types/FilterId";
import { filterGroups, filterGroupIds } from "../../model/filterGroups";
import { countActiveFilters } from "../../../../../../shared/helpers/isFilterActive";
import { Divider } from "../../../../../../components/ui/Divider/Divider";
import { MedViewButton } from "../../../../../../shared/ui/medView/buttons/MedViewButton";
import { useMedViewFiltersStore } from "../../model/stores/useMedViewFiltersStore";
import { useMedViewWorkspaceStore } from "../../../workspace/model/stores/useMedViewWorkspaceStore";
import { MedicalRegisterTypeToggle } from "../../../../../../shared/ui/medTools/toggles/MedicalRegisterTypeToggle";
import { resetFilterActionSx } from "../resetFilterActionSx";
import styles from "./styles.module.scss";

interface FiltersPanelProps {
  filtersDraft: FiltersDraft;
  onSelectGroup: (groupId: FilterGroupId) => void;
  onReset: () => void;
  canReset: boolean;
}

export const MedViewFiltersPanel = ({
  filtersDraft,
  onSelectGroup,
  onReset,
  canReset,
}: FiltersPanelProps) => {
  const registerTypeLabelId = useId();
  const { resetWorkspace } = useMedViewWorkspaceStore();
  const {
    applyFilters,
    selectRegisterType,
    selectedfilterGroupId,
    registerType,
  } = useMedViewFiltersStore();

  const handleToggleChange = (
    _event: React.MouseEvent<HTMLElement>,
    newValue: string,
  ) => {
    if (newValue === "Internal" || newValue === "Interterritorial") {
      resetWorkspace();
      selectRegisterType(newValue);
    }
  };

  return (
    <section className={styles.filtersPanelRoot}>
      <div className={styles.filtersGroup}>
        <div className={styles.registerTypeControl}>
          <h2 id={registerTypeLabelId}>Тип реестра</h2>
          <MedicalRegisterTypeToggle
            value={registerType ?? ""}
            onChange={handleToggleChange}
            labels={{ internal: "Внутренний", interterritorial: "Иногородний" }}
            aria-labelledby={registerTypeLabelId}
          />
        </div>
        <Divider />
        <div className={styles.filtersList}>
          <header className={styles.filtersListHeader}>
            <h2>Группы фильтров</h2>
            <Button
              type="button"
              variant="text"
              size="small"
              disableRipple
              disabled={!canReset}
              onClick={onReset}
              startIcon={<ReplayRoundedIcon />}
              sx={[
                resetFilterActionSx,
                {
                  minHeight: "var(--mt-space-8)",
                  paddingInline: "var(--mt-space-2)",
                  fontFamily: "var(--mt-font-family)",
                  fontSize: "var(--mt-font-body)",
                  textTransform: "none",
                  whiteSpace: "nowrap",
                  "& .MuiButton-startIcon": {
                    marginInline: "0 var(--mt-space-1)",
                  },
                },
              ]}
            >
              Сбросить всё
            </Button>
          </header>
          <ul>
            {filterGroupIds.map((groupId) => {
              const { draftKey, label } = filterGroups[groupId];
              const count = countActiveFilters(filtersDraft[draftKey]);
              const selected = selectedfilterGroupId === groupId;

              return (
                <li key={groupId}>
                  <button
                    type="button"
                    className={selected ? styles.selectedRow : undefined}
                    onClick={() => onSelectGroup(groupId)}
                    aria-current={selected ? "true" : undefined}
                  >
                    <span className={styles.namingGroup}>{label}</span>
                    {count > 0 && <span className={styles.counter}>{count}</span>}
                  </button>
                </li>
              );
            })}
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
            disabled={registerType === null}
          />
        </div>
      </div>
    </section>
  );
};
