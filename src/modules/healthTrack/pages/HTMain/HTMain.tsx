import { useCallback, useState } from "react";
import { PageContainer } from "../../../../components/layouts/PageContainer/PageContainer";

import {
  HTTabCards,
  type HTTabKey,
} from "../../components/HTTabCards/HTTabCards";

import { HTDocumentsTab } from "../../features/documents/HTDocumentsTab";
import { HTImportTab } from "../../features/import/HTImportTab";
import { HTRegisterDnTab } from "../../features/registerDn/HTRegisterDnTab";
import { HTStatisticsTab } from "../../features/statistics/HTStatisticsTab";

import styles from "./styles.module.scss";

export const HTMain = () => {
  const [activeTab, setActiveTab] = useState<HTTabKey>("documents");
  const [pendingDocumentId, setPendingDocumentId] = useState<number | null>(
    null,
  );

  const handleTabChange = useCallback((key: HTTabKey) => {
    setActiveTab(key);
    setPendingDocumentId(null);
  }, []);

  const handleGoToDocument = useCallback((documentId: number) => {
    setPendingDocumentId(documentId);
    setActiveTab("documents");
  }, []);

  const handleConsumedPendingDocument = useCallback(() => {
    setPendingDocumentId(null);
  }, []);

  const renderTabContent = () => {
    switch (activeTab) {
      case "documents":
        return (
          <HTDocumentsTab
            initialDocumentId={pendingDocumentId}
            onInitialDocumentConsumed={handleConsumedPendingDocument}
          />
        );
      case "import":
        return <HTImportTab onGoToDocument={handleGoToDocument} />;
      case "registerDn":
        return <HTRegisterDnTab />;
      case "statistics":
        return <HTStatisticsTab />;
      default:
        return null;
    }
  };

  return (
    <PageContainer width="wide">
      <section className={styles.mainRoot}>
        <HTTabCards activeTab={activeTab} onTabChange={handleTabChange} />
        <section className={styles.tabContent}>{renderTabContent()}</section>
      </section>
    </PageContainer>
  );
};
