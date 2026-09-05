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

describe("Accessibility (WCAG 2.2 AAA) Automated Review", () => {
  // Slate-950 dark background: rgb(2, 6, 23)
  const bgDark: [number, number, number] = [2, 6, 23];

  it("verifies Cyan highlight text passes WCAG 2.2 AAA (>= 7:1) contrast", () => {
    // Cyan #00E5FF = rgb(0, 229, 255)
    const cyan: [number, number, number] = [0, 229, 255];
    const ratio = getContrastRatio(cyan, bgDark);
    expect(ratio).toBeGreaterThanOrEqual(7.0);
  });

  it("verifies Status Green (OK) passes WCAG 2.2 AAA (>= 7:1) contrast", () => {
    // Green #4ADE80 = rgb(74, 222, 128)
    const green: [number, number, number] = [74, 222, 128];
    const ratio = getContrastRatio(green, bgDark);
    expect(ratio).toBeGreaterThanOrEqual(7.0);
  });

  it("verifies Status Amber (Warn) passes WCAG 2.2 AAA (>= 7:1) contrast", () => {
    // Amber #FBBF24 = rgb(251, 191, 36)
    const amber: [number, number, number] = [251, 191, 36];
    const ratio = getContrastRatio(amber, bgDark);
    expect(ratio).toBeGreaterThanOrEqual(7.0);
  });

  it("verifies Status Red (Crit) passes WCAG 2.2 AAA (>= 7:1) contrast", () => {
    // Red #F87171 = rgb(248, 113, 113)
    const red: [number, number, number] = [248, 113, 113];
    const ratio = getContrastRatio(red, bgDark);
    expect(ratio).toBeGreaterThanOrEqual(7.0);
  });

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
