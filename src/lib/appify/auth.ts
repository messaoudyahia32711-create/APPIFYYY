"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type AppifyUser = {
  name: string;
  email: string;
  provider: "google";
};

type AuthState = {
  user: AppifyUser | null;
  signIn: (user: AppifyUser) => void;
  signOut: () => void;
};

/**
 * Session store for the Gmail (Google) sign-in.
 * Persisted locally so the account survives reloads — mirrors how the
 * original platform keeps you signed in across visits.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      signIn: (user) => set({ user }),
      signOut: () => set({ user: null }),
    }),
    {
      name: "appify-user-v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user }) as unknown as AuthState,
    },
  ),
);
