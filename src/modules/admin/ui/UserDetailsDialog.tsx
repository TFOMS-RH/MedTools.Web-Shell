import { useCallback, useState } from "react";
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
} from "@mui/material";
import { useAdminUserQuery } from "../model/useAdminUsersQueries";
import { useAuthStore } from "../../auth/stores/authStore";
import { adminPermissions } from "../model/permissions";
import { medToolsButtonSx } from "../../../shared/sxConfigs/medToolsButtonSx";
import { CardField } from "../../../shared/ui/CardField/CardField";
import { AdminQueryError } from "./AdminQueryError";
import { UserProfileForm } from "./UserProfileForm";
import { UserRolesPanel } from "./UserRolesPanel";
import { useUnsavedChanges } from "./useUnsavedChanges";
import styles from "./styles.module.scss";

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
  const [confirmClose, setConfirmClose] = useState(false);
  const dirty = profileDirty || rolesDirty;
  const busy = profileBusy || rolesBusy;
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
      >
        <DialogTitle id="admin-user-title">
          {query.data ? query.data.userName : "Пользователь"}
        </DialogTitle>
        <DialogContent dividers>
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
              <div className={styles.identity}>
                <CardField label="Идентификатор" value={query.data.id} />
                <CardField
                  label="Организация (ID)"
                  value={query.data.organizationId}
                />
              </div>
              <UserProfileForm
                user={query.data}
                canEdit={canEdit}
                disabled={rolesBusy}
                onDirtyChange={setProfileDirty}
                onBusyChange={setProfileBusy}
              />
              <Divider />
              <UserRolesPanel
                userId={userId}
                profileDirty={profileDirty}
                profileBusy={profileBusy}
                onDirtyChange={setRolesDirty}
                onBusyChange={setRolesBusy}
              />
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button sx={medToolsButtonSx} disabled={busy} onClick={requestClose}>
            Закрыть
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={confirmClose}
        onClose={() => setConfirmClose(false)}
        aria-labelledby="discard-user-title"
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
          <Button sx={medToolsButtonSx} onClick={() => setConfirmClose(false)}>
            Продолжить редактирование
          </Button>
          <Button sx={medToolsButtonSx} onClick={onClose}>
            Не сохранять
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
