import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useOncologyCaseQuery } from "../../../../../../../../shared/model/queries/invoiceStructure/oncology/useOncologyCaseQuery";
import { useOncologyServicesQuery } from "../../../../../../../../shared/model/queries/invoiceStructure/oncology/useOncologyServicesQuery";
import { useMedicationsQuery } from "../../../../../../../../shared/model/queries/invoiceStructure/oncology/useMedicationsQuery";
import { useMedViewFiltersStore } from "../../../../../filters/model/stores/useMedViewFiltersStore";
import { useMedViewWorkspaceStore } from "../../../../model/stores/useMedViewWorkspaceStore";

/** Validate the whole current-parent chain before rendering any descendants. */
export const useOncologySelection = () => {
  const { targetDb } = useMedViewFiltersStore();
  const {
    selectedMedicalCaseUid,
    selectedOncologyServiceUid,
    selectedMedicationUid,
  } = useMedViewWorkspaceStore();
  const queryClient = useQueryClient();
  const oncologyCase = useOncologyCaseQuery(selectedMedicalCaseUid, targetDb);
  const oncologyCaseUid = selectedMedicalCaseUid !== null && targetDb !== null
    ? oncologyCase.data?.oncologyCaseUid ?? null
    : null;
  // Existing hooks/keyed cache: these observers share requests with the list roots.
  const services = useOncologyServicesQuery(oncologyCaseUid, targetDb);
  const serviceUid = oncologyCaseUid !== null && services.data?.some(
    (service) => service.oncologyServiceUid === selectedOncologyServiceUid,
  ) ? selectedOncologyServiceUid : null;
  const medications = useMedicationsQuery(serviceUid, targetDb);
  const medicationUid = serviceUid !== null && medications.data?.some(
    (medication) => medication.medicamentUid === selectedMedicationUid,
  ) ? selectedMedicationUid : null;

  useEffect(() => {
    const current = useMedViewWorkspaceStore.getState();
    // An effect from a previous render must never clear a newer user selection.
    if (useMedViewFiltersStore.getState().targetDb !== targetDb ||
      current.selectedMedicalCaseUid !== selectedMedicalCaseUid ||
      current.selectedOncologyServiceUid !== selectedOncologyServiceUid ||
      current.selectedMedicationUid !== selectedMedicationUid ||
      selectedMedicalCaseUid === null || targetDb === null) return;

    const isCurrentData = (kind: string, parentUid: number | null, data: unknown) => {
      const state = queryClient.getQueryState(["r-control", kind, parentUid, targetDb]);
      return data !== undefined && state?.data === data;
    };
    const isCurrentSuccess = (kind: string, parentUid: number | null, data: unknown) => {
      const state = queryClient.getQueryState(["r-control", kind, parentUid, targetDb]);
      return isCurrentData(kind, parentUid, data) &&
        state?.status === "success" && state.fetchStatus === "idle";
    };

    if (!isCurrentData("oncology-case", selectedMedicalCaseUid, oncologyCase.data)) return;
    if (oncologyCase.data === null) {
      if (!isCurrentSuccess("oncology-case", selectedMedicalCaseUid, oncologyCase.data)) return;
      if (selectedOncologyServiceUid !== null || selectedMedicationUid !== null)
        current.selectOncologyService(null);
      return;
    }
    if (!isCurrentData("oncology-services", oncologyCaseUid, services.data)) return;
    if (selectedOncologyServiceUid !== null && serviceUid === null) {
      if (isCurrentSuccess("oncology-services", oncologyCaseUid, services.data))
        current.selectOncologyService(null);
      return;
    }
    if (serviceUid !== null && selectedMedicationUid !== null && medicationUid === null &&
      isCurrentSuccess("medications", serviceUid, medications.data)) {
      current.selectMedication(null);
    }
  }, [queryClient, targetDb, selectedMedicalCaseUid, selectedOncologyServiceUid,
    selectedMedicationUid, oncologyCaseUid, oncologyCase.data, oncologyCase.dataUpdatedAt,
    oncologyCase.isFetching, oncologyCase.isSuccess, services.data, services.dataUpdatedAt,
    services.isFetching, services.isSuccess, serviceUid, medications.data,
    medications.dataUpdatedAt, medications.isFetching, medications.isSuccess, medicationUid]);

  return { oncologyCase, oncologyCaseUid, serviceUid, medicationUid };
};
