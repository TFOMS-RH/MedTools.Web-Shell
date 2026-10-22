import { useState, type FormEvent } from "react";
import {
  Alert, Autocomplete, Button, CircularProgress, Dialog, DialogActions,
  DialogContent, DialogContentText, DialogTitle, TextField,
} from "@mui/material";
import { useAuthStore } from "../../auth/stores/authStore";
import { adminPermissions } from "../model/permissions";
import {
  useAdminOrganizationsQuery, useCreateAdminUserMutation,
} from "../model/useAdminUsersQueries";
import {
  buildCreateUserRequest, emptyCreateUserForm, validateCreateUserForm,
  type CreateUserFormErrors, type CreateUserFormValues,
} from "../model/createUserForm";
import { userFieldLabels } from "../model/userForm";
import { getAdminApiError } from "../model/getAdminApiError";
import type { ApiErrorInfo } from "../../../shared/helpers/getApiError";
import { AdminQueryError } from "./AdminQueryError";
import { useUnsavedChanges } from "./useUnsavedChanges";
import styles from "./access.module.scss";

const fieldLabels = {
  userName: "Логин",
  password: "Пароль",
  ...userFieldLabels,
};

export const CreateUserDialog = ({ onClose, onCreated }: {
  onClose: () => void;
  onCreated: () => void;
}) => {
  const permissions = useAuthStore((state) => state.permissions);
  const canCreate = permissions.includes(adminPermissions.createUsers);
  const canReadOrganizations = permissions.includes(adminPermissions.readOrganizations);
  const organizations = useAdminOrganizationsQuery(canReadOrganizations);
  const mutation = useCreateAdminUserMutation();
  const [values, setValues] = useState<CreateUserFormValues>(emptyCreateUserForm);
  const [validation, setValidation] = useState<CreateUserFormErrors>({});
  const [serverError, setServerError] = useState<ApiErrorInfo | null>(null);
  const [confirmClose, setConfirmClose] = useState(false);
  const dirty = Object.values(values).some((value) => value.length > 0);
  useUnsavedChanges(dirty || mutation.isPending);

  const requestClose = () => {
    if (mutation.isPending) return;
    if (dirty) setConfirmClose(true);
    else onClose();
  };

  const change = (field: keyof CreateUserFormValues, value: string) => {
    setValues((previous) => ({ ...previous, [field]: value }));
    setValidation((previous) => ({ ...previous, [field]: undefined }));
    setServerError(null);
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canCreate || mutation.isPending || !canReadOrganizations || !organizations.isSuccess) return;
    const errors = validateCreateUserForm(values);
    if (!organizations.data.some((organization) => organization.id === values.organizationId))
      errors.organizationId = "Выберите организацию из списка.";
    setValidation(errors);
    setServerError(null);
    if (Object.keys(errors).length) return;
    mutation.mutate(buildCreateUserRequest(values), {
      onSuccess: () => {
        setValues(emptyCreateUserForm);
        mutation.reset();
        onCreated();
      },
      onError: (error) => {
        setServerError(getAdminApiError(error, "Не удалось создать пользователя."));
        mutation.reset();
      },
    });
  };

  const organizationError = validation.organizationId ?? serverError?.fields.organizationId;

  return (
    <>
      <Dialog open fullWidth maxWidth="md" onClose={requestClose}
        className={styles.dialog} aria-labelledby="create-user-title">
        <form onSubmit={submit} noValidate aria-busy={mutation.isPending}>
          <DialogTitle id="create-user-title">Новый пользователь</DialogTitle>
          <DialogContent className={styles.formFields}>
            {!canCreate && <Alert severity="error">Нет разрешения на создание пользователей.</Alert>}
            {!canReadOrganizations ? (
              <Alert severity="info">Для выбора организации необходимо разрешение на просмотр организаций.</Alert>
            ) : organizations.isPending ? (
              <CircularProgress color="inherit" size={24} aria-label="Загрузка организаций" />
            ) : organizations.isError ? (
              <AdminQueryError error={organizations.error}
                onRetry={() => { void organizations.refetch(); }} />
            ) : (
              <>
                {organizations.data.length === 0 && (
                  <Alert severity="info">Организаций пока нет. Перед созданием пользователя добавьте организацию.</Alert>
                )}
                <Autocomplete
                  options={organizations.data}
                  value={organizations.data.find((organization) => organization.id === values.organizationId) ?? null}
                  getOptionLabel={(organization) => organization.name
                    ? `${organization.name} (${organization.code})` : organization.code}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  disabled={mutation.isPending || !canCreate}
                  onChange={(_event, organization) => change("organizationId", organization?.id ?? "")}
                  noOptionsText="Организации не найдены"
                  renderInput={(params) => (
                    <TextField {...params} label="Организация" required
                      className={styles.input} error={Boolean(organizationError)} helperText={organizationError} />
                  )}
                />
              </>
            )}
            <div className={styles.fieldsGrid}>
              {(Object.keys(fieldLabels) as (keyof typeof fieldLabels)[]).map((field) => {
                const error = validation[field] ?? serverError?.fields[field];
                return (
                  <TextField key={field} label={fieldLabels[field]} value={values[field]}
                    className={styles.input} fullWidth
                    type={field === "password" ? "password" : field === "birthDate" ? "date" : field === "email" ? "email" : "text"}
                    autoComplete={field === "password" ? "new-password" : field === "userName" ? "off" : undefined}
                    required={["userName", "password", "firstName", "lastName"].includes(field)}
                    disabled={mutation.isPending || !canCreate}
                    error={Boolean(error)} helperText={error}
                    onChange={(event) => change(field, event.target.value)}
                    slotProps={{
                      inputLabel: field === "birthDate" ? { shrink: true } : undefined,
                      htmlInput: { maxLength: field === "password" || field === "birthDate" ? undefined : 255 },
                    }} />
                );
              })}
            </div>
            {serverError && (
              <Alert severity="error">
                {serverError.message}
                {Object.entries(serverError.fields)
                  .filter(([field]) => field !== "organizationId" && !(field in fieldLabels))
                  .map(([field, message]) => <div key={field}>{message}</div>)}
              </Alert>
            )}
          </DialogContent>
          <DialogActions className={styles.formActions}>
            <Button className={styles.button} disabled={mutation.isPending} onClick={requestClose}>Отмена</Button>
            <Button className={styles.primaryButton} type="submit" loading={mutation.isPending}
              disabled={!canCreate || !canReadOrganizations || !organizations.isSuccess || !organizations.data.length}>
              Создать пользователя
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      <Dialog open={confirmClose} onClose={() => setConfirmClose(false)} aria-labelledby="discard-new-user-title">
        <DialogTitle id="discard-new-user-title">Закрыть без сохранения?</DialogTitle>
        <DialogContent><DialogContentText>Введённые данные будут потеряны.</DialogContentText></DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmClose(false)}>Продолжить редактирование</Button>
          <Button onClick={onClose}>Не сохранять</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
