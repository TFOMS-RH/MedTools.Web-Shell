import { Divider } from "../../../components/ui/Divider/Divider";
import { PageContainer } from "../../../components/layouts/PageContainer/PageContainer";
import { RControlWorkspacePanel } from "../widgets/workspace/ui/panels/workspacePanel/RControlWorkspacePanel";
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
  return (
    <PageContainer width="wide">
      <div className={styles.page}>
        <div className={styles.workspaceGroup}>
          <RControlWorkspacePanel />
          <RControlWorkspace />
        </div>
        <Divider />
        <div className={styles.workspaceGroup}>
          <RControlCategoriesPanel />
          <RControlCategoryRender />
        </div>
      </div>
    </PageContainer>
  );
};
