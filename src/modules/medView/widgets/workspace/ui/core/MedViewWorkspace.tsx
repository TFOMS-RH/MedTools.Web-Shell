import { lazy, Suspense, type ReactNode } from "react";
import { useMedViewWorkspaceStore } from "../../model/stores/useMedViewWorkspaceStore";
import { useMedViewFiltersStore } from "../../../filters/model/stores/useMedViewFiltersStore";
import { useCompletedCasesQuery } from "../../model/queries/useCompletedCasesQuery";
import { useMedicalCasesListItemsQuery } from "../../../../../../shared/model/queries/invoiceStructure/medicalCases/useMedicalCasesListItemsQuery";
import { MedViewCompletedCasesTableRoot } from "./completedCases/table/MedViewCompletedCasesTableRoot";
import { MedViewMedicalCaseCardsGroupRoot } from "./medicalCases/cardsGroup/MedViewMedicalCaseCardsGroupRoot";
import styles from "./styles.module.scss";

const WorkspacePreview = import.meta.env.DEV
  ? lazy(() => import("./MedViewWorkspacePreview"))
  : null;
const categoryDemoParams = [
  "demoPatient",
  "demoCaseDetails",
  "demoOncology",
  "demoPrescriptions",
  "demoClinicalGroups",
  "demoProvidedServices",
  "demoDefects",
];

export const MedViewWorkspace = ({ children }: { children: ReactNode }) => {
  const params = new URLSearchParams(window.location.search);
  if (WorkspacePreview && params.get("demoWorkspace") === "1") {
    return (
      <Suspense fallback={null}>
        <WorkspacePreview>{children}</WorkspacePreview>
      </Suspense>
    );
  }
  // Standalone development fixtures remain reachable without inventing parent selections.
  if (
    import.meta.env.DEV &&
    categoryDemoParams.some((key) => params.get(key) === "1")
  ) {
    return <section className={styles.workspaceRoot}>{children}</section>;
  }
  if (
    import.meta.env.DEV &&
    (params.get("demoTable") === "1" || params.get("demoCases") === "1")
  ) {
    return (
      <section className={styles.workspaceRoot}>
        {params.get("demoTable") === "1" && <MedViewCompletedCasesTableRoot />}
        {params.get("demoCases") === "1" && (
          <MedViewMedicalCaseCardsGroupRoot />
        )}
      </section>
    );
  }
  return <MedViewLiveWorkspace>{children}</MedViewLiveWorkspace>;
};

interface WorkspaceViewProps {
  hasSearch: boolean;
  hasCompleted: boolean;
  hasMedical: boolean;
  results: ReactNode;
  cards: ReactNode;
  children: ReactNode;
}

// One presentation flow for live queries and offline development fixtures.
export const MedViewWorkspaceView = ({
  hasSearch,
  hasCompleted,
  hasMedical,
  results,
  cards,
  children,
}: WorkspaceViewProps) => (
  <section
    className={styles.workspaceRoot}
    aria-label="Рабочее пространство MedView"
  >
    {!hasSearch ? (
      <section className={styles.initialState} role="status">
        <h2>Начните с поиска</h2>
        <p>Укажите параметры поиска, чтобы найти законченные случаи.</p>
      </section>
    ) : (
      results
    )}
    {hasSearch && hasCompleted && cards}
    {hasSearch && hasCompleted && hasMedical && children}
  </section>
);

const MedViewLiveWorkspace = ({ children }: { children: ReactNode }) => {
  const { appliedFilters, targetDb } = useMedViewFiltersStore();
  const {
    selectedCompletedCaseUid,
    selectedMedicalCaseUid,
    completedCasePaginationState,
  } = useMedViewWorkspaceStore();
  const hasSearch = appliedFilters !== null && targetDb !== null;
  const { data: result } = useCompletedCasesQuery(
    appliedFilters,
    completedCasePaginationState,
    targetDb,
  );
  // Membership comes from the current query key; cached data remains valid on refetch/error.
  const completedCaseUid =
    hasSearch &&
    result?.completedCases.some(
      (item) => item.completedCaseUid === selectedCompletedCaseUid,
    )
      ? selectedCompletedCaseUid
      : null;
  const { data: medicalCases } = useMedicalCasesListItemsQuery(
    completedCaseUid,
    targetDb,
  );
  const hasMedicalCase =
    completedCaseUid !== null &&
    medicalCases?.some(
      (item) => item.medicalCaseUid === selectedMedicalCaseUid,
    );

  return (
    <MedViewWorkspaceView
      hasSearch={hasSearch}
      hasCompleted={completedCaseUid !== null}
      hasMedical={Boolean(hasMedicalCase)}
      results={<MedViewCompletedCasesTableRoot />}
      cards={<MedViewMedicalCaseCardsGroupRoot />}
    >
      {children}
    </MedViewWorkspaceView>
  );
};
