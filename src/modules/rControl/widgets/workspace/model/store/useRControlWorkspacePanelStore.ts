import { create } from "zustand";
import { useRControlWorkspaceStore } from "./useRControlWorkspaceStore.ts";
import type {
  MedicalRegisterType,
  TargetDbType,
} from "../../../../../../shared/types/TargetDbType";

interface RControlWorkspacePanelStore {
  targetDb: TargetDbType | null;
  registerType: MedicalRegisterType | null;
  selectedMedicalOrganization: string | null;
  selectedBillingYear: number | null;
  selectedBillingMonth: number | null;
  selectTargetDb: (targetDb: TargetDbType | null) => void;
  selectRegisterType: (registerType: MedicalRegisterType | null) => void;
  selectMedicalOrganization: (medicalOrganization: string) => void;
  selectBillingYear: (billingYear: number) => void;
  selectBillingMonth: (billingMonth: number) => void;
}

export const useRControlWorkspacePanelStore =
  create<RControlWorkspacePanelStore>((set) => ({
    targetDb: null,
    registerType: null,
    selectedMedicalOrganization: null,
    selectedBillingYear: null,
    selectedBillingMonth: null,
    selectTargetDb: (targetDb) => {
      set({
        targetDb: targetDb,
        selectedMedicalOrganization: null,
        selectedBillingYear: null,
        selectedBillingMonth: null,
      });
      useRControlWorkspaceStore
        .getState()
        .setInvoicesTablePagination({ page: 0 });
    },
    selectRegisterType: (registerType) => {
      set({
        registerType: registerType,
        selectedMedicalOrganization: null,
        selectedBillingYear: null,
        selectedBillingMonth: null,
      });
      useRControlWorkspaceStore
        .getState()
        .setInvoicesTablePagination({ page: 0 });
    },
    selectMedicalOrganization: (medicalOrganization) => {
      useRControlWorkspaceStore
        .getState()
        .setInvoicesTablePagination({ page: 0 });
      set({
        selectedMedicalOrganization: medicalOrganization,
        selectedBillingYear: null,
        selectedBillingMonth: null,
      });
    },
    selectBillingYear: (billingYear) => {
      useRControlWorkspaceStore
        .getState()
        .setInvoicesTablePagination({ page: 0 });
      set({
        selectedBillingYear: billingYear,
        selectedBillingMonth: null,
      });
    },
    selectBillingMonth: (billingMonth) => {
      useRControlWorkspaceStore
        .getState()
        .setInvoicesTablePagination({ page: 0 });
      set({
        selectedBillingMonth: billingMonth,
      });
    },
  }));
