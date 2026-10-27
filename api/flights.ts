import type { IncomingMessage, ServerResponse } from "node:http";

type CachedFeed = { data: unknown[]; updatedAt: string; expiresAt: number };
let cache: CachedFeed | null = null;

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "private, max-age=0, must-revalidate");
  if (req.method !== "GET") {
    res.statusCode = 405;
    res.setHeader("Allow", "GET");
    res.end(JSON.stringify({ error: "Method not allowed" }));
    return;
  }
  const key = process.env.AVIATIONSTACK_KEY;
  if (!key) {
    res.statusCode = 503;
    res.end(JSON.stringify({ error: "Flight feed not configured" }));
    return;
  }
  if (cache && cache.expiresAt > Date.now()) {
    res.statusCode = 200;
    res.end(JSON.stringify({ data: cache.data, updatedAt: cache.updatedAt }));
    return;
  }
  try {
    const url = new URL("https://api.aviationstack.com/v1/flights");
    url.searchParams.set("access_key", key);
    url.searchParams.set("arr_iata", "CAI");
    url.searchParams.set("limit", "6");
    const upstream = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!upstream.ok) throw new Error(`Upstream status ${upstream.status}`);
    const payload = await upstream.json() as { data?: unknown[] };
    if (!Array.isArray(payload.data)) throw new Error("Invalid feed response");
    cache = { data: payload.data.slice(0, 6), updatedAt: new Date().toISOString(), expiresAt: Date.now() + 5 * 60_000 };
    res.statusCode = 200;
    res.end(JSON.stringify({ data: cache.data, updatedAt: cache.updatedAt }));
  } catch {
    res.statusCode = 503;
    res.setHeader("Retry-After", "300");
    res.end(JSON.stringify({ error: "Flight feed unavailable" }));
  }
}
