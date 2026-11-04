import { create } from "zustand";
import type { AuthUser } from "../types/AuthUser";
import { readTokenClaims } from "../helpers/readTokenClaims";
import { queryClient } from "../../../shared/api/client/queryClient";

interface AuthState {
  accessToken: string | null;
  user: AuthUser | null;
  isInitialized: boolean;
  permissions: string[];
  organizationType: number | null; 
  organizationCode: string | null; 
  setSession: (accessToken: string) => void;
  setUser: (user: AuthUser) => void;
  clearSession: () => void;
}

const savedToken = sessionStorage.getItem("accessToken");

export const useAuthStore = create<AuthState>((set) => {
  const initialClaims = savedToken ? readTokenClaims(savedToken) : null;

  return {
    accessToken: savedToken,
    user: null,
    isInitialized: !savedToken,
    permissions: initialClaims?.permissions ?? [],
    organizationType: initialClaims?.organizationType ?? null, 
    organizationCode: initialClaims?.organizationCode ?? null, 

    setSession: (accessToken) => {
      queryClient.clear();
      sessionStorage.setItem("accessToken", accessToken);
      
      const claims = readTokenClaims(accessToken);
      
      set({ 
        accessToken, 
        user: null, 
        permissions: claims?.permissions ?? [], 
        organizationType: claims?.organizationType ?? null,
        organizationCode: claims?.organizationCode ?? null,
        isInitialized: false 
      });
    },

    setUser: (user) =>
      set((state) => {
        const claims = state.accessToken ? readTokenClaims(state.accessToken) : null;
        return {
          user,
          permissions: claims?.permissions ?? [],
          organizationType: claims?.organizationType ?? null,
          organizationCode: claims?.organizationCode ?? null,
          isInitialized: true,
        };
      }),

    clearSession: () => {
      sessionStorage.removeItem("accessToken");
      set({
        accessToken: null,
        user: null,
        permissions: [],
        organizationType: null,
        organizationCode: null,
        isInitialized: true,
      });
      queryClient.clear();
    },
  };
});
