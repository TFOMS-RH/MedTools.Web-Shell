import type { LoginResponse } from "../types/LoginReponse";
import apiClient from "../../../shared/api/client/apiClient";
import type { AuthUser } from "../types/AuthUser";

export const authService = {
  login: async (userName: string, password: string) => {
    const response = await apiClient.post<LoginResponse>("/identity/auth/login", { userName, password });
    return response.data;
  },
  getCurrentUser: async (signal?: AbortSignal) => {
    const response = await apiClient.get<AuthUser>("/identity/users/me", { signal });
    return response.data;
  },
};
