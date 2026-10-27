# Cairo International Airport Command Hub

A bilingual airport manager dashboard prototype covering the digital twin, operations, safety, staffing, and supporting documentation. Most operational figures and scenarios are simulated. The incoming flights panel uses a sample when no flight-feed endpoint is configured.

Each dashboard view includes a compact **Data sources** disclosure. It explains which values are fixed examples, modeled forecasts, or local training interactions. Weather and runway plans are examples, and the staffing roster is synthetic. Checklists and decision controls only update this browser session; they do not authorize or dispatch airport activity.

The shared training event record powers the manager work queue, role filters, digital twin hotspots, simulated stand reassignment, operations flight boards, passenger journey view, and handover summary. Events carry a responsible team, scenario timestamp, evidence, passenger impact, proposed action, and local action history. Assignments and stand moves are browser-session simulations; they do not dispatch teams or update an airport system.

Operations keeps the new visuals close to the decisions they support: the existing hourly passenger forecast compares demand with explicitly modeled capacity, turnaround cards use a planned/actual milestone path, and a baggage exception path appears only in the sorter-failure scenario. The chart details disclose exact values and calculation limits. The capacity model and baggage statuses are training data; bag scan counts and real staffing capacity are not connected.

For a Vercel deployment, configure `AVIATIONSTACK_KEY` as a server environment variable and `VITE_FLIGHT_FEED_URL=/api/flights` for the client. The `api/flights.ts` endpoint keeps the key server-side and caches successful responses for five minutes per instance. Other static hosts can provide a compatible server endpoint, or continue to show the labeled sample. Never put the provider key in a `VITE_` variable: [Vite exposes those values to browser code](https://vite.dev/guide/env-and-mode). The key previously used in the browser should be rotated before enabling the server endpoint.

## Run locally

```bash
npm install
npm run dev
```

Open the URL printed by Vite. The configured base path is `/Cairo-International-Airpot-CIA-Dashboard/`.

## Quality checks

```bash
npm run audit:all
```

This runs TypeScript checking, ESLint, Vitest, and a production build. `npm run test`, `npm run check:responsive`, and `npm run build` are also available separately.

## Project layout

- `src/App.tsx` coordinates page navigation, locale, theme, and view loading.
- `src/features/` contains the digital twin, operations, safety, and staffing views.
- `src/components/` holds shared navigation, widgets, dialogs, and documentation.
- `src/context/` provides locale, scenario, and shared operational-event state.
- `src/data/apronStands.ts` contains the sample stand plan and pure diversion calculation.
- `src/hooks/` contains interaction and data hooks.
- `src/data.ts` provides prototype data and bilingual copy.
- `src/styles.css` defines design tokens and shared styling.

The app uses React 19, TypeScript, Vite, Tailwind CSS v4, Lucide icons, and lightweight SVG charts. It supports English and Arabic layout, light and dark themes, and a high contrast preference. The [UX review](UX_REVIEW.md) records the latest improvements, verification, and remaining checks.

Pushes to `main` run the repository quality gates and deploy to GitHub Pages. The artifact includes `release.json` with the commit SHA; the post-deploy check compares it to the workflow SHA and checks linked assets before reporting success. The public Pages build has no server flight-feed endpoint unless separately provided by the hosting environment.

## Production integration boundary

The map coordinates, clearance flag, flight assignments, queues, staffing, weather, and incident records are illustrative. Stand fit cannot be inferred from aircraft wingspan alone; it needs surveyed stand geometry, clearances, movement routes, and an approved stand plan. An operational release also needs authenticated roles, source timestamps and health, approved data contracts with airport systems, event persistence and audit, and review by airport operations, airline, ground handling, security, and accessibility specialists. The current UI explicitly marks simulated actions and camera stills.
