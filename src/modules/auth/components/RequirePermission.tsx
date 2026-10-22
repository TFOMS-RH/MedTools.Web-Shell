import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router";
import { useAuthStore } from "../stores/authStore";
import { DataState } from "../../../shared/ui/DataState/DataState";

export const RequirePermission = ({
  permission,
  children,
}: {
  permission: string;
  children: ReactNode;
}) => {
  const user = useAuthStore((state) => state.user);
  const allowed = useAuthStore((state) =>
    state.permissions.includes(permission),
  );
  const location = useLocation();
  if (!user)
    return (
      <Navigate
        to={`/login?returnTo=${encodeURIComponent(location.pathname)}`}
        replace
      />
    );
  if (!allowed)
    return (
      <DataState
        variant="error"
        title="Нет доступа"
        description="У вас нет разрешения на просмотр пользователей."
      />
    );
  return children;
};
