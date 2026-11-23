import { MedViewBulkAutocompleteInput } from "../../../../../../../shared/ui/medView/inputs/MedViewBulkAutocompleteInput/MedViewBulkAutocompleteInput";
import { MedViewDefaultInput } from "../../../../../../../shared/ui/medView/inputs/MedViewDefaultInput/MedViewDefaultInput";
import { MedViewSelectInput } from "../../../../../../../shared/ui/medView/inputs/MedViewSelectInput/MedViewSelectInput";
import {
  initialFiltersDraft,
  type InternalServiceFiltersGroupDraft,
} from "../../../../workspace/model/types/FiltersDraft";
import styles from "./styles.module.scss";

interface InternalServiceFiltersGroupProps {
  internalServiceFiltersGroupDraft: InternalServiceFiltersGroupDraft;
  setInternalServiceFiltersGroupDraft: (
    internalServiceFiltersGroupDraft: InternalServiceFiltersGroupDraft,
  ) => void;
}

const InternalServiceFiltersGroup = ({
  internalServiceFiltersGroupDraft,
  setInternalServiceFiltersGroupDraft,
}: InternalServiceFiltersGroupProps) => {
  const updateBillingMonth = (invoiceBillingMonth: string) =>
    setInternalServiceFiltersGroupDraft({
      ...internalServiceFiltersGroupDraft,
      invoiceBillingMonth,
    });

  return (
    <div className={styles.internalServiceFiltersSubgroup}>
      <div className={styles.groupLineGrid}>
        <div className={styles.span12}>
          <MedViewBulkAutocompleteInput
            mode="uid"
            label="UID пациента"
            placeholder="Например, 1000, 1001"
            value={internalServiceFiltersGroupDraft.patientUid}
            onChange={(newValue) =>
              setInternalServiceFiltersGroupDraft({
                ...internalServiceFiltersGroupDraft,
                patientUid: newValue,
              })
            }
          />
        </div>
      </div>
      <div className={styles.groupLineGrid}>
        <div className={styles.span12}>
          <MedViewBulkAutocompleteInput
            mode="uid"
            label="UID случая"
            placeholder="Например, 1000, 1001"
            value={internalServiceFiltersGroupDraft.medicalCaseUid}
            onChange={(newValue) =>
              setInternalServiceFiltersGroupDraft({
                ...internalServiceFiltersGroupDraft,
                medicalCaseUid: newValue,
              })
            }
          />
        </div>
      </div>
      <div className={styles.groupLineGrid}>
        <div className={styles.span12}>
          <MedViewBulkAutocompleteInput
            mode="uid"
            label="UID законченного случая"
            placeholder="Например, 1000, 1001"
            value={internalServiceFiltersGroupDraft.completedCaseUid}
            onChange={(newValue) =>
              setInternalServiceFiltersGroupDraft({
                ...internalServiceFiltersGroupDraft,
                completedCaseUid: newValue,
              })
            }
          />
        </div>
      </div>
      <div className={styles.groupLineGrid}>
        <div className={styles.span3}>
          <MedViewBulkAutocompleteInput
            mode="uid"
            label="UID счета"
            placeholder="Например, 1000, 1001"
            value={internalServiceFiltersGroupDraft.invoiceUid}
            onChange={(newValue) =>
              setInternalServiceFiltersGroupDraft({
                ...internalServiceFiltersGroupDraft,
                invoiceUid: newValue,
              })
            }
          />
        </div>
        <div className={styles.span3}>
          <MedViewDefaultInput
            label="Номер счета"
            placeholder="ООГУ-000000"
            value={internalServiceFiltersGroupDraft.invoiceNumber}
            handleInputChange={(newValue: string) =>
              setInternalServiceFiltersGroupDraft({
                ...internalServiceFiltersGroupDraft,
                invoiceNumber: newValue,
              })
            }
          />
        </div>
        <div className={styles.span3}>
          <MedViewSelectInput
            label="Расчетный месяц"
            value={internalServiceFiltersGroupDraft.invoiceBillingMonth}
            options={[
              { label: "Январь", value: "1" },
              { label: "Февраль", value: "2" },
              { label: "Март", value: "3" },
              { label: "Апрель", value: "4" },
              { label: "Май", value: "5" },
              { label: "Июнь", value: "6" },
              { label: "Июль", value: "7" },
              { label: "Август", value: "8" },
              { label: "Сентябрь", value: "9" },
              { label: "Октябрь", value: "10" },
              { label: "Ноябрь", value: "11" },
              { label: "Декабрь", value: "12" },
            ]}
            onChange={updateBillingMonth}
            onClear={() =>
              updateBillingMonth(
                initialFiltersDraft.inrernalService.invoiceBillingMonth,
              )
            }
          />
        </div>
        <div className={styles.span3}>
          <MedViewDefaultInput
            label="Расчетный год"
            placeholder="2026"
            value={internalServiceFiltersGroupDraft.invoiceBillingYear}
            handleInputChange={(newValue: string) =>
              setInternalServiceFiltersGroupDraft({
                ...internalServiceFiltersGroupDraft,
                invoiceBillingYear: newValue,
              })
            }
          />
        </div>
      </div>
    </div>
  );
};

export default InternalServiceFiltersGroup;
