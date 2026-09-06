import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { exportToCsv } from "../utils/exportCsv";
import { formatCairoTime, localize, localizedFlightStatus, toneCssVar } from "../utils/helpers";
import { notifyManager, TOAST_EVENT } from "../utils/toast";
import { safeStorage } from "../utils/safeStorage";
import { LocalizedText } from "../data";

interface MockAnchorElement {
  setAttribute: (key: string, val: string) => void;
  style: Record<string, string>;
  click: () => void;
}

interface ToastDetail {
  id: string;
  title: string;
  message?: string;
  tone?: string;
}

describe("Utility Functions & CSV Export Engine", () => {
  describe("exportToCsv", () => {
    let originalURL: typeof globalThis.URL;
    let originalDocument: unknown;
    let originalWindow: unknown;
    let clickedBlob: Blob | null = null;
    let downloadedFilename = "";

    beforeEach(() => {
      clickedBlob = null;
      downloadedFilename = "";
      originalURL = globalThis.URL;
      originalDocument = (globalThis as Record<string, unknown>).document;
      originalWindow = (globalThis as Record<string, unknown>).window;

      // Polyfill URL methods
      globalThis.URL.createObjectURL = vi.fn((blob: Blob) => {
        clickedBlob = blob;
        return "blob:mock-export-url";
      });
      globalThis.URL.revokeObjectURL = vi.fn();

      // Minimal DOM polyfill for Node.js test environment
      const mockElement: MockAnchorElement = {
        setAttribute: (key: string, val: string) => {
          if (key === "download") downloadedFilename = val;
        },
        style: {},
        click: vi.fn(),
      };

      (globalThis as Record<string, unknown>).document = {
        createElement: vi.fn(() => mockElement),
        body: {
          appendChild: vi.fn(),
          removeChild: vi.fn(),
        },
      };

      (globalThis as Record<string, unknown>).window = {
        dispatchEvent: vi.fn(),
      };
    });

    afterEach(() => {
      globalThis.URL = originalURL;
      (globalThis as Record<string, unknown>).document = originalDocument;
      (globalThis as Record<string, unknown>).window = originalWindow;
      vi.restoreAllMocks();
    });

    it("generates valid RFC 4180 CSV with UTF-8 BOM for Arabic character preservation", async () => {
      const headers = ["Flight", "Origin", "Status", "Notes"];
      const rows = [
        ["MS 800", "Paris CDG", "Landed", "Normal Ops"],
        ["SV 302", "Jeddah", "Active", 'Pilot said: "Holding at Sinai"'],
        ["QR 1301", "Doha", "Delayed", "Requires bus, apron conflict"],
      ];

      exportToCsv({
        filename: "cairo-flights",
        headers,
        rows,
        language: "en",
      });

      expect(downloadedFilename).toBe("cairo-flights.csv");
      expect(clickedBlob).not.toBeNull();

      if (clickedBlob) {
        const buffer = await (clickedBlob as Blob).arrayBuffer();
        const bytes = new Uint8Array(buffer);
        // BOM verification (0xEF, 0xBB, 0xBF)
        expect(bytes[0]).toBe(0xef);
        expect(bytes[1]).toBe(0xbb);
        expect(bytes[2]).toBe(0xbf);

        const text = await (clickedBlob as Blob).text();
        // Header verification
        expect(text).toContain("Flight,Origin,Status,Notes");
        // Escaped quotes verification
        expect(text).toContain('"Pilot said: ""Holding at Sinai"""');
        // Escaped commas verification
        expect(text).toContain('"Requires bus, apron conflict"');
      }
    });

    it("ensures .csv extension is appended if missing", () => {
      exportToCsv({
        filename: "terminal3-stand-occupancy",
        headers: ["Stand", "Type"],
        rows: [["Stand 301", "Heavy E"]],
      });

      expect(downloadedFilename).toBe("terminal3-stand-occupancy.csv");
    });
  });

  describe("formatCairoTime", () => {
    it("converts UTC timestamps correctly to Cairo Africa/Cairo local time", () => {
      const date = new Date("2026-09-06T10:00:00Z");
      const cairoFormatted = formatCairoTime(date.toISOString());
      expect(cairoFormatted).toMatch(/^\d{2}:\d{2}$/);
      expect(cairoFormatted).not.toBe("--");
    });

    it("returns '--' when timestamp is undefined or invalid", () => {
      expect(formatCairoTime(undefined)).toBe("--");
      expect(formatCairoTime("invalid-date-string")).toBe("--");
      expect(formatCairoTime("")).toBe("--");
    });
  });

  describe("localize helper", () => {
    it("extracts localized Arabic and English strings properly", () => {
      const bilingual = { en: "Runway 05C Active", ar: "المدرج 05C نشط" };
      expect(localize(bilingual, "en")).toBe("Runway 05C Active");
      expect(localize(bilingual, "ar")).toBe("المدرج 05C نشط");
    });

    it("handles plain strings and fallback values gracefully", () => {
      expect(localize("Plain String", "en")).toBe("Plain String");
      expect(localize("Plain String", "ar")).toBe("Plain String");
      expect(localize(null, "en")).toBe("");
      expect(localize(undefined, "ar")).toBe("");
      expect(localize({ en: "Only English" } as unknown as LocalizedText, "ar")).toBe("Only English");
    });
  });

  describe("localizedFlightStatus helper", () => {
    it("maps all standard aeronautical flight status strings in both English and Arabic", () => {
      const statuses = ["scheduled", "active", "landed", "cancelled", "incident", "diverted", "landing"];

      statuses.forEach((st) => {
        const enLabel = localizedFlightStatus(st, "en");
        const arLabel = localizedFlightStatus(st, "ar");
        expect(enLabel).toBeTruthy();
        expect(arLabel).toBeTruthy();
        expect(enLabel).not.toBe(arLabel);
      });
    });

    it("handles case-insensitive inputs and fallback values", () => {
      expect(localizedFlightStatus("LANDED", "en")).toBe("Landed");
      expect(localizedFlightStatus("UNKNOWN_STATE", "en")).toBe("UNKNOWN_STATE");
    });
  });

  describe("toneCssVar mapping", () => {
    it("correctly maps system tones to CSS status tokens", () => {
      expect(toneCssVar("ok")).toBe("var(--status-ok)");
      expect(toneCssVar("info")).toBe("var(--status-info)");
      expect(toneCssVar("warn")).toBe("var(--status-warn)");
      expect(toneCssVar("high")).toBe("var(--status-high)");
      expect(toneCssVar("crit")).toBe("var(--status-crit)");
      expect(toneCssVar("neutral")).toBe("var(--muted-foreground)");
    });
  });

  describe("notifyManager (Toast dispatch)", () => {
    it("dispatches custom toast event with unique ID and tone", () => {
      const captured: ToastDetail[] = [];
      (globalThis as Record<string, unknown>).window = {
        dispatchEvent: (event: CustomEvent<ToastDetail>) => {
          if (event.type === TOAST_EVENT) {
            captured.push(event.detail);
          }
          return true;
        },
      };

      notifyManager("Test Alert", "Runway friction nominal", "ok");

      expect(captured.length).toBe(1);
      const detail = captured[0];
      expect(detail.title).toBe("Test Alert");
      expect(detail.message).toBe("Runway friction nominal");
      expect(detail.tone).toBe("ok");
      expect(typeof detail.id).toBe("string");

      delete (globalThis as Record<string, unknown>).window;
    });
  });

  describe("safeStorage (Memory Fallback)", () => {
    it("stores and retrieves key-value items safely", () => {
      safeStorage.setItem("test_key_cai", "active_metric");
      expect(safeStorage.getItem("test_key_cai")).toBe("active_metric");
      safeStorage.removeItem("test_key_cai");
      expect(safeStorage.getItem("test_key_cai")).toBeNull();
    });
  });
});
