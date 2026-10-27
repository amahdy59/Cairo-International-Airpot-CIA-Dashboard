export function timeDeltaMinutes(expected: string, observed: string): number | null {
  const parse = (value: string) => {
    const match = /^(\d{2}):(\d{2})$/.exec(value);
    if (!match) return null;
    const hours = Number(match[1]), minutes = Number(match[2]);
    return hours < 24 && minutes < 60 ? hours * 60 + minutes : null;
  };
  const start = parse(expected), end = parse(observed);
  if (start === null || end === null) return null;
  const difference = end - start;
  return difference < -720 ? difference + 1440 : difference > 720 ? difference - 1440 : difference;
}

export function shiftClockTime(value: string, deltaMinutes: number): string {
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  if (!match) return value;
  const total = ((Number(match[1]) * 60 + Number(match[2]) + deltaMinutes) % 1440 + 1440) % 1440;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}
