import { validateUserForm, type UserFormValues } from "./userForm.ts";
import type { CreateUserRequest } from "./types";

export type CreateUserFormValues = UserFormValues & {
  userName: string;
  password: string;
  organizationId: string;
};
export type CreateUserFormErrors = Partial<Record<keyof CreateUserFormValues, string>>;

export const emptyCreateUserForm: CreateUserFormValues = {
  userName: "", password: "", organizationId: "", firstName: "", lastName: "",
  middleName: "", email: "", contactPhone: "", birthDate: "",
};

export const validateCreateUserForm = (values: CreateUserFormValues): CreateUserFormErrors => {
  const errors: CreateUserFormErrors = validateUserForm(values);
  if (!values.userName.trim()) errors.userName = "Укажите логин.";
  else if (values.userName.trim().length > 255) errors.userName = "Не более 255 символов.";
  if (!values.password.length) errors.password = "Укажите пароль.";
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(values.organizationId)
    || values.organizationId === "00000000-0000-0000-0000-000000000000")
    errors.organizationId = "Выберите организацию.";
  return errors;
};

export const buildCreateUserRequest = (values: CreateUserFormValues): CreateUserRequest => ({
  userName: values.userName.trim(),
  // Passwords must be submitted exactly as entered.
  password: values.password,
  firstName: values.firstName.trim(),
  lastName: values.lastName.trim(),
  middleName: values.middleName.trim() || null,
  email: values.email.trim() || null,
  contactPhone: values.contactPhone.trim() || null,
  birthDate: values.birthDate || null,
  organizationId: values.organizationId,
});
