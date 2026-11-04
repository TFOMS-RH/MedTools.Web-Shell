import { useCallback, useState } from "react";
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { useAdminUserQuery } from "../model/useAdminUsersQueries";
import { useAuthStore } from "../../auth/stores/authStore";
import { adminPermissions } from "../model/permissions";
import { AdminQueryError } from "./AdminQueryError";
import { UserProfileForm } from "./UserProfileForm";
import { UserRolesPanel } from "./UserRolesPanel";
import { UserStatusPanel } from "./UserStatusPanel";
import { useUnsavedChanges } from "./useUnsavedChanges";
import styles from "./userDialog.module.scss";

export const UserDetailsDialog = ({
  userId,
  onClose,
}: {
  userId: string;
  onClose: () => void;
}) => {
  const query = useAdminUserQuery(userId);
  const canEdit = useAuthStore((state) =>
    state.permissions.includes(adminPermissions.updateUsers),
  );
  const [profileDirty, setProfileDirty] = useState(false);
  const [rolesDirty, setRolesDirty] = useState(false);
  const [profileBusy, setProfileBusy] = useState(false);
  const [rolesBusy, setRolesBusy] = useState(false);
  const [statusBusy, setStatusBusy] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);
  const dirty = profileDirty || rolesDirty;
  const busy = profileBusy || rolesBusy || statusBusy;
  useUnsavedChanges(dirty || busy);

  const requestClose = useCallback(() => {
    if (busy) return;
    if (dirty) setConfirmClose(true);
    else onClose();
  }, [busy, dirty, onClose]);

  return (
    <>
      <Dialog
        open
        fullWidth
        maxWidth="md"
        onClose={requestClose}
        aria-labelledby="admin-user-title"
        slotProps={{ paper: { className: styles.paper } }}
      >
        <DialogTitle component="div" id="admin-user-header" className={styles.header}>
          <h2 id="admin-user-title">Редактирование пользователя</h2>
          {query.data && <p className={styles.login}>{query.data.userName}</p>}
        </DialogTitle>
        <DialogContent className={styles.content}>
          {query.isPending ? (
            <CircularProgress
              color="inherit"
              aria-label="Загрузка пользователя"
            />
          ) : query.isError ? (
            <AdminQueryError
              error={query.error}
              onRetry={() => {
                void query.refetch();
              }}
            />
          ) : (
            <div className={styles.details}>
              <UserProfileForm
                user={query.data}
                canEdit={canEdit}
                disabled={rolesBusy || statusBusy}
                onDirtyChange={setProfileDirty}
                onBusyChange={setProfileBusy}
              />
              <UserRolesPanel
                userId={userId}
                profileDirty={profileDirty}
                profileBusy={profileBusy || statusBusy}
                onDirtyChange={setRolesDirty}
                onBusyChange={setRolesBusy}
              />
              <UserStatusPanel
                userId={userId}
                userName={query.data.userName}
                disabled={dirty || profileBusy || rolesBusy}
                onBusyChange={setStatusBusy}
              />
              <section className={styles.system} aria-labelledby="admin-user-system-title">
                <h3 id="admin-user-system-title">Системная информация</h3>
                <dl className={styles.identity}>
                  <div><dt>Идентификатор</dt><dd>{query.data.id}</dd></div>
                  <div><dt>Организация (ID)</dt><dd>{query.data.organizationId}</dd></div>
                </dl>
              </section>
            </div>
          )}
        </DialogContent>
        <DialogActions className={styles.footer}>
          <Button className={`${styles.button} ${styles.closeButton}`} disabled={busy} onClick={requestClose}>
            Закрыть
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={confirmClose}
        onClose={() => setConfirmClose(false)}
        aria-labelledby="discard-user-title"
        slotProps={{ paper: { className: `${styles.paper} ${styles.confirmation}` } }}
      >
        <DialogTitle id="discard-user-title">
          Закрыть без сохранения?
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Изменения данных пользователя или ролей будут потеряны.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button className={`${styles.button} ${styles.secondaryButton}`} onClick={() => setConfirmClose(false)}>
            Продолжить редактирование
          </Button>
          <Button className={`${styles.button} ${styles.primaryButton}`} onClick={onClose}>
            Не сохранять
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
