import type { ContraindicationDto } from "../../../../../../../../../../shared/model/types/invoiceStructure/results/oncology/GetContraindicationsResult";
import { Skeleton } from "@mui/material";
import styles from "../../styles.module.scss";
import { codeDescription } from "../../presentation";
import { formatOncologyDate } from "../../formatOncologyDate";

export const MedViewContraindicationsListBody = ({
  contraindications,
  isPending,
}: {
  contraindications: ContraindicationDto[];
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
      : contraindications.map((record) => (
          <li className={styles.record} key={record.contraindicationUid}>
            <span className={styles.recordDate}>
              {formatOncologyDate(record.contraindicationDate)}
            </span>
            <p className={styles.recordText}>
              {codeDescription(
                record.contraindication,
                record.contraindicationCode,
              )}
            </p>
          </li>
        ))}
  </ul>
);
