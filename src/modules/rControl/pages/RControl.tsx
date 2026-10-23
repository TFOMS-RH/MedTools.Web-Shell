import { Divider } from "../../../components/ui/Divider/Divider";
import { PageContainer } from "../../../components/layouts/PageContainer/PageContainer";
import { RControlWorkspacePanel } from "../widgets/workspace/ui/panels/workspacePanel/RControlWorkspacePanel";
import { RControlCategoryRender } from "../widgets/workspace/ui/categories/RControlCategoryRender";
import { RControlWorkspace } from "../widgets/workspace/ui/core/RControlWorkspace";
import { RControlCategoriesPanel } from "../widgets/workspace/ui/panels/categoriesPanel/RControlCategoriesPanel";
import styles from "./styles.module.scss";

export const RControl = () => {
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
