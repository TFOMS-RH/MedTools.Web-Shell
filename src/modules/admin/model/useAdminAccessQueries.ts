import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { adminAccessService } from "../api/adminAccessService";
import { adminUsersKeys } from "./useAdminUsersQueries";
import type { CreatePermissionRequest, CreateRoleRequest } from "./types";

export const adminPermissionsKey = ["admin", "permissions"] as const;

export const adminRoleKeys = {
  detail: (id: string) => ["admin", "roles", "detail", id] as const,
  permissions: (id: string) => ["admin", "roles", "permissions", id] as const,
};

const retryQuery = (count: number, error: Error) =>
  count < 1 &&
  (!isAxiosError(error) || !error.response || error.response.status >= 500);

export const useAdminRoleQuery = (id: string) =>
  useQuery({
    queryKey: adminRoleKeys.detail(id),
    queryFn: ({ signal }) => adminAccessService.getRole(id, signal),
    retry: retryQuery,
  });

export const useAdminRolePermissionsQuery = (id: string, enabled: boolean) =>
  useQuery({
    queryKey: adminRoleKeys.permissions(id),
    queryFn: ({ signal }) => adminAccessService.getRolePermissions(id, signal),
    enabled,
    retry: retryQuery,
  });

export const useUpdateAdminRolePermissionsMutation = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (permissionIds: string[]) =>
      adminAccessService.updateRolePermissions(id, permissionIds),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: adminRoleKeys.permissions(id) });
    },
  });
};

export const useAdminPermissionsQuery = (enabled: boolean) =>
  useQuery({
    queryKey: adminPermissionsKey,
    queryFn: ({ signal }) => adminAccessService.getPermissions(signal),
    enabled,
    retry: (count, error) =>
      count < 1 &&
      (!isAxiosError(error) || !error.response || error.response.status >= 500),
  });

type CreateAccessRequest =
  | { kind: "role"; request: CreateRoleRequest }
  | { kind: "permission"; request: CreatePermissionRequest };

export const useCreateAdminAccessMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateAccessRequest) =>
      input.kind === "role"
        ? adminAccessService.createRole(input.request)
        : adminAccessService.createPermission(input.request),
    onSuccess: async (_data, input) => {
      await queryClient.invalidateQueries({
        queryKey:
          input.kind === "role" ? adminUsersKeys.roles : adminPermissionsKey,
      });
    },
  });
};
