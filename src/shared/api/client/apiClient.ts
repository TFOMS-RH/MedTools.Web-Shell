import axios from "axios";
import { useAuthStore } from "../../../modules/auth/stores/authStore";

const apiClient = axios.create({
  baseURL: "/api",

  timeout: 300000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;

  if (token && config.url !== "/identity/auth/login") {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const token = useAuthStore.getState().accessToken;
    // An old request must not clear a session established by a newer login.
    if (error.response?.status === 401 && token &&
        error.config?.headers?.Authorization === `Bearer ${token}` &&
        error.config?.url !== "/identity/auth/login") {
      useAuthStore.getState().clearSession();
      if (window.location.pathname !== "/login") {
        window.location.replace(`/login?returnTo=${encodeURIComponent(window.location.pathname)}`);
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
