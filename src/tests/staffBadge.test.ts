import { describe, expect, it } from "vitest";
import { badgeValidity } from "../utils/staffBadge";

describe("staff badge validity", () => {
  const today = new Date(2026, 9, 26);

  it("uses the permit date for expired, expiring, and valid badges", () => {
    expect(badgeValidity("2026-10-25", today)).toEqual({ certStatus: "expired", daysToCertExpiry: -1 });
    expect(badgeValidity("2026-11-15", today)).toEqual({ certStatus: "expiring_soon", daysToCertExpiry: 20 });
    expect(badgeValidity("2027-02-28", today)).toEqual({ certStatus: "valid", daysToCertExpiry: 125 });
  });

  it("treats the expiry date as the last valid day", () => {
    expect(badgeValidity("2026-10-26", today)).toEqual({ certStatus: "expiring_soon", daysToCertExpiry: 0 });
  });
});
