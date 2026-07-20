# VAYU — Backend Requirements & Improvements Document (Person B)

Complete spec for the backend build — ingestion, database, API layer, integration with AI/ML, and a prioritized improvements list for whatever time remains after the core is stable. Cross-reference Section 3 of the Team Roadmap for the API contract; this doc tells you how to actually build what's behind it.

---

## 1. Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Language/Framework | Python + FastAPI | Async-native, auto-generates OpenAPI docs (useful for Person A to self-serve the contract), same language as Person C's model code — zero-friction integration |
| Database | PostgreSQL + PostGIS extension | Native geospatial queries (ward containment, distance to permit, etc.) without a separate geo engine |
| ORM | SQLAlchemy + GeoAlchemy2 | Handles PostGIS geometry types cleanly |
| Migrations | Alembic | Don't hand-edit schema under time pressure — one bad migration shouldn't cost you an hour |
| Scheduling/ingestion | APScheduler (in-process) | Full Kafka/Airflow setup is not worth the ops overhead in a 36–48h window; revisit under Improvements if there's spare time |
| Caching | In-memory (`functools.lru_cache` / simple TTL dict) or Redis if already familiar | Needed for demo-day latency safety, not for "real" scale |
| Validation | Pydantic (comes with FastAPI) | Enforces the API contract shape automatically — reject malformed requests instead of silently passing bad data downstream |
| Testing | pytest, minimal but present | At least one test per endpoint verifying response shape matches the contract |
| Deployment | Docker + Render/Fly.io (or a single cloud VM) | Fast to stand up, easy to hand off/replicate if a teammate needs to run it locally |

---

## 2. Core Responsibilities (in priority order)

1. Ingest real data from CPCB/OpenAQ, IMD, and Sentinel-5P and land it in a queryable schema.
2. Expose the 8 contract endpoints, each backed by real data as soon as possible, mock data until then.
3. Wrap Person C's Python functions with zero network overhead (same-process function calls, not HTTP between B and C).
4. Guarantee the demo doesn't break because of an external API — caching and a static fallback dataset are not optional.
5. Everything else (auth, multi-city support, etc.) is secondary to the four items above.

---

## 3. Database Schema (PostGIS)

```sql
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE stations (
  id            SERIAL PRIMARY KEY,
  external_id   TEXT UNIQUE,           -- CPCB/OpenAQ station ID
  name          TEXT,
  lat           DOUBLE PRECISION,
  lon           DOUBLE PRECISION,
  geom          GEOMETRY(Point, 4326),
  ward_id       INTEGER REFERENCES wards(id),
  source        TEXT                   -- 'cpcb' | 'openaq' | 'iqair'
);

CREATE TABLE readings (
  id            BIGSERIAL PRIMARY KEY,
  station_id    INTEGER REFERENCES stations(id),
  ts            TIMESTAMPTZ NOT NULL,
  pollutant     TEXT,                  -- 'pm25' | 'pm10' | 'no2' | 'so2' | 'co' | 'o3'
  value         DOUBLE PRECISION,
  unit          TEXT,
  aqi_category  TEXT                   -- pre-computed here, NEVER left for frontend to derive
);
CREATE INDEX idx_readings_station_ts ON readings(station_id, ts);

CREATE TABLE wards (
  id                 SERIAL PRIMARY KEY,
  name               TEXT,
  geom               GEOMETRY(Polygon, 4326),
  population         INTEGER,
  vulnerability_score DOUBLE PRECISION -- derived from hospitals/schools/elderly density
);

CREATE TABLE permits (
  id            SERIAL PRIMARY KEY,
  geom          GEOMETRY(Point, 4326),
  type          TEXT,                  -- 'construction' | 'demolition'
  status        TEXT,                  -- 'active' | 'closed'
  issued_date   DATE,
  ward_id       INTEGER REFERENCES wards(id)
);

CREATE TABLE industries (
  id            SERIAL PRIMARY KEY,
  geom          GEOMETRY(Point, 4326),
  name          TEXT,
  category      TEXT,
  ward_id       INTEGER REFERENCES wards(id)
);

CREATE TABLE weather (
  id            BIGSERIAL PRIMARY KEY,
  ward_id       INTEGER REFERENCES wards(id),
  ts            TIMESTAMPTZ,
  wind_speed    DOUBLE PRECISION,
  wind_dir      DOUBLE PRECISION,
  temp          DOUBLE PRECISION,
  humidity      DOUBLE PRECISION,
  is_forecast   BOOLEAN
);

CREATE TABLE attributions (
  id            BIGSERIAL PRIMARY KEY,
  ward_id       INTEGER REFERENCES wards(id),
  ts            TIMESTAMPTZ,
  cause         TEXT,
  confidence    DOUBLE PRECISION,
  evidence_json JSONB
);

CREATE TABLE enforcement_actions (
  id            SERIAL PRIMARY KEY,
  target_id     INTEGER,
  target_type   TEXT,                  -- 'permit' | 'industry'
  priority_score DOUBLE PRECISION,
  status        TEXT,                  -- 'pending' | 'dispatched' | 'resolved'
  outcome       TEXT,
  created_at    TIMESTAMPTZ DEFAULT now()
);
```

**Design decisions worth explaining to the team:**
- `aqi_category` is computed and stored at ingestion time, not derived client-side or per-request — one source of truth for thresholds, no frontend/backend disagreement.
- `evidence_json` is a flexible JSONB column so Person C can iterate on what evidence looks like without a schema migration every time.
- Every geospatial table has a `geom` column so ward-containment and proximity queries (`ST_Contains`, `ST_DWithin`) are native SQL, not application-layer loops.

---

## 4. Ingestion Pipeline

**Jobs (APScheduler, in-process):**
| Job | Frequency | Source | Notes |
|---|---|---|---|
| `poll_cpcb_openaq` | Every 15 min | CPCB portal / OpenAQ API | Upsert into `stations` + `readings`; compute `aqi_category` on insert |
| `poll_weather` | Every 60 min | IMD / OpenWeatherMap | Both observed and forecast rows, flagged via `is_forecast` |
| `poll_satellite` | Daily | Copernicus Sentinel-5P | Aerosol index + thermal anomaly detection, feeds attribution evidence |
| `refresh_demo_cache` | Every 5 min during demo window | Internal | Pre-warms the cache for the exact bbox/ward used in the demo script |

**Failure handling:** every job wraps its external call in try/except, logs failures, and falls back to the last successful pull rather than throwing — a single missed CPCB poll should never take down `/aqi/surface`.

---

## 5. API Layer — Implementation Notes per Endpoint

(Shapes are fixed in the Team Roadmap contract — this section is about *how* to build each one, not the shape.)

- **`/wards`** — static-ish, cache aggressively (changes rarely); serve `geom` as GeoJSON directly from PostGIS via `ST_AsGeoJSON`.
- **`/aqi/surface`** — call `Person C's get_surface(bbox, ts)`; cache per (bbox, ts-rounded-to-15min) key so repeated map pans/zooms during a demo don't recompute the interpolation every time.
- **`/forecast/{ward_id}`** — call `forecast(ward_id)`; cache per ward for the polling interval (60–120s matches frontend's refetch).
- **`/attribution/{ward_id}`** — call `attribute(ward_id, ts)`; also persist the result into the `attributions` table so the enforcement queue can reference `evidence_ref` without recomputation.
- **`/agent/ask`** — call `ask(question)`; this is the slowest endpoint (multi-step LLM reasoning) — set a generous timeout (10–15s) and make sure frontend's loading state matches, rather than trying to force this one fast.
- **`/simulate`** — call the forecast model with a modified feature vector; do not persist simulation results (they're hypothetical, not real state).
- **`/enforcement/queue`** — call `prioritize_enforcement()`, merge with any `enforcement_actions` rows that already exist so status changes persist across refreshes.
- **`/advisory/{ward_id}`** — call `generate_advisory(ward_id, lang)`; cache per (ward, lang, hour) since the message doesn't need to regenerate every request.

**Auth:** a simple bearer-token or role header (`X-Role: official|inspector|citizen`) is sufficient for a hackathon — full OAuth is not worth the time unless there's a specific "enterprise-readiness" judging criterion you're targeting.

---

## 6. Integration Contract with AI/ML (Person C)

Backend imports these directly — no HTTP hop inside the same service:

```python
from ai.surface import get_surface
from ai.forecast import forecast
from ai.attribution import attribute
from ai.agent import ask
from ai.enforcement import prioritize_enforcement
from ai.advisory import generate_advisory
```

**Backend's obligation to Person C:** provide a read-only DB session or a simple data-access helper (`get_readings(ward_id, since)`, `get_permits(ward_id)`, etc.) so Person C never writes raw SQL — this keeps the AI/ML code portable and testable in isolation, which matters because Person C is very likely iterating on model quality right up until the integration checkpoint.

---

## 7. Reliability & Demo-Day Safety Net

This is the single most-skipped part of hackathon backends and the most common reason demos fail live:

1. **Static fallback dataset:** at Hour ~24, snapshot a full day of real pulled data (readings, weather, permits) to disk/JSON. Add a `DEMO_MODE` env flag that serves from this snapshot instead of live external APIs if they're unreachable.
2. **Timeouts everywhere:** every external call (CPCB, Sentinel, IMD) gets a hard timeout (5–8s) with a fallback to cached/last-known data — never let a slow third-party API hang your own endpoint.
3. **Pre-warm the cache** for the exact bbox/time window used in the rehearsed demo script, right before judging.
4. **Health check endpoint** (`/health`) that reports the status of each ingestion job — lets you catch a silently-dead poller before it becomes a blank map mid-demo.

---

## 8. Improvements (post-MVP, in priority order if time remains)

**Tier 1 — do these if Phase 3 (hardening) finishes early:**
- Swap in-process APScheduler for a proper task queue (Celery/Redis) so ingestion failures don't block the API process.
- Add WebSocket push for `/aqi/surface` instead of polling, for a smoother live-update feel in the demo.
- Add response compression + pagination on `/enforcement/queue` for larger cities.
- Persist `/simulate` runs (currently stateless) so officials can compare saved "what-if" scenarios over time.

**Tier 2 — real product-readiness, not needed for the demo but worth mentioning in the pitch:**
- Move from in-memory cache to Redis with proper TTL/invalidation.
- Multi-tenant schema (one deployment serving multiple cities) instead of the single-city hackathon build.
- Proper OAuth/RBAC replacing the simple role header.
- Audit logging on every enforcement action for legal defensibility (mentioned in the original strategy doc's competitive moat).
- Rate-limit and API-key management if the platform's API is exposed to third parties (e.g., NCAP integration).

**Tier 3 — scale/architecture evolution (for the "scalability" judging criterion — describe, don't build):**
- Kafka/Flink streaming replacing scheduled polling, for true real-time ingestion at national scale.
- Move interpolation/forecast serving to a dedicated model-serving layer (e.g., Ray Serve or a lightweight ML API) decoupled from the main FastAPI app, so model updates don't require redeploying the whole backend.
- Read replicas / partitioned tables (`readings` partitioned by month) once data volume grows beyond a single city.

Mentioning Tier 2/3 explicitly in your pitch deck — even unbuilt — signals to judges that the architecture was designed with production scale in mind, not just hacked together for the demo.

---

## 9. What Backend Does NOT Own

No UI logic, no model training/tuning decisions (that's Person C's call), no direct frontend state — backend's job ends at returning contract-shaped JSON. If frontend needs a field that isn't in the contract, that's a contract change to negotiate with Person A, not something to bolt on ad hoc.
