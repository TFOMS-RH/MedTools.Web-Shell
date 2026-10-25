import { create } from "zustand";
import { useRControlWorkspaceStore } from "./useRControlWorkspaceStore.ts";
import type { TargetDbType } from "../../../../../../shared/types/TargetDbType";

interface RControlWorkspacePanelStore {
  targetDb: TargetDbType | null;
  selectedMedicalOrganization: string | null;
  selectedBillingYear: number | null;
  selectedBillingMonth: number | null;
  selectTargetDb: (targetDb: TargetDbType | null) => void;
  selectMedicalOrganization: (medicalOrganization: string) => void;
  selectBillingYear: (billingYear: number) => void;
  selectBillingMonth: (billingMonth: number) => void;
}

export const useRControlWorkspacePanelStore =
  create<RControlWorkspacePanelStore>((set) => ({
    targetDb: null,
    selectedMedicalOrganization: null,
    selectedBillingYear: null,
    selectedBillingMonth: null,
    selectTargetDb: (targetDb) => {
      useRControlWorkspaceStore.getState().setInvoicesTablePagination({ page: 0 });
      set({
        targetDb: targetDb,
        selectedMedicalOrganization: null,
        selectedBillingYear: null,
        selectedBillingMonth: null,
      });
    },
    selectMedicalOrganization: (medicalOrganization) => {
      useRControlWorkspaceStore.getState().setInvoicesTablePagination({ page: 0 });
      set({
        selectedMedicalOrganization: medicalOrganization,
        selectedBillingYear: null,
        selectedBillingMonth: null,
      });
    },
    selectBillingYear: (billingYear) => {
      useRControlWorkspaceStore.getState().setInvoicesTablePagination({ page: 0 });
      set({
        selectedBillingYear: billingYear,
        selectedBillingMonth: null,
      });
    },
    selectBillingMonth: (billingMonth) => {
      useRControlWorkspaceStore.getState().setInvoicesTablePagination({ page: 0 });
      set({
        selectedBillingMonth: billingMonth,
      });
    },
  }));
