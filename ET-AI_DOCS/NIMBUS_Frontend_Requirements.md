# VAYU — Frontend Requirements Document (Person A)

This is the complete spec for the UI build — screens, components, states, data contracts, and design direction. Cross-reference Section 3 of the Team Roadmap for the exact API endpoints; this doc tells you what to build around them.

---

## 1. Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | React (Vite, not CRA — faster hackathon builds) | |
| Map | Mapbox GL JS (or deck.gl on top of Mapbox for heatmap layers) | Free tier is enough for a demo |
| Styling | Tailwind CSS | Fast to theme, no fighting a component library under time pressure |
| Charts | Recharts | Simple line/area charts with confidence bands |
| State | React Query (TanStack Query) for all API calls + local `useState`/`useReducer` for UI state | Query gives you caching/loading/error states for free — don't hand-roll fetch logic |
| Routing | React Router (only if you split into multiple views; a single-page app with panel toggles is fine and safer for a demo) | |
| Icons | lucide-react | |
| Real-time updates | Simple polling (`refetchInterval` in React Query) every 60–120s — no need for WebSockets in a hackathon | |

**Do not use localStorage/sessionStorage** if any part of this ever runs as a Claude artifact preview — keep state in memory/React state only. For the actual hackathon deployment this restriction doesn't apply, but default to React state anyway for simplicity.

---

## 2. Screen Inventory

1. **Command Map View** (default/home screen — this is what's on screen 90% of the demo)
2. **Ward Detail Panel** (slide-over, triggered by map click)
3. **Ask the City** (chat panel, docked or slide-over)
4. **Scenario Simulator** (modal or panel, launched from Ward Detail)
5. **Enforcement Queue** (secondary tab/view)
6. **Citizen Advisory Preview** (secondary tab/view — simulates the WhatsApp/IVR message a citizen would get)

Recommended layout: a persistent left/top nav with 3 tabs — **Map**, **Enforcement**, **Citizen View** — plus the chat panel as a persistent floating button that opens a slide-over from any tab. Keep it to one shell so the demo never looks like you're navigating between disconnected apps.

---

## 3. Screen-by-Screen Requirements

### 3.1 Command Map View

**Purpose:** the primary "wow" screen — a live, color-coded pollution surface over the city.

**Components:**
- Full-bleed Mapbox map, city centered, ward boundaries as a GeoJSON layer (`fill-color` bound to AQI value from `/aqi/surface`).
- Color scale legend (fixed position, bottom-left): Good (green) → Satisfactory → Moderate → Poor → Very Poor → Severe (deep red), matching the standard Indian AQI category colors so it reads as credible, not arbitrary.
- Timestamp/"last updated" indicator, top-right, showing data freshness.
- A small time-scrubber control (optional but strong for demo) letting the user slide across the next 24–72h forecast and watch the surface animate — pulls from `/forecast/{ward_id}` aggregated, or a dedicated surface-forecast variant if backend adds one.
- Click on any ward → opens Ward Detail Panel (3.2).
- Search/jump-to-ward input, top-left.

**Data needed:** `GET /wards` (once, cache it) for boundaries; `GET /aqi/surface?bbox=&ts=` polled every 60–120s for live color values.

**States to handle:**
- Loading: skeleton map with a subtle pulse on ward polygons, not a blank screen.
- Empty/no data for a ward: gray fill, "no recent reading" on hover — never silently omit a ward, since a gap looks like a bug to a judge.
- Error (API down): show cached last-known-good data with a small "showing cached data" badge, not a broken map. This is the fallback the roadmap's Hour 26 hardening step is for.

---

### 3.2 Ward Detail Panel (slide-over from the right)

**Purpose:** answer "what's happening in this specific ward and why."

**Components:**
- Header: ward name, current AQI value + category badge, population + vulnerability score.
- Forecast chart (Recharts area chart): 24–72h line with a shaded confidence band (`confidence_low`/`confidence_high`).
- Attribution block: plain-language cause statement (e.g., "Elevated primarily due to construction dust, 72% confidence"), with an expandable evidence list (each evidence item shows type + short description — construction permit ID, satellite thermal anomaly, traffic segment).
- "Simulate intervention" button → opens Scenario Simulator (3.3), pre-filled with this ward.
- "Ask about this ward" button → opens chat panel pre-seeded with a question referencing this ward.

**Data needed:** `GET /forecast/{ward_id}`, `GET /attribution/{ward_id}?ts=`.

**States:** loading skeleton for chart + evidence list; if attribution confidence is low (e.g., <40%), visually flag it as "inconclusive" rather than presenting a shaky cause with false confidence — this matters for judge trust in an explainable-AI feature.

---

### 3.3 Ask the City (chat panel)

**Purpose:** the standout agentic feature — natural language Q&A over the live data.

**Components:**
- Standard chat UI: message list, input box, send button.
- Assistant messages render: the answer text, a citations strip (small pills, e.g., "CPCB Station #12", "Permit #4521") below the text, and — critically — trigger the main map to pan/zoom to `map_focus` when a message arrives.
- Suggested-question chips above the input for first use (e.g., "Why is [Ward] AQI rising?", "Which zones need enforcement today?") so judges don't have to think of a question during the demo.
- Typing/"thinking" indicator while the agent call is in flight — agent calls take longer than normal API calls (multi-step reasoning), so this needs to feel intentional, not broken/slow.

**Data needed:** `POST /agent/ask { question }` → `{ answer, citations, map_focus }`.

**States:** if the agent call errors or times out, show a graceful retry message, never a raw error stack — this is the highest-visibility feature in the demo, so it needs the most polished failure handling.

---

### 3.4 Scenario Simulator

**Purpose:** the second standout feature — counterfactual reasoning, shown visually.

**Components:**
- A simple intervention picker: dropdown or toggle list of available interventions for the selected ward (e.g., "Halt construction at [Site]", "Divert traffic from [Segment]") — populate options from the ward's linked permits/industries.
- "Run simulation" button.
- Before/after comparison: two overlaid forecast lines on the same chart (current trajectory vs. simulated trajectory), with a clear delta callout (e.g., "−18 AQI points over 48h").

**Data needed:** `POST /simulate { ward_id, intervention }` → `{ before, after }`.

**States:** loading state while simulation recomputes (this should feel snappy — under 2–3 seconds, or add a deliberate "recalculating forecast..." message so it doesn't feel stuck).

---

### 3.5 Enforcement Queue

**Purpose:** shows the platform driving real action, not just insight.

**Components:**
- Sortable table: target name, type (construction/industry/burning), priority score, ward, status.
- Row click → highlights the corresponding pin on a small inset map or jumps to it on the main map.
- Priority score shown as a visual bar/badge, not just a raw number, for scannability.
- Filter by ward or status (pending/dispatched/resolved).

**Data needed:** `GET /enforcement/queue`.

**States:** empty state ("no active enforcement targets") should look intentional, not broken — unlikely to show empty in a live demo but code it anyway.

---

### 3.6 Citizen Advisory Preview

**Purpose:** shows the citizen-facing output, framed as a phone mockup for visual impact.

**Components:**
- Ward selector + language selector (English, Hindi, Tamil, Kannada, Bengali — match whatever languages Person C's `generate_advisory` supports).
- A phone-frame mockup component rendering the message as it would appear in WhatsApp — this single visual detail (an actual phone frame, not just plain text) reads as far more "product" than "hackathon project" to judges.
- Risk level badge (color-coded) alongside the message.

**Data needed:** `GET /advisory/{ward_id}?lang=`.

**States:** loading skeleton inside the phone frame; if a language isn't yet supported by the backend, disable that option in the selector rather than showing an error.

---

## 4. Design Direction

- **Color system:** base the whole UI around the AQI category palette (green → red) so it reads as a serious environmental/govtech product, not a generic SaaS dashboard. Keep chrome (nav, panels, text) in neutral dark grays/whites so the AQI colors are the only "loud" element — this is what makes the map feel authoritative.
- **Typography:** one clean sans-serif (Inter or similar) throughout; avoid anything playful — this is a public-health/government tool.
- **Density:** officials and inspectors are the primary personas — favor information density (real numbers, confidence scores, evidence) over whitespace-heavy consumer-app styling. The citizen advisory screen is the one exception where a lighter, friendlier feel fits.
- **Motion:** use it sparingly but deliberately for the two standout features — the map panning to `map_focus` after a chat answer, and the before/after chart transition in the simulator. Judges remember the moment the map moves in response to a question far more than a static chart.

---

## 5. Responsive / Demo Environment Notes

- Design and test for a **laptop screen shared to a projector/Zoom**, not mobile-first — that's the actual judging environment. A basic responsive fallback for the citizen advisory phone-mockup screen is enough mobile consideration.
- Verify the color palette is readable on a projector (avoid low-contrast mid-tones for the "Moderate" AQI category specifically — it's the one most likely to wash out).
- Keep the demo click-path to under 6 clicks total across all four standout moments (map load → ward click → ask a question → run simulation) so it stays inside a tight demo time slot.

---

## 6. Full Component Checklist (build order recommendation)

1. App shell + nav tabs
2. Map view + ward boundary layer (static first, live color second)
3. Ward Detail slide-over + forecast chart
4. Attribution block + evidence list
5. Chat panel (UI only, wired to mock `/agent/ask` first)
6. Map pan-to-focus behavior triggered by chat response
7. Scenario simulator + before/after chart
8. Enforcement queue table
9. Citizen advisory phone-mockup screen
10. Loading/error/empty states pass across every screen (do this explicitly as its own pass — don't assume it's covered)
11. Final polish pass: color contrast, transitions, demo click-path rehearsal

---

## 7. What Frontend Does NOT Own

To keep the three-person split clean: no direct calls to CPCB/OpenAQ/Sentinel, no database access, no model logic, no computing AQI categories/colors from raw pollutant values (ask backend to return a pre-computed category alongside the number, to avoid frontend/backend disagreeing on thresholds). If a screen needs data that isn't in the API contract from the Team Roadmap, flag it to Person B rather than fetching it directly — that's what keeps the parallel workflow from breaking down under time pressure.
