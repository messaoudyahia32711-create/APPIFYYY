"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { ar, type Dict } from "./ar";
import { en } from "./en";

export type Lang = "ar" | "en";

type LangContextValue = {
  lang: Lang;
  dir: "rtl" | "ltr";
  d: Dict;
  setLang: (l: Lang) => void;
  toggleLang: () => void;
};

const LangContext = createContext<LangContextValue>({
  lang: "ar",
  dir: "rtl",
  d: ar,
  setLang: () => {},
  toggleLang: () => {},
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("ar");

  useEffect(() => {
    const t = window.setTimeout(() => {
      try {
        const saved = window.localStorage.getItem("appify-lang");
        if (saved === "en" || saved === "ar") setLangState(saved);
      } catch {
        /* ignore */
      }
    }, 0);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    try {
      window.localStorage.setItem("appify-lang", lang);
    } catch {
      /* ignore */
    }
  }, [lang]);

  const setLang = useCallback((l: Lang) => setLangState(l), []);
  const toggleLang = useCallback(() => setLangState((p) => (p === "ar" ? "en" : "ar")), []);

  const value = useMemo<LangContextValue>(
    () => ({ lang, dir: lang === "ar" ? "rtl" : "ltr", d: lang === "ar" ? ar : en, setLang, toggleLang }),
    [lang, setLang, toggleLang],
  );

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang() {
  return useContext(LangContext);
}
