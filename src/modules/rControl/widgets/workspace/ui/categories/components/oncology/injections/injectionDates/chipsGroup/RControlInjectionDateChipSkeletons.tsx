import { Skeleton } from "@mui/material";
import styles from "../../../styles.module.scss";

export const RControlInjectionDateChipSkeletons = () => (
  <ul className={styles.dates}>
    {Array.from({ length: 10 }, (_, i) => (
      <li key={i}>
        <Skeleton width={80} />
      </li>
    ))}
  </ul>
);
