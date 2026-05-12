import { useMemo, useState } from "react";
import {
  BadgeInfo,
  Building2,
  Car,
  CircleDollarSign,
  CircleX,
  Coffee,
  DoorOpen,
  Eye,
  Info,
  MapPin,
  Plane,
  ShieldCheck,
  ShoppingBag,
  Utensils,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type Language = "en" | "ar";

type SceneId = "overview" | "terminal1" | "terminal2" | "terminal3" | "airside";
type LayerId = "restaurants" | "services" | "parking" | "atms" | "lounges" | "gates";
type LocalText = Record<Language, string>;

type Hotspot = {
  id: string;
  layer?: LayerId;
  icon: LucideIcon;
  x: number;
  y: number;
  title: LocalText;
  summary: LocalText;
  detailTarget?: SceneId;
};

type Scene = {
  id: SceneId;
  aiImage: string;
  realImage: string;
  source: string;
  sourceLabel: string;
  title: LocalText;
  subtitle: LocalText;
  notes: LocalText[];
  hotspots: Hotspot[];
};

const ar = (value: string) => value;
const t = (en: string, arText: string): LocalText => ({ en, ar: arText });
const commons = (fileName: string) => `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(fileName)}`;
const ai = (prompt: string, seed: number) =>
  `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1600&height=900&seed=${seed}&nologo=true&enhance=true`;

const ui = {
  en: {
    eyebrow: "Interactive airport image map",
    title: "Cairo Airport visual command map",
    description: "Use the AI-generated airport layout as the main interactive canvas. Click hotspots to inspect details, jump into terminal views, or open a real image overlay.",
    source: "Real image source",
    selected: "Selected area",
    visit: "Open detailed view",
    realImage: "View real image",
    close: "Close image",
    views: "Airport image views",
    layers: "Show on map",
    notes: "Useful context",
    generated: "AI-generated layout",
  },
  ar: {
    eyebrow: ar("\u062e\u0631\u064a\u0637\u0629 \u0645\u0637\u0627\u0631 \u062a\u0641\u0627\u0639\u0644\u064a\u0629"),
    title: ar("\u062e\u0631\u064a\u0637\u0629 \u0645\u0631\u0626\u064a\u0629 \u0644\u0645\u0637\u0627\u0631 \u0627\u0644\u0642\u0627\u0647\u0631\u0629"),
    description: ar("\u0627\u0633\u062a\u062e\u062f\u0645 \u0635\u0648\u0631\u0629 \u0627\u0644\u0645\u062e\u0637\u0637 \u0627\u0644\u0645\u0648\u0644\u062f\u0629 \u0628\u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064a \u0643\u062e\u0631\u064a\u0637\u0629 \u062a\u0641\u0627\u0639\u0644\u064a\u0629\u060c \u0648\u0627\u0636\u063a\u0637 \u0639\u0644\u0649 \u0627\u0644\u0646\u0642\u0627\u0637 \u0644\u0644\u062a\u0641\u0627\u0635\u064a\u0644."),
    source: ar("\u0645\u0635\u062f\u0631 \u0627\u0644\u0635\u0648\u0631\u0629 \u0627\u0644\u062d\u0642\u064a\u0642\u064a\u0629"),
    selected: ar("\u0627\u0644\u0645\u0646\u0637\u0642\u0629 \u0627\u0644\u0645\u062d\u062f\u062f\u0629"),
    visit: ar("\u0641\u062a\u062d \u0627\u0644\u0639\u0631\u0636 \u0627\u0644\u062a\u0641\u0635\u064a\u0644\u064a"),
    realImage: ar("\u0639\u0631\u0636 \u0635\u0648\u0631\u0629 \u062d\u0642\u064a\u0642\u064a\u0629"),
    close: ar("\u0625\u063a\u0644\u0627\u0642 \u0627\u0644\u0635\u0648\u0631\u0629"),
    views: ar("\u0639\u0631\u0648\u0636 \u0627\u0644\u0645\u0637\u0627\u0631"),
    layers: ar("\u0625\u0638\u0647\u0627\u0631 \u0639\u0644\u0649 \u0627\u0644\u062e\u0631\u064a\u0637\u0629"),
    notes: ar("\u0645\u0639\u0644\u0648\u0645\u0627\u062a \u0645\u0641\u064a\u062f\u0629"),
    generated: ar("\u0645\u062e\u0637\u0637 \u0645\u0648\u0644\u062f \u0628\u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064a"),
  },
} as const;

const layerText: Record<LayerId, LocalText> = {
  restaurants: t("Restaurants", ar("\u0627\u0644\u0645\u0637\u0627\u0639\u0645")),
  services: t("Services", ar("\u0627\u0644\u062e\u062f\u0645\u0627\u062a")),
  parking: t("Parking", ar("\u0627\u0644\u0645\u0648\u0627\u0642\u0641")),
  atms: t("ATMs", ar("\u0627\u0644\u0635\u0631\u0627\u0641 \u0627\u0644\u0622\u0644\u064a")),
  lounges: t("Lounges", ar("\u0627\u0644\u0635\u0627\u0644\u0627\u062a")),
  gates: t("Gates", ar("\u0627\u0644\u0628\u0648\u0627\u0628\u0627\u062a")),
};

const basePrompt =
  "premium Apple-style AI generated aerial airport layout illustration for Cairo International Airport, realistic 3D infographic, runway taxiway apron terminals parking palm trees desert city context, clean labels, soft daylight, high detail, no people closeups";

const scenes: Scene[] = [
  {
    id: "overview",
    aiImage: ai(`${basePrompt}, full airport overview with Terminal 1 left, Terminal 2 center, Terminal 3 right, main halls, parking, ground transport, control tower`, 59101),
    realImage: commons("Cairo Airport Terminal 3.jpg"),
    source: "https://commons.wikimedia.org/wiki/File:Cairo_Airport_Terminal_3.jpg",
    sourceLabel: "Wikimedia Commons / Alensha",
    title: t("Airport overview", ar("\u0646\u0638\u0631\u0629 \u0639\u0627\u0645\u0629 \u0639\u0644\u0649 \u0627\u0644\u0645\u0637\u0627\u0631")),
    subtitle: t("Terminals, parking, transfer and airside orientation", ar("\u0627\u0644\u0645\u0628\u0627\u0646\u064a \u0648\u0627\u0644\u0645\u0648\u0627\u0642\u0641 \u0648\u0627\u0644\u062a\u0646\u0642\u0644 \u0648\u0627\u0644\u0645\u0646\u0627\u0637\u0642 \u0627\u0644\u062c\u0648\u064a\u0629")),
    notes: [
      t("CAI has three parallel 05/23 runways.", ar("\u064a\u0636\u0645 \u0645\u0637\u0627\u0631 \u0627\u0644\u0642\u0627\u0647\u0631\u0629 \u062b\u0644\u0627\u062b\u0629 \u0645\u062f\u0627\u0631\u062c \u0645\u062a\u0648\u0627\u0632\u064a\u0629 \u0628\u0627\u062a\u062c\u0627\u0647 05/23.")),
      t("Terminal 1 is separate from the connected Terminal 2 and Terminal 3 complex.", ar("\u064a\u0642\u0639 \u0645\u0628\u0646\u0649 1 \u0645\u0646\u0641\u0635\u0644\u0627 \u0639\u0646 \u0645\u062c\u0645\u0639 \u0645\u0628\u0646\u064a\u064a 2 \u06483 \u0627\u0644\u0645\u062a\u0635\u0644\u064a\u0646.")),
      t("Passenger services include restaurants, lounges, banks, ATMs, parking, medical support and terminal transfer.", ar("\u062a\u0634\u0645\u0644 \u062e\u062f\u0645\u0627\u062a \u0627\u0644\u0631\u0643\u0627\u0628 \u0627\u0644\u0645\u0637\u0627\u0639\u0645 \u0648\u0627\u0644\u0635\u0627\u0644\u0627\u062a \u0648\u0627\u0644\u0628\u0646\u0648\u0643 \u0648\u0627\u0644\u0635\u0631\u0627\u0641 \u0648\u0627\u0644\u0645\u0648\u0627\u0642\u0641 \u0648\u0627\u0644\u062f\u0639\u0645 \u0627\u0644\u0637\u0628\u064a \u0648\u0627\u0644\u062a\u0646\u0642\u0644 \u0628\u064a\u0646 \u0627\u0644\u0645\u0628\u0627\u0646\u064a.")),
    ],
    hotspots: [
      { id: "overview-t1", icon: Building2, x: 25, y: 52, title: t("Terminal 1", ar("\u0645\u0628\u0646\u0649 1")), summary: t("Domestic, regional and selected international operations.", ar("\u0631\u062d\u0644\u0627\u062a \u062f\u0627\u062e\u0644\u064a\u0629 \u0648\u0625\u0642\u0644\u064a\u0645\u064a\u0629 \u0648\u0628\u0639\u0636 \u0627\u0644\u0631\u062d\u0644\u0627\u062a \u0627\u0644\u062f\u0648\u0644\u064a\u0629.")), detailTarget: "terminal1" },
      { id: "overview-t2", icon: Building2, x: 50, y: 49, title: t("Terminal 2", ar("\u0645\u0628\u0646\u0649 2")), summary: t("Renovated international terminal connected directly to Terminal 3.", ar("\u0645\u0628\u0646\u0649 \u062f\u0648\u0644\u064a \u0645\u0637\u0648\u0631 \u0648\u0645\u062a\u0635\u0644 \u0645\u0628\u0627\u0634\u0631\u0629 \u0628\u0645\u0628\u0646\u0649 3.")), detailTarget: "terminal2" },
      { id: "overview-t3", icon: Building2, x: 73, y: 52, title: t("Terminal 3", ar("\u0645\u0628\u0646\u0649 3")), summary: t("Primary EgyptAir hub and largest passenger terminal at CAI.", ar("\u0627\u0644\u0645\u0631\u0643\u0632 \u0627\u0644\u0631\u0626\u064a\u0633\u064a \u0644\u0645\u0635\u0631 \u0644\u0644\u0637\u064a\u0631\u0627\u0646 \u0648\u0623\u0643\u0628\u0631 \u0645\u0628\u0627\u0646\u064a \u0627\u0644\u0631\u0643\u0627\u0628.")), detailTarget: "terminal3" },
      { id: "overview-parking", layer: "parking", icon: Car, x: 15, y: 77, title: t("Parking", ar("\u0627\u0644\u0645\u0648\u0627\u0642\u0641")), summary: t("Short-stay and pick-up areas near the passenger frontage.", ar("\u0645\u0648\u0627\u0642\u0641 \u0648\u0645\u0646\u0627\u0637\u0642 \u0627\u0633\u062a\u0642\u0628\u0627\u0644 \u0642\u0631\u0628 \u0648\u0627\u062c\u0647\u0629 \u0627\u0644\u0631\u0643\u0627\u0628.")) },
      { id: "overview-ground", layer: "services", icon: MapPin, x: 55, y: 79, title: t("Ground transport", ar("\u0627\u0644\u0646\u0642\u0644 \u0627\u0644\u0623\u0631\u0636\u064a")), summary: t("Buses, taxis, car rental and terminal transfer planning.", ar("\u0627\u0644\u062d\u0627\u0641\u0644\u0627\u062a \u0648\u0633\u064a\u0627\u0631\u0627\u062a \u0627\u0644\u0623\u062c\u0631\u0629 \u0648\u062a\u0623\u062c\u064a\u0631 \u0627\u0644\u0633\u064a\u0627\u0631\u0627\u062a \u0648\u0627\u0644\u062a\u0646\u0642\u0644 \u0628\u064a\u0646 \u0627\u0644\u0645\u0628\u0627\u0646\u064a.")) },
      { id: "overview-airside", icon: Plane, x: 52, y: 18, title: t("Runway and apron", ar("\u0627\u0644\u0645\u062f\u0627\u0631\u062c \u0648\u0627\u0644\u0633\u0627\u062d\u0627\u062a")), summary: t("Runways, taxiways, apron stands, cargo and maintenance context.", ar("\u0627\u0644\u0645\u062f\u0627\u0631\u062c \u0648\u0627\u0644\u0645\u0645\u0631\u0627\u062a \u0648\u0633\u0627\u062d\u0627\u062a \u0627\u0644\u0637\u0627\u0626\u0631\u0627\u062a \u0648\u0627\u0644\u0634\u062d\u0646 \u0648\u0627\u0644\u0635\u064a\u0627\u0646\u0629.")), detailTarget: "airside" },
    ],
  },
  {
    id: "terminal1",
    aiImage: ai(`${basePrompt}, detailed Terminal 1 cutaway with check-in halls, gates, restaurants, ATMs, parking, polished airport infographic`, 59102),
    realImage: commons("CairoAirport-Terminal1.JPG"),
    source: "https://commons.wikimedia.org/wiki/File:CairoAirport-Terminal1.JPG",
    sourceLabel: "Wikimedia Commons / Beebah",
    title: t("Terminal 1 detail", ar("\u062a\u0641\u0627\u0635\u064a\u0644 \u0645\u0628\u0646\u0649 1")),
    subtitle: t("Halls, check-in, services and gates", ar("\u0627\u0644\u0635\u0627\u0644\u0627\u062a \u0648\u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u0633\u0641\u0631 \u0648\u0627\u0644\u062e\u062f\u0645\u0627\u062a \u0648\u0627\u0644\u0628\u0648\u0627\u0628\u0627\u062a")),
    notes: [t("Use this view for check-in, banks/ATMs, restaurants, parking and gate orientation.", ar("\u0627\u0633\u062a\u062e\u062f\u0645 \u0647\u0630\u0627 \u0627\u0644\u0639\u0631\u0636 \u0644\u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u0633\u0641\u0631 \u0648\u0627\u0644\u0628\u0646\u0648\u0643 \u0648\u0627\u0644\u0645\u0637\u0627\u0639\u0645 \u0648\u0627\u0644\u0645\u0648\u0627\u0642\u0641 \u0648\u0627\u0644\u0628\u0648\u0627\u0628\u0627\u062a."))],
    hotspots: [
      { id: "t1-checkin", layer: "services", icon: BadgeInfo, x: 31, y: 66, title: t("Check-in halls", ar("\u0635\u0627\u0644\u0627\u062a \u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u0633\u0641\u0631")), summary: t("Departure counters, baggage wrapping and information support.", ar("\u0643\u0627\u0648\u0646\u062a\u0631\u0627\u062a \u0627\u0644\u0633\u0641\u0631 \u0648\u062a\u063a\u0644\u064a\u0641 \u0627\u0644\u062d\u0642\u0627\u0626\u0628 \u0648\u0645\u0643\u0627\u062a\u0628 \u0627\u0644\u0645\u0639\u0644\u0648\u0645\u0627\u062a.")) },
      { id: "t1-gates", layer: "gates", icon: DoorOpen, x: 72, y: 44, title: t("Gate area", ar("\u0645\u0646\u0637\u0642\u0629 \u0627\u0644\u0628\u0648\u0627\u0628\u0627\u062a")), summary: t("Compact boarding area for Terminal 1 flights.", ar("\u0645\u0646\u0637\u0642\u0629 \u0635\u0639\u0648\u062f \u0645\u062f\u0645\u062c\u0629 \u0644\u0631\u062d\u0644\u0627\u062a \u0645\u0628\u0646\u0649 1.")) },
      { id: "t1-food", layer: "restaurants", icon: Utensils, x: 47, y: 56, title: t("Restaurants and cafes", ar("\u0645\u0637\u0627\u0639\u0645 \u0648\u0645\u0642\u0627\u0647\u064a")), summary: t("Food and drink points near the passenger hall spine.", ar("\u0646\u0642\u0627\u0637 \u0637\u0639\u0627\u0645 \u0648\u0634\u0631\u0627\u0628 \u0642\u0631\u0628 \u0645\u062d\u0648\u0631 \u0627\u0644\u0635\u0627\u0644\u0627\u062a.")) },
      { id: "t1-atm", layer: "atms", icon: CircleDollarSign, x: 58, y: 70, title: t("Banks and ATMs", ar("\u0627\u0644\u0628\u0646\u0648\u0643 \u0648\u0627\u0644\u0635\u0631\u0627\u0641 \u0627\u0644\u0622\u0644\u064a")), summary: t("Currency and cash services grouped with passenger facilities.", ar("\u062e\u062f\u0645\u0627\u062a \u0627\u0644\u0639\u0645\u0644\u0629 \u0648\u0627\u0644\u0646\u0642\u062f \u0636\u0645\u0646 \u0645\u0631\u0627\u0641\u0642 \u0627\u0644\u0631\u0643\u0627\u0628.")) },
      { id: "t1-parking", layer: "parking", icon: Car, x: 19, y: 82, title: t("Parking and pick-up", ar("\u0627\u0644\u0645\u0648\u0627\u0642\u0641 \u0648\u0627\u0644\u0627\u0633\u062a\u0642\u0628\u0627\u0644")), summary: t("Landside access for drop-off, pick-up and parking.", ar("\u0648\u0635\u0648\u0644 \u0623\u0631\u0636\u064a \u0644\u0644\u0646\u0632\u0648\u0644 \u0648\u0627\u0644\u0627\u0633\u062a\u0642\u0628\u0627\u0644 \u0648\u0627\u0644\u0645\u0648\u0627\u0642\u0641.")) },
    ],
  },
  {
    id: "terminal2",
    aiImage: ai(`${basePrompt}, detailed Terminal 2 international concourse with passport control, lounges, duty free, pier gates, sleek Apple map UI`, 59103),
    realImage: commons("CAI T2 20200110.jpg"),
    source: "https://commons.wikimedia.org/wiki/File:CAI_T2_20200110.jpg",
    sourceLabel: "Wikimedia Commons",
    title: t("Terminal 2 detail", ar("\u062a\u0641\u0627\u0635\u064a\u0644 \u0645\u0628\u0646\u0649 2")),
    subtitle: t("International processing and Terminal 3 connector", ar("\u0625\u062c\u0631\u0627\u0621\u0627\u062a \u0627\u0644\u0633\u0641\u0631 \u0627\u0644\u062f\u0648\u0644\u064a \u0648\u0627\u0644\u0627\u062a\u0635\u0627\u0644 \u0628\u0645\u0628\u0646\u0649 3")),
    notes: [t("Terminal 2 connects directly with Terminal 3 and prioritizes international processing.", ar("\u0645\u0628\u0646\u0649 2 \u0645\u062a\u0635\u0644 \u0645\u0628\u0627\u0634\u0631\u0629 \u0628\u0645\u0628\u0646\u0649 3 \u0648\u064a\u0631\u0643\u0632 \u0639\u0644\u0649 \u0625\u062c\u0631\u0627\u0621\u0627\u062a \u0627\u0644\u0633\u0641\u0631 \u0627\u0644\u062f\u0648\u0644\u064a."))],
    hotspots: [
      { id: "t2-checkin", layer: "services", icon: BadgeInfo, x: 30, y: 68, title: t("Departure hall", ar("\u0635\u0627\u0644\u0629 \u0627\u0644\u0645\u063a\u0627\u062f\u0631\u0629")), summary: t("Check-in and passenger preparation before security.", ar("\u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u0633\u0641\u0631 \u0648\u062a\u062c\u0647\u064a\u0632 \u0627\u0644\u0631\u0643\u0627\u0628 \u0642\u0628\u0644 \u0627\u0644\u062a\u0641\u062a\u064a\u0634.")) },
      { id: "t2-security", layer: "services", icon: ShieldCheck, x: 48, y: 54, title: t("Security and passport control", ar("\u0627\u0644\u0623\u0645\u0646 \u0648\u0627\u0644\u062c\u0648\u0627\u0632\u0627\u062a")), summary: t("International processing before airside entry.", ar("\u0625\u062c\u0631\u0627\u0621\u0627\u062a \u062f\u0648\u0644\u064a\u0629 \u0642\u0628\u0644 \u062f\u062e\u0648\u0644 \u0645\u0646\u0637\u0642\u0629 \u0627\u0644\u0633\u0641\u0631.")) },
      { id: "t2-lounge", layer: "lounges", icon: Coffee, x: 62, y: 44, title: t("Lounges", ar("\u0627\u0644\u0635\u0627\u0644\u0627\u062a")), summary: t("Premium waiting areas near the secure concourse.", ar("\u0645\u0646\u0627\u0637\u0642 \u0627\u0646\u062a\u0638\u0627\u0631 \u0645\u0645\u064a\u0632\u0629 \u0642\u0631\u0628 \u0627\u0644\u0645\u0645\u0631 \u0627\u0644\u0645\u0624\u0645\u0646.")) },
      { id: "t2-retail", layer: "restaurants", icon: ShoppingBag, x: 62, y: 66, title: t("Duty free and food", ar("\u0627\u0644\u0633\u0648\u0642 \u0627\u0644\u062d\u0631\u0629 \u0648\u0627\u0644\u0637\u0639\u0627\u0645")), summary: t("Retail, duty free, restaurants and cafeterias along the concourse.", ar("\u0645\u062a\u0627\u062c\u0631 \u0648\u0633\u0648\u0642 \u062d\u0631\u0629 \u0648\u0645\u0637\u0627\u0639\u0645 \u0639\u0644\u0649 \u0627\u0645\u062a\u062f\u0627\u062f \u0627\u0644\u0645\u0645\u0631.")) },
      { id: "t2-gates", layer: "gates", icon: DoorOpen, x: 78, y: 50, title: t("Pier gates", ar("\u0628\u0648\u0627\u0628\u0627\u062a \u0627\u0644\u0631\u0635\u064a\u0641")), summary: t("Airside gate bank connected to aircraft stands.", ar("\u0645\u062c\u0645\u0648\u0639\u0629 \u0628\u0648\u0627\u0628\u0627\u062a \u0645\u062a\u0635\u0644\u0629 \u0628\u0645\u0648\u0627\u0642\u0641 \u0627\u0644\u0637\u0627\u0626\u0631\u0627\u062a.")) },
    ],
  },
  {
    id: "terminal3",
    aiImage: ai(`${basePrompt}, detailed Terminal 3 EgyptAir hub with check in, lounges, duty free, pier gates, parking, premium travel dashboard illustration`, 59104),
    realImage: commons("Gate at Terminal 3 Cairo International Airport - panoramio.jpg"),
    source: "https://commons.wikimedia.org/wiki/File:Gate_at_Terminal_3_Cairo_International_Airport_-_panoramio.jpg",
    sourceLabel: "Wikimedia Commons / Panoramio",
    title: t("Terminal 3 detail", ar("\u062a\u0641\u0627\u0635\u064a\u0644 \u0645\u0628\u0646\u0649 3")),
    subtitle: t("EgyptAir hub, check-in, lounges and pier gates", ar("\u0645\u0631\u0643\u0632 \u0645\u0635\u0631 \u0644\u0644\u0637\u064a\u0631\u0627\u0646 \u0648\u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u0633\u0641\u0631 \u0648\u0627\u0644\u0635\u0627\u0644\u0627\u062a \u0648\u0627\u0644\u0628\u0648\u0627\u0628\u0627\u062a")),
    notes: [t("Terminal 3 is the main EgyptAir hub and the strongest passenger guidance opportunity.", ar("\u0645\u0628\u0646\u0649 3 \u0647\u0648 \u0627\u0644\u0645\u0631\u0643\u0632 \u0627\u0644\u0631\u0626\u064a\u0633\u064a \u0644\u0645\u0635\u0631 \u0644\u0644\u0637\u064a\u0631\u0627\u0646 \u0648\u0623\u0647\u0645 \u0646\u0642\u0637\u0629 \u0644\u0625\u0631\u0634\u0627\u062f \u0627\u0644\u0631\u0643\u0627\u0628."))],
    hotspots: [
      { id: "t3-checkin", layer: "services", icon: BadgeInfo, x: 33, y: 64, title: t("EgyptAir check-in", ar("\u062a\u0633\u062c\u064a\u0644 \u0645\u0635\u0631 \u0644\u0644\u0637\u064a\u0631\u0627\u0646")), summary: t("Primary hub check-in and support area.", ar("\u0645\u0646\u0637\u0642\u0629 \u062a\u0633\u062c\u064a\u0644 \u0648\u062f\u0639\u0645 \u0631\u0626\u064a\u0633\u064a\u0629.")) },
      { id: "t3-lounge", layer: "lounges", icon: Coffee, x: 55, y: 44, title: t("Lounges", ar("\u0627\u0644\u0635\u0627\u0644\u0627\u062a")), summary: t("Premium lounge and waiting areas near the secure concourse.", ar("\u0635\u0627\u0644\u0627\u062a \u0648\u0627\u0646\u062a\u0638\u0627\u0631 \u0645\u0645\u064a\u0632 \u0642\u0631\u0628 \u0627\u0644\u0645\u0646\u0637\u0642\u0629 \u0627\u0644\u0645\u0624\u0645\u0646\u0629.")) },
      { id: "t3-dutyfree", layer: "restaurants", icon: ShoppingBag, x: 63, y: 63, title: t("Duty free and food", ar("\u0627\u0644\u0633\u0648\u0642 \u0627\u0644\u062d\u0631\u0629 \u0648\u0627\u0644\u0637\u0639\u0627\u0645")), summary: t("Retail and dining options support passenger dwell time.", ar("\u0645\u062a\u0627\u062c\u0631 \u0648\u062e\u064a\u0627\u0631\u0627\u062a \u0637\u0639\u0627\u0645 \u062a\u062e\u062f\u0645 \u0648\u0642\u062a \u0627\u0646\u062a\u0638\u0627\u0631 \u0627\u0644\u0631\u0643\u0627\u0628.")) },
      { id: "t3-gates", layer: "gates", icon: DoorOpen, x: 76, y: 48, title: t("Pier gates", ar("\u0628\u0648\u0627\u0628\u0627\u062a \u0627\u0644\u0631\u0635\u064a\u0641")), summary: t("Gate pier supports boarding and aircraft stand access.", ar("\u0631\u0635\u064a\u0641 \u0627\u0644\u0628\u0648\u0627\u0628\u0627\u062a \u064a\u062f\u0639\u0645 \u0627\u0644\u0635\u0639\u0648\u062f \u0648\u0627\u0644\u0648\u0635\u0648\u0644 \u0644\u0644\u0637\u0627\u0626\u0631\u0627\u062a.")) },
      { id: "t3-parking", layer: "parking", icon: Car, x: 22, y: 80, title: t("Parking and transfer", ar("\u0627\u0644\u0645\u0648\u0627\u0642\u0641 \u0648\u0627\u0644\u062a\u0646\u0642\u0644")), summary: t("Parking and terminal transfer connections sit on the landside edge.", ar("\u0627\u0644\u0645\u0648\u0627\u0642\u0641 \u0648\u0631\u0648\u0627\u0628\u0637 \u0627\u0644\u062a\u0646\u0642\u0644 \u062a\u0642\u0639 \u0641\u064a \u0627\u0644\u062c\u0647\u0629 \u0627\u0644\u0623\u0631\u0636\u064a\u0629.")) },
    ],
  },
  {
    id: "airside",
    aiImage: ai(`${basePrompt}, detailed airside operations view with runways, taxiways, apron stands, cargo village, maintenance hangars, command center aesthetic`, 59105),
    realImage: commons("Cairo International Airport 03.JPG"),
    source: "https://commons.wikimedia.org/wiki/File:Cairo_International_Airport_03.JPG",
    sourceLabel: "Wikimedia Commons / Ad Meskens",
    title: t("Airside and operations", ar("\u0627\u0644\u0645\u0646\u0627\u0637\u0642 \u0627\u0644\u062c\u0648\u064a\u0629 \u0648\u0627\u0644\u062a\u0634\u063a\u064a\u0644")),
    subtitle: t("Runways, apron, cargo and seasonal flow", ar("\u0627\u0644\u0645\u062f\u0627\u0631\u062c \u0648\u0627\u0644\u0633\u0627\u062d\u0627\u062a \u0648\u0627\u0644\u0634\u062d\u0646 \u0648\u0627\u0644\u0645\u0633\u0627\u0631 \u0627\u0644\u0645\u0648\u0633\u0645\u064a")),
    notes: [t("Manager-critical items include runway status, apron safety, cargo and maintenance response.", ar("\u062a\u0634\u0645\u0644 \u0639\u0646\u0627\u0635\u0631 \u0627\u0644\u0625\u062f\u0627\u0631\u0629 \u062d\u0627\u0644\u0629 \u0627\u0644\u0645\u062f\u0631\u062c \u0648\u0633\u0644\u0627\u0645\u0629 \u0627\u0644\u0633\u0627\u062d\u0629 \u0648\u0627\u0644\u0634\u062d\u0646 \u0648\u0627\u0644\u0635\u064a\u0627\u0646\u0629."))],
    hotspots: [
      { id: "air-runways", icon: Plane, x: 35, y: 38, title: t("Parallel runways", ar("\u0645\u062f\u0627\u0631\u062c \u0645\u062a\u0648\u0627\u0632\u064a\u0629")), summary: t("Three parallel 05/23 runways are represented for orientation.", ar("\u062b\u0644\u0627\u062b\u0629 \u0645\u062f\u0627\u0631\u062c \u0645\u062a\u0648\u0627\u0632\u064a\u0629 \u0628\u0627\u062a\u062c\u0627\u0647 05/23.")) },
      { id: "air-apron", icon: ShieldCheck, x: 56, y: 55, title: t("Apron and stands", ar("\u0627\u0644\u0633\u0627\u062d\u0629 \u0648\u0645\u0648\u0627\u0642\u0641 \u0627\u0644\u0637\u0627\u0626\u0631\u0627\u062a")), summary: t("Aircraft turnaround, ground support and safety checks happen here.", ar("\u062a\u062a\u0645 \u0647\u0646\u0627 \u062e\u062f\u0645\u0629 \u0627\u0644\u0637\u0627\u0626\u0631\u0627\u062a \u0648\u0645\u0633\u0627\u0646\u062f\u0629 \u0627\u0644\u0623\u0631\u0636 \u0648\u0641\u062d\u0648\u0635 \u0627\u0644\u0633\u0644\u0627\u0645\u0629.")) },
      { id: "air-cargo", layer: "services", icon: Building2, x: 72, y: 38, title: t("Cargo Village", ar("\u0642\u0631\u064a\u0629 \u0627\u0644\u0628\u0636\u0627\u0626\u0639")), summary: t("Cargo and logistics are separated from passenger terminal flow.", ar("\u0627\u0644\u0634\u062d\u0646 \u0648\u0627\u0644\u0644\u0648\u062c\u0633\u062a\u064a\u0627\u062a \u0645\u0646\u0641\u0635\u0644\u0629 \u0639\u0646 \u0645\u0633\u0627\u0631 \u0627\u0644\u0631\u0643\u0627\u0628.")) },
      { id: "air-seasonal", layer: "services", icon: Building2, x: 76, y: 72, title: t("Seasonal / Hajj terminal", ar("\u0627\u0644\u0645\u0628\u0646\u0649 \u0627\u0644\u0645\u0648\u0633\u0645\u064a / \u0627\u0644\u062d\u062c")), summary: t("Seasonal terminal supports pilgrimage and overflow charter operations.", ar("\u0627\u0644\u0645\u0628\u0646\u0649 \u0627\u0644\u0645\u0648\u0633\u0645\u064a \u064a\u062f\u0639\u0645 \u0631\u062d\u0644\u0627\u062a \u0627\u0644\u062d\u062c \u0648\u0627\u0644\u0631\u062d\u0644\u0627\u062a \u0627\u0644\u0639\u0627\u0631\u0636\u0629.")) },
      { id: "air-maintenance", icon: ShieldCheck, x: 45, y: 72, title: t("Service / maintenance", ar("\u0627\u0644\u062e\u062f\u0645\u0629 \u0648\u0627\u0644\u0635\u064a\u0627\u0646\u0629")), summary: t("Operational view highlights maintenance and safety response points.", ar("\u064a\u0639\u0631\u0636 \u0645\u0646\u0638\u0648\u0631 \u0627\u0644\u062a\u0634\u063a\u064a\u0644 \u0646\u0642\u0627\u0637 \u0627\u0644\u0635\u064a\u0627\u0646\u0629 \u0648\u0627\u0644\u0627\u0633\u062a\u062c\u0627\u0628\u0629.")) },
    ],
  },
];

export function AirportMap2D({ className = "", language = "en" }: { className?: string; language?: Language }) {
  const [activeSceneId, setActiveSceneId] = useState<SceneId>("overview");
  const [activeHotspotId, setActiveHotspotId] = useState(scenes[0].hotspots[0].id);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [activeLayers, setActiveLayers] = useState<Record<LayerId, boolean>>({
    restaurants: true,
    services: true,
    parking: true,
    atms: true,
    lounges: true,
    gates: true,
  });

  const copy = ui[language];
  const activeScene = scenes.find((scene) => scene.id === activeSceneId) ?? scenes[0];
  const activeHotspot = useMemo(
    () => activeScene.hotspots.find((hotspot) => hotspot.id === activeHotspotId) ?? activeScene.hotspots[0],
    [activeHotspotId, activeScene],
  );
  const visibleHotspots = activeScene.hotspots.filter((hotspot) => !hotspot.layer || activeLayers[hotspot.layer]);

  const selectScene = (sceneId: SceneId) => {
    const scene = scenes.find((item) => item.id === sceneId) ?? scenes[0];
    setActiveSceneId(scene.id);
    setActiveHotspotId(scene.hotspots[0].id);
    setPreviewOpen(false);
  };

  return (
    <section className={`panel overflow-hidden ${className}`} aria-labelledby="airport-visual-title">
      <div className="border-b border-border p-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-primary">{copy.eyebrow}</p>
        <div className="mt-1 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 id="airport-visual-title" className="text-2xl font-semibold tracking-tight">{copy.title}</h2>
            <p className="mt-1 max-w-3xl text-sm leading-relaxed text-muted-foreground">{copy.description}</p>
          </div>
          <a href={activeScene.source} target="_blank" rel="noreferrer" className="inline-flex h-9 items-center gap-2 rounded-md border border-border px-3 text-xs hover:bg-secondary">
            <Info aria-hidden="true" className="h-4 w-4 text-primary" />
            {copy.source}
          </a>
        </div>
      </div>

      <div className="grid gap-4 p-4 xl:grid-cols-[220px_minmax(0,1fr)_320px]">
        <nav className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1" aria-label={copy.views}>
          {scenes.map((scene, index) => {
            const active = scene.id === activeScene.id;
            return (
              <button key={scene.id} type="button" onClick={() => selectScene(scene.id)} aria-pressed={active} className={`rounded-md border p-3 text-start transition-colors ${active ? "border-primary bg-primary/15 text-primary" : "border-border bg-background/50 text-muted-foreground hover:bg-secondary hover:text-foreground"}`}>
                <span className="block font-mono text-[10px] uppercase tracking-wider">0{index + 1}</span>
                <span className="mt-1 block text-sm font-semibold">{scene.title[language]}</span>
                <span className="mt-0.5 block text-[11px] leading-snug opacity-80">{scene.subtitle[language]}</span>
              </button>
            );
          })}
        </nav>

        <div>
          <div className="relative overflow-hidden rounded-lg border border-border bg-background">
            <img src={activeScene.aiImage} alt={activeScene.title[language]} className="aspect-[16/9] w-full object-cover" loading="eager" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-white/5" />
            <div className="absolute start-4 top-4 max-w-[78%] rounded-md bg-background/85 p-3 backdrop-blur">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-primary">{copy.generated}</p>
              <h3 className="mt-1 text-lg font-semibold">{activeScene.title[language]}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{activeScene.subtitle[language]}</p>
            </div>
            {visibleHotspots.map((hotspot, index) => {
              const Icon = hotspot.icon;
              const active = hotspot.id === activeHotspot.id;
              return (
                <button
                  key={hotspot.id}
                  type="button"
                  onClick={() => setActiveHotspotId(hotspot.id)}
                  aria-label={hotspot.title[language]}
                  className={`absolute flex min-h-10 -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold shadow-xl backdrop-blur transition hover:scale-[1.03] ${
                    active ? "border-white bg-primary text-primary-foreground" : "border-white/80 bg-background/90 text-foreground hover:bg-primary hover:text-primary-foreground"
                  }`}
                  style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
                >
                  <Icon aria-hidden="true" className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{index + 1}. {hotspot.title[language]}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-3">
            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{copy.layers}</p>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(layerText) as LayerId[]).map((layer) => (
                <button key={layer} type="button" onClick={() => setActiveLayers((current) => ({ ...current, [layer]: !current[layer] }))} aria-pressed={activeLayers[layer]} className={`h-8 rounded-md border px-3 text-xs transition-colors ${activeLayers[layer] ? "border-primary bg-primary/15 text-primary" : "border-border text-muted-foreground hover:bg-secondary hover:text-foreground"}`}>
                  {layerText[layer][language]}
                </button>
              ))}
            </div>
          </div>
        </div>

        <aside className="space-y-3">
          <div className="panel-inner p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary">{copy.selected}</p>
            <h3 className="mt-2 text-lg font-semibold">{activeHotspot.title[language]}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{activeHotspot.summary[language]}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" onClick={() => setPreviewOpen(true)} className="inline-flex h-9 items-center gap-2 rounded-md border border-border px-3 text-xs font-medium hover:bg-secondary">
                <Eye aria-hidden="true" className="h-4 w-4 text-primary" />
                {copy.realImage}
              </button>
              {activeHotspot.detailTarget && (
                <button type="button" onClick={() => selectScene(activeHotspot.detailTarget!)} className="inline-flex h-9 items-center rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground hover:opacity-90">
                  {copy.visit}
                </button>
              )}
            </div>
          </div>

          <div className="panel-inner p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary">{copy.notes}</p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {activeScene.notes.map((note) => (
                <li key={note.en} className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  <span>{note[language]}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      {previewOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4" role="dialog" aria-modal="true" aria-labelledby="airport-photo-title">
          <div className="panel max-h-[90vh] w-full max-w-4xl overflow-hidden">
            <div className="flex items-center justify-between gap-3 border-b border-border p-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary">{activeScene.sourceLabel}</p>
                <h3 id="airport-photo-title" className="text-lg font-semibold">{activeHotspot.title[language]}</h3>
              </div>
              <button type="button" onClick={() => setPreviewOpen(false)} className="grid h-10 w-10 place-items-center rounded-md border border-border hover:bg-secondary" aria-label={copy.close}>
                <CircleX aria-hidden="true" className="h-4 w-4" />
              </button>
            </div>
            <img src={activeScene.realImage} alt={activeHotspot.title[language]} className="max-h-[68vh] w-full object-cover" />
            <div className="flex items-center justify-between gap-3 p-4 text-xs text-muted-foreground">
              <span>{activeScene.subtitle[language]}</span>
              <a href={activeScene.source} target="_blank" rel="noreferrer" className="text-primary hover:underline">{copy.source}</a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
