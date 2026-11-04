import assert from "node:assert/strict";
import { beforeEach, test } from "node:test";
import { useRControlWorkspaceStore as workspace } from "../src/modules/rControl/widgets/workspace/model/store/useRControlWorkspaceStore.ts";
import { useRControlWorkspacePanelStore as panel } from "../src/modules/rControl/widgets/workspace/model/store/useRControlWorkspacePanelStore.ts";

beforeEach(() => {
  panel.setState({ ...panel.getInitialState(), targetDb: "SMODB18",
    selectedMedicalOrganization: "001", selectedBillingYear: 2026, selectedBillingMonth: 1 });
  workspace.setState({ ...workspace.getInitialState(), selectedInvoiceUid: 11,
    selectedCompletedCaseUid: 111, selectedMedicalCaseUid: 1111,
    selectedProvidedServiceUid: 1, selectedOncologyServiceUid: 2, selectedMedicationUid: 3,
    invoiceTableSearchString: "invoice", completedCasesTableSearchString: "case",
    targetCategory: "patient", invoicesTablePagination: { page: 3, pageSize: 25 } });
});

function descendants() {
  const state = workspace.getState();
  return [state.selectedCompletedCaseUid, state.selectedMedicalCaseUid,
    state.selectedProvidedServiceUid, state.selectedOncologyServiceUid, state.selectedMedicationUid];
}

for (const [action, value, expectedPeriod] of [
  ["selectTargetDb", "INOGOROD18", [null, null, null]],
  ["selectMedicalOrganization", "002", ["002", null, null]],
  ["selectBillingYear", 2025, ["001", 2025, null]],
  ["selectBillingMonth", 2, ["001", 2026, 2]],
]) {
  test(`${action} synchronously clears descendants before publishing the new parent`, () => {
    const unsubscribe = panel.subscribe(() => {
      assert.equal(workspace.getState().selectedInvoiceUid, null);
      assert.deepEqual(descendants(), [null, null, null, null, null]);
    });
    try { panel.getState()[action](value); } finally { unsubscribe(); }
    const p = panel.getState(), w = workspace.getState();
    assert.deepEqual([p.selectedMedicalOrganization, p.selectedBillingYear, p.selectedBillingMonth], expectedPeriod);
    assert.deepEqual(w.invoicesTablePagination, { page: 0, pageSize: 25 });
    assert.equal(w.invoiceTableSearchString, "invoice");
    assert.equal(w.completedCasesTableSearchString, "case");
    assert.equal(w.targetCategory, "patient");
  });
}

test("Changing invoice clears all its descendants and keeps the applied searches", () => {
  workspace.getState().selectInvoice(12);
  assert.equal(workspace.getState().selectedInvoiceUid, 12);
  assert.deepEqual(descendants(), [null, null, null, null, null]);
  assert.equal(workspace.getState().completedCasesTableSearchString, "case");
});

test("Changing completed case keeps the invoice and clears deeper selections", () => {
  workspace.getState().selectCompletedCase(112);
  assert.equal(workspace.getState().selectedInvoiceUid, 11);
  assert.deepEqual(descendants(), [112, null, null, null, null]);
});

for (const [action, value, invoiceUid] of [
  ["setInvoicesTablePagination", { page: 4 }, null],
  ["setInvoicesSearch", "new-invoice", null],
  ["setCompletedCasesTablePagination", { page: 2 }, 11],
  ["setCompletedCasesSearch", "new-case", 11],
]) {
  test(`${action} explicitly resets the affected selection`, () => {
    workspace.getState()[action](value);
    assert.equal(workspace.getState().selectedInvoiceUid, invoiceUid);
    assert.deepEqual(descendants(), [null, null, null, null, null]);
  });
}
