import { create } from "zustand";
import type { AuthUser } from "../types/AuthUser";
import { readTokenClaims } from "../helpers/readTokenClaims";
import { queryClient } from "../../../shared/api/client/queryClient";

interface AuthState {
  accessToken: string | null;
  user: AuthUser | null;
  isInitialized: boolean;
  permissions: string[];
  setSession: (accessToken: string) => void;
  setUser: (user: AuthUser) => void;
  clearSession: () => void;
}

const savedToken = sessionStorage.getItem("accessToken");

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: savedToken,
  user: null,
  isInitialized: !savedToken,
  permissions: [],
  setSession: (accessToken) => {
    queryClient.clear();
    sessionStorage.setItem("accessToken", accessToken);
    set({ accessToken, user: null, permissions: [], isInitialized: false });
  },
  setUser: (user) =>
    set((state) => ({
      user,
      permissions: state.accessToken
        ? (readTokenClaims(state.accessToken)?.permissions ?? [])
        : [],
      isInitialized: true,
    })),
  clearSession: () => {
    sessionStorage.removeItem("accessToken");
    set({
      accessToken: null,
      user: null,
      permissions: [],
      isInitialized: true,
    });
    queryClient.clear();
  },
}));
