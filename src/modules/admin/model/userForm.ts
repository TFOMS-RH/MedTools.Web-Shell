import type { AdminUser, UpdateUserRequest } from "./types";

export const userFieldLabels = {
  lastName: "Фамилия",
  firstName: "Имя",
  middleName: "Отчество",
  email: "Электронная почта",
  contactPhone: "Контактный телефон",
  birthDate: "Дата рождения",
} as const;

export type UserFormValues = Record<keyof typeof userFieldLabels, string>;
export type UserFormErrors = Partial<Record<keyof UserFormValues, string>>;

export const toUserForm = (user: AdminUser): UserFormValues => ({
  firstName: user.firstName,
  lastName: user.lastName,
  middleName: user.middleName ?? "",
  email: user.email ?? "",
  contactPhone: user.contactPhone ?? "",
  birthDate: user.birthDate ?? "",
});

export const buildUserPatch = (
  original: UserFormValues,
  values: UserFormValues,
): UpdateUserRequest => {
  const patch: UpdateUserRequest = {};
  for (const key of Object.keys(userFieldLabels) as (keyof UserFormValues)[]) {
    if (values[key] === original[key]) continue;
    if (key === "firstName" || key === "lastName") patch[key] = values[key];
    else patch[key] = values[key] || null;
  }
  return patch;
};

export const validateUserForm = (values: UserFormValues): UserFormErrors => {
  const errors: UserFormErrors = {};
  for (const key of Object.keys(userFieldLabels) as (keyof UserFormValues)[]) {
    if (key !== "birthDate" && values[key].length > 255)
      errors[key] = "Не более 255 символов.";
  }
  if (!values.firstName.trim()) errors.firstName = "Укажите имя.";
  if (!values.lastName.trim()) errors.lastName = "Укажите фамилию.";
  if (values.birthDate) {
    const date = new Date(`${values.birthDate}T00:00:00Z`);
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(values.birthDate) ||
      values.birthDate.startsWith("0000") ||
      Number.isNaN(date.getTime()) ||
      date.toISOString().slice(0, 10) !== values.birthDate
    ) {
      errors.birthDate = "Укажите корректную дату.";
    }
  }
  return errors;
};

export const sameRoleIds = (left: string[], right: string[]) =>
  left.length === right.length &&
  new Set(left).size === new Set(right).size &&
  left.every((id) => right.includes(id));
