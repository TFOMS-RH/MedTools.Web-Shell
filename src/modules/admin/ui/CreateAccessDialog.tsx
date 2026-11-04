import { useState, type FormEvent } from "react";
import {
  Alert, Button, Dialog, DialogActions, DialogContent,
  DialogContentText, DialogTitle, TextField,
} from "@mui/material";
import { useAuthStore } from "../../auth/stores/authStore";
import { adminPermissions } from "../model/permissions";
import { useCreateAdminAccessMutation } from "../model/useAdminAccessQueries";
import {
  accessFieldLabels, buildPermissionRequest, buildRoleRequest, validateAccessForm,
  type AccessFormErrors, type AccessFormValues, type AccessKind,
} from "../model/accessForm";
import { getApiError, type ApiErrorInfo } from "../../../shared/helpers/getApiError";
import { useUnsavedChanges } from "./useUnsavedChanges";
import styles from "./access.module.scss";

export const CreateAccessDialog = ({ kind, onClose, onCreated }: {
  kind: AccessKind;
  onClose: () => void;
  onCreated: () => void;
}) => {
  const [values, setValues] = useState<AccessFormValues>({ name: "", code: "", description: "" });
  const [validation, setValidation] = useState<AccessFormErrors>({});
  const [serverError, setServerError] = useState<ApiErrorInfo | null>(null);
  const [confirmClose, setConfirmClose] = useState(false);
  const mutation = useCreateAdminAccessMutation();
  const canCreate = useAuthStore((state) => state.permissions.includes(
    kind === "role" ? adminPermissions.createRoles : adminPermissions.createPermissions,
  ));
  const dirty = Object.values(values).some((value) => value.length > 0);
  useUnsavedChanges(dirty || mutation.isPending);

  const requestClose = () => {
    if (mutation.isPending) return;
    if (dirty) setConfirmClose(true);
    else onClose();
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canCreate || mutation.isPending) return;
    const errors = validateAccessForm(kind, values);
    setValidation(errors);
    setServerError(null);
    if (Object.keys(errors).length) return;
    mutation.mutate(
      kind === "role"
        ? { kind, request: buildRoleRequest(values) }
        : { kind, request: buildPermissionRequest(values) },
      {
        onSuccess: onCreated,
        onError: (error) => {
          const info = getApiError(error, kind === "role"
            ? "Не удалось создать роль." : "Не удалось создать разрешение.");
          // ASP.NET ValidationProblem uses PascalCase request property names.
          setServerError({ ...info, fields: Object.fromEntries(
            Object.entries(info.fields).map(([field, message]) => [field.toLowerCase(), message]),
          ) });
        },
      },
    );
  };

  const fields: (keyof AccessFormValues)[] = kind === "role"
    ? ["name"] : ["code", "name", "description"];

  return (
    <>
      <Dialog open fullWidth maxWidth="sm" onClose={requestClose}
        aria-labelledby="create-access-title" className={styles.dialog}>
        <form onSubmit={submit} noValidate aria-busy={mutation.isPending}>
          <DialogTitle id="create-access-title">
            {kind === "role" ? "Новая роль" : "Новое разрешение"}
          </DialogTitle>
          <DialogContent className={styles.formFields}>
            <p className={styles.secondary}>
              {kind === "role"
                ? "Создайте роль, которую можно назначить пользователям."
                : "Укажите код и понятное название разрешения. Описание необязательно."}
            </p>
            {!canCreate && <Alert severity="error">Нет разрешения на создание.</Alert>}
            {serverError && (
              <Alert severity="error">
                {serverError.message}
                {Object.entries(serverError.fields)
                  .filter(([field]) => !fields.includes(field as keyof AccessFormValues))
                  .map(([field, message]) => <div key={field}>{message}</div>)}
              </Alert>
            )}
            {fields.map((field, index) => {
              const error = validation[field] ?? serverError?.fields[field];
              return (
                <TextField key={field} label={accessFieldLabels[field]}
                  value={values[field]} fullWidth autoFocus={index === 0}
                  required={field !== "description"} multiline={field === "description"}
                  minRows={field === "description" ? 3 : undefined}
                  disabled={mutation.isPending || !canCreate}
                  error={Boolean(error)} helperText={error}
                  className={styles.input}
                  slotProps={{ htmlInput: { maxLength: kind === "permission" ? 255 : undefined } }}
                  onChange={(event) => {
                    setValues((previous) => ({ ...previous, [field]: event.target.value }));
                    setValidation((previous) => ({ ...previous, [field]: undefined }));
                    setServerError(null);
                  }} />
              );
            })}
          </DialogContent>
          <DialogActions className={styles.formActions}>
            <Button className={styles.button} disabled={mutation.isPending} onClick={requestClose}>
              Отмена
            </Button>
            <Button type="submit" className={styles.primaryButton}
              loading={mutation.isPending} disabled={!canCreate}>
              {kind === "role" ? "Создать роль" : "Создать разрешение"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      <Dialog open={confirmClose} onClose={() => setConfirmClose(false)}
        aria-labelledby="discard-access-title">
        <DialogTitle id="discard-access-title">Закрыть без сохранения?</DialogTitle>
        <DialogContent>
          <DialogContentText>Введённые данные будут потеряны.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmClose(false)}>Продолжить редактирование</Button>
          <Button onClick={onClose}>Не сохранять</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
