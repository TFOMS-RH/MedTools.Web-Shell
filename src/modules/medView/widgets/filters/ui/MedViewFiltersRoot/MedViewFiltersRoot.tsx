import { useState } from "react";
import {
  initialFiltersDraft,
  type FiltersDraft,
} from "../../../workspace/model/types/FiltersDraft";
import type { FilterGroupId } from "../../../workspace/model/types/FilterId";
import { useMedViewFiltersStore } from "../../model/stores/useMedViewFiltersStore";
import { hasFilterChanges, resetFiltersDraft } from "../../model/filterGroups";
import { MedViewFilterInputReset } from "../../../../../../shared/ui/medView/inputs/filterInputReset";
import { MedViewFiltersGroupRender } from "../MedViewFiltersGroupRender/MedViewFiltersGroupRender";
import { MedViewFiltersPanel } from "../MedViewFiltersPanel/MedViewFiltersPanel";
import styles from "./styles.module.scss";

export const MedViewFiltersRoot = () => {
  const selectedfilterGroupId = useMedViewFiltersStore(
    (state) => state.selectedfilterGroupId,
  );
  const selectFilterGroup = useMedViewFiltersStore(
    (state) => state.selectFilterGroup,
  );
  const [filtersDraft, setFiltersDraft] =
    useState<FiltersDraft>(() => structuredClone(initialFiltersDraft));
  const [resetVersion, setResetVersion] = useState(0);
  const [hasInputEdits, setHasInputEdits] = useState(false);

  const resetFilters = (groupId?: FilterGroupId) => {
    setFiltersDraft((draft) => resetFiltersDraft(draft, groupId));
    setResetVersion((version) => version + 1);
    setHasInputEdits(false);
  };

  return (
    <section className={styles.filtersRoot}>
      <div className={styles.filtersGroup}>
        <MedViewFiltersPanel
          filtersDraft={filtersDraft}
          onSelectGroup={(groupId) => {
            if (groupId !== selectedfilterGroupId) setHasInputEdits(false);
            selectFilterGroup(groupId);
          }}
          onReset={() => resetFilters()}
          canReset={hasInputEdits || hasFilterChanges(filtersDraft)}
        />
        <MedViewFilterInputReset.Provider value={resetVersion}>
          <MedViewFiltersGroupRender
            filterGroupId={selectedfilterGroupId}
            filtersDraft={filtersDraft}
            setFiltersDraft={setFiltersDraft}
            onReset={() => resetFilters(selectedfilterGroupId)}
            canReset={
              hasInputEdits || hasFilterChanges(filtersDraft, selectedfilterGroupId)
            }
            onInput={(event) => {
              const target = event.target;
              // Search text and unfinished date sections may exist outside the draft.
              if (
                target instanceof HTMLElement &&
                (target.getAttribute("role") === "combobox" ||
                  target.isContentEditable)
              ) {
                setHasInputEdits(true);
              }
            }}
          />
        </MedViewFilterInputReset.Provider>
      </div>
    </section>
  );
};
