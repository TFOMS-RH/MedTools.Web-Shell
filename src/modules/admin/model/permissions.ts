// MedTools.Identity.API/Common/Constants/MedToolsIdentityPermissionCodes.cs
export const adminPermissions = {
  readUsers: "identity.users.read",
  updateUsers: "identity.users.update",
  readUserRoles: "identity.users.roles_read",
  manageUserRoles: "identity.users.roles_manage",
  readRoles: "identity.roles.read",
} as const;
