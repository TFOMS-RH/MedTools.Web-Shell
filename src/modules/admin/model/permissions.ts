// MedTools.Identity.API/Common/Constants/MedToolsIdentityPermissionCodes.cs
export const adminPermissions = {
  readUsers: "identity.users.read",
  createUsers: "identity.users.create",
  updateUserStatus: "identity.users.status_update",
  updateUsers: "identity.users.update",
  readUserRoles: "identity.users.roles_read",
  manageUserRoles: "identity.users.roles_manage",
  readRoles: "identity.roles.read",
  createRoles: "identity.roles.create",
  readRolePermissions: "identity.roles.read_permissions",
  manageRolePermissions: "identity.roles.permissions_manage",
  readOrganizations: "identity.organizations.read",
  readPermissions: "identity.permissions.read",
  createPermissions: "identity.permissions.create",
} as const;
