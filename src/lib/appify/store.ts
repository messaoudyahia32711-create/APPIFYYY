"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { AppRecord, BridgeEvent, BuildRecord, NotificationItem } from "./types";
import { createDemoApp, uid } from "./defaults";

type AppifyState = {
  apps: AppRecord[];
  seeded: boolean;
  bridgeEvents: BridgeEvent[];
  pendingBridgeDemo: string | null;
  // app CRUD
  createApp: (app: AppRecord) => AppRecord;
  updateApp: (id: string, updater: (app: AppRecord) => AppRecord) => void;
  deleteApp: (id: string) => void;
  // notifications
  addNotification: (appId: string, n: NotificationItem) => void;
  // builds
  addBuild: (appId: string, b: BuildRecord) => void;
  updateBuild: (appId: string, buildId: string, patch: Partial<BuildRecord>) => void;
  // bridge console
  pushBridgeEvent: (ev: Omit<BridgeEvent, "id" | "at">) => void;
  clearBridgeEvents: () => void;
  queueBridgeDemo: (method: string) => void;
  consumeBridgeDemo: () => string | null;
  clearPendingBridgeDemo: () => void;
  // seeding
  seedIfEmpty: () => void;
};

export const useAppifyStore = create<AppifyState>()(
  persist(
    (set, get) => ({
      apps: [],
      seeded: false,
      bridgeEvents: [],
      pendingBridgeDemo: null,

      createApp: (app) => {
        set((s) => ({ apps: [app, ...s.apps] }));
        return app;
      },

      updateApp: (id, updater) => {
        set((s) => ({
          apps: s.apps.map((a) => (a.id === id ? updater(a) : a)),
        }));
      },

      deleteApp: (id) => {
        set((s) => ({ apps: s.apps.filter((a) => a.id !== id) }));
      },

      addNotification: (appId, n) => {
        set((s) => ({
          apps: s.apps.map((a) =>
            a.id === appId ? { ...a, notifications: [n, ...a.notifications], updatedAt: Date.now() } : a,
          ),
        }));
      },

      addBuild: (appId, b) => {
        set((s) => ({
          apps: s.apps.map((a) => (a.id === appId ? { ...a, builds: [b, ...a.builds], updatedAt: Date.now() } : a)),
        }));
      },

      updateBuild: (appId, buildId, patch) => {
        set((s) => ({
          apps: s.apps.map((a) =>
            a.id === appId
              ? { ...a, builds: a.builds.map((b) => (b.id === buildId ? { ...b, ...patch } : b)) }
              : a,
          ),
        }));
      },

      pushBridgeEvent: (ev) => {
        set((s) => ({
          bridgeEvents: [{ ...ev, id: uid(), at: Date.now() }, ...s.bridgeEvents].slice(0, 40),
        }));
      },

      clearBridgeEvents: () => set({ bridgeEvents: [] }),

      queueBridgeDemo: (method) => set({ pendingBridgeDemo: method }),

      consumeBridgeDemo: () => {
        const m = get().pendingBridgeDemo;
        if (m) set({ pendingBridgeDemo: null });
        return m;
      },

      clearPendingBridgeDemo: () => set({ pendingBridgeDemo: null }),

      seedIfEmpty: () => {
        const { seeded, apps } = get();
        if (!seeded && apps.length === 0) {
          set({ apps: [createDemoApp()], seeded: true });
        } else if (!seeded) {
          set({ seeded: true });
        }
      },
    }),
    {
      name: "appify-store-v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        apps: state.apps,
        seeded: state.seeded,
      }) as unknown as AppifyState,
    },
  ),
);

// Selector helpers
export function useAppById(id: string | undefined): AppRecord | undefined {
  return useAppifyStore((s) => (id ? s.apps.find((a) => a.id === id) : undefined));
}
