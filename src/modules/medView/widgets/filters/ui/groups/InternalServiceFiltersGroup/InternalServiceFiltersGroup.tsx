import { MedViewDefaultInput } from "../../../../../../../shared/ui/medView/inputs/MedViewDefaultInput/MedViewDefaultInput";
import { MedViewSelectInput } from "../../../../../../../shared/ui/medView/inputs/MedViewSelectInput/MedViewSelectInput";
import type { InternalServiceFiltersGroupDraft } from "../../../../workspace/model/types/FiltersDraft";
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
  return (
    <section className={styles.internalServiceFiltersGroup}>
      <header className={styles.internalServiceFiltersGroupHeader}>
        <div className={styles.titleGroup}>
          <h2>Фильтрация по техническим полям</h2>
          <p className={styles.description}>
            Все, что относится к техническим полям
          </p>
        </div>
      </header>
      <div className={styles.internalServiceFiltersSubgroup}>
        <div className={styles.groupLineGrid}>
          <div className={styles.span12}>
            <MedViewDefaultInput
              label="UID пациента"
              placeholder="1000"
              value={internalServiceFiltersGroupDraft.patientUid}
              handleInputChange={(newValue: string) =>
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
            <MedViewDefaultInput
              label="UID случая"
              placeholder="1000"
              value={internalServiceFiltersGroupDraft.medicalCaseUid}
              handleInputChange={(newValue: string) =>
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
            <MedViewDefaultInput
              label="UID законченного случая"
              placeholder="1000"
              value={internalServiceFiltersGroupDraft.completedCaseUid}
              handleInputChange={(newValue: string) =>
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
            <MedViewDefaultInput
              label="UID счета"
              placeholder="1000"
              value={internalServiceFiltersGroupDraft.invoiceUid}
              handleInputChange={(newValue: string) =>
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
              onChange={(newValue: string) =>
                setInternalServiceFiltersGroupDraft({
                  ...internalServiceFiltersGroupDraft,
                  invoiceBillingMonth: newValue,
                })
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
    </section>
  );
};

export default InternalServiceFiltersGroup;
