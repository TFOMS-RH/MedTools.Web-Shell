import { Outlet } from "react-router";
import styles from "./styles.module.scss";

export const PlainLayout = () => {
  return (
    <main className={styles.contentRoot}>
      <Outlet />
    </main>
  );
};
