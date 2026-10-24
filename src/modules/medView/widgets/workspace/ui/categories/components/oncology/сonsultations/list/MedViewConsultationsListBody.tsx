import type { ConsultationDto } from "../../../../../../../../../../shared/model/types/invoiceStructure/results/oncology/GetConsultationsResult";
import { Skeleton } from "@mui/material";
import styles from "../../styles.module.scss";
import { codeDescription } from "../../presentation";
import { formatOncologyDate } from "../../formatOncologyDate";

export const MedViewConsultationsListBody = ({
  consultations,
  isPending,
}: {
  consultations: ConsultationDto[];
  isPending: boolean;
}) => (
  <ul className={styles.records}>
    {isPending
      ? Array.from({ length: 3 }, (_, i) => (
          <li key={i} className={styles.record}>
            <Skeleton width={100} />
            <Skeleton height={24} />
          </li>
        ))
      : consultations.map((record) => (
          <li className={styles.record} key={record.consultationUid}>
            <span className={styles.recordDate}>
              {formatOncologyDate(record.consultationDate)}
            </span>
            <p className={styles.recordText}>
              {codeDescription(
                record.consultationPurpose,
                record.consultationPurposeCode,
              )}
            </p>
          </li>
        ))}
  </ul>
);
