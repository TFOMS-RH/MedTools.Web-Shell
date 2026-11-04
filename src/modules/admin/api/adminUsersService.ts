import apiClient from "../../../shared/api/client/apiClient";
import type {
  AdminOrganization, AdminRole, AdminUser, CreateUserRequest, UpdateUserRequest,
} from "../model/types";

const usersUrl = "/identity/admin/users";

export const adminUsersService = {
  createUser: async (request: CreateUserRequest) => {
    await apiClient.post(usersUrl, request);
  },
  getOrganizations: async (signal: AbortSignal) => {
    const response = await apiClient.get<AdminOrganization[]>(
      "/identity/admin/organizations", { signal },
    );
    return response.data;
  },
  updateUserStatus: async (id: string, isActive: boolean) => {
    await apiClient.patch(`${usersUrl}/${encodeURIComponent(id)}/status`, { isActive });
  },
  getUsers: async (signal: AbortSignal) => {
    const response = await apiClient.get<AdminUser[]>(usersUrl, { signal });
    return response.data;
  },
  getUser: async (id: string, signal: AbortSignal) => {
    const response = await apiClient.get<AdminUser>(
      `${usersUrl}/${encodeURIComponent(id)}`,
      { signal },
    );
    return response.data;
  },
  updateUser: async (id: string, request: UpdateUserRequest) => {
    await apiClient.patch(`${usersUrl}/${encodeURIComponent(id)}`, request);
  },
  getUserRoles: async (id: string, signal: AbortSignal) => {
    const response = await apiClient.get<AdminRole[]>(
      `${usersUrl}/${encodeURIComponent(id)}/roles`,
      { signal },
    );
    return response.data;
  },
  getRoles: async (signal: AbortSignal) => {
    const response = await apiClient.get<AdminRole[]>("/identity/admin/roles", {
      signal,
    });
    return response.data;
  },
  updateUserRoles: async (id: string, roleIds: string[]) => {
    await apiClient.put(`${usersUrl}/${encodeURIComponent(id)}/roles`, {
      roleIds,
    });
  },
};
