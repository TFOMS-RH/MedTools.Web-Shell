import { resolveDataState } from "../../../../../../../../../../shared/helpers/resolveDataState";
import { DataState } from "../../../../../../../../../../shared/ui/DataState/DataState";
import { useReferralsQuery } from "../../../../../../../../../../shared/model/queries/invoiceStructure/prescriptions/useReferralsQuery";
import { useRControlWorkspacePanelStore } from "../../../../../../model/store/useRControlWorkspacePanelStore";
import { useRControlWorkspaceStore } from "../../../../../../model/store/useRControlWorkspaceStore";
import { RControlReferralsTableHeader } from "./RControlReferralsTableHeader";
import { RControlReferralsTableBody } from "./RControlReferralsTableBody";
import styles from "../../styles.module.scss";

export const RControlReferralsTableRoot = () => {
  const { targetDb } = useRControlWorkspacePanelStore();
  const { selectedMedicalCaseUid } = useRControlWorkspaceStore();
  const {
    data: referrals,
    isLoading,
    isPending,
    isError,
    isSuccess,
    error,
  } = useReferralsQuery(selectedMedicalCaseUid, targetDb);

  const dataState = resolveDataState({
    isEnabled: selectedMedicalCaseUid !== null && targetDb !== null,
    isLoading: isLoading,
    isError: isError,
    isSuccess: isSuccess,
    isEmpty: referrals?.length === 0 && isSuccess,
  });

  return (
    <section className={styles.section} aria-labelledby="rcontrol-referrals-heading">
      <RControlReferralsTableHeader />
      {dataState === "error" ? (
        <DataState
          title="Ошибка данных"
          description={error?.message ?? "Неизвестная ошибка"}
          variant="error"
        />
      ) : dataState === "empty" ? (
        <DataState
          title="Данных не найдено"
          description="Медицинский случай не содержит информации о направлениях"
          variant="empty"
        />
      ) : (
        <RControlReferralsTableBody
          referrals={referrals ?? []}
          isPending={isPending}
        />
      )}
    </section>
  );
};
