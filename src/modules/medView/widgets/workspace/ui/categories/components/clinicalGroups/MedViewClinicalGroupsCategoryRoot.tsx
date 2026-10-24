import { DataState } from "../../../../../../../../shared/ui/DataState/DataState";
import { useMedViewFiltersStore } from "../../../../../filters/model/stores/useMedViewFiltersStore";
import { useClinicalGroupQuery } from "../../../../../../../../shared/model/queries/invoiceStructure/clinicalGroups/useClinicalGroupQuery";
import { useMedViewWorkspaceStore } from "../../../../model/stores/useMedViewWorkspaceStore";
import { MedViewClinicalGroupCardRoot } from "./clinicalGroup/card/MedViewClinicalGroupCardRoot";
import { MedViewHighTechMedicalCareCardRoot } from "./highTechMedicalCare/card/MedViewHighTechMedicalCareCardRoot";
import { MedViewTreatmentCoefficientsListRoot } from "./treatmentCoefficients/list/MedViewTreatmentCoefficientsListRoot";
import { MedViewClassificationCriterionChipsGroupRoot } from "./сlassificationCriteria/chipsGroup/MedViewClassificationCriterionChipsGroupRoot";
import styles from "./styles.module.scss";

const MedViewClinicalGroupsCategoryRoot = () => {
  const { targetDb } = useMedViewFiltersStore();
  const { selectedMedicalCaseUid } = useMedViewWorkspaceStore();
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
            <MedViewClinicalGroupCardRoot />
            <MedViewHighTechMedicalCareCardRoot />
          </div>
          <section className={styles.relatedSection} aria-labelledby="medview-csg-related-heading">
            <h3 id="medview-csg-related-heading" className={styles.sectionHeading}>Связанные сведения КСГ</h3>
            {clinicalGroupUid !== null ? (
              <div className={styles.relatedGrid}>
                <MedViewClassificationCriterionChipsGroupRoot clinicalGroupUid={clinicalGroupUid} />
                <MedViewTreatmentCoefficientsListRoot clinicalGroupUid={clinicalGroupUid} />
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

export default MedViewClinicalGroupsCategoryRoot;
