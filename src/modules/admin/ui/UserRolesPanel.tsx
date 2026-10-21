import { useEffect, useState } from "react";
import {
  Alert,
  Autocomplete,
  Button,
  Chip,
  CircularProgress,
  TextField,
} from "@mui/material";
import { useNavigate } from "react-router";
import { useAuthStore } from "../../auth/stores/authStore";
import { adminPermissions } from "../model/permissions";
import { sameRoleIds } from "../model/userForm";
import {
  useAdminRolesQuery,
  useAdminUserRolesQuery,
  useUpdateAdminUserRolesMutation,
} from "../model/useAdminUsersQueries";
import { getApiError } from "../../../shared/helpers/getApiError";
import { medToolsInputSx } from "../../../shared/sxConfigs/medToolsInputSx";
import { medToolsButtonSx } from "../../../shared/sxConfigs/medToolsButtonSx";
import { AdminQueryError } from "./AdminQueryError";
import styles from "./styles.module.scss";

interface UserRolesPanelProps {
  userId: string;
  profileDirty: boolean;
  profileBusy: boolean;
  onDirtyChange: (dirty: boolean) => void;
  onBusyChange: (busy: boolean) => void;
}

export const UserRolesPanel = ({
  userId,
  profileDirty,
  profileBusy,
  onDirtyChange,
  onBusyChange,
}: UserRolesPanelProps) => {
  const permissions = useAuthStore((state) => state.permissions);
  const currentUserId = useAuthStore((state) => state.user?.id);
  const canRead = permissions.includes(adminPermissions.readUserRoles);
  const canEdit =
    canRead &&
    permissions.includes(adminPermissions.manageUserRoles) &&
    permissions.includes(adminPermissions.readRoles);
  const assignedQuery = useAdminUserRolesQuery(userId, canRead);
  const catalogQuery = useAdminRolesQuery(canEdit);
  const mutation = useUpdateAdminUserRolesMutation(userId);
  const navigate = useNavigate();
  const [draft, setDraft] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const originalIds = assignedQuery.data?.map((role) => role.id) ?? [];
  const selectedIds = draft ?? originalIds;
  const dirty = draft !== null && !sameRoleIds(originalIds, draft);
  const blockedByProfile =
    profileBusy || (currentUserId === userId && profileDirty);

  useEffect(() => {
    onDirtyChange(dirty);
  }, [dirty, onDirtyChange]);
  useEffect(() => {
    onBusyChange(mutation.isPending);
  }, [mutation.isPending, onBusyChange]);

  const handleSave = () => {
    if (
      !canEdit ||
      blockedByProfile ||
      !dirty ||
      mutation.isPending ||
      !assignedQuery.isSuccess ||
      !catalogQuery.isSuccess
    )
      return;
    setError(null);
    setSaved(false);
    mutation.mutate(selectedIds, {
      onSuccess: () => {
        setDraft(null);
        if (currentUserId === userId) {
          useAuthStore.getState().clearSession();
          navigate("/login?returnTo=%2Fadmin%2Fusers", {
            replace: true,
            state: {
              notice:
                "Ваши роли изменены. Войдите снова, чтобы получить токен с актуальными разрешениями.",
            },
          });
        } else setSaved(true);
      },
      onError: (reason) =>
        setError(getApiError(reason, "Не удалось сохранить роли.").message),
    });
  };

  return (
    <section className={styles.section}>
      <h3>Роли</h3>
      {!canRead ? (
        <p className={styles.secondary}>
          Нет разрешения на просмотр ролей пользователя.
        </p>
      ) : assignedQuery.isPending ? (
        <CircularProgress
          size={24}
          color="inherit"
          aria-label="Загрузка ролей пользователя"
        />
      ) : assignedQuery.isError ? (
        <AdminQueryError
          error={assignedQuery.error}
          onRetry={() => {
            void assignedQuery.refetch();
          }}
        />
      ) : (
        <>
          {!canEdit && (
            <>
              <div className={styles.roles}>
                {assignedQuery.data.length ? (
                  assignedQuery.data.map((role) => (
                    <Chip key={role.id} label={role.name} size="small" />
                  ))
                ) : (
                  <span>Роли не назначены.</span>
                )}
              </div>
              <p className={styles.secondary}>
                Для изменения нужны разрешения на управление ролями пользователя
                и чтение справочника ролей.
              </p>
            </>
          )}
          {canEdit &&
            (catalogQuery.isPending ? (
              <CircularProgress
                size={24}
                color="inherit"
                aria-label="Загрузка справочника ролей"
              />
            ) : catalogQuery.isError ? (
              <AdminQueryError
                error={catalogQuery.error}
                onRetry={() => {
                  void catalogQuery.refetch();
                }}
              />
            ) : (
              <>
                <Autocomplete
                  multiple
                  options={catalogQuery.data}
                  value={selectedIds
                    .map(
                      (id) =>
                        catalogQuery.data.find((role) => role.id === id) ??
                        assignedQuery.data.find((role) => role.id === id),
                    )
                    .filter((role) => role !== undefined)}
                  getOptionLabel={(role) => role.name}
                  isOptionEqualToValue={(option, value) =>
                    option.id === value.id
                  }
                  disabled={
                    blockedByProfile ||
                    mutation.isPending ||
                    catalogQuery.isFetching ||
                    assignedQuery.isFetching
                  }
                  onChange={(_event, roles) => {
                    setDraft(roles.map((role) => role.id));
                    setSaved(false);
                    setError(null);
                  }}
                  noOptionsText="Нет доступных ролей"
                  size="small"
                  sx={medToolsInputSx}
                  renderInput={(params) => (
                    <TextField {...params} label="Назначенные роли" />
                  )}
                />
                {currentUserId === userId && (
                  <Alert severity="info">
                    После изменения собственных ролей потребуется повторный
                    вход. Действующие токены других пользователей обновятся
                    после их повторного входа.
                  </Alert>
                )}
                {currentUserId === userId && profileDirty && (
                  <p className={styles.secondary}>
                    Сначала сохраните или отмените изменения своих данных.
                  </p>
                )}
                {dirty && selectedIds.length === 0 && (
                  <Alert severity="warning">
                    После сохранения у пользователя не останется ролей.
                  </Alert>
                )}
                <div className={styles.actions}>
                  <Button
                    variant="outlined"
                    sx={medToolsButtonSx}
                    onClick={handleSave}
                    loading={mutation.isPending}
                    disabled={
                      !dirty ||
                      blockedByProfile ||
                      catalogQuery.isFetching ||
                      assignedQuery.isFetching
                    }
                  >
                    Сохранить роли
                  </Button>
                  <Button
                    sx={medToolsButtonSx}
                    disabled={!dirty || profileBusy || mutation.isPending}
                    onClick={() => {
                      setDraft(null);
                      setError(null);
                      setSaved(false);
                    }}
                  >
                    Отменить изменения ролей
                  </Button>
                </div>
              </>
            ))}
        </>
      )}
      {error && <Alert severity="error">{error}</Alert>}
      {saved && (
        <Alert severity="success">
          Роли сохранены. Новые разрешения будут включены в токен при следующем
          входе пользователя.
        </Alert>
      )}
    </section>
  );
};
