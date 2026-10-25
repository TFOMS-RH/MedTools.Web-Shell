import { AxiosError, type AxiosAdapter } from "axios";
import type {
  AdminUser,
  AdminRole,
  AdminPermission,
  AdminOrganization,
  CreateUserRequest,
  CreateRoleRequest,
  CreatePermissionRequest,
  UpdateUserRequest,
} from "../model/types";
import { adminPermissions } from "../model/permissions";

export type DemoState = "ready" | "loading" | "empty" | "error";

/** Only mounted in the separate development iframe. No request is forwarded. */
export function createAdminDemoTransport() {
  const organizations: AdminOrganization[] = [
    {
      id: "00000000-0000-0000-0000-000000000001",
      type: 1,
      code: "DEMO-001",
      name: "Тестовая организация (вымышленная)",
    },
    {
      id: "00000000-0000-0000-0000-000000000002",
      type: 2,
      code: "DEMO-002",
      name: "Демонстрационная организация с длинным названием для проверки интерфейса",
    },
  ];
  const users: AdminUser[] = Array.from({ length: 6 }, (_, i) => ({
    id: `demo-user-${i + 1}`,
    organizationId: organizations[i % 2].id,
    userName: `demo.user.${i + 1}`,
    firstName: "Демонстрационный",
    lastName: `Пользователь ${i + 1}`,
    middleName: i % 2 ? null : "Тестовый",
    email: i % 2 ? null : `demo.${i + 1}@example.invalid`,
    contactPhone: null,
    birthDate: i % 2 ? null : "1990-01-01",
  }));
  const roles: AdminRole[] = [
    { id: "demo-role-1", name: "Демонстрационный администратор" },
    { id: "demo-role-2", name: "Демонстрационный оператор" },
  ];
  const permissions: AdminPermission[] = Object.values(adminPermissions).map(
    (code, i) => ({
      id: `demo-permission-${i + 1}`,
      code,
      name: `Тестовое разрешение ${i + 1}`,
      description: i % 2 ? null : "Вымышленная запись для изучения интерфейса",
    }),
  );
  const assignedRoles = new Map(users.map((user) => [user.id, [roles[1].id]]));
  const assignedPermissions = new Map(
    roles.map((role) => [
      role.id,
      permissions.slice(0, 3).map((permission) => permission.id),
    ]),
  );
  let mode: DemoState = "ready";
  let mutationError = false;
  let operations = 0;
  const adapter: AxiosAdapter = async (config) => {
    if (!import.meta.env.DEV) throw new Error("Admin demo is development-only");
    const pathname = new URL(config.url ?? "", "http://demo.invalid").pathname;
    const method = (config.method ?? "get").toLowerCase();
    const response = (data: unknown, status = 200) => ({
      config,
      data,
      status,
      statusText: status === 200 ? "OK" : "Demo",
      headers: {},
    });
    const fail = (message: string, status = 503): never => {
      throw new AxiosError(
        message,
        "ERR_BAD_RESPONSE",
        config,
        undefined,
        response({ title: message }, status),
      );
    };
    if (!pathname.startsWith("/identity/admin/"))
      fail("Демо блокирует неизвестный запрос.", 403);
    const capturedMode = mode;
    await new Promise((resolve) =>
      setTimeout(resolve, capturedMode === "loading" ? 5000 : 150),
    );
    if (config.signal?.aborted)
      throw new AxiosError("Canceled", "ERR_CANCELED", config);
    if (
      (method === "get" && capturedMode === "error") ||
      (method !== "get" && mutationError)
    )
      fail("Демонстрационная ошибка. Реальный API не вызывался.");
    const [, , , kind, id, child] = pathname.split("/");
    const body =
      typeof config.data === "string"
        ? (JSON.parse(config.data) as Record<string, unknown>)
        : (config.data as Record<string, unknown> | undefined);
    if (method === "get") {
      if (kind === "organizations" && !id)
        return response(capturedMode === "empty" ? [] : organizations);
      if (kind === "permissions" && !id)
        return response(capturedMode === "empty" ? [] : permissions);
      if (kind === "users") {
        if (!id) return response(capturedMode === "empty" ? [] : users);
        if (child === "roles")
          return response(
            capturedMode === "empty"
              ? []
              : roles.filter((role) =>
                  assignedRoles.get(id)?.includes(role.id),
                ),
          );
        if (!child)
          return response(
            users.find((user) => user.id === id) ??
              fail("Тестовый пользователь не найден.", 404),
          );
      }
      if (kind === "roles") {
        if (!id) return response(capturedMode === "empty" ? [] : roles);
        if (child === "permissions")
          return response(
            capturedMode === "empty"
              ? []
              : permissions.filter((permission) =>
                  assignedPermissions.get(id)?.includes(permission.id),
                ),
          );
        if (!child)
          return response(
            roles.find((role) => role.id === id) ??
              fail("Тестовая роль не найдена.", 404),
          );
      }
    }
    // Apply only supported demo operations in memory. Never store the submitted password.
    if (method === "post" && !id) {
      if (kind === "users") {
        const { password: _password, ...request } =
          body as unknown as CreateUserRequest;
        users.push({ ...request, id: `demo-user-new-${++operations}` });
      } else if (kind === "roles")
        roles.push({
          id: `demo-role-new-${++operations}`,
          name: (body as unknown as CreateRoleRequest).name,
        });
      else if (kind === "permissions")
        permissions.push({
          ...(body as unknown as CreatePermissionRequest),
          id: `demo-permission-new-${++operations}`,
        });
      else fail("Демо не поддерживает операцию.", 403);
      return response(null, 201);
    }
    if (method === "patch" && kind === "users" && id) {
      const user =
        users.find((entry) => entry.id === id) ??
        fail("Пользователь не найден.", 404);
      if (!child) Object.assign(user, body as UpdateUserRequest);
      else if (child !== "status") fail("Демо не поддерживает операцию.", 403);
      // The real DTO has no status field; acknowledge the simulated status command only.
      operations++;
      return response(null, 204);
    }
    if (method === "put" && kind === "users" && id && child === "roles") {
      assignedRoles.set(id, body?.roleIds as string[]);
      operations++;
      return response(null, 204);
    }
    if (method === "put" && kind === "roles" && id && child === "permissions") {
      assignedPermissions.set(id, body?.permissionIds as string[]);
      operations++;
      return response(null, 204);
    }
    return fail("Демо блокирует неподдерживаемый запрос.", 403);
  };
  return {
    adapter,
    setMode: (value: DemoState) => {
      mode = value;
    },
    setMutationError: (value: boolean) => {
      mutationError = value;
    },
  };
}
