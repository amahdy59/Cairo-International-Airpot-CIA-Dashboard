import { useEffect, useState } from "react";
import { type IncomingFlight, sampleIncomingFlights, type Tone } from "../data";
import { formatCairoTime } from "../utils/helpers";

export type FlightFeedState = "sample" | "loading" | "live" | "stale" | "unavailable";

type FeedFlight = {
  airline?: { name?: string };
  flight?: { iata?: string; number?: string };
  departure?: { airport?: string; iata?: string };
  arrival?: { estimated?: string; scheduled?: string; terminal?: string; gate?: string };
  flight_status?: string;
};
type FeedResponse = { data?: FeedFlight[]; updatedAt?: string };

function mapFlight(item: FeedFlight): IncomingFlight | null {
  const flight = item.flight?.iata ?? item.flight?.number;
  if (!flight) return null;
  const status = item.flight_status ?? "scheduled";
  const normalized = status.toLowerCase();
  const tone: Tone = normalized.includes("delay") ? "warn" : normalized.includes("landed") ? "ok" : normalized.includes("active") ? "info" : "neutral";
  const arrival = item.arrival;
  const terminal = arrival?.terminal ? /^T/i.test(arrival.terminal) ? arrival.terminal : `T${arrival.terminal}` : "";
  const gate = arrival?.gate ? `${terminal ? `${terminal} / ` : ""}${arrival.gate}` : terminal ? `${terminal} / --` : "Gate TBD";
  const origin = item.departure?.iata ? `${item.departure.airport ?? "Origin"} (${item.departure.iata})` : item.departure?.airport ?? "Origin TBD";
  return { airline: item.airline?.name ?? "Airline TBD", flight, eta: formatCairoTime(arrival?.estimated ?? arrival?.scheduled), gate, status: status.replace(/_/g, " "), tone, origin };
}

export function useIncomingCaiFlights() {
  const endpoint = import.meta.env.VITE_FLIGHT_FEED_URL as string | undefined;
  const [flights, setFlights] = useState<IncomingFlight[]>(sampleIncomingFlights);
  const [source, setSource] = useState<FlightFeedState>(endpoint ? "loading" : "sample");
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  useEffect(() => {
    if (!endpoint) return;
    const controller = new AbortController();
    let hasLiveData = false;
    const load = async () => {
      try {
        const response = await fetch(endpoint, { signal: controller.signal, cache: "no-store" });
        if (!response.ok) throw new Error("Feed unavailable");
        const payload = await response.json() as FeedResponse;
        const mapped = (payload.data ?? []).map(mapFlight).filter((item): item is IncomingFlight => item !== null).slice(0, 4);
        if (mapped.length === 0) throw new Error("Feed empty");
        hasLiveData = true;
        setFlights(mapped);
        setSource("live");
        setUpdatedAt(formatCairoTime(payload.updatedAt ?? new Date().toISOString()));
      } catch {
        if (controller.signal.aborted) return;
        setSource(hasLiveData ? "stale" : "unavailable");
        if (!hasLiveData) setFlights(sampleIncomingFlights);
      }
    };
    void load();
    const refresh = window.setInterval(() => { void load(); }, 5 * 60_000);
    return () => { controller.abort(); window.clearInterval(refresh); };
  }, [endpoint]);

  return { flights, source, updatedAt };
}
