"use client";

import { useCallback, useEffect, useState } from "react";

export type Route =
  | { view: "landing" }
  | { view: "dashboard" }
  | { view: "wizard" }
  | { view: "workspace"; appId: string; tab: string }
  | { view: "preview"; appId: string };

export function parseHash(hash: string): Route {
  const clean = hash.replace(/^#\/?/, "");
  const parts = clean.split("/").filter(Boolean);
  if (parts.length === 0) return { view: "landing" };
  if (parts[0] === "dashboard") return { view: "dashboard" };
  if (parts[0] === "new") return { view: "wizard" };
  if (parts[0] === "app" && parts[1]) {
    if (parts[2] === "preview") return { view: "preview", appId: parts[1] };
    return { view: "workspace", appId: parts[1], tab: parts[2] || "overview" };
  }
  return { view: "landing" };
}

export function navigate(to: string) {
  if (typeof window !== "undefined") {
    window.location.hash = to;
  }
}

export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(() =>
    typeof window !== "undefined" ? parseHash(window.location.hash) : { view: "landing" },
  );

  useEffect(() => {
    const onChange = () => {
      setRoute(parseHash(window.location.hash));
      window.scrollTo({ top: 0 });
    };
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  return route;
}

export function useGo() {
  return useCallback((to: string) => navigate(to), []);
}
