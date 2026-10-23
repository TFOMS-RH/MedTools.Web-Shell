import { useState } from "react";
import { PageContainer } from "../../../components/layouts/PageContainer/PageContainer";
import { Alert, Button, LinearProgress } from "@mui/material";
import { useAuthStore } from "../../auth/stores/authStore";
import { RequirePermission } from "../../auth/components/RequirePermission";
import { adminPermissions } from "../model/permissions";
import { useAdminRolesQuery } from "../model/useAdminUsersQueries";
import { useAdminPermissionsQuery } from "../model/useAdminAccessQueries";
import type { AccessKind } from "../model/accessForm";
import { DataState } from "../../../shared/ui/DataState/DataState";
import { TableSkeleton } from "../../../shared/ui/TableSkeleton/TableSkeleton";
import { AdminQueryError } from "../ui/AdminQueryError";
import { AdminNavigation } from "../ui/AdminNavigation";
import { CreateAccessDialog } from "../ui/CreateAccessDialog";
import { RoleDetailsDialog } from "../ui/RoleDetailsDialog";
import styles from "../ui/access.module.scss";

export const AdminAccessCatalog = ({ kind }: { kind: AccessKind }) => {
  const permissions = useAuthStore((state) => state.permissions);
  const readPermission = kind === "role" ? adminPermissions.readRoles : adminPermissions.readPermissions;
  const createPermission = kind === "role" ? adminPermissions.createRoles : adminPermissions.createPermissions;
  const canRead = permissions.includes(readPermission);

  return (
    <PageContainer width="standard">
      <RequirePermission permission={canRead ? readPermission : createPermission}>
        <AccessCatalog key={kind} kind={kind} canRead={canRead}
          canCreate={permissions.includes(createPermission)} />
      </RequirePermission>
    </PageContainer>
  );
};

const AccessCatalog = ({ kind, canRead, canCreate }: {
  kind: AccessKind; canRead: boolean; canCreate: boolean;
}) => {
  const roles = useAdminRolesQuery(kind === "role" && canRead);
  const permissions = useAdminPermissionsQuery(kind === "permission" && canRead);
  const query = kind === "role" ? roles : permissions;
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const isRole = kind === "role";

  return (
    <section className={styles.page}>
      <AdminNavigation />
      <header className={styles.pageHeader}>
        <div>
          <h2>{isRole ? "Роли" : "Разрешения"}</h2>
          <p className={styles.secondary}>
            {isRole ? "Роли пользователей MedTools Web" : "Справочник разрешений MedTools Web"}
          </p>
        </div>
        <div className={styles.actions}>
          {canRead && (
            <Button className={styles.button} disabled={query.isFetching}
              onClick={() => { void query.refetch(); }}>Обновить список</Button>
          )}
          {canCreate && (
            <Button className={styles.primaryButton} onClick={() => {
              setCreated(false);
              setCreating(true);
            }}>{isRole ? "Создать роль" : "Создать разрешение"}</Button>
          )}
        </div>
      </header>
      {created && <Alert severity="success">{isRole ? "Роль создана." : "Разрешение создано."}</Alert>}
      {!canRead ? (
        <p className={styles.secondary}>Создание доступно. Нет разрешения на просмотр списка.</p>
      ) : (
        <section className={styles.panel} aria-label={isRole ? "Список ролей" : "Список разрешений"}
          aria-busy={query.isFetching}>
          <div className={styles.panelHeader}>
            <h3>{isRole ? "Справочник ролей" : "Справочник разрешений"}</h3>
            {query.data && <span className={styles.secondary}>Всего: {query.data.length}</span>}
          </div>
          {query.isFetching && <LinearProgress color="inherit" aria-label="Обновление списка" />}
          {query.isError ? (
            <AdminQueryError error={query.error} onRetry={() => { void query.refetch(); }} />
          ) : query.isSuccess && query.data.length === 0 ? (
            <DataState variant="empty" title={isRole ? "Ролей пока нет" : "Разрешений пока нет"}
              description={canCreate ? "Создайте первую запись с помощью кнопки выше." : "Справочник пуст."} />
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead><tr>
                  {!isRole && <th scope="col">Код</th>}
                  <th scope="col">Название</th>
                  {isRole && <th scope="col">Действия</th>}
                  {!isRole && <th scope="col">Описание</th>}
                </tr></thead>
                <tbody>
                  {query.isPending ? <TableSkeleton columns={isRole ? 2 : 3} rows={5} />
                    : isRole ? roles.data?.map((role) => (
                      <tr key={role.id}>
                        <td>{role.name}</td>
                        <td>
                          <Button className={styles.button} onClick={() => setSelectedRoleId(role.id)}
                            aria-label={`Открыть роль ${role.name}`}>Открыть</Button>
                        </td>
                      </tr>
                    )) : permissions.data?.map((permission) => (
                      <tr key={permission.id}>
                        <td>{permission.code}</td><td>{permission.name}</td>
                        <td>{permission.description || "—"}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
      {creating && <CreateAccessDialog kind={kind} onClose={() => setCreating(false)}
        onCreated={() => { setCreating(false); setCreated(true); }} />}
      {selectedRoleId && <RoleDetailsDialog key={selectedRoleId} roleId={selectedRoleId}
        onClose={() => setSelectedRoleId(null)} />}
    </section>
  );
};
