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
          <div className={styles.workspaceGroup} tabIndex={0} role="region" aria-label="Информационные категории медицинского случая">
            <RControlCategoriesPanel />
            <RControlCategoryRender />
          </div>
        )}
      </div>
    </PageContainer>
  );
};
