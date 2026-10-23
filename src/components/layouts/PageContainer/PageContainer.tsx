import type { ReactNode } from "react";
import styles from "./styles.module.scss";

interface PageContainerProps {
  children: ReactNode;
  width?: "standard" | "wide";
}

export const PageContainer = ({
  children,
  width = "standard",
}: PageContainerProps) => (
  <div className={`${styles.container} ${width === "wide" ? styles.wide : ""}`}>
    {children}
  </div>
);
