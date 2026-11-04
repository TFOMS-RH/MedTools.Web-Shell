import { useState } from "react";
import {
  Alert, Autocomplete, Button, Chip, CircularProgress, Dialog,
  DialogActions, DialogContent, DialogContentText, DialogTitle, TextField,
} from "@mui/material";
import { useAuthStore } from "../../auth/stores/authStore";
import { adminPermissions } from "../model/permissions";
import {
  useAdminRoleQuery, useAdminRolePermissionsQuery,
  useAdminPermissionsQuery, useUpdateAdminRolePermissionsMutation,
} from "../model/useAdminAccessQueries";
import { sameRoleIds as samePermissionIds } from "../model/userForm";
import { getApiError } from "../../../shared/helpers/getApiError";
import { AdminQueryError } from "./AdminQueryError";
import { useUnsavedChanges } from "./useUnsavedChanges";
import styles from "./access.module.scss";

export const RoleDetailsDialog = ({ roleId, onClose }: {
  roleId: string;
  onClose: () => void;
}) => {
  const permissions = useAuthStore((state) => state.permissions);
  const canRead = permissions.includes(adminPermissions.readRolePermissions);
  const canEdit = canRead && permissions.includes(adminPermissions.manageRolePermissions)
    && permissions.includes(adminPermissions.readPermissions);
  const role = useAdminRoleQuery(roleId);
  const assigned = useAdminRolePermissionsQuery(roleId, canRead);
  const catalog = useAdminPermissionsQuery(canEdit);
  const mutation = useUpdateAdminRolePermissionsMutation(roleId);
  const [draft, setDraft] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);
  const originalIds = assigned.data?.map((permission) => permission.id) ?? [];
  const selectedIds = draft ?? originalIds;
  const dirty = draft !== null && !samePermissionIds(originalIds, draft);
  const busy = mutation.isPending;
  useUnsavedChanges(dirty || busy);

  const requestClose = () => {
    if (busy) return;
    if (dirty) setConfirmClose(true);
    else onClose();
  };

  const save = () => {
    if (!canEdit || !dirty || busy || !role.isSuccess || !assigned.isSuccess
      || !catalog.isSuccess || assigned.isFetching || catalog.isFetching) return;
    setError(null);
    setSaved(false);
    mutation.mutate(selectedIds, {
      onSuccess: () => { setDraft(null); setSaved(true); },
      onError: (reason) => setError(getApiError(reason, "Не удалось сохранить разрешения роли.").message),
    });
  };

  return (
    <>
      <Dialog open fullWidth maxWidth="md" onClose={requestClose}
        className={styles.dialog} aria-labelledby="role-details-title">
        <DialogTitle id="role-details-title">{role.data?.name ?? "Роль"}</DialogTitle>
        <DialogContent className={styles.formFields}>
          {role.isPending ? (
            <CircularProgress color="inherit" aria-label="Загрузка роли" />
          ) : role.isError ? (
            <AdminQueryError error={role.error} onRetry={() => { void role.refetch(); }} />
          ) : (
            <>
              <p className={styles.secondary}>Идентификатор: {role.data.id}</p>
              <h3>Разрешения роли</h3>
              {!canRead ? (
                <p className={styles.secondary}>Нет разрешения на просмотр разрешений роли.</p>
              ) : assigned.isPending ? (
                <CircularProgress color="inherit" size={24} aria-label="Загрузка разрешений роли" />
              ) : assigned.isError ? (
                <AdminQueryError error={assigned.error} onRetry={() => { void assigned.refetch(); }} />
              ) : !canEdit ? (
                <>
                  <div className={styles.actions}>
                    {assigned.data.length ? assigned.data.map((permission) => (
                      <Chip key={permission.id} label={`${permission.name} (${permission.code})`} />
                    )) : <p>Разрешения не назначены.</p>}
                  </div>
                  <p className={styles.secondary}>Доступен только просмотр разрешений роли.</p>
                </>
              ) : catalog.isPending ? (
                <CircularProgress color="inherit" size={24} aria-label="Загрузка справочника разрешений" />
              ) : catalog.isError ? (
                <AdminQueryError error={catalog.error} onRetry={() => { void catalog.refetch(); }} />
              ) : (
                <>
                  <Autocomplete multiple
                    options={[...catalog.data, ...assigned.data.filter(
                      (permission) => !catalog.data.some((entry) => entry.id === permission.id),
                    )]}
                    value={selectedIds.map((id) =>
                      catalog.data.find((permission) => permission.id === id)
                      ?? assigned.data.find((permission) => permission.id === id),
                    ).filter((permission) => permission !== undefined)}
                    getOptionLabel={(permission) => `${permission.name} (${permission.code})`}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    disabled={busy || catalog.isFetching || assigned.isFetching}
                    noOptionsText="Разрешения не найдены"
                    onChange={(_event, selected) => {
                      setDraft(selected.map((permission) => permission.id));
                      setError(null);
                      setSaved(false);
                    }}
                    renderInput={(params) => <TextField {...params} className={styles.input} label="Назначенные разрешения" />} />
                  <Alert severity="info">Новые разрешения вступят в силу после повторного входа пользователей с этой ролью.</Alert>
                  {dirty && selectedIds.length === 0 && (
                    <Alert severity="warning">После сохранения у роли не останется разрешений.</Alert>
                  )}
                  <div className={styles.actions}>
                    <Button className={styles.primaryButton} loading={busy}
                      disabled={!dirty || catalog.isFetching || assigned.isFetching} onClick={save}>
                      Сохранить разрешения
                    </Button>
                    <Button className={styles.button} disabled={!dirty || busy} onClick={() => {
                      setDraft(null); setSaved(false); setError(null);
                    }}>Отменить изменения</Button>
                  </div>
                </>
              )}
            </>
          )}
          {error && <Alert severity="error">{error}</Alert>}
          {saved && <Alert severity="success">Разрешения роли сохранены.</Alert>}
        </DialogContent>
        <DialogActions className={styles.formActions}>
          <Button className={styles.button} disabled={busy} onClick={requestClose}>Закрыть</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={confirmClose} onClose={() => setConfirmClose(false)} aria-labelledby="discard-role-title">
        <DialogTitle id="discard-role-title">Закрыть без сохранения?</DialogTitle>
        <DialogContent><DialogContentText>Изменения разрешений роли будут потеряны.</DialogContentText></DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmClose(false)}>Продолжить редактирование</Button>
          <Button onClick={onClose}>Не сохранять</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
