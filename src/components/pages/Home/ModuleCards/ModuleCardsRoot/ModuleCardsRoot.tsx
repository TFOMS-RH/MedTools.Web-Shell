import { ModuleCard } from "../ModuleCard/ModuleCard";
import projects from "../../../../../../projects.json";
import styles from "./styles.module.scss";
import { useAuthStore } from "../../../../../modules/auth/stores/authStore";
import { adminPermissions } from "../../../../../modules/admin/model/permissions";

const modules = [
  {
    ...projects.RControl,
    navigatePath: "/rcontrol",
    accentColor: "#24876D",
    coverBackground: "#E5F4EE",
  },
  {
    ...projects.MedView,
    navigatePath: "/med-view",
    accentColor: "#7654B8",
    coverBackground: "#EEE8FC",
  },
  {
    ...projects.HealthTrack,
    navigatePath: "/health-track",
    accentColor: "#CA7C20",
    coverBackground: "#FFF0DC",
  },
];

export const ModuleCardsRoot = () => {
  const permissions = useAuthStore((state) => state.permissions);
  const adminPath = [
    {
      path: "/admin/users",
      permissions: [adminPermissions.readUsers, adminPermissions.createUsers],
    },
    {
      path: "/admin/roles",
      permissions: [adminPermissions.readRoles, adminPermissions.createRoles],
    },
    {
      path: "/admin/permissions",
      permissions: [
        adminPermissions.readPermissions,
        adminPermissions.createPermissions,
      ],
    },
  ].find((section) =>
    section.permissions.some((permission) => permissions.includes(permission)),
  )?.path;

  return (
    <section className={styles.modulesGroup}>
      {modules.map((module) => (
        <ModuleCard
          key={module.navigatePath}
          displayName={module.DisplayName}
          moduleDescription={module.Description}
          navigatePath={module.navigatePath}
          accentColor={module.accentColor}
          coverBackground={module.coverBackground}
        />
      ))}
      {adminPath && (
        <ModuleCard
          displayName="Администрирование"
          moduleDescription="Пользователи, роли и разрешения платформы"
          navigatePath={adminPath}
          accentColor="var(--mt-text-primary)"
          coverBackground="var(--mt-surface-subtle)"
        />
      )}
    </section>
  );
};
