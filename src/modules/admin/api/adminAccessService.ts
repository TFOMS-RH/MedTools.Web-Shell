import apiClient from "../../../shared/api/client/apiClient";
import type {
  AdminPermission,
  AdminRole,
  CreatePermissionRequest,
  CreateRoleRequest,
} from "../model/types";

// IdentityEndpoints -> RoleEndpoints / PermissionEndpoints.
// Create handlers return 201 with a Location header and no response body.
export const adminAccessService = {
  getRole: async (id: string, signal: AbortSignal) => {
    const response = await apiClient.get<AdminRole>(
      `/identity/admin/roles/${encodeURIComponent(id)}`, { signal },
    );
    return response.data;
  },
  getRolePermissions: async (id: string, signal: AbortSignal) => {
    const response = await apiClient.get<AdminPermission[]>(
      `/identity/admin/roles/${encodeURIComponent(id)}/permissions`, { signal },
    );
    return response.data;
  },
  updateRolePermissions: async (id: string, permissionIds: string[]) => {
    await apiClient.put(`/identity/admin/roles/${encodeURIComponent(id)}/permissions`, {
      permissionIds,
    });
  },
  createRole: async (request: CreateRoleRequest) => {
    await apiClient.post("/identity/admin/roles", request);
  },
  getPermissions: async (signal: AbortSignal) => {
    const response = await apiClient.get<AdminPermission[]>(
      "/identity/admin/permissions",
      { signal },
    );
    return response.data;
  },
  createPermission: async (request: CreatePermissionRequest) => {
    await apiClient.post("/identity/admin/permissions", request);
  },
};
