import { resolveDataState } from "../../../../../../../../shared/helpers/resolveDataState";
import { useMedViewFiltersStore } from "../../../../../filters/model/stores/useMedViewFiltersStore";
import { useMedViewWorkspaceStore } from "../../../../model/stores/useMedViewWorkspaceStore";
import { useMedicalCasesListItemsQuery } from "../../../../../../../../shared/model/queries/invoiceStructure/medicalCases/useMedicalCasesListItemsQuery";
import { MedViewMedicalCaseCardSkeletons } from "./MedViewMedicalCaseCardSkeletons";
import { MedViewMedicalCaseCards } from "./MedViewMedicalCaseCards";
import { DataState } from "../../../../../../../../shared/ui/DataState/DataState";
import { lazy, Suspense, useEffect } from "react";

const MedViewMedicalCaseCardsPreview = import.meta.env.DEV
  ? lazy(() => import("./MedViewMedicalCaseCardsPreview"))
  : null;

export const MedViewMedicalCaseCardsGroupRoot = () => {
  if (
    MedViewMedicalCaseCardsPreview &&
    new URLSearchParams(window.location.search).get("demoCases") === "1"
  ) {
    return (
      <Suspense fallback={<MedViewMedicalCaseCardSkeletons />}>
        <MedViewMedicalCaseCardsPreview />
      </Suspense>
    );
  }

  return <MedViewMedicalCaseCardsGroup />;
};

const MedViewMedicalCaseCardsGroup = () => {
  const { targetDb } = useMedViewFiltersStore();
  const {
    selectedCompletedCaseUid,
    selectedMedicalCaseUid,
    selectMedicalCase,
  } = useMedViewWorkspaceStore();
  const {
    data: medicalCases,
    isLoading,
    isError,
    isSuccess,
    error,
  } = useMedicalCasesListItemsQuery(selectedCompletedCaseUid, targetDb);

  const dataState = resolveDataState({
    isEnabled: selectedCompletedCaseUid !== null && targetDb !== null,
    isLoading: isLoading,
    isError: isError,
    isEmpty: medicalCases?.length === 0 && isSuccess,
    isSuccess: isSuccess,
  });

  useEffect(() => {
    if (!medicalCases?.length) {
      return;
    }

    const hasSelectedMedicalCase = medicalCases.some(
      (medicalCase) => medicalCase.medicalCaseUid === selectedMedicalCaseUid,
    );

    if (!hasSelectedMedicalCase) {
      selectMedicalCase(medicalCases[0].medicalCaseUid);
    }
  }, [medicalCases, selectedMedicalCaseUid, selectMedicalCase]);

  return (
    <>
      {dataState === "waiting" ? (
        <DataState
          title="Выберите законченный случай"
          description="Нажмите на строку в таблице законченных случаев для просмотра медицинских случаев"
          variant="waiting"
        />
      ) : dataState === "error" ? (
        <DataState
          title="Ошибка данных"
          description={error?.message ?? "Неизвестная ошибка"}
          variant="error"
        />
      ) : dataState === "loading" ? (
        <MedViewMedicalCaseCardSkeletons />
      ) : dataState === "empty" ? (
        <DataState
          title="Данных не найдено"
          description="Медицинские случаи не найдены по выбранному законченному случаю"
          variant="empty"
        />
      ) : (
        <MedViewMedicalCaseCards
          medicalCases={medicalCases ?? []}
          selectedMedicalCaseUid={selectedMedicalCaseUid}
          selectMedicalCase={selectMedicalCase}
        />
      )}
    </>
  );
};
