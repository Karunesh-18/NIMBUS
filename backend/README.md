# NIMBUS Backend

This is the backend template for the NIMBUS platform, built using Python and FastAPI.

## Directory Structure

```text
backend/
├── Person_C/         # Backend + AI Integration Lead codebase
│   ├── api/          # Route handlers / API controllers
│   ├── models/       # SQLAlchemy database models
│   ├── database/     # Database session and setup
│   ├── services/     # Business logic / DB queries
│   ├── ingestion/    # Background data ingestion jobs
│   ├── ai/           # AI/ML function wrappers
│   ├── scheduler/    # APScheduler configuration
│   ├── cache/        # In-memory or Redis caching
│   └── main.py       # FastAPI application entrypoint with stubs
├── requirements.txt  # Python package dependencies
└── README.md         # Documentation
```

## Setup & Running Locally

1. **Create a virtual environment:**
   ```bash
   python -m venv .venv
   ```

2. **Activate the virtual environment:**
   - **Windows (Command Prompt):**
     ```cmd
     .venv\Scripts\activate.bat
     ```
   - **Windows (PowerShell):**
     ```powershell
     .venv\Scripts\Activate.ps1
     ```
   - **Linux/macOS:**
     ```bash
     source .venv/bin/activate
     ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the FastAPI development server:**
   ```bash
   uvicorn Person_C.main:app --reload
   ```

The API documentation will be available at:
- Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)
- ReDoc: [http://localhost:8000/redoc](http://localhost:8000/redoc)
