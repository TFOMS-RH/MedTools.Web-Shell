import { useId, type ReactNode } from "react";
import type { ProvidedServiceDto } from "../../../../../../../../../../shared/model/types/invoiceStructure/results/providedServices/GetProvidedServicesResult";
import { formatCurrency } from "../../../../../../../../../../shared/helpers/formatCurrency";
import { displayValue, formatServiceDate, renderReference } from "../../presentation";
import styles from "./styles.module.scss";

interface MedViewProvidedServiceCardsProps {
  providedSevices: ProvidedServiceDto[];
  selectedProvidedServiceUid: number | null;
  selectProvidedService: (providedServiceUid: number | null) => void;
}

// Local table shell shared by the loaded rows and their skeleton.
export const MedViewProvidedServicesTable = ({
  children,
  isPending = false,
}: { children: ReactNode; isPending?: boolean }) => (
  <div
    className={`mt-table-viewport ${styles.viewport}`}
    role="region"
    aria-label="Таблица оказанных услуг"
    tabIndex={0}
    aria-busy={isPending}
  >
    <table className={`mt-table ${styles.servicesTable}`} aria-labelledby="medview-services-heading">
      <colgroup>
        <col />
        <col className={styles.periodColumn} />
        <col className={styles.quantityColumn} />
        <col className={styles.rateColumn} />
        <col className={styles.amountColumn} />
      </colgroup>
      <thead>
        <tr>
          <th scope="col">Услуга / выбор</th>
          <th scope="col">Период</th>
          <th scope="col" className={styles.numeric}>Количество</th>
          <th scope="col" className={styles.numeric}>Тариф</th>
          <th scope="col" className={styles.numeric}>Сумма</th>
        </tr>
      </thead>
      {children}
    </table>
  </div>
);

export const MedViewProvidedServiceCards = ({
  providedSevices,
  selectedProvidedServiceUid,
  selectProvidedService,
}: MedViewProvidedServiceCardsProps) => {
  const selectionName = useId();

  return (
    <MedViewProvidedServicesTable>
      {providedSevices.map((service) => (
        <tbody
          className={selectedProvidedServiceUid === service.providedServiceUid ? styles.selectedGroup : undefined}
          key={service.providedServiceUid}
        >
          <tr className={`noneHover ${styles.mainRow}`}>
            <th scope="row">
              <label className={styles.serviceChoice}>
                <input
                  type="radio"
                  name={selectionName}
                  checked={selectedProvidedServiceUid === service.providedServiceUid}
                  onChange={() => selectProvidedService(service.providedServiceUid)}
                  aria-label={`Выбрать услугу: ${displayValue(service.service).trim() === "—" ? displayValue(service.serviceCode) : service.service}`}
                />
                <span>{renderReference(service.service, service.serviceCode)}</span>
              </label>
            </th>
            <td className={styles.period}>
              {formatServiceDate(service.serviceStartDate)} — {formatServiceDate(service.serviceEndDate)}
            </td>
            <td className={styles.numeric}>{displayValue(service.serviceQuantity)}</td>
            <td className={styles.money}>{formatCurrency(service.unitRate)}</td>
            <td className={`${styles.money} ${styles.amount}`}>{formatCurrency(service.amountBilled)}</td>
          </tr>
          <tr className={`noneHover ${styles.detailsRow}`}>
            <td colSpan={5}>
              <dl className={styles.detailsGrid}>
                <div>
                  <dt>Вид медицинского вмешательства</dt>
                  <dd>{displayValue(service.medicalInterventionType)}</dd>
                </div>
                <div>
                  <dt>Профиль</dt>
                  <dd>{renderReference(service.medicalProfile, service.medicalProfileCode)}</dd>
                </div>
                <div>
                  <dt>Специальность</dt>
                  <dd>{renderReference(service.physicianSpecialty, service.physicianSpecialtyCode)}</dd>
                </div>
                <div>
                  <dt>Категория</dt>
                  <dd>{service.isPediatric ? "Ребенок" : "Взрослый"}</dd>
                </div>
                <div>
                  <dt>Диагноз</dt>
                  <dd>{displayValue(service.diagnosis)}</dd>
                </div>
                <div className={styles.comment}>
                  <dt>Комментарий</dt>
                  <dd>{displayValue(service.internalComment)}</dd>
                </div>
              </dl>
            </td>
          </tr>
        </tbody>
      ))}
    </MedViewProvidedServicesTable>
  );
};
