import { CircularProgress } from "@mui/material";
import styles from "./styles.module.scss";

const CategoryFallback = () => {
  return (
    <div className={styles.fallback} role="status">
      <CircularProgress
        size={20}
        aria-label="Загрузка раздела"
        sx={{ color: "var(--mt-medview-accent)" }}
      />
      <p className={styles.loaderText}>Загрузка раздела…</p>
    </div>
  );
};

export default CategoryFallback;
