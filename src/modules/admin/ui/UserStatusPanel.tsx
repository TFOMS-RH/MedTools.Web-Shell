import { useEffect, useState } from "react";
import {
  Alert, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
} from "@mui/material";
import { useNavigate } from "react-router";
import { useAuthStore } from "../../auth/stores/authStore";
import { adminPermissions } from "../model/permissions";
import { useUpdateAdminUserStatusMutation } from "../model/useAdminUsersQueries";
import { getApiError } from "../../../shared/helpers/getApiError";
import styles from "./access.module.scss";

export const UserStatusPanel = ({ userId, userName, disabled, onBusyChange }: {
  userId: string;
  userName: string;
  disabled: boolean;
  onBusyChange: (busy: boolean) => void;
}) => {
  const permissions = useAuthStore((state) => state.permissions);
  const currentUserId = useAuthStore((state) => state.user?.id);
  const canEdit = permissions.includes(adminPermissions.updateUserStatus);
  const mutation = useUpdateAdminUserStatusMutation(userId);
  const navigate = useNavigate();
  const [requestedStatus, setRequestedStatus] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedStatus, setSavedStatus] = useState<boolean | null>(null);

  useEffect(() => { onBusyChange(mutation.isPending); }, [mutation.isPending, onBusyChange]);

  const save = () => {
    if (!canEdit || disabled || mutation.isPending || requestedStatus === null) return;
    const isActive = requestedStatus;
    setError(null);
    setSavedStatus(null);
    mutation.mutate(isActive, {
      onSuccess: () => {
        setRequestedStatus(null);
        setSavedStatus(isActive);
        if (userId === currentUserId && !isActive) {
          useAuthStore.getState().clearSession();
          navigate("/login", {
            replace: true,
            state: { notice: "Ваша учётная запись отключена." },
          });
        }
      },
      onError: (reason) => {
        setError(getApiError(reason, "Не удалось изменить статус пользователя.").message);
      },
    });
  };

  if (!canEdit) return null;

  return (
    <section className={styles.section}>
      <h3>Доступ к учётной записи</h3>
      <p className={styles.secondary}>
        Текущий статус недоступен. Выберите действие, чтобы установить нужный статус.
      </p>
      {disabled && <p className={styles.secondary}>Сначала сохраните или отмените изменения данных и ролей.</p>}
      <div className={styles.actions}>
        <Button className={styles.button} disabled={disabled || mutation.isPending}
          onClick={() => { setError(null); setRequestedStatus(true); }}>Активировать</Button>
        <Button className={styles.button} disabled={disabled || mutation.isPending}
          onClick={() => { setError(null); setRequestedStatus(false); }}>Отключить</Button>
      </div>
      {savedStatus !== null && (
        <Alert severity="success">{savedStatus ? "Учётная запись активирована." : "Учётная запись отключена."}</Alert>
      )}
      <Dialog open={requestedStatus !== null} onClose={() => {
        if (!mutation.isPending) setRequestedStatus(null);
      }} aria-labelledby="user-status-title">
        <DialogTitle id="user-status-title">
          {requestedStatus ? "Активировать учётную запись?" : "Отключить учётную запись?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>Пользователь: {userName}.</DialogContentText>
          {userId === currentUserId && requestedStatus === false && (
            <Alert severity="warning">Вы отключаете собственную учётную запись. Текущий сеанс будет завершён.</Alert>
          )}
          {error && <Alert severity="error">{error}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button disabled={mutation.isPending} onClick={() => setRequestedStatus(null)}>Отмена</Button>
          <Button disabled={disabled || !canEdit} loading={mutation.isPending} onClick={save}>
            {requestedStatus ? "Активировать" : "Отключить"}
          </Button>
        </DialogActions>
      </Dialog>
    </section>
  );
};
