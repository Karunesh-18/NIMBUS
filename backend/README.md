# NIMBUS Backend

This is the backend template for the NIMBUS platform, built using Python and FastAPI.

## Directory Structure

```text
backend/
├── app/
│   ├── api/          # Route handlers / API controllers
│   ├── core/         # Configuration, database connection, security
│   ├── models/       # SQLAlchemy database models
│   ├── schemas/      # Pydantic validation schemas
│   ├── services/     # Business logic / DB queries
│   ├── ai/           # AI/ML function wrappers
│   ├── ingestion/    # Background data ingestion jobs
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
   uvicorn app.main:app --reload
   ```

The API documentation will be available at:
- Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)
- ReDoc: [http://localhost:8000/redoc](http://localhost:8000/redoc)
