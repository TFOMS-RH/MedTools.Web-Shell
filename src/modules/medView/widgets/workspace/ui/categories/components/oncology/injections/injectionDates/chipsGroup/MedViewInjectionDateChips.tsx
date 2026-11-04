import type { InjectionDateDto } from "../../../../../../../../../../../shared/model/types/invoiceStructure/results/oncology/GetInjectionDatesResult";
import { formatOncologyDate } from "../../../formatOncologyDate";
import styles from "../../../styles.module.scss";

export const MedViewInjectionDateChips = ({
  injectionDates,
}: {
  injectionDates: InjectionDateDto[];
}) => (
  <ul className={styles.dates}>
    {injectionDates.map((record) => (
      <li key={record.injectionDateUid}>
        {formatOncologyDate(record.administrationDate)}
      </li>
    ))}
  </ul>
);
