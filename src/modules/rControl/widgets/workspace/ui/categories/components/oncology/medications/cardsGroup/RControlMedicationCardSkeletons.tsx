import { Skeleton } from "@mui/material";
import styles from "../../styles.module.scss";

export const RControlMedicationCardSkeletons = () => (
  <div className={styles.selectionList} aria-label="Загрузка списка">
    {Array.from({ length: 4 }, (_, i) => (
      <div className={styles.selectionCard} key={i} aria-hidden="true">
        {Array.from({ length: 2 }, (_, j) => (
          <Skeleton key={j} height={22} />
        ))}
      </div>
    ))}
  </div>
);
