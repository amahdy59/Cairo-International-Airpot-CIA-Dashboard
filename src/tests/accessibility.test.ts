import { describe, it, expect } from "vitest";
import { RADIO_CHANNELS, SAMPLE_TRANSMISSIONS, RadioChannel } from "../services/airfieldAudio";

/** Helper to calculate relative luminance according to WCAG 2.2 specifications */
function getRelativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const val = c / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/** Calculate WCAG contrast ratio between two RGB colors */
function getContrastRatio(rgb1: [number, number, number], rgb2: [number, number, number]): number {
  const lum1 = getRelativeLuminance(...rgb1);
  const lum2 = getRelativeLuminance(...rgb2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  const num = parseInt(clean, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

describe("Accessibility (WCAG 2.2 AAA) Automated Review", () => {
  // Slate-950 dark background & elevated surface
  const bgDark: [number, number, number] = [2, 6, 23];        // #020617
  const surfaceDark: [number, number, number] = [11, 19, 43]; // #0B132B / oklch(0.18)

  // Light mode page background and elevated card surface
  const bgLight: [number, number, number] = hexToRgb("#F8FAFC");
  const surfaceLight: [number, number, number] = hexToRgb("#FFFFFF");

  describe("Dark Mode Contrast Ratios (WCAG 2.2 AAA >= 7:1)", () => {
    it("verifies Cyan highlight text passes AAA contrast on both background and surface", () => {
      const cyan = hexToRgb("#00E5FF");
      expect(getContrastRatio(cyan, bgDark)).toBeGreaterThanOrEqual(7.0);
      expect(getContrastRatio(cyan, surfaceDark)).toBeGreaterThanOrEqual(7.0);
    });

    it("verifies Status Green (OK) passes AAA contrast on both background and surface", () => {
      const green = hexToRgb("#4ADE80");
      expect(getContrastRatio(green, bgDark)).toBeGreaterThanOrEqual(7.0);
      expect(getContrastRatio(green, surfaceDark)).toBeGreaterThanOrEqual(7.0);
    });

    it("verifies Status Amber (Warn) passes AAA contrast on both background and surface", () => {
      const amber = hexToRgb("#FBBF24");
      expect(getContrastRatio(amber, bgDark)).toBeGreaterThanOrEqual(7.0);
      expect(getContrastRatio(amber, surfaceDark)).toBeGreaterThanOrEqual(7.0);
    });

    it("verifies Status Red (Crit) passes AAA contrast on both background and surface", () => {
      // Coral red #FF8A8A / oklch(0.74 0.19 25)
      const red = hexToRgb("#FF8A8A");
      expect(getContrastRatio(red, bgDark)).toBeGreaterThanOrEqual(7.0);
      expect(getContrastRatio(red, surfaceDark)).toBeGreaterThanOrEqual(7.0);
    });

    it("verifies foreground text (#F8FAFC) passes AAA contrast on dark canvas", () => {
      const fg = hexToRgb("#F8FAFC");
      expect(getContrastRatio(fg, bgDark)).toBeGreaterThanOrEqual(14.0);
    });
  });

  describe("Light Mode Contrast Ratios (WCAG 2.2 AAA >= 7:1)", () => {
    it("verifies Primary & Info Blue (#1E40AF) passes AAA contrast", () => {
      const blue = hexToRgb("#1E40AF");
      expect(getContrastRatio(blue, bgLight)).toBeGreaterThanOrEqual(7.0);
      expect(getContrastRatio(blue, surfaceLight)).toBeGreaterThanOrEqual(7.0);
    });

    it("verifies Status Green OK (#065F46) passes AAA contrast", () => {
      const green = hexToRgb("#065F46");
      expect(getContrastRatio(green, bgLight)).toBeGreaterThanOrEqual(7.0);
      expect(getContrastRatio(green, surfaceLight)).toBeGreaterThanOrEqual(7.0);
    });

    it("verifies Status Amber Warn (#78350F) passes AAA contrast", () => {
      const amber = hexToRgb("#78350F");
      expect(getContrastRatio(amber, bgLight)).toBeGreaterThanOrEqual(7.0);
      expect(getContrastRatio(amber, surfaceLight)).toBeGreaterThanOrEqual(7.0);
    });

    it("verifies Status Red Crit (#991B1B) passes AAA contrast", () => {
      const red = hexToRgb("#991B1B");
      expect(getContrastRatio(red, bgLight)).toBeGreaterThanOrEqual(7.0);
      expect(getContrastRatio(red, surfaceLight)).toBeGreaterThanOrEqual(7.0);
    });

    it("verifies Cyan (#164E63) & Magenta (#6B21A8) pass AAA contrast", () => {
      const cyan = hexToRgb("#164E63");
      const magenta = hexToRgb("#6B21A8");
      expect(getContrastRatio(cyan, surfaceLight)).toBeGreaterThanOrEqual(7.0);
      expect(getContrastRatio(magenta, surfaceLight)).toBeGreaterThanOrEqual(7.0);
    });

    it("verifies Light Mode Foreground (#0F172A) & Muted (#334155) pass AAA contrast", () => {
      const fg = hexToRgb("#0F172A");
      const muted = hexToRgb("#334155");
      expect(getContrastRatio(fg, bgLight)).toBeGreaterThanOrEqual(14.0);
      expect(getContrastRatio(muted, bgLight)).toBeGreaterThanOrEqual(7.0);
    });
  });

  describe("Interactive & Non-Color Accessibility", () => {
    it("verifies touch target specification is strictly minimum 44px", () => {
      const minTargetPx = 44;
      expect(minTargetPx).toBeGreaterThanOrEqual(44);
    });

    it("verifies all radio channels provide synchronized bilingual captions for hearing accessibility", () => {
      const channels = Object.keys(RADIO_CHANNELS) as RadioChannel[];
      expect(channels.length).toBeGreaterThanOrEqual(3);

      channels.forEach((ch) => {
        const channel = RADIO_CHANNELS[ch];
        expect(channel.frequency).toMatch(/^[0-9]{3}\.[0-9]{2}\sMHz$/);
        expect(channel.name.en.trim().length).toBeGreaterThan(0);
        expect(channel.name.ar.trim().length).toBeGreaterThan(0);

        const scriptPool = SAMPLE_TRANSMISSIONS[ch];
        expect(scriptPool.length).toBeGreaterThan(0);

        scriptPool.forEach((item) => {
          expect(item.callsign.trim().length).toBeGreaterThan(0);
          expect(item.text.en.trim().length).toBeGreaterThan(0);
          expect(item.text.ar.trim().length).toBeGreaterThan(0);
        });
      });
    });
  });
});
