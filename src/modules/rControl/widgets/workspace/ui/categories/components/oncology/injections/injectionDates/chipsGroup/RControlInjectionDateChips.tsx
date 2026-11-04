import type { InjectionDateDto } from "../../../../../../../../../../../shared/model/types/invoiceStructure/results/oncology/GetInjectionDatesResult";
import { formatDate } from "../../../../../../../../../../../shared/helpers/formatDate";
import styles from "../../../styles.module.scss";

export const RControlInjectionDateChips = ({
  injectionDates,
}: {
  injectionDates: InjectionDateDto[];
}) => (
  <ul className={styles.dates}>
    {injectionDates.map((record) => (
      <li key={record.injectionDateUid}>
        {formatDate(record.administrationDate)}
      </li>
    ))}
  </ul>
);
