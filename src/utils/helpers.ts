import { Language, LocalizedText } from "../data";

/** Format an ISO timestamp as HH:mm in Cairo (Africa/Cairo) timezone. */
export function formatCairoTime(value?: string) {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Cairo",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

/** Return the localized string for a given language key. */
export function localize(value: LocalizedText, language: Language) {
  return value[language];
}

/** Localize a flight_status string to a user-friendly label. */
export function localizedFlightStatus(status: string, language: Language) {
  const normalized = status.toLowerCase();
  const labels: Record<string, LocalizedText> = {
    scheduled: { en: "Scheduled", ar: "مجدولة" },
    active: { en: "Active", ar: "نشطة" },
    landed: { en: "Landed", ar: "هبطت" },
    cancelled: { en: "Cancelled", ar: "ملغاة" },
    incident: { en: "Incident", ar: "حادث" },
    diverted: { en: "Diverted", ar: "محولة" },
    "on time": { en: "On time", ar: "في الموعد" },
    landing: { en: "Landing", ar: "تهبط" },
    "delayed +18m": { en: "Delayed +18m", ar: "متأخرة 18د" },
  };
  return localize(labels[normalized] ?? { en: status, ar: status }, language);
}

/** Get the CSS variable string for a given Tone. */
export function toneCssVar(tone: import('../data').Tone) {
  const map: Record<import('../data').Tone, string> = {
    ok: "var(--status-ok)",
    info: "var(--status-info)",
    warn: "var(--status-warn)",
    high: "var(--status-high)",
    crit: "var(--status-crit)",
    neutral: "var(--muted-foreground)",
  };
  return map[tone];
}
