import { useState } from "react";
import { Alert, Button, LinearProgress } from "@mui/material";
import { useAuthStore } from "../../auth/stores/authStore";
import { adminPermissions } from "../model/permissions";
import { RequirePermission } from "../../auth/components/RequirePermission";
import { useAdminUsersQuery } from "../model/useAdminUsersQueries";
import { DataState } from "../../../shared/ui/DataState/DataState";
import { TableSkeleton } from "../../../shared/ui/TableSkeleton/TableSkeleton";
import { medToolsButtonSx } from "../../../shared/sxConfigs/medToolsButtonSx";
import { AdminQueryError } from "../ui/AdminQueryError";
import { UserDetailsDialog } from "../ui/UserDetailsDialog";
import { AdminNavigation } from "../ui/AdminNavigation";
import { CreateUserDialog } from "../ui/CreateUserDialog";
import styles from "../ui/styles.module.scss";

export const AdminUsers = () => {
  const permissions = useAuthStore((state) => state.permissions);
  const canRead = permissions.includes(adminPermissions.readUsers);
  return (
    <RequirePermission
      permission={
        canRead ? adminPermissions.readUsers : adminPermissions.createUsers
      }
    >
      <UsersCatalog
        canRead={canRead}
        canCreate={permissions.includes(adminPermissions.createUsers)}
      />
    </RequirePermission>
  );
};

const UsersCatalog = ({
  canRead,
  canCreate,
}: {
  canRead: boolean;
  canCreate: boolean;
}) => {
  const query = useAdminUsersQuery(canRead);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState(false);

  return (
    <section className={styles.page}>
      <AdminNavigation />
      <header className={styles.pageHeader}>
        <div>
          <h2>Пользователи</h2>
          <p className={styles.secondary}>Учётные записи MedTools Web</p>
        </div>
        <div className={styles.actions}>
          {canCreate && (
            <Button
              variant="outlined"
              sx={medToolsButtonSx}
              onClick={() => {
                setCreated(false);
                setCreating(true);
              }}
            >
              Создать пользователя
            </Button>
          )}
          {canRead && (
            <Button
              variant="outlined"
              sx={medToolsButtonSx}
              disabled={query.isFetching}
              onClick={() => {
                void query.refetch();
              }}
            >
              Обновить список
            </Button>
          )}
        </div>
      </header>
      {created && <Alert severity="success">Пользователь создан.</Alert>}
      {!canRead ? (
        <p className={styles.secondary}>
          Создание доступно. Нет разрешения на просмотр списка пользователей.
        </p>
      ) : (
        <section
          className={styles.panel}
          aria-label="Список пользователей"
          aria-busy={query.isFetching}
        >
          <div className={styles.panelHeader}>
            <h3>Учётные записи</h3>
            {query.data && (
              <span className={styles.secondary}>
                Всего: {query.data.length}
              </span>
            )}
          </div>
          {query.isFetching && (
            <LinearProgress
              color="inherit"
              aria-label="Обновление пользователей"
            />
          )}
          {query.isError ? (
            <AdminQueryError
              error={query.error}
              onRetry={() => {
                void query.refetch();
              }}
            />
          ) : query.isSuccess && query.data.length === 0 ? (
            <DataState
              variant="empty"
              title="Пользователей пока нет"
              description="Учётные записи не найдены."
            />
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th scope="col">Логин</th>
                    <th scope="col">ФИО</th>
                    <th scope="col">Электронная почта</th>
                    <th scope="col">Телефон</th>
                    <th scope="col">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {query.isPending ? (
                    <TableSkeleton columns={5} rows={5} />
                  ) : (
                    query.data?.map((user) => (
                      <tr key={user.id}>
                        <td>{user.userName}</td>
                        <td>
                          {[user.lastName, user.firstName, user.middleName]
                            .filter(Boolean)
                            .join(" ")}
                        </td>
                        <td>{user.email || "—"}</td>
                        <td>{user.contactPhone || "—"}</td>
                        <td>
                          <Button
                            size="small"
                            sx={medToolsButtonSx}
                            disabled={query.isFetching}
                            onClick={() => setSelectedId(user.id)}
                            aria-label={`Открыть пользователя ${user.userName}`}
                          >
                            Открыть
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
      {selectedId && (
        <UserDetailsDialog
          key={selectedId}
          userId={selectedId}
          onClose={() => setSelectedId(null)}
        />
      )}
      {creating && (
        <CreateUserDialog
          onClose={() => setCreating(false)}
          onCreated={() => {
            setCreating(false);
            setCreated(true);
          }}
        />
      )}
    </section>
  );
};
