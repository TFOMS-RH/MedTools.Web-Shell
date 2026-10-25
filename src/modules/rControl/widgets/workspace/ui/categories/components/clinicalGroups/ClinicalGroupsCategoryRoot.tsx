import { lazy, Suspense } from "react";
import { DataState } from "../../../../../../../../shared/ui/DataState/DataState";
import { useRControlWorkspacePanelStore } from "../../../../model/store/useRControlWorkspacePanelStore";
import { useClinicalGroupQuery } from "../../../../../../../../shared/model/queries/invoiceStructure/clinicalGroups/useClinicalGroupQuery";
import { useRControlWorkspaceStore } from "../../../../model/store/useRControlWorkspaceStore";
import { RControlClinicalGroupCardRoot } from "./clinicalGroup/card/RControlClinicalGroupCardRoot";
import { RControlHighTechMedicalCareCardRoot } from "./highTechMedicalCare/card/RControlHighTechMedicalCareCardRoot";
import { RControlTreatmentCoefficientsListRoot } from "./treatmentCoefficients/list/RControlTreatmentCoefficientsListRoot";
import { RControlClassificationCriterionChipsGroupRoot } from "./сlassificationCriteria/chipsGroup/RControlClassificationCriterionChipsGroupRoot";
import styles from "./styles.module.scss";

const ClinicalGroupsLive = () => {
  const { targetDb } = useRControlWorkspacePanelStore();
  const { selectedMedicalCaseUid } = useRControlWorkspaceStore();
  const { data: clinicalGroup, isError, isSuccess } = useClinicalGroupQuery(selectedMedicalCaseUid, targetDb);
  const clinicalGroupUid = clinicalGroup?.clinicalGroupUid ?? null;

  return (
    <section className={styles.clinicalGroupsRoot}>
      {selectedMedicalCaseUid === null ? (
        <DataState
          title="Выберите медицинский случай"
          description="Нажмите на карточку медицинского случая для отображения данных о КСГ/КПГ и ВМП"
          variant="waiting"
        />
      ) : (
        <>
          <div className={styles.topGrid}>
            <RControlClinicalGroupCardRoot />
            <RControlHighTechMedicalCareCardRoot />
          </div>
          <section className={styles.relatedSection} aria-labelledby="rcontrol-csg-related-heading">
            <h3 id="rcontrol-csg-related-heading" className={styles.sectionHeading}>Связанные сведения КСГ</h3>
            {clinicalGroupUid !== null ? (
              <div className={styles.relatedGrid}>
                <RControlClassificationCriterionChipsGroupRoot clinicalGroupUid={clinicalGroupUid} />
                <RControlTreatmentCoefficientsListRoot clinicalGroupUid={clinicalGroupUid} />
              </div>
            ) : isError ? (
              <DataState
                title="Связанные сведения КСГ недоступны"
                description="Не удалось получить клиническую группу. Классификационные критерии и КСЛП недоступны."
                variant="error"
              />
            ) : isSuccess && clinicalGroup === null ? (
              <DataState
                title="Клиническая группа отсутствует"
                description="Для этого медицинского случая нет КСГ; классификационные критерии и КСЛП недоступны."
                variant="empty"
              />
            ) : (
              <DataState
                title="Получение клинической группы"
                description="После получения данных станут доступны классификационные критерии и КСЛП"
                variant="waiting"
              />
            )}
          </section>
        </>
      )}
    </section>
  );
};

const ClinicalGroupsPreview = import.meta.env.DEV
  ? lazy(() => import("./RControlClinicalGroupsCategoryPreview"))
  : null;

const ClinicalGroupsCategoryRoot = () => {
  const { selectedMedicalCaseUid } = useRControlWorkspaceStore();
  const params = new URLSearchParams(window.location.search);
  if (
    ClinicalGroupsPreview &&
    params.get("demoWorkspace") === "1" &&
    params.get("demoClinicalGroups") !== "live"
  ) {
    return (
      <Suspense fallback={null}>
        <ClinicalGroupsPreview key={selectedMedicalCaseUid} />
      </Suspense>
    );
  }
  return <ClinicalGroupsLive />;
};

export default ClinicalGroupsCategoryRoot;
