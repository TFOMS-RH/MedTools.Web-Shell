import { Outlet, useLocation, useNavigate } from "react-router";
import { Header } from "../../widgets/Header/Header";
import { useAuthStore } from "../../../modules/auth/stores/authStore";
import { resolveCurrentModule } from "../../../shared/helpers/resolveCurrentModule";
import styles from "./styles.module.scss";

export const MainLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = user !== null;
  const currentModule = resolveCurrentModule(location.pathname);

  const isHome = location.pathname === "/";

  const handleLogin = () => {
    const returnTo = location.pathname + location.search + location.hash;
    navigate(`/login?returnTo=${encodeURIComponent(returnTo)}`);
  };

  return (
    <div
      className={`${styles.appRoot} ${
        isHome ? styles.homeLayout : styles.workspaceLayout
      }`}
    >
      <Header
        currentModule={currentModule}
        isAuthenticated={isAuthenticated}
        onLogin={handleLogin}
        userName={user?.userName}
      />

      <main className={styles.contentRoot}>
        <Outlet />
      </main>
    </div>
  );
};
