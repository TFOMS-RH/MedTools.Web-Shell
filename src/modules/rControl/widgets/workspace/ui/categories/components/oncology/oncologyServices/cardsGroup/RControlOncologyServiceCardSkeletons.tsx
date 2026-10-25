import { Skeleton } from "@mui/material";
import styles from "../../styles.module.scss";

export const RControlOncologyServiceCardSkeletons = () => (
  <div className={styles.selectionList} aria-label="Загрузка списка">
    {Array.from({ length: 2 }, (_, i) => (
      <div className={styles.selectionCard} key={i} aria-hidden="true">
        {Array.from({ length: 5 }, (_, j) => (
          <Skeleton key={j} height={22} />
        ))}
      </div>
    ))}
  </div>
);
