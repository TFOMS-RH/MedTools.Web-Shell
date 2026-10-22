import { MedToolsButton } from "../../../shared/ui/medTools/buttons/MedToolsButton";
import { useAuthStore } from "../../../modules/auth/stores/authStore";
import { authService } from "../../../modules/auth/api/authService";
import { Divider } from "../../ui/Divider/Divider";
import { Navigate, useLocation, useNavigate, useSearchParams } from "react-router";
import React, { useState } from "react";
import { Alert, TextField } from "@mui/material";
import { medToolsInputSx } from "../../../shared/sxConfigs/medToolsInputSx";
import { getApiError } from "../../../shared/helpers/getApiError";
import styles from "./styles.module.scss";

export const Login = () => {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const user = useAuthStore((state) => state.user);
  const navigator = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const requestedPath = searchParams.get("returnTo");
  const returnTo = requestedPath?.startsWith("/") && !requestedPath.startsWith("//") && !requestedPath.startsWith("/login") && !requestedPath.includes("\\") ? requestedPath : "/";
  const notice: unknown = location.state?.notice;

  if (user) return <Navigate to={returnTo} replace />;

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading) return;
    try {
      setIsLoading(true);
      setError(null);
      const result = await authService.login(userName.trim(), password);
      if (!result.accessToken || result.tokenType !== "Bearer") {
        throw new Error("Некорректный ответ сервера аутентификации");
      }
      useAuthStore.getState().setSession(result.accessToken);
      navigator(returnTo, { replace: true });
    } catch (reason) {
      const info = getApiError(reason, "Не удалось войти. Повторите попытку.");
      setError(info.status === 401 ? "Неверный логин или пароль." : info.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className={styles.loginRoot}>
      <header className={styles.loginHeader}>
        <h1>Вход в MedTools Web</h1>
      </header>

      <form onSubmit={handleLogin} className={styles.loginForm}>
        <header className={styles.loginFormHeader}>
          <h2>Войдите в свой аккаунт</h2>

          <p className={styles.primaryText}>
            Получите данные у отдела информационно-аналитического обеспечения или введите их ниже
          </p>
        </header>

        <section className={styles.inputs}>
          {typeof notice === "string" && <Alert severity="info">{notice}</Alert>}
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            label="Логин"
            value={userName}
            onChange={(event) => setUserName(event.target.value)}
            autoComplete="username"
            required
            disabled={isLoading}
            sx={medToolsInputSx}
            fullWidth
            size="small"
          />

          <TextField
            label="Пароль"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
            disabled={isLoading}
            sx={medToolsInputSx}
            fullWidth
            size="small"
            type="password"
          />
        </section>

        <Divider />

        <section className={styles.actions}>
          <MedToolsButton
            text="Войти"
            variant="outlined"
            fullWidth
            isLoading={isLoading}
            isSubmitButton
          />
        </section>
      </form>
    </section>
  );
};
