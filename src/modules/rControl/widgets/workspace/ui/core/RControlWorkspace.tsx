import { RControlCompletedCasesTableRoot } from "./completedCases/table/RControlCompletedCasesTableRoot";
import { RControlInvoicesTableRoot } from "./invoices/table/RControlInvoicesTableRoot";
import { RControlMedicalCaseCardsGroupRoot } from "./medicalCases/cardsGroup/RControlMedicalCaseCardsGroupRoot";
import styles from "./styles.module.scss";
import { useRControlWorkspaceStore } from "../../model/store/useRControlWorkspaceStore";
import { useRControlWorkspacePanelStore } from "../../model/store/useRControlWorkspacePanelStore";
import { RControlWorkspacePanel } from "../panels/workspacePanel/RControlWorkspacePanel";

export const RControlWorkspace = () => {
  const { targetDb, selectedMedicalOrganization, selectedBillingYear, selectedBillingMonth } =
    useRControlWorkspacePanelStore();
  const { selectedInvoiceUid, selectedCompletedCaseUid } = useRControlWorkspaceStore();
  const hasPeriod = targetDb !== null && selectedMedicalOrganization !== null &&
    selectedBillingYear !== null && selectedBillingMonth !== null;
  return (
    <>
      <section className={styles.workspaceRoot} aria-labelledby="rcontrol-accounts-title">
        <header className={styles.workspaceHeader}>
          <h2 id="rcontrol-accounts-title">Счета</h2>
        </header>
        <RControlWorkspacePanel />
        {hasPeriod ? <RControlInvoicesTableRoot /> : (
          <p className={styles.contextHint} role="status">
            Выберите источник данных, организацию, год и месяц — реестр счетов загрузится автоматически.
          </p>
        )}
      </section>
      {selectedInvoiceUid !== null && (
        <section className={styles.casesWorkspace} aria-label="Законченные и медицинские случаи">
          <RControlCompletedCasesTableRoot />
          {selectedCompletedCaseUid !== null && (
            <section className={styles.medicalCasesArea} aria-labelledby="rcontrol-medical-heading">
              <h3 id="rcontrol-medical-heading">Медицинские случаи</h3>
              <RControlMedicalCaseCardsGroupRoot />
            </section>
          )}
        </section>
      )}
    </>
  );
};
