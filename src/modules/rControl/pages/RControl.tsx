import { PageContainer } from "../../../components/layouts/PageContainer/PageContainer";
import { useRControlWorkspaceStore } from "../widgets/workspace/model/store/useRControlWorkspaceStore";
import { RControlCategoryRender } from "../widgets/workspace/ui/categories/RControlCategoryRender";
import { RControlWorkspace } from "../widgets/workspace/ui/core/RControlWorkspace";
import { RControlCategoriesPanel } from "../widgets/workspace/ui/panels/categoriesPanel/RControlCategoriesPanel";
import styles from "./styles.module.scss";
import { lazy, Suspense } from "react";

const WorkspaceDemo = import.meta.env.DEV
  ? lazy(
    () =>
      import("../widgets/workspace/ui/core/RControlWorkspaceDemoProvider"),
  )
  : null;

export const RControl = () => {
  if (
    WorkspaceDemo &&
    new URLSearchParams(window.location.search).get("demoWorkspace") === "1"
  ) {
    return (
      <Suspense fallback={null}>
        <WorkspaceDemo>
          <RControlContent />
        </WorkspaceDemo>
      </Suspense>
    );
  }
  return <RControlContent />;
};

const RControlContent = () => {
  const { selectedMedicalCaseUid } = useRControlWorkspaceStore();
  return (
    <PageContainer width="wide">
      <div className={styles.page}>
        <RControlWorkspace />
        {selectedMedicalCaseUid !== null && (
          <section className={styles.caseDetailsSection} aria-labelledby="rcontrol-case-heading">
            <header className={styles.caseDetailsHeader}>
              <h2 id="rcontrol-case-heading">Сведения о медицинском случае</h2>
            </header>
            <RControlCategoriesPanel />
            <RControlCategoryRender />
          </section>
        )}
      </div>
    </PageContainer>
  );
};
