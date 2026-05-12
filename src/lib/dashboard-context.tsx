import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Lang = "en" | "ar";
type Mode = "traveler" | "manager";

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  hc: boolean;
  setHc: (v: boolean) => void;
  reduceMotion: boolean;
  setReduceMotion: (v: boolean) => void;
  mode: Mode;
  setMode: (m: Mode) => void;
};

const DashCtx = createContext<Ctx | null>(null);

function getInitialMode(): Mode {
  if (typeof window === "undefined") return "traveler";
  return window.location.pathname === "/ops" || window.location.pathname === "/safety" ? "manager" : "traveler";
}

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");
  const [hc, setHc] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [mode, setMode] = useState<Mode>(getInitialMode);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("dark");
    root.classList.toggle("hc", hc);
    root.classList.toggle("reduce-motion", reduceMotion);
    root.dir = lang === "ar" ? "rtl" : "ltr";
    root.lang = lang;
  }, [hc, reduceMotion, lang]);

  return (
    <DashCtx.Provider value={{ lang, setLang, hc, setHc, reduceMotion, setReduceMotion, mode, setMode }}>
      {children}
    </DashCtx.Provider>
  );
}

export function useDashboard() {
  const c = useContext(DashCtx);
  if (!c) throw new Error("useDashboard outside provider");
  return c;
}
