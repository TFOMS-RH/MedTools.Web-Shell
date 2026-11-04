import { Link } from "react-router";
import ArrowOutwardRoundedIcon from "@mui/icons-material/ArrowOutwardRounded";
import styles from "./styles.module.scss";

interface ModuleCardProps {
  displayName: string;
  moduleDescription: string;
  navigatePath: string;
  accentColor: string;
  coverBackground: string;
  cover?: React.ReactNode;
}

export const ModuleCard = ({
  displayName,
  moduleDescription,
  navigatePath,
  accentColor,
  coverBackground,
  cover,
}: ModuleCardProps) => {
  return (
    <Link
      to={navigatePath}
      className={styles.moduleCard}
      style={
        {
          "--module-accent": accentColor,
          "--module-cover": coverBackground,
        } as React.CSSProperties
      }
    >
      <div className={styles.cover}>{cover}</div>

      <div className={styles.content}>
        <div className={styles.description}>
          <h2>{displayName}</h2>
          <p>{moduleDescription}</p>
        </div>

        <div className={styles.action}>
          <span>Открыть</span>

          <span className={styles.actionIcon} aria-hidden="true">
            <ArrowOutwardRoundedIcon fontSize="small" />
          </span>
        </div>
      </div>
    </Link>
  );
};
