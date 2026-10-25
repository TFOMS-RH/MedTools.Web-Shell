import { MedViewWorkspaceView } from "./MedViewWorkspace";
import { useEffect, useState, type ReactNode } from "react";
import type { CompletedCaseListItemDto } from "../../../../../../shared/model/types/invoiceStructure/results/medicalCases/GetCompletedCaseListItemsResult";
import type { MedicalCaseDto } from "../../../../../../shared/model/types/invoiceStructure/results/medicalCases/GetMedicalCaseListItemsResult";
import { useMedViewWorkspaceStore } from "../../model/stores/useMedViewWorkspaceStore";
import { useMedViewFiltersStore } from "../../../filters/model/stores/useMedViewFiltersStore";
import { MedViewCompletedCasesTableBody } from "./completedCases/table/MedViewCompletedCasesTableBody";
import { MedViewCompletedCasesTableHeader } from "./completedCases/table/MedViewCompletedCasesTableHeader";
import { MedViewMedicalCaseCards } from "./medicalCases/cardsGroup/MedViewMedicalCaseCards";
import { MedViewMedicalCaseCardSkeletons } from "./medicalCases/cardsGroup/MedViewMedicalCaseCardSkeletons";
import { DataState } from "../../../../../../shared/ui/DataState/DataState";
import { Divider } from "../../../../../../components/ui/Divider/Divider";
import tableStyles from "./completedCases/table/styles.module.scss";
import styles from "./styles.module.scss";

type PreviewState = "ready" | "loading" | "empty" | "error";
const states = [
  ["ready", "Данные"],
  ["loading", "Загрузка"],
  ["empty", "Нет данных"],
  ["error", "Ошибка"],
] as const;
const completedCases: CompletedCaseListItemDto[] = [1, 2].map((uid) => ({
  completedCaseUid: uid,
  entryPositionNumber: uid,
  entryNumber: 100000 + uid,
  patientLastName: "Демонстрационный",
  patientFirstName: `Пациент ${uid}`,
  patientMiddleName: "",
  medicalCareConditions: 1,
  insurancePolicySeries: null,
  insurancePolicyNumber: "0000000000000000",
  amountBilled: 12345.67,
  approvedAmount: null,
  insuranceCompanyApprovedAmount: null,
}));

/** Offline presentation sandbox. Live request transitions are covered by the browser regression. */
export default function MedViewWorkspacePreview({
  children,
}: {
  children: ReactNode;
}) {
  const [resultsState, setResultsState] = useState<PreviewState>("ready");
  const [medicalState, setMedicalState] = useState<PreviewState>("ready");
  const [count, setCount] = useState(2);
  const { appliedFilters, targetDb } = useMedViewFiltersStore();
  const {
    selectedCompletedCaseUid,
    selectedMedicalCaseUid,
    selectCompletedCase,
    selectMedicalCase,
    completedCasePaginationState,
    setCompletedCasesTablePagination,
  } = useMedViewWorkspaceStore();

  useEffect(() => {
    const workspace = useMedViewWorkspaceStore.getState();
    const filters = useMedViewFiltersStore.getState();
    workspace.resetWorkspace();
    useMedViewFiltersStore.setState({ appliedFilters: null, targetDb: null });
    return () => {
      // Never leave synthetic selections in the live workspace after leaving the sandbox.
      useMedViewWorkspaceStore.setState(workspace);
      useMedViewFiltersStore.setState(filters);
    };
  }, []);

  const hasSearch = appliedFilters !== null && targetDb !== null;
  const hasCompleted =
    hasSearch &&
    resultsState !== "empty" &&
    completedCases.some(
      (item) => item.completedCaseUid === selectedCompletedCaseUid,
    );
  const medicalCases: MedicalCaseDto[] = Array.from(
    { length: count },
    (_, index) => ({
      medicalCaseUid: (selectedCompletedCaseUid ?? 0) * 100 + index + 1,
      medicalProfile: null,
      isPediatric: false,
      physicianSpecialty: 0,
      treatmentStartDate: "2026-01-01",
      treatmentEndDate: "2026-01-03",
      primaryDiagnosis: "",
      paidUnits: index + 1,
      unitRate: null,
      amountBilled: 12345.67,
      approvedAmount: null,
      insuranceCompanyApprovedAmount: null,
    }),
  );
  const hasMedical =
    hasCompleted &&
    medicalState !== "empty" &&
    medicalCases.some((item) => item.medicalCaseUid === selectedMedicalCaseUid);
  const firstMedicalUid = medicalCases[0]?.medicalCaseUid ?? null;
  useEffect(() => {
    // Match the existing first-medical-case selection; no extra selection store is introduced.
    if (
      hasCompleted &&
      medicalState === "ready" &&
      !hasMedical &&
      firstMedicalUid !== null
    )
      selectMedicalCase(firstMedicalUid);
  }, [
    hasCompleted,
    hasMedical,
    medicalState,
    firstMedicalUid,
    selectMedicalCase,
  ]);

  return (
    <section
      className={styles.workspaceRoot}
      aria-label="Демонстрация постепенного раскрытия"
    >
      <div className={styles.previewControls}>
        <p>
          Демонстрационный стенд: результаты, медицинские случаи и категории
          используют тестовые данные. Выберите источник и нажмите «Применить
          фильтры». Состояния ниже задаются вручную.
        </p>
        <label>
          Результаты
          <select
            value={resultsState}
            onChange={(event) =>
              setResultsState(event.target.value as PreviewState)
            }
          >
            {states.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Медицинские случаи
          <select
            value={medicalState}
            onChange={(event) =>
              setMedicalState(event.target.value as PreviewState)
            }
          >
            {states.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Карточек
          <select
            value={count}
            onChange={(event) => setCount(Number(event.target.value))}
          >
            {[1, 2, 8].map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
      </div>
      <MedViewWorkspaceView
        hasSearch={hasSearch}
        hasCompleted={hasCompleted}
        hasMedical={hasMedical}
        results={
          <section className={tableStyles.CompletedCasesTableRoot}>
            <MedViewCompletedCasesTableHeader
              totalCount={resultsState === "empty" ? 0 : completedCases.length}
              pagination={completedCasePaginationState}
              onPageChange={(_, page) =>
                setCompletedCasesTablePagination({ page })
              }
              onRowsPerPageChange={(event) =>
                setCompletedCasesTablePagination({
                  page: 0,
                  pageSize: Number(event.target.value),
                })
              }
              isLoading={resultsState === "loading"}
              disabled={resultsState === "loading"}
            />
            <Divider />
            <div className={tableStyles.content}>
              {resultsState === "error" ? (
                <DataState
                  title="Ошибка данных"
                  description="Демонстрационная ошибка поиска"
                  variant="error"
                />
              ) : resultsState === "empty" ? (
                <DataState
                  title="Данных не найдено"
                  description="Нет данных по текущим фильтрам"
                  variant="empty"
                />
              ) : (
                <MedViewCompletedCasesTableBody
                  completedCases={completedCases}
                  selectedCompletedCaseUid={selectedCompletedCaseUid}
                  selectCompletedCase={selectCompletedCase}
                  isPending={resultsState === "loading"}
                  totalCount={completedCasePaginationState.pageSize}
                />
              )}
            </div>
          </section>
        }
        cards={
          medicalState === "loading" ? (
            <MedViewMedicalCaseCardSkeletons />
          ) : medicalState === "error" ? (
            <DataState
              title="Ошибка данных"
              description="Демонстрационная ошибка медицинских случаев"
              variant="error"
            />
          ) : medicalState === "empty" ? (
            <DataState
              title="Данных не найдено"
              description="Медицинские случаи не найдены по выбранному законченному случаю"
              variant="empty"
            />
          ) : (
            <MedViewMedicalCaseCards
              medicalCases={medicalCases}
              selectedMedicalCaseUid={selectedMedicalCaseUid}
              selectMedicalCase={selectMedicalCase}
            />
          )
        }
      >
        {children}
      </MedViewWorkspaceView>
    </section>
  );
}
