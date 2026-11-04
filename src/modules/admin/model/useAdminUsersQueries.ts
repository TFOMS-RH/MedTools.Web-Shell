import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { adminUsersService } from "../api/adminUsersService";
import type { CreateUserRequest, UpdateUserRequest } from "./types";
import { useAuthStore } from "../../auth/stores/authStore";

export const adminUsersKeys = {
  all: ["admin", "users"] as const,
  list: ["admin", "users", "list"] as const,
  detail: (id: string) => ["admin", "users", "detail", id] as const,
  userRoles: (id: string) => ["admin", "users", "roles", id] as const,
  roles: ["admin", "roles"] as const,
};

const retryQuery = (count: number, error: Error) =>
  count < 1 &&
  (!isAxiosError(error) || !error.response || error.response.status >= 500);

export const useAdminOrganizationsQuery = (enabled: boolean) =>
  useQuery({
    queryKey: ["admin", "organizations"],
    queryFn: ({ signal }) => adminUsersService.getOrganizations(signal),
    enabled,
    retry: retryQuery,
  });

export const useCreateAdminUserMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: CreateUserRequest) => adminUsersService.createUser(request),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: adminUsersKeys.list });
    },
    // Do not keep the submitted password in the mutation cache after unmount.
    gcTime: 0,
  });
};

export const useUpdateAdminUserStatusMutation = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (isActive: boolean) => adminUsersService.updateUserStatus(id, isActive),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: adminUsersKeys.list }),
        queryClient.invalidateQueries({ queryKey: adminUsersKeys.detail(id) }),
      ]);
    },
  });
};

export const useAdminUsersQuery = (enabled = true) =>
  useQuery({
    queryKey: adminUsersKeys.list,
    queryFn: ({ signal }) => adminUsersService.getUsers(signal),
    enabled,
    retry: retryQuery,
  });

export const useAdminUserQuery = (id: string) =>
  useQuery({
    queryKey: adminUsersKeys.detail(id),
    queryFn: ({ signal }) => adminUsersService.getUser(id, signal),
    retry: retryQuery,
  });

export const useAdminUserRolesQuery = (id: string, enabled: boolean) =>
  useQuery({
    queryKey: adminUsersKeys.userRoles(id),
    queryFn: ({ signal }) => adminUsersService.getUserRoles(id, signal),
    enabled,
    retry: retryQuery,
  });

export const useAdminRolesQuery = (enabled: boolean) =>
  useQuery({
    queryKey: adminUsersKeys.roles,
    queryFn: ({ signal }) => adminUsersService.getRoles(signal),
    enabled,
    retry: retryQuery,
  });

export const useUpdateAdminUserMutation = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: UpdateUserRequest) =>
      adminUsersService.updateUser(id, request),
    onSuccess: async (_data, request) => {
      const session = useAuthStore.getState();
      if (session.user?.id === id)
        session.setUser({ ...session.user, ...request });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: adminUsersKeys.list }),
        queryClient.invalidateQueries({ queryKey: adminUsersKeys.detail(id) }),
      ]);
    },
  });
};

export const useUpdateAdminUserRolesMutation = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (roleIds: string[]) =>
      adminUsersService.updateUserRoles(id, roleIds),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: adminUsersKeys.userRoles(id),
        }),
        queryClient.invalidateQueries({ queryKey: adminUsersKeys.list }),
        queryClient.invalidateQueries({ queryKey: adminUsersKeys.detail(id) }),
      ]);
    },
  });
};
