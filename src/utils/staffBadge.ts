import type { StaffMember } from "../data";

export function badgeValidity(validUntil: string, today = new Date()): Pick<StaffMember, "certStatus" | "daysToCertExpiry"> {
  const expiry = Date.parse(`${validUntil}T00:00:00Z`);
  const todayDay = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  if (!Number.isFinite(expiry)) return { certStatus: "expired", daysToCertExpiry: -1 };
  const daysToCertExpiry = Math.round((expiry - todayDay) / 86_400_000);
  return {
    daysToCertExpiry,
    certStatus: daysToCertExpiry < 0 ? "expired" : daysToCertExpiry <= 30 ? "expiring_soon" : "valid",
  };
}
