import { Skeleton } from "@mui/material";
import styles from "./styles.module.scss";

export const RControlClassificationCriterionChipSkeletons = () => (
  <ul className={styles.criteriaList} role="status" aria-label="Загрузка классификационных критериев">
    {[75, 90, 60].map((width) => <li key={width} aria-hidden="true"><Skeleton width={`${width}%`} /></li>)}
  </ul>
);
