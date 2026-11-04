import type { ProvidedServiceDto } from "../../../../../../../../../../shared/model/types/invoiceStructure/results/providedServices/GetProvidedServicesResult";
import { useId, type ReactNode } from "react";
import { formatCurrency } from "../../../../../../../../../../shared/helpers/formatCurrency";
import {
  displayValue,
  formatServiceDate,
  renderReference,
} from "../../presentation";
import styles from "./styles.module.scss";
import { formatCodeNamePair } from "../../../oncology/presentation";

interface RControlProvidedServiceCardsProps {
  providedSevices: ProvidedServiceDto[];
  selectedProvidedServiceUid: number | null;
  selectProvidedService: (providedServiceUid: number | null) => void;
}

export const RControlProvidedServicesTable = ({
  children,
  isPending = false,
}: {
  children: ReactNode;
  isPending?: boolean;
}) => (
  <div
    className={`mt-table-viewport ${styles.viewport}`}
    role="region"
    aria-label="Таблица оказанных услуг"
    tabIndex={0}
    aria-busy={isPending}
  >
    <table
      className={`mt-table ${styles.servicesTable}`}
      aria-labelledby="rcontrol-services-heading"
    >
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
          <th scope="col" className={styles.numeric}>
            Количество
          </th>
          <th scope="col" className={styles.numeric}>
            Тариф
          </th>
          <th scope="col" className={styles.numeric}>
            Сумма
          </th>
        </tr>
      </thead>
      {children}
    </table>
  </div>
);

export const RControlProvidedServiceCards = ({
  providedSevices,
  selectedProvidedServiceUid,
  selectProvidedService,
}: RControlProvidedServiceCardsProps) => {
  const selectionName = useId();

  return (
    <RControlProvidedServicesTable>
      {providedSevices.map((service) => (
        <tbody
          className={
            selectedProvidedServiceUid === service.providedServiceUid
              ? styles.selectedGroup
              : undefined
          }
          key={service.providedServiceUid}
        >
          <tr className={`noneHover ${styles.mainRow}`}>
            <th scope="row">
              <label className={styles.serviceChoice}>
                <input
                  type="radio"
                  name={selectionName}
                  checked={
                    selectedProvidedServiceUid === service.providedServiceUid
                  }
                  onChange={() =>
                    selectProvidedService(service.providedServiceUid)
                  }
                  aria-label={`Выбрать услугу: ${displayValue(service.serviceName).trim() === "—" ? displayValue(service.serviceCode) : service.serviceName}`}
                />
                <span>
                  {renderReference(service.serviceName, service.serviceCode)}
                </span>
              </label>
            </th>
            <td className={styles.period}>
              {formatServiceDate(service.serviceStartDate)} —{" "}
              {formatServiceDate(service.serviceEndDate)}
            </td>
            <td className={styles.numeric}>
              {displayValue(service.serviceQuantity)}
            </td>
            <td className={styles.money}>{formatCurrency(service.unitRate)}</td>
            <td className={`${styles.money} ${styles.amount}`}>
              {formatCurrency(service.amountBilled)}
            </td>
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
                  <dd>
                    {renderReference(
                      service.medicalProfile,
                      service.medicalProfileCode,
                    )}
                  </dd>
                </div>
                <div>
                  <dt>Специальность</dt>
                  <dd>
                    {renderReference(
                      service.physicianSpecialty,
                      service.physicianSpecialtyCode,
                    )}
                  </dd>
                </div>
                <div>
                  <dt>Категория</dt>
                  <dd>{service.isPediatric ? "Ребенок" : "Взрослый"}</dd>
                </div>
                <div>
                  <dt>Диагноз</dt>
                  <dd>
                    {formatCodeNamePair(
                      service.diagnosisCode,
                      service.diagnosisName,
                    )}
                  </dd>
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
    </RControlProvidedServicesTable>
  );
};
