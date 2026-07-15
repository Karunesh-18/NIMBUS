import os, sys
from dotenv import load_dotenv
import sqlalchemy as sa

load_dotenv("Person_C/.env")
url = os.getenv("DATABASE_URL")
print(f"Connecting to: {url[:55]}...")

try:
    engine = sa.create_engine(
        url,
        connect_args={"options": "-c search_path=public,postgis,extensions"},
        pool_pre_ping=True
    )
    with engine.connect() as conn:
        ver = conn.execute(sa.text("SELECT version()")).fetchone()[0]
        print(f"SUCCESS — PostgreSQL: {ver[:70]}")

        row = conn.execute(sa.text(
            "SELECT extname, extversion FROM pg_extension WHERE extname = 'postgis'"
        )).fetchone()
        if row:
            print(f"PostGIS extension: {row[0]} v{row[1]}")
        else:
            print("WARNING: PostGIS extension NOT found — enable it in Supabase SQL editor with: CREATE EXTENSION postgis;")

        tables = conn.execute(sa.text(
            "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename"
        )).fetchall()
        if tables:
            print(f"Existing tables: {[t[0] for t in tables]}")
        else:
            print("No tables yet — run: alembic upgrade head")

except Exception as e:
    print(f"FAILED: {e}")
    sys.exit(1)
