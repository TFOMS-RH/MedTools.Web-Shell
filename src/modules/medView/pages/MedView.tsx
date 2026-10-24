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
        <section className={styles.caseDetailsSection} aria-labelledby="medview-case-heading">
          <header className={styles.caseDetailsHeader}>
            <h2 id="medview-case-heading">Сведения о медицинском случае</h2>
            <button className={styles.exportButton} type="button" disabled>
              Экспорт
            </button>
          </header>
          <MedViewCategoriesPanel />
          <MedViewCategoryRender />
        </section>
      </div>
    </PageContainer>
  );
};
