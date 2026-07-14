# NIMBUS AI Agent Instructions & Rules

This file defines the strict rules, architectural constraints, and folder ownership boundaries that any AI agent must read and adhere to before performing tasks or executing prompts in this codebase.

---

## 1. Directory & File Ownership Boundaries

To avoid merge conflicts and preserve the clean partition of the hackathon build, each AI agent must operate strictly within the directories owned by the role it is currently acting as:

### Person A — Frontend Lead (Map & Dashboard)
* **Allowed Directory**: `frontend/src/Person_A/`
* **Permitted Components**: Core app layout, navigation headers, sidebars, Mapbox map layers, legends, charts, details slide-overs, and standard common UI components.
* **Restricted**: Do NOT touch `frontend/src/Person_B/` or `backend/Person_C/`.

### Person B — Frontend AI Experience Lead
* **Allowed Directory**: `frontend/src/Person_B/`
* **Permitted Components**: "Ask the City" Chat UI, Scenario Simulator overlay/sliders, Enforcement Queue tables, Citizen WhatsApp phone mockups, animations/transitions, and TanStack query client API integration hooks.
* **Restricted**: Do NOT touch `frontend/src/Person_A/` or `backend/Person_C/`.

### Person C — Backend & AI Integration Lead
* **Allowed Directory**: `backend/Person_C/` and `backend/requirements.txt`
* **Permitted Components**: FastAPI routing, SQLAlchemy models, database migrations, scheduler tasks, external API pullers, and AI/ML model wrappers.
* **Restricted**: Do NOT touch `frontend/` except to review endpoint integrations.

---

## 2. API Contract & Integration Rules

* **Single Source of Truth**: The API Contract is located in Section 3 of [NIMBUS_Team_Roadmap.md](file:///w:/CODE/NIMBUS/ET-AI_DOCS/NIMBUS_Team_Roadmap.md).
* **Strict Shape Enforcement**: You must never change endpoint paths, parameter names, or JSON response keys without explicit approval from all roles.
* **CORS Middleware**: Ensure CORS is enabled on the backend to allow frontend calls during local debug.
* **Fallback Mode**: At later integration stages, respect the fallback configuration to read cached/mock data if live external APIs are unresponsive.

---

## 3. Git Branching & Workflow Rules

Before starting any task, check the active Git branch and adhere to the following workflow:
* **Feature Branches**: All active work must be committed to the role's assigned branch:
  * Person A: `frontend-map`
  * Person B: `frontend-ai-ui`
  * Person C: `backend`
* **No Direct Merges**: Do NOT merge feature branches directly into `main` or `develop` on local terminals unless instructed. Merging is done via Pull Request review.
* **Clean Tree**: Ensure no untracked/dangling files are committed to incorrect directories. Use standard Git `.gitignore` policies.
