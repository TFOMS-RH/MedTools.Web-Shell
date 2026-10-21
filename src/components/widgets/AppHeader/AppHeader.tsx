import { Link, useNavigate } from "react-router";
import { Button } from "@mui/material";
import { useAuthStore } from "../../../modules/auth/stores/authStore";
import { adminPermissions } from "../../../modules/admin/model/permissions";
import { medToolsButtonSx } from "../../../shared/sxConfigs/medToolsButtonSx";
import styles from "./styles.module.scss";

interface AppHeaderProps {
  currentModule: string;
}

export const AppHeader = ({ currentModule }: AppHeaderProps) => {
  const user = useAuthStore((state) => state.user);
  const canReadUsers = useAuthStore((state) => state.permissions.includes(adminPermissions.readUsers));
  const navigate = useNavigate();
  const title = currentModule
    ? `MedTools Web / ${currentModule}`
    : "MedTools Web";

  return (
    <header className={styles.appHeaderRoot}>
      <Link to="/" className={styles.logo}>
        <h1>{title}</h1>
      </Link>
      <nav className={styles.actions} aria-label="Управление учётной записью">
        {canReadUsers && <Link to="/admin/users">Пользователи</Link>}
        {user ? <>
          <span>{user.userName}</span>
          <Button size="small" sx={medToolsButtonSx} onClick={() => {
            useAuthStore.getState().clearSession();
            navigate("/login", { replace: true });
          }}>Выйти</Button>
        </> : <Link to="/login">Войти</Link>}
      </nav>
    </header>
  );
};
