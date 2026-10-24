import type { MedViewCategoryId } from "../../../../../../shared/model/types/CategoryId";
import {
  lazy,
  Suspense,
  type ComponentType,
  type LazyExoticComponent,
} from "react";
import { useMedViewWorkspaceStore } from "../../model/stores/useMedViewWorkspaceStore";
import CategoryFallback from "./components/default/CategoryFallback/CategoryFallback";

const PatientCategoryPreview = import.meta.env.DEV
  ? lazy(() => import("./components/patient/MedViewPatientCategoryPreview"))
  : null;

const CaseDetailsCategoryPreview = import.meta.env.DEV
  ? lazy(() => import("./components/medicalCaseDetails/MedViewCaseDetailsCategoryPreview"))
  : null;

const PrescriptionsCategoryPreview = import.meta.env.DEV
  ? lazy(() => import("./components/prescriptions/MedViewPrescriptionsCategoryPreview"))
  : null;

const ProvidedServicesCategoryPreview = import.meta.env.DEV
  ? lazy(() => import("./components/providedServices/MedViewProvidedServicesCategoryPreview"))
  : null;

const DefaultCategoryComponent = lazy(
  () =>
    import("../categories/components/default/DefaultCategory/DefaultCategory"),
);

const PatientCategoryComponent = lazy(
  () => import("../categories/components/patient/MedViewPatientCategoryRoot"),
);

const MedicalCaseDetailsCategoryComponent = lazy(
  () =>
    import("../categories/components/medicalCaseDetails/MedViewMedicalCaseDetailsCategoryRoot"),
);

const OncologyCategoryComponent = lazy(
  () => import("../categories/components/oncology/MedViewOncologyRoot"),
);

const PrescriptionsCategoryComponent = lazy(
  () =>
    import("../categories/components/prescriptions/MedViewPrescriptionsCategoryRoot"),
);

const ClinicalGroupsCategoryComponent = lazy(
  () =>
    import("../categories/components/clinicalGroups/MedViewClinicalGroupsCategoryRoot"),
);

const ProvidedServicesCategoryComponent = lazy(
  () =>
    import("../categories/components/providedServices/MedViewProvidedServicesCategoryRoot"),
);

const DefectsCategoryComponent = lazy(
  () => import("../categories/components/defects/MedViewDefectsCategoryRoot"),
);

const categoryMap = {
  default: DefaultCategoryComponent,
  patient: PatientCategoryComponent,
  "case-details": MedicalCaseDetailsCategoryComponent,
  oncology: OncologyCategoryComponent,
  prescriptions: PrescriptionsCategoryComponent,
  "clinical-groups": ClinicalGroupsCategoryComponent,
  "provided-services": ProvidedServicesCategoryComponent,
  defects: DefectsCategoryComponent,
  export: DefaultCategoryComponent,
} satisfies Record<MedViewCategoryId, LazyExoticComponent<ComponentType>>;

export const MedViewCategoryRender = () => {
  const { targetCategory, selectedCompletedCaseUid, selectedMedicalCaseUid } =
    useMedViewWorkspaceStore();
  const CategoryComponent = categoryMap[targetCategory];
  const hasActiveTab = targetCategory !== "default" && targetCategory !== "export";
  const needsSelection = selectedCompletedCaseUid === null ||
    selectedMedicalCaseUid === null || !hasActiveTab;
  const showPatientPreview = PatientCategoryPreview && targetCategory === "patient" &&
    new URLSearchParams(window.location.search).get("demoPatient") === "1";
  const showCaseDetailsPreview = CaseDetailsCategoryPreview && targetCategory === "case-details" &&
    new URLSearchParams(window.location.search).get("demoCaseDetails") === "1";
  const showPrescriptionsPreview = PrescriptionsCategoryPreview && targetCategory === "prescriptions" &&
    new URLSearchParams(window.location.search).get("demoPrescriptions") === "1";
  const showProvidedServicesPreview = ProvidedServicesCategoryPreview && targetCategory === "provided-services" &&
    new URLSearchParams(window.location.search).get("demoProvidedServices") === "1";

  return (
    <div
      id="medview-case-panel"
      role={hasActiveTab ? "tabpanel" : "region"}
      aria-labelledby={hasActiveTab ? `medview-case-tab-${targetCategory}` : "medview-case-heading"}
      tabIndex={0}
    >
      <Suspense fallback={<CategoryFallback />}>
        {showPatientPreview ? (
          <PatientCategoryPreview />
        ) : showCaseDetailsPreview ? (
          <CaseDetailsCategoryPreview />
        ) : showPrescriptionsPreview ? (
          <PrescriptionsCategoryPreview />
        ) : showProvidedServicesPreview ? (
          <ProvidedServicesCategoryPreview />
        ) : needsSelection ? <DefaultCategoryComponent /> : <CategoryComponent />}
      </Suspense>
    </div>
  );
};
