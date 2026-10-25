import { NavLink } from "react-router";
import { useAuthStore } from "../../auth/stores/authStore";
import { adminPermissions } from "../model/permissions";
import styles from "./access.module.scss";

const sections = [
  {
    to: "/admin/users",
    label: "Пользователи",
    permissions: [adminPermissions.readUsers, adminPermissions.createUsers],
  },
  {
    to: "/admin/roles",
    label: "Роли",
    permissions: [adminPermissions.readRoles, adminPermissions.createRoles],
  },
  {
    to: "/admin/permissions",
    label: "Разрешения",
    permissions: [adminPermissions.readPermissions, adminPermissions.createPermissions],
  },
];

export const AdminNavigation = () => {
  const permissions = useAuthStore((state) => state.permissions);
  return (
    <>
    <header className={styles.workspaceHeading}>
      <h1>Администрирование</h1>
      <p>Управление пользователями, ролями и разрешениями MedTools Web.</p>
    </header>
    <nav className={styles.navigation} aria-label="Разделы администрирования">
      {sections
        .filter((section) =>
          section.permissions.some((permission) => permissions.includes(permission)),
        )
        .map((section) => (
          <NavLink key={section.to} to={section.to}>
            {section.label}
          </NavLink>
        ))}
    </nav>
    </>
  );
};
