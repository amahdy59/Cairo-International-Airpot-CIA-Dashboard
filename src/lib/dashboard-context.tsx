import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Lang = "en" | "ar";
type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  hc: boolean;
  setHc: (v: boolean) => void;
  reduceMotion: boolean;
  setReduceMotion: (v: boolean) => void;
  accessibleRoutes: boolean;
  setAccessibleRoutes: (v: boolean) => void;
  t: (key: keyof typeof DICT.en) => string;
};

const DICT = {
  en: {
    appName: "CAI Smart Airport Command Center",
    cairo: "Cairo International Airport",
    overview: "Airport Pulse",
    flights: "Live Flights",
    navigation: "Smart Navigation",
    heatmap: "Flow & Queues",
    gates: "Gate Connections",
    transport: "APM, Transport & Parking",
    services: "Services & Comfort",
    operations: "Operations",
    contrast: "High Contrast",
    motion: "Reduce Motion",
    access: "Accessible Routes",
    language: "العربية",
    settings: "Settings",
    live: "LIVE",
    today: "Today",
    nominal: "Nominal",
    alert: "Alert",
  },
  ar: {
    appName: "مركز قيادة مطار القاهرة الذكي",
    cairo: "مطار القاهرة الدولي",
    overview: "نبض المطار",
    flights: "الرحلات المباشرة",
    navigation: "الملاحة الذكية",
    heatmap: "التدفق والطوابير",
    gates: "اتصالات البوابات",
    transport: "النقل والمواقف",
    services: "الخدمات والراحة",
    operations: "العمليات",
    contrast: "تباين عالٍ",
    motion: "تقليل الحركة",
    access: "مسارات متاحة",
    language: "English",
    settings: "الإعدادات",
    live: "مباشر",
    today: "اليوم",
    nominal: "طبيعي",
    alert: "تنبيه",
  },
} as const;

const DashCtx = createContext<Ctx | null>(null);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");
  const [hc, setHc] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [accessibleRoutes, setAccessibleRoutes] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("dark");
    root.classList.toggle("hc", hc);
    root.classList.toggle("reduce-motion", reduceMotion);
    root.dir = lang === "ar" ? "rtl" : "ltr";
    root.lang = lang;
  }, [hc, reduceMotion, lang]);

  return (
    <DashCtx.Provider
      value={{
        lang, setLang, hc, setHc, reduceMotion, setReduceMotion,
        accessibleRoutes, setAccessibleRoutes,
        t: (k) => DICT[lang][k],
      }}
    >
      {children}
    </DashCtx.Provider>
  );
}

export function useDashboard() {
  const c = useContext(DashCtx);
  if (!c) throw new Error("useDashboard outside provider");
  return c;
}
