import { useEffect, useState } from "react";
import { Bell, Contrast, Languages, MoonStar, Accessibility, Search } from "lucide-react";
import { useDashboard } from "@/lib/dashboard-context";

export function Topbar({ section, sub }: { section: string; sub?: string }) {
  const { lang, setLang, hc, setHc, reduceMotion, setReduceMotion, accessibleRoutes, setAccessibleRoutes, t } = useDashboard();
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const i = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(i);
  }, []);

  const date = now.toLocaleDateString(lang === "ar" ? "ar-EG" : "en-GB", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });
  const time = now.toLocaleTimeString(lang === "ar" ? "ar-EG" : "en-GB", { hour: "2-digit", minute: "2-digit" });

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-xl">
      <div className="flex items-center gap-4 px-5 lg:px-8 h-16">
        <div className="min-w-0">
          <div className="text-[10px] font-mono tracking-[0.22em] text-primary">CAI · {t("cairo").toUpperCase()}</div>
          <h1 className="text-base lg:text-lg font-semibold truncate">{section}{sub && <span className="text-muted-foreground font-normal"> · {sub}</span>}</h1>
        </div>

        <div className="hidden md:flex items-center gap-2 ms-6 panel-inner px-3 py-1.5 w-[280px]">
          <Search className="h-3.5 w-3.5 text-muted-foreground" />
          <input
            placeholder={lang === "ar" ? "بحث رحلات، بوابات…" : "Search flights, gates, services…"}
            className="bg-transparent outline-none text-sm flex-1 placeholder:text-muted-foreground/70"
          />
          <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-border text-muted-foreground">⌘K</kbd>
        </div>

        <div className="ms-auto flex items-center gap-2">
          <div className="hidden xl:flex flex-col items-end leading-tight me-2">
            <div className="text-[11px] text-muted-foreground font-mono">{date}</div>
            <div className="text-sm font-mono">{time} <span className="text-primary">CLT</span></div>
          </div>

          <ToggleBtn active={accessibleRoutes} onClick={() => setAccessibleRoutes(!accessibleRoutes)} label={t("access")} icon={<Accessibility className="h-4 w-4" />} />
          <ToggleBtn active={hc} onClick={() => setHc(!hc)} label={t("contrast")} icon={<Contrast className="h-4 w-4" />} />
          <ToggleBtn active={reduceMotion} onClick={() => setReduceMotion(!reduceMotion)} label={t("motion")} icon={<MoonStar className="h-4 w-4" />} />

          <button
            onClick={() => setLang(lang === "en" ? "ar" : "en")}
            className="flex items-center gap-1.5 h-9 px-3 rounded-md border border-border text-xs hover:bg-secondary transition-colors"
            aria-label="Toggle language"
          >
            <Languages className="h-4 w-4 text-primary" />
            <span className="font-mono">{lang === "en" ? "AR" : "EN"}</span>
          </button>

          <button className="relative h-9 w-9 grid place-items-center rounded-md border border-border hover:bg-secondary" aria-label="Notifications">
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 end-1.5 h-2 w-2 rounded-full bg-accent glow-magenta" />
          </button>
        </div>
      </div>
    </header>
  );
}

function ToggleBtn({ active, onClick, label, icon }: { active: boolean; onClick: () => void; label: string; icon: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      title={label}
      className={`group hidden md:flex items-center gap-1.5 h-9 px-2.5 rounded-md border text-xs transition-colors ${active ? "border-primary bg-primary/15 text-primary" : "border-border hover:bg-secondary"}`}
    >
      {icon}
      <span className="hidden xl:inline">{label}</span>
    </button>
  );
}
