# UX review and improvements

Reviewed and updated locally on 27 October 2026. Scope: digital twin, operations, safety, staffing, documentation, navigation, dialogs, print reports, English and Arabic, light and dark themes.

## Changes made

| Area | Improvement |
| --- | --- |
| Navigation and layout | Gave each view a clear title and honest prototype label; made route changes, browser Back and Forward, and reload preserve the selected view; reduced header crowding and unnecessary motion; made the primary actions easier to find. |
| Mobile use | Replaced crowded scenario, area, wave, and terminal controls with labeled selects where space is limited; kept tables and charts readable in named keyboard-scrollable regions; removed page-level overflow at 320 px and up. |
| Keyboard and dialogs | Added consistent tab behavior to navigation and documentation; trapped focus within dialogs, supported Escape and focus return, and prevented background interaction while a dialog is open. |
| Accessibility | Increased small controls to at least 44 px, improved input and chart names, table headers, focus behavior, contrast, reduced-motion behavior, and print report structure. Removed unverified accessibility certification wording. |
| Data visualization | Preserved exact KPI precision; corrected trend arrows; gave the forecast a zero-based scale, distinguishable series, peak summary, and exact data table; separated queue percentages from their overall index; started safety aging bars at zero. |
| Clarity and performance | Reduced decorative gradients and persistent alert emphasis, disclosed secondary actions, labeled sample data, and split secondary views into production chunks. Prevented the development service worker from serving stale source. |
| Dropdowns and mobile menu | Replaced five native select popups and the radio channel popup with one theme-aware select-only combobox. Fixed the mobile More panel, which was opening at only 29 px tall because it was constrained by the fixed header. |
| Visual explanations | Replaced the drill's long visible paragraph with a compact three-step impact path. Removed duplicate drill notifications and unsupported contrast-ratio claims from the accessibility page. Removed the documentation panel fade that temporarily lowered text contrast. |
| Data-led summaries | Added a safety-check composition ring with exact counts and a disclosed list of on-track checks; staffing coverage bullet charts with a 90% marker; and a terminal-status matrix with actions available on demand. Corrected staffing KPIs to distinguish the sample roster from the planned shift allocation and calculate ETA from ready units. |
| Four chart types | Added volume-scaled stacked flight-status bars, a terminal-by-stage queue heatmap, an aircraft events-versus-risk scatter plot, and a sample-roster availability waffle. Each uses the existing source records, shows exact values, and keeps detailed records available. The flight summary appears before the long turnaround list. Flight and queue views react to scenario and terminal changes; roster availability reacts to status changes. |
| Responsive density | Replaced the squeezed staffing, flight, and maintenance tables with readable cards below wide desktop sizes, while keeping tables on wide screens and CSV export available. Condensed roster filters into labeled menus and put secondary roster, permit, and turnaround details behind accessible disclosures. Moved Back to top into the footer so it cannot cover data. |
| Data clarity | Calculated staff badge status and days remaining from permit dates at runtime; counted expiring but still valid badges correctly in the validity KPI. Shortened and localized mobile apron conflict and turnaround labels, and marked the dated maintenance records as a sample log. |
| Surface texture | Added low-opacity procedural paper grain behind body and card content, tuned separately for light and dark modes. The texture is disabled in high contrast, forced-colors, and print modes. |
| Stand conflict clarity | Replaced the unexplained clearance warning with a labeled 305–306 stand sequence and an explicit EK927 → R-14 simulation. The source stand now becomes empty, the destination appears separately, and the panel explains that surveyed geometry is unavailable. Aligned shared sample flight-to-gate assignments and the decisions panel. |
| Honest labels | Renamed the A-CDM percentage to match its calculation, marked static recommendations as sample guidance, and removed unsupported clearance, certification, and permit-compliance claims from the affected views. |
| Connected operational tasks | Added one shared scenario event record with owner, priority, evidence, passenger impact, source, sample time, and local action history. A role-filtered work queue links tasks to digital twin hotspots; simulated EK927 reassignment updates the map, stand sequence, and operations flight board. |
| Digital twin and journey | Added Airside, Passenger, Safety, and Services map layers and event details; added a four-stage passenger journey diagram that separates pressure index from measured wait time. Reconciled sample gate and terminal assignments for EK927, SV302, and MS777. |
| Feed and handover trust | Routed the optional flight provider through a server endpoint with a server-only key and five-minute cache. The UI distinguishes provider, stale, unavailable, and sample states. Replaced the handover's unsupported official certification and archive claims with a local review state and live scenario event summary. |
| Decision-focused visual pass | Replaced repeated A-CDM time boxes and generic progress bars with an actual-versus-target milestone path. The existing hourly forecast now compares demand with a labeled training capacity model and shows a shortfall only when forecast exceeds capacity. A compact baggage path appears only during the sorter-failure scenario and marks missing scan data instead of inventing counts. TOBT edits shift dependent target times within the simulation. |
| Factuality pass | Marked fixed weather and runway values as examples, removed a false live AOCC/CAT III header status, corrected safety checklists so local clicks mean reviewed rather than executed, and removed unsupported operational thresholds, frequencies, credential names, and regulatory endorsements. The radio description now identifies synthesized audio. |
| Release trust | Added page-specific data-source disclosures, changed local decision and staffing controls to say reviewed or assigned in simulation, and removed unsupported live dispatch and approval messages. The deployment workflow now publishes a commit identity and verifies the live revision and linked assets. |

## Factuality gate for real airport use

For every operational value, store its source system, event time with timezone, ingestion time, update cadence, owner, and validity or stale state. Show these near the value when the distinction matters. Separate observed, planned, forecast, and scenario values in the data model and chart legends. A source name alone does not establish that the current value is valid.

Before presenting any procedure, threshold, credential, radio frequency, stand restriction, runway status, or response target as authoritative, obtain the current airport and regulator-approved source and an operational owner. ICAO publications can supply context; they do not certify this prototype or replace the local aerodrome procedures. The emergency checklists remain training prompts and local review state is not evidence of dispatch or execution.

Reference cross-check: [ICAO lists Doc 4444 as PANS-ATM](https://www.icao.int/airnavigation/implementation/documents), while its [aerodrome guidance table](https://www.icao.int/operational-safety/contingency-aerodromes) associates Doc 9137 Part 8 with apron management and Part 7 with emergency planning. [EUROCONTROL describes A-CDM](https://www.eurocontrol.int/concept/airport-collaborative-decision-making) as timely shared information across airport partners, especially for turnaround and pre-departure. These references guide terminology; they do not validate the sample Cairo values.

Recommended validation order: (1) AODB/FIDS flight identity, schedule, actual times and gate/stand; (2) authoritative weather, runway and aeronautical information; (3) queue and baggage sensors with measured units; (4) roster, qualifications and role permissions; (5) surveyed digital-twin geometry and local decision thresholds. Require the relevant airport team to sign off each data contract and user-facing interpretation before operational use.

## Verification

- `npm run audit:all`: typecheck and lint passed; 99 tests across 14 files passed; production build passed.
- Automated browser checks in Microsoft Edge Chromium covered all five views at 320, 390, 768, 1024, and 1440 px; English and Arabic; light and dark themes; keyboard navigation and dialogs; browser history; short viewport settings; high contrast; and printable reports.
- axe-core 4.10.3 reported zero violations in the sampled WCAG 2 A/AA and WCAG 2.1/2.2 AA rules on the tested views and dialog states. This is an automated result, not a WCAG conformance certification.
- No page-wide horizontal overflow was found in the tested mobile layouts. The wide data tables and chart intentionally scroll within labeled regions.
- Browser evidence and scripts are local, ignored files under `output/playwright/`.
- The updated menus were checked with pointer and keyboard input, in English and Arabic at 320, 390, 768, and 1024 px. The mobile navigation panel, operations filters, high contrast menu, video wall preset, radio channel, and video wall information dialog were also exercised; no browser console errors or page-wide overflow occurred in those runs.
- The safety, staffing, and digital views were rechecked in both themes and both languages after the visual summaries and grain were added. Automated scans found no sampled WCAG A/AA violations or page-wide overflow in those runs.
- The four additional charts were checked at 390 and 1440 px in English and Arabic, light and dark themes, across operations, safety, and staffing. The sampled axe checks reported zero WCAG A/AA violations and no page-wide overflow; no application runtime errors occurred. The aircraft detail disclosure was also checked at 320 px.
- The new charts were also checked at 390 px in both high-contrast themes; the sampled axe checks reported no WCAG A/AA violations or page-wide overflow. Browser interaction verified chart updates after a scenario change, terminal filter, and roster status change.
- A later responsive pass covered all five main views at 320, 768, and 1440 px in English and Arabic (30 browser cases). No page-wide overflow, sampled automated WCAG A/AA violations, or application runtime errors occurred. The staffing roster was additionally checked at 390 and 1024 px; its filters, details, and status actions were exercised.
- The condensed Operations, Safety, and Staffing layouts were checked at 320, 768, 1024, and 1440 px in English and Arabic; cards appear below wide desktop widths. High-contrast checks at 390 px in both themes found no sampled violations or page-wide overflow.
- The connected work queue and stand-move flow were exercised in a real browser. Assigning an event updated its digital-twin record; moving EK927 updated its stand in the map and flight board. At 390 px, English and Arabic layouts had no page-wide overflow. The Arabic handover dialog was checked at 390 px. No fresh browser runtime errors followed a clean reload.
- The milestone path and demand/capacity chart were visually checked at desktop and 390 px; the baggage path was checked at 390 px during the sorter-failure drill. The Operations page had no page-wide overflow at 320 or 390 px. In the browser, revising TOBT from 16:30 to 16:40 moved the associated start-up and take-off targets by ten minutes. Arabic chart text and the time arithmetic are covered by focused tests.

## Remaining validation before a public release

- Complete a task-based review with airport managers to confirm information priority, action wording, and whether the charts answer their real decisions.
- Check with keyboard and screen-reader users on real devices, including Arabic speech output. Test Safari and Firefox as well as Edge Chromium.
- Validate all operational labels, status thresholds, data provenance, and the live flight provider configuration with production data. The current prototype does not establish those facts.
- Review the deployed production site after hosting, including mobile hardware and printed reports.

## Next steps for an operational dashboard

1. Connect the shared event schema to authenticated airport systems and persist changes with actor, time, approval, escalation, and audit trail. The implemented role selector filters sample tasks; it does not grant permissions.
2. Establish data contracts and health monitoring for AODB/FIDS, stand planning, baggage, queue sensors, weather, and workforce systems. The optional flight endpoint is only one feed adapter; static scenario values remain throughout the prototype.
3. Validate surveyed stand geometry, operational thresholds, passenger counts, journey times, accessibility assistance, and dispatch routes with the airport and its partners. The map layers and forecasts are illustrative.
4. Complete task-based acceptance with airport managers and workers, plus keyboard, screen-reader, Arabic speech, mobile hardware, and cross-browser testing before operational use.
