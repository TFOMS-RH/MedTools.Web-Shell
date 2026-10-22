import { Link } from "react-router";
import styles from "./styles.module.scss";

interface HeaderProps {
  variant?: "home" | "workspace";
  currentModule?: string | null;
  isAuthenticated: boolean;
  onLogin: () => void;
  userName?: string;
}

export const Header = ({
  variant = "home",
  currentModule,
  isAuthenticated,
  onLogin,
  userName,
}: HeaderProps) => {
  return (
    <header
      className={[
        styles.headerContainer,
        variant === "workspace" ? styles.workspace : "",
      ].join(" ")}
    >
      <div className={styles.header}>
        <div className={styles.navigation}>
          <Link to="/" className={styles.brand}>
            <span>MedTools</span>
          </Link>

          {currentModule && (
            <>
              <span className={styles.separator}>/</span>
              <span className={styles.currentModule}>{currentModule}</span>
            </>
          )}
        </div>

        {isAuthenticated ? (
          <button
            type="button"
            className={styles.avatar}
            aria-label="Открыть меню пользователя"
          >
            {userName?.slice(0, 2).toUpperCase() ?? "U"}
          </button>
        ) : (
          <button
            type="button"
            className={styles.loginButton}
            onClick={onLogin}
          >
            Войти
          </button>
        )}
      </div>
    </header>
  );
};
