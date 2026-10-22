import type { AuthUser } from "../../auth/types/AuthUser";

export type AdminUser = AuthUser;

export interface AdminRole {
  id: string;
  name: string;
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
