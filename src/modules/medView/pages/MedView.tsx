import { Divider } from "../../../components/ui/Divider/Divider";
import { PageContainer } from "../../../components/layouts/PageContainer/PageContainer";
import { MedViewFiltersRoot } from "../widgets/filters/ui/MedViewFiltersRoot/MedViewFiltersRoot";
import { MedViewCategoryRender } from "../widgets/workspace/ui/categories/MedViewCategoryRender";
import { MedViewWorkspace } from "../widgets/workspace/ui/core/MedViewWorkspace";
import { MedViewCategoriesPanel } from "../widgets/workspace/ui/panels/categoriesPanel/MedViewCategoriesPanel";
import styles from "./styles.module.scss";

export const MedView = () => {
  return (
    <PageContainer width="wide">
      <div className={styles.page}>
        <MedViewFiltersRoot />
        <Divider />
        <MedViewWorkspace />
        <Divider />
        <MedViewCategoriesPanel />
        <MedViewCategoryRender />
      </div>
    </PageContainer>
  );
};
