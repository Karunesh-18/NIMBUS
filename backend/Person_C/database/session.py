import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Load environment variables explicitly from Person_C/.env
_env_path = os.path.join(os.path.dirname(__file__), "..", ".env")
load_dotenv(_env_path)
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/nimbus")

# Configure database engine with health check ping and schema search path
connect_args = {}
if DATABASE_URL.startswith("postgresql://") or DATABASE_URL.startswith("postgres://"):
    connect_args["options"] = "-c search_path=public,postgis,extensions"

try:
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,
        pool_recycle=3600,
        connect_args=connect_args
    )
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
except Exception as e:
    print(f"Warning: Failed to initialize SQLAlchemy engine: {e}")
    engine = None
    SessionLocal = None

def get_db():
    """
    FastAPI dependency that yields a database session and ensures it is closed.
    """
    if SessionLocal is None:
        yield None
        return
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
