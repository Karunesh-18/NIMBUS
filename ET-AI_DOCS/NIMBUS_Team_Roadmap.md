# VAYU — 3-Person Build Roadmap & Frontend/Backend Contract

Assumption: a standard 36–48 hour hackathon sprint (2 days + overnight). If your actual window is shorter/longer, the phases compress/stretch proportionally but the role split and API contract stay the same.

---

## 1. Team Roles

**Person A — Frontend Engineer (Product/UI owner)**
Owns everything the judge *sees*: map, chat panel, dashboard, citizen PWA, demo polish.

**Person B — Backend Engineer (Data & API owner)**
Owns ingestion pipelines, database, and the FastAPI layer that the frontend calls. This is the glue — everyone talks to Person B's API, not to each other's code directly.

**Person C — AI/ML Engineer (Intelligence owner)**
Owns the forecast model, attribution engine, and the "Ask the City" agent. Ships these as Python functions/services that Person B wires into the API.

**Golden rule for parallel work:** Person A and Person C should never have to wait on each other. Person B defines the API contract (below) in the first 2 hours; A and C build against that contract using mock data until the real thing is ready, then swap the mock for the real call. This is what lets three people work simultaneously without blocking each other.

---

## 2. Hour-by-Hour Roadmap

### Phase 0 — Alignment (Hour 0–2, all three together)
- Agree on the API contract in Section 3 below — **do not skip this**, it's the only thing that lets you split up afterward.
- Person B stands up a skeleton FastAPI project with every endpoint stubbed to return hardcoded mock JSON matching the contract.
- Person A and Person C both pull this skeleton and start building against the mocks immediately.
- Agree on the one city and date range for the demo (pick a city with confirmed live CPCB/OpenAQ coverage — verify this in Hour 0, not Hour 20).

### Phase 1 — Independent build (Hour 2–18)

**Person B (Backend):**
- Hour 2–6: Set up PostgreSQL + PostGIS, create schema (Section 5), write ingestion worker for CPCB/OpenAQ (poll every 15 min, land into `readings` table).
- Hour 6–10: Add Sentinel-5P + IMD weather pollers. Build ward boundary geometries (use public shapefiles) and join stations to wards.
- Hour 10–14: Build the real `/aqi/surface`, `/forecast/{ward_id}`, `/attribution/{ward_id}` endpoints — initially returning interpolated/rule-based values while Person C's models aren't ready yet.
- Hour 14–18: Swap in Person C's real model outputs as they land. Add auth (basic role check is enough for a hackathon).

**Person C (AI/ML):**
- Hour 2–6: Get historical CPCB/OpenAQ data (bulk download or Person B's DB once populated), build baseline interpolation surface (Kriging or even IDW if time-constrained) as a Python function `get_surface(bbox, timestamp) -> grid`.
- Hour 6–11: Build the forecast model (XGBoost on weather + lag features is realistic in this timeframe; skip the Transformer unless ahead of schedule) — expose as `forecast(ward_id) -> [{ts, aqi, confidence}]`.
- Hour 11–15: Build the attribution model — a feature-weighted scorer over traffic/permit/satellite features — expose as `attribute(ward_id, ts) -> {cause, confidence, evidence}`.
- Hour 15–18: Build the "Ask the City" agent — a tool-calling loop (LangGraph or a manual loop) that can call `forecast()`, `attribute()`, and a permit lookup, then compose a cited natural-language answer. Expose as `ask(question) -> {answer, citations, map_focus}`.

**Person A (Frontend):**
- Hour 2–6: Scaffold React app, integrate Mapbox GL, render a static ward-boundary layer using mock data from Person B's stub endpoints.
- Hour 6–10: Build the live AQI heatmap layer (color-coded by surface values), ward click → detail panel.
- Hour 10–14: Build the chat panel UI for "Ask the City," wired to the mock `/agent/ask` endpoint first.
- Hour 14–18: Build the enforcement queue view and the citizen advisory preview screen. Start integrating real endpoints as Person B swaps mocks for real data.

### Phase 2 — Integration (Hour 18–26, all three together)
- Swap every remaining mock for a live call. Test each endpoint end-to-end with real data for your chosen demo city.
- Build the "what-if" scenario simulator: frontend sends a modified feature vector (e.g., "construction halted") to a new `/simulate` endpoint; Person C's forecast model reruns with that feature disabled; frontend animates the before/after.
- Fix broken joins (most bugs at this stage are ward-ID mismatches between geometry data and readings data — check this first).

### Phase 3 — Hardening & Demo Prep (Hour 26–34)
- Person B: add caching (Redis or in-memory) so the live demo doesn't depend on external APIs responding fast during judging — pre-fetch and cache the demo window's data.
- Person C: add a static fallback dataset (yesterday's real pulled data, saved to disk) in case live APIs are down during judging. **Never demo on a live external API you don't control without a fallback.**
- Person A: polish UI, add loading states, rehearse the exact click-path for the demo script from the earlier strategy doc.
- All three: run the full demo script 2–3 times end-to-end, timing it.

### Phase 4 — Buffer & Submission (Hour 34–36+)
- Record the demo video, prep slides, write the architecture diagram cleanly, submit.

---

## 3. The API Contract (build this first, hour 0–2)

This is the single source of truth connecting all three people. Frontend only ever talks to these endpoints; AI/ML code only ever exposes Python functions that Backend wraps into these endpoints.

| Endpoint | Method | Called by | Backed by | Request | Response |
|---|---|---|---|---|---|
| `/aqi/surface` | GET | Frontend map layer | Backend (Person B), using Person C's interpolation | `?bbox=lat1,lon1,lat2,lon2&ts=ISO8601` | `{ grid: [{lat, lon, aqi, pollutant_breakdown}] }` |
| `/wards` | GET | Frontend map layer | Backend | none | `{ wards: [{id, name, geom_geojson, population, vulnerability_score}] }` |
| `/forecast/{ward_id}` | GET | Frontend detail panel | Backend, wrapping Person C's `forecast()` | path param `ward_id` | `{ ward_id, points: [{ts, aqi, confidence_low, confidence_high}] }` |
| `/attribution/{ward_id}` | GET | Frontend detail panel | Backend, wrapping Person C's `attribute()` | `?ts=ISO8601` | `{ ward_id, cause, confidence, evidence: [{type, ref, description}] }` |
| `/agent/ask` | POST | Frontend chat panel | Backend, wrapping Person C's `ask()` | `{ question: string }` | `{ answer: string, citations: [{source, ref}], map_focus: {ward_id, bbox} }` |
| `/simulate` | POST | Frontend scenario slider | Backend, wrapping Person C's model rerun | `{ ward_id, intervention: {type, target_id, action} }` | `{ before: [...forecast points], after: [...forecast points] }` |
| `/enforcement/queue` | GET | Frontend enforcement view | Backend, wrapping Person C's prioritization | none | `{ queue: [{target_id, name, geom, priority_score, evidence_ref}] }` |
| `/advisory/{ward_id}` | GET | Frontend citizen preview | Backend, using Person C's LLM generation | `?lang=ta|kn|hi|en` | `{ ward_id, message, risk_level }` |

**Contract rules for the team:**
- Every response field name above is final — don't rename fields once agreed, since both Person A and Person C are coding against these names independently.
- Person B should stub *all* of these on Hour 0–2 with realistic mock JSON so A and C are never blocked.
- Timestamps always ISO 8601 UTC. Coordinates always `[lat, lon]` order, never `[lon, lat]` (this is the single most common integration bug in geospatial hackathon projects — agree on it now).

---

## 4. Frontend — Exact Scope (Person A)

**Must build:**
1. Map view (Mapbox GL) with a live-colored AQI heatmap layer, pulling `/aqi/surface`.
2. Ward click → side panel showing `/forecast/{ward_id}` as a line chart with confidence band, and `/attribution/{ward_id}` as a plain-language explanation + evidence list.
3. Chat panel calling `/agent/ask`, rendering the answer with citations and auto-panning the map to `map_focus`.
4. Scenario simulator: a simple control (e.g., "pause construction" toggle) that calls `/simulate` and animates the before/after forecast on the chart.
5. Enforcement queue table pulling `/enforcement/queue`, sortable by priority score, with a map pin per target.
6. Citizen advisory preview screen (simulating the WhatsApp/IVR message) pulling `/advisory/{ward_id}`.

**What frontend needs from backend, explicitly:** only the 8 endpoints above, nothing else. Frontend should never query the database or call CPCB/Sentinel directly — that isolation is what lets Person A work independently.

---

## 5. Backend — Exact Scope (Person B)

**Database schema (PostGIS):**
```sql
stations(id, name, lat, lon, ward_id, source)
readings(id, station_id, ts, pollutant, value, unit)
wards(id, name, geom GEOMETRY(Polygon,4326), population, vulnerability_score)
permits(id, geom GEOMETRY(Point,4326), type, status, issued_date, ward_id)
industries(id, geom GEOMETRY(Point,4326), name, category, ward_id)
attributions(id, ward_id, ts, cause, confidence, evidence_json)
enforcement_actions(id, target_id, target_type, priority_score, status, outcome, created_at)
```

**Must build:**
1. Ingestion workers (cron/APScheduler is fine for a hackathon — no need for real Kafka unless there's spare time) for CPCB/OpenAQ, IMD weather, Sentinel-5P.
2. The 8 API endpoints in Section 3, each initially returning mock/rule-based data, later wrapping Person C's real model calls.
3. A thin Python interface layer that imports Person C's functions directly (`from ai.forecast import forecast`, `from ai.attribution import attribute`, `from ai.agent import ask`) so there's no network hop between B and C's code inside the same service — simplest possible integration for a hackathon.
4. Caching for the demo city/date window so judging-day performance doesn't depend on external API latency.

**What backend needs from AI/ML, explicitly:** four Python functions with the exact signatures below — nothing else. Person C should be able to develop and unit-test these completely standalone, then hand them off as a package.

```python
def get_surface(bbox: tuple, ts: str) -> list[dict]: ...
def forecast(ward_id: str) -> list[dict]: ...
def attribute(ward_id: str, ts: str) -> dict: ...
def ask(question: str) -> dict: ...
def prioritize_enforcement() -> list[dict]: ...
def generate_advisory(ward_id: str, lang: str) -> dict: ...
```

---

## 6. AI/ML — Exact Scope (Person C)

**Must build**, each as a standalone, independently testable Python function (signatures above):
1. `get_surface` — spatial interpolation (Kriging/GP, or IDW if short on time) over station readings + satellite prior.
2. `forecast` — XGBoost/LightGBM on lag features (recent AQI, weather forecast, day-of-week/seasonal calendar) per ward. Validate against a simple persistence baseline so you have a concrete accuracy number for the judges.
3. `attribute` — a feature-weighted scorer (traffic density, permit proximity, industry proximity, satellite thermal anomaly) producing a ranked cause list with confidence; add SHAP values if time allows, for the explainability wow-feature.
4. `ask` — tool-calling agent (LangGraph, or a manual "LLM decides which function to call" loop) with access to `forecast`, `attribute`, and a permit/industry lookup, grounded with citations.
5. `prioritize_enforcement` — combines `attribute` scores with a target registry (permits/industries) and repeat-offense history into a ranked list.
6. `generate_advisory` — LLM call with a vulnerability-layer-aware prompt, output in the requested language.

**What AI/ML needs from backend, explicitly:** read access to the `readings`, `wards`, `permits`, `industries` tables (or a CSV export of them) — nothing else. Person C doesn't need to know anything about FastAPI or the frontend at all.

---

## 7. Risk Checklist (review at Hour 18 integration checkpoint)

- Ward ID mismatch between geometry source and readings source — check first if the map renders blank.
- External API rate limits/downtime on demo day — mitigated by the Hour 26 caching/fallback step; don't skip it.
- Coordinate order bugs (`lat,lon` vs `lon,lat`) — agree once, in Section 3, and don't deviate.
- Model training data gaps for the chosen demo city — verify data availability in Hour 0, not Hour 20.
