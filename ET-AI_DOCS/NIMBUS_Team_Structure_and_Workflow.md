# NIMBUS Team Structure and Development Workflow

This document outlines the roles, responsibilities, folder ownership, and git branch strategy for the NIMBUS development team.

---

## 1. Team Roles & Responsibilities

### Person A — Frontend Lead (Map & Dashboard)
Owns everything related to the main dashboard and the user experience.
* **Responsibilities**:
  * Project setup, global theme, and folder structure.
  * Core Dashboard: Application layout, sidebar/header navigation, and responsive behavior.
  * Map View: Mapbox integration, AQI heatmap rendering, ward boundaries layer, legend, zoom, and search controls.
  * Ward Detail Panel: Slide-over panel, AQI card, forecast charts (Recharts), attribution cards, loading/error states.
  * API Integration: Consume `/wards`, `/aqi/surface`, `/forecast/{id}`, `/attribution/{id}`.

### Person B — Frontend AI Experience Lead
Owns every feature judges directly interact with.
* **Responsibilities**:
  * Ask the City: Chat UI, suggested prompts, typing animation, citations, map auto-focus, and chat history.
  * Scenario Simulator: Intervention selector, before/after graphs, AQI comparisons, difference cards.
  * Enforcement Queue: Data table, filtering, sorting, priority badges, and map highlighting.
  * Citizen Advisory: WhatsApp/IVR phone mockup view, language selector, risk badges, and message rendering.
  * Polish: Animations, transitions, loading screens, error handling, and offline/demo modes.
  * API Integration: Consume `/agent/ask`, `/simulate`, `/enforcement/queue`, `/advisory/{id}`.

### Person C — Backend + AI Integration
Owns everything server-side.
* **Responsibilities**:
  * FastAPI Server Setup: App routing, middlewares, folder structure, logging, Docker configurations, env variables, and OpenAPI documentation.
  * Database Management: PostgreSQL, PostGIS, SQLAlchemy, Alembic, DB Schema migrations, and seed data.
  * Data Ingestion: Worker jobs/scheduler (APScheduler) for CPCB, OpenAQ, Weather (IMD), and Satellite (Sentinel-5P) APIs, caching layer.
  * AI Integration: Wrap Person C's ML/agent functions (`get_surface()`, `forecast()`, `attribute()`, `ask()`, `prioritize()`, `generate_advisory()`) into corresponding FastAPI endpoints.
  * Deployment: Dockerizing backend, deploying to cloud platforms (Render/Fly.io), GitHub Actions (CI/CD), and health check monitoring.

---

## 2. Folder Ownership

The codebase is partitioned into distinct directories based on owner responsibilities to prevent merge conflicts during development:

### Frontend Workspace (`frontend/`)
* **`frontend/src/Person_A/`** (Frontend Lead)
  * `app/`: General app entrypoints/configuration
  * `layouts/`: Core page templates, sidebars, headers
  * `map/`: Mapbox GL components and configurations
  * `dashboard/`: Overview panel layouts
  * `charts/`: Chart configurations and wrapper components
  * `components/`: Core UI components (buttons, inputs, cards)
* **`frontend/src/Person_B/`** (Frontend AI Experience Lead)
  * `chat/`: "Ask the City" agent UI elements
  * `simulator/`: Scenario simulator UI and comparison views
  * `enforcement/`: Task queue tables and list components
  * `advisory/`: Mock phone and citizen message previewer
  * `animations/`: Global motion effects and transition files
  * `api/`: API integration clients and TanStack Query hook definitions

### Backend Workspace (`backend/`)
* **`backend/Person_C/`** (Backend + AI Integration Lead)
  * `api/`: Endpoint route definitions
  * `models/`: SQLAlchemy database models
  * `database/`: Database engines and sessions
  * `services/`: Data querying and updates logic
  * `ingestion/`: Ingestion scripts for external APIs
  * `ai/`: Machine learning models and LLM agent function files
  * `scheduler/`: Cron / APScheduler task runners
  * `cache/`: Redis / in-memory cache helpers

---

## 3. Git Branch Strategy & Merge Flow

To facilitate clean parallel feature development, we follow a branching model structured around main, develop, and feature-specific branches:

### Branch Roles
* **`main`**: Production-ready code. Always stable and deployable.
* **`develop`**: Integration branch for all active features. All feature branches merge here first.
* **`frontend-map`**: Active development branch for Person A's map and dashboard tasks.
* **`frontend-ai-ui`**: Active development branch for Person B's AI experience tasks.
* **`backend`**: Active development branch for Person C's backend and API tasks.

### Merge Flow
Feature development is structured as follows:

```text
feature branch (e.g. frontend-map, backend)
                  ↓
    [Pull Request Review & Merge]
                  ↓
               develop
                  ↓
    [Integration Testing & Hardening]
                  ↓
                 main (Production release)
```

1. Developers check out feature branches from `develop`.
2. When a feature is complete and verified locally, the developer opens a Pull Request (PR) to merge into `develop`.
3. After integration checks, `develop` is merged into `main` for deployment/demo release.
