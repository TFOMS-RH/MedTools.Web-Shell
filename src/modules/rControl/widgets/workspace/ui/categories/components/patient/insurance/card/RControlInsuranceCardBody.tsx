import type { InsuranceDto } from "../../../../../../../../../../shared/model/types/invoiceStructure/results/patient/GetInsuranceResult";
import { Skeleton } from "@mui/material";
import { CardField } from "../../../../../../../../../../shared/ui/CardField/CardField";
import { formatNullableValue } from "../../../../../../../../../../shared/helpers/formatNullableValue";

import styles from "../../styles.module.scss";

interface RControlInsuranceCardBodyProps {
  insurance: InsuranceDto;
  isPending: boolean;
}

export const RControlInsuranceCardBody = ({
  insurance,
  isPending,
}: RControlInsuranceCardBodyProps) => {
  return (
    <div className={styles.fieldGrid} aria-busy={isPending}>
      <CardField
        label="Реестровый номер СМО"
        value={isPending ? <Skeleton /> : formatNullableValue(insurance.insuranceCompanyCode)}
      />
      <div className={styles.wideField}>
        <CardField
          label="Наименование СМО"
          value={isPending ? <Skeleton /> : formatNullableValue(insurance.insuranceCompanyName)}
        />
      </div>
      <CardField
        label="ОГРН"
        value={isPending ? <Skeleton /> : formatNullableValue(insurance.ogrn)}
      />
      <CardField
        label="ОКАТО"
        value={isPending ? <Skeleton /> : formatNullableValue(insurance.okato)}
      />
      <CardField
        label="Номер полиса (старый)"
        value={isPending ? <Skeleton /> : formatNullableValue(insurance.insurancePolicyUnifiedNumber)}
      />
      <CardField
        label="Номер полиса (новый)"
        value={isPending ? <Skeleton /> : formatNullableValue(insurance.insurancePolicyNumber)}
      />
      <CardField
        label="Серия полиса"
        value={isPending ? <Skeleton /> : formatNullableValue(insurance.insurancePolicySeries)}
      />
      <div className={styles.wideField}>
        <CardField
          label="Тип полиса"
          value={isPending ? <Skeleton /> : `${insurance.insurancePolicyTypeCode} : ${insurance.insurancePolicyTypeName}`}
        />
      </div>
    </div>
  );
};
