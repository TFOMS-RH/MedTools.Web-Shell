import { useEffect, useState, type FormEvent } from "react";
import { Alert, Button, TextField } from "@mui/material";
import {
  getApiError,
  type ApiErrorInfo,
} from "../../../shared/helpers/getApiError";
import { useUpdateAdminUserMutation } from "../model/useAdminUsersQueries";
import {
  buildUserPatch,
  toUserForm,
  userFieldLabels,
  validateUserForm,
  type UserFormErrors,
  type UserFormValues,
} from "../model/userForm";
import type { AdminUser } from "../model/types";
import styles from "./userDialog.module.scss";

interface UserProfileFormProps {
  user: AdminUser;
  canEdit: boolean;
  disabled: boolean;
  onDirtyChange: (dirty: boolean) => void;
  onBusyChange: (busy: boolean) => void;
}

export const UserProfileForm = ({
  user,
  canEdit,
  disabled,
  onDirtyChange,
  onBusyChange,
}: UserProfileFormProps) => {
  const [original, setOriginal] = useState(() => toUserForm(user));
  const [values, setValues] = useState(original);
  const [validation, setValidation] = useState<UserFormErrors>({});
  const [serverError, setServerError] = useState<ApiErrorInfo | null>(null);
  const [saved, setSaved] = useState(false);
  const mutation = useUpdateAdminUserMutation(user.id);
  const dirty = Object.keys(buildUserPatch(original, values)).length > 0;

  useEffect(() => {
    onDirtyChange(dirty);
  }, [dirty, onDirtyChange]);
  useEffect(() => {
    onBusyChange(mutation.isPending);
  }, [mutation.isPending, onBusyChange]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canEdit || disabled || mutation.isPending || !dirty) return;
    const errors = validateUserForm(values);
    setValidation(errors);
    setServerError(null);
    setSaved(false);
    if (Object.keys(errors).length) return;
    const submitted = { ...values };
    mutation.mutate(buildUserPatch(original, submitted), {
      onSuccess: () => {
        setOriginal(submitted);
        setSaved(true);
      },
      onError: (error) =>
        setServerError(
          getApiError(error, "Не удалось сохранить пользователя."),
        ),
    });
  };

  const reset = () => {
    const latest = toUserForm(user);
    setOriginal(latest);
    setValues(latest);
    setValidation({});
    setServerError(null);
    setSaved(false);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.section}>
      <h3>Данные пользователя</h3>
      {!canEdit && (
        <p className={styles.secondary}>Доступен только просмотр данных.</p>
      )}
      <div className={styles.fieldsGrid}>
        {(Object.keys(userFieldLabels) as (keyof UserFormValues)[]).map(
          (field) => {
            const error = validation[field] ?? serverError?.fields[field];
            return (
              <div key={field} className={styles.field}>
                <label htmlFor={`admin-user-${field}`} className={styles.label}>
                  {userFieldLabels[field]}
                  {canEdit && (field === "firstName" || field === "lastName") && <span aria-hidden="true"> *</span>}
                </label>
                <TextField
                  id={`admin-user-${field}`}
                  variant="standard"
                  className={styles.control}
                  value={values[field]}
                  type={field === "birthDate" ? "date" : "text"}
                  size="small"
                  fullWidth
                  required={
                    canEdit && (field === "firstName" || field === "lastName")
                  }
                  disabled={disabled || mutation.isPending}
                  error={Boolean(error)}
                  helperText={error}
                  slotProps={{
                    input: { readOnly: !canEdit, disableUnderline: true },
                    htmlInput: {
                      maxLength: field === "birthDate" ? undefined : 255,
                    },
                  }}
                  onChange={(event) => {
                    setValues((previous) => ({
                      ...previous,
                      [field]: event.target.value,
                    }));
                    setSaved(false);
                    setValidation((previous) => ({
                      ...previous,
                      [field]: undefined,
                    }));
                    setServerError(null);
                  }}
                />
              </div>
            );
          },
        )}
      </div>
      {serverError && (
        <Alert severity="error">
          {serverError.message}
          {Object.entries(serverError.fields)
            .filter(([field]) => !(field in userFieldLabels))
            .map(([field, message]) => (
              <div key={field}>{message}</div>
            ))}
        </Alert>
      )}
      {saved && (
        <Alert severity="success">Данные пользователя сохранены.</Alert>
      )}
      {canEdit && (
        <div className={styles.actions}>
          <Button
            type="submit"
            className={`${styles.button} ${styles.primaryButton}`}
            loading={mutation.isPending}
            disabled={!dirty || disabled}
          >
            Сохранить данные
          </Button>
          <Button
            type="button"
            className={`${styles.button} ${styles.secondaryButton}`}
            disabled={!dirty || disabled || mutation.isPending}
            onClick={reset}
          >
            Отменить изменения
          </Button>
        </div>
      )}
    </form>
  );
};
