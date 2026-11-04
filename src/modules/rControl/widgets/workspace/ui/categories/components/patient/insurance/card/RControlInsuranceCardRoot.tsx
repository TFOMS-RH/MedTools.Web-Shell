import { resolveDataState } from "../../../../../../../../../../shared/helpers/resolveDataState";
import { DataState } from "../../../../../../../../../../shared/ui/DataState/DataState";
import { useRControlWorkspacePanelStore } from "../../../../../../model/store/useRControlWorkspacePanelStore";
import { useInsuranceQuery } from "../../../../../../../../../../shared/model/queries/invoiceStructure/patient/useInsuranceQuery";
import { useRControlWorkspaceStore } from "../../../../../../model/store/useRControlWorkspaceStore";
import { RControlInsuranceCardBody } from "./RControlInsuranceCardBody";
import { RControlInsuranceCardHeader } from "./RControlInsuranceCardHeader";
import type { InsuranceDto } from "../../../../../../../../../../shared/model/types/invoiceStructure/results/patient/GetInsuranceResult";
import type { DataState as DataStateValue } from "../../../../../../../../../../shared/types/DataState";
import styles from "../../styles.module.scss";

export const RControlInsuranceCardRoot = () => {
  const { targetDb } = useRControlWorkspacePanelStore();
  const { selectedMedicalCaseUid } = useRControlWorkspaceStore();
  const {
    data: insurance,
    isLoading,
    isPending,
    isError,
    isSuccess,
    error,
  } = useInsuranceQuery(selectedMedicalCaseUid, targetDb);

  const dataState = resolveDataState({
    isEnabled: selectedMedicalCaseUid !== null && targetDb !== null,
    isLoading: isLoading,
    isError: isError,
    isSuccess: isSuccess,
    isEmpty: insurance === null && isSuccess,
  });

  return <RControlInsuranceCardContent insurance={insurance} isPending={isPending}
    dataState={dataState} error={error?.message} />;
};

export const RControlInsuranceCardContent = ({ insurance, isPending, dataState, error }: {
  insurance?: InsuranceDto | null;
  isPending: boolean;
  dataState: DataStateValue;
  error?: string;
}) => (
  <section className={styles.insuranceGroup} aria-labelledby="rcontrol-patient-insurance">
    <RControlInsuranceCardHeader />
    {dataState === "error" ? (
      <DataState
        title="Ошибка данных"
        description={error ?? "Неизвестная ошибка"}
        variant="error"
      />
    ) : dataState === "empty" ? (
      <DataState
        title="Данных не найдено"
        description="Медицинский случай не содержит информации о СМО"
        variant="empty"
      />
    ) : (
      <RControlInsuranceCardBody
        insurance={insurance!}
        isPending={isPending}
      />
    )}
  </section>
);
