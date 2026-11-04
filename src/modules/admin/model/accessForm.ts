import type { CreatePermissionRequest, CreateRoleRequest } from "./types";

export type AccessKind = "role" | "permission";
export type AccessFormValues = { name: string; code: string; description: string };
export type AccessFormErrors = Partial<Record<keyof AccessFormValues, string>>;

export const accessFieldLabels = {
  name: "Название",
  code: "Код разрешения",
  description: "Описание",
} as const;

export const validateAccessForm = (
  kind: AccessKind,
  values: AccessFormValues,
): AccessFormErrors => {
  const errors: AccessFormErrors = {};
  if (!values.name.trim()) errors.name = "Укажите название.";
  if (kind === "permission") {
    if (!values.code.trim()) errors.code = "Укажите код разрешения.";
    // PermissionDbEntityConfiguration: all three fields have a 255 character limit.
    for (const field of ["name", "code", "description"] as const) {
      if (values[field].trim().length > 255)
        errors[field] = "Не более 255 символов.";
    }
  }
  return errors;
};

export const buildRoleRequest = (values: AccessFormValues): CreateRoleRequest => ({
  name: values.name.trim(),
});

export const buildPermissionRequest = (
  values: AccessFormValues,
): CreatePermissionRequest => ({
  code: values.code.trim(),
  name: values.name.trim(),
  description: values.description.trim() || null,
});
