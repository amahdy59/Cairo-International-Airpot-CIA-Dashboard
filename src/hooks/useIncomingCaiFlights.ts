import { useEffect, useState } from "react";
import { IncomingFlight, sampleIncomingFlights, Tone } from "../data";
import { formatCairoTime } from "../utils/helpers";

type AviationStackFlight = {
  airline?: { name?: string };
  flight?: { iata?: string; number?: string };
  departure?: { airport?: string; iata?: string };
  arrival?: { estimated?: string; scheduled?: string; terminal?: string; gate?: string };
  flight_status?: string;
};

type AviationStackResponse = {
  data?: AviationStackFlight[];
};

export function useIncomingCaiFlights() {
  const [flights, setFlights] = useState<IncomingFlight[]>(sampleIncomingFlights);
  const [source, setSource] = useState<"loading" | "live" | "sample">("loading");
  const [updatedAt, setUpdatedAt] = useState(() => formatCairoTime(new Date().toISOString()));

  useEffect(() => {
    const apiKey = import.meta.env.VITE_AVIATIONSTACK_KEY as string | undefined;
    if (!apiKey || apiKey === "replace_with_your_aviationstack_access_key") {
      setSource("sample");
      return;
    }

    const controller = new AbortController();
    const params = new URLSearchParams({
      access_key: apiKey,
      arr_iata: "CAI",
      limit: "6",
    });

    fetch(`https://api.aviationstack.com/v1/flights?${params.toString()}`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Flight provider unavailable");
        return response.json() as Promise<AviationStackResponse>;
      })
      .then((payload) => {
        const mapped = (payload.data ?? [])
          .map((item): IncomingFlight | null => {
            const flight = item.flight?.iata ?? item.flight?.number;
            if (!flight) return null;
            const status = item.flight_status ?? "scheduled";
            const normalized = status.toLowerCase();
            const tone: Tone = normalized.includes("delay")
              ? "warn"
              : normalized.includes("landed")
                ? "ok"
                : normalized.includes("active")
                  ? "info"
                  : "neutral";
            const gate = item.arrival?.gate
              ? `${item.arrival.terminal ? `T${item.arrival.terminal} / ` : ""}${item.arrival.gate}`
              : item.arrival?.terminal
                ? `T${item.arrival.terminal} / --`
                : "Gate TBD";
            const origin = item.departure?.iata ? `${item.departure.airport ?? "Origin"} (${item.departure.iata})` : item.departure?.airport ?? "Origin TBD";
            return {
              airline: item.airline?.name ?? "Airline TBD",
              flight,
              eta: formatCairoTime(item.arrival?.estimated ?? item.arrival?.scheduled),
              gate,
              status: status.replace(/_/g, " "),
              tone,
              origin,
            };
          })
          .filter((item): item is IncomingFlight => item != null)
          .slice(0, 4);

        if (mapped.length === 0) {
          setSource("sample");
          return;
        }
        setFlights(mapped);
        setSource("live");
        setUpdatedAt(formatCairoTime(new Date().toISOString()));
      })
      .catch(() => {
        setSource("sample");
      });

    return () => controller.abort();
  }, []);

  return { flights, source, updatedAt };
}
