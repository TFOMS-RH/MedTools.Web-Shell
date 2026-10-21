import { useEffect, useState, type ReactNode } from "react";
import { Button, CircularProgress } from "@mui/material";
import { authService } from "../api/authService";
import { useAuthStore } from "../stores/authStore";
import { readTokenClaims } from "../helpers/readTokenClaims";
import { DataState } from "../../../shared/ui/DataState/DataState";
import { getApiError } from "../../../shared/helpers/getApiError";
import { medToolsButtonSx } from "../../../shared/sxConfigs/medToolsButtonSx";

export const AuthSession = ({ children }: { children: ReactNode }) => {
  const token = useAuthStore((state) => state.accessToken);
  const initialized = useAuthStore((state) => state.isInitialized);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!token) return;
    const expiresAt = readTokenClaims(token)?.expiresAt ?? 0;
    if (expiresAt <= Date.now()) {
      useAuthStore.getState().clearSession();
      return;
    }
    const timer = window.setInterval(() => {
      if (expiresAt <= Date.now()) useAuthStore.getState().clearSession();
    }, 30_000);
    return () => window.clearInterval(timer);
  }, [token]);

  useEffect(() => {
    if (!token || initialized) return;
    const controller = new AbortController();
    authService
      .getCurrentUser(controller.signal)
      .then((user) => {
        if (
          !controller.signal.aborted &&
          useAuthStore.getState().accessToken === token
        ) {
          setError(null);
          useAuthStore.getState().setUser(user);
        }
      })
      .catch((reason: unknown) => {
        if (
          !controller.signal.aborted &&
          useAuthStore.getState().accessToken === token
        ) {
          setError(
            getApiError(reason, "Не удалось восстановить профиль пользователя.")
              .message,
          );
        }
      });
    return () => controller.abort();
  }, [token, initialized, attempt]);

  if (token && !initialized) {
    return error ? (
      <section role="alert">
        <DataState
          variant="error"
          title="Не удалось загрузить профиль"
          description={error}
        />
        <Button
          sx={medToolsButtonSx}
          onClick={() => {
            setError(null);
            setAttempt((value) => value + 1);
          }}
        >
          Повторить
        </Button>
        <Button
          sx={medToolsButtonSx}
          onClick={() => {
            setError(null);
            useAuthStore.getState().clearSession();
          }}
        >
          Выйти
        </Button>
      </section>
    ) : (
      <CircularProgress aria-label="Восстановление сессии" color="inherit" />
    );
  }
  return children;
};
