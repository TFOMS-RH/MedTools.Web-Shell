import { resolveDataState } from "../../../../../../../../../../shared/helpers/resolveDataState";
import { DataState } from "../../../../../../../../../../shared/ui/DataState/DataState";
import { useMedicalSanctionsQuery } from "../../../../../../../../../../shared/model/queries/invoiceStructure/defects/useMedicalSanctionsQuery";
import { useMedViewFiltersStore } from "../../../../../../../filters/model/stores/useMedViewFiltersStore";
import { useMedViewWorkspaceStore } from "../../../../../../model/stores/useMedViewWorkspaceStore";
import { MedViewMedicalSanctionCards } from "./MedViewMedicalSanctionCards";
import { MedViewMedicalSanctionCardSkeletons } from "./MedViewMedicalSanctionCardSkeletons";
import styles from "../../styles.module.scss";

export const MedViewMedicalSanctionCardsGroupRoot = () => {
  const { targetDb } = useMedViewFiltersStore();
  const { selectedMedicalCaseUid } = useMedViewWorkspaceStore();
  const {
    data: medicalSanctions,
    isLoading,
    isPending,
    isError,
    isSuccess,
    error,
  } = useMedicalSanctionsQuery(selectedMedicalCaseUid, targetDb);

  const dataState = resolveDataState({
    isEnabled: selectedMedicalCaseUid !== null && targetDb !== null,
    isLoading: isLoading,
    isError: isError,
    isSuccess: isSuccess,
    isEmpty: medicalSanctions?.length === 0 && isSuccess,
  });

  return (
    <section className={styles.section} aria-labelledby="medview-sanctions-heading">
      <h3 id="medview-sanctions-heading" className={styles.sectionHeading}>Санкции</h3>
      {dataState === "error" ? (
        <DataState
          title="Ошибка данных"
          description={error?.message ?? "Неизвестная ошибка"}
          variant="error"
        />
      ) : isLoading ? (
        <MedViewMedicalSanctionCardSkeletons />
      ) : dataState === "empty" ? (
        <DataState
          title="Данных не найдено"
          description="Медицинский случай не содержит санкции"
          variant="empty"
        />
      ) : (
        <MedViewMedicalSanctionCards
          isPending={isPending}
          medicalSanctions={medicalSanctions ?? []}
        />
      )}
    </section>
  );
};
