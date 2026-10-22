import type { AuthUser } from "../../auth/types/AuthUser";

export type AdminUser = AuthUser;

// OrganizationDto / OrganizationType in MedTools.Identity.API.
export interface AdminOrganization {
  id: string;
  type: 1 | 2 | 3;
  code: string;
  name: string | null;
}

export interface CreateUserRequest {
  userName: string;
  password: string;
  lastName: string;
  firstName: string;
  middleName: string | null;
  email: string | null;
  contactPhone: string | null;
  organizationId: string;
  birthDate: string | null;
}

export interface AdminRole {
  id: string;
  name: string;
}

// MedTools.Identity.API/Common/Models/Dtos/PermissionDto.cs
export interface AdminPermission {
  id: string;
  code: string;
  name: string;
  description: string | null;
}

export interface CreateRoleRequest {
  name: string;
}

export interface CreatePermissionRequest {
  code: string;
  name: string;
  description: string | null;
}

export type UpdateUserRequest = Partial<
  Pick<
    AdminUser,
    | "firstName"
    | "lastName"
    | "middleName"
    | "contactPhone"
    | "email"
    | "birthDate"
  >
>;
