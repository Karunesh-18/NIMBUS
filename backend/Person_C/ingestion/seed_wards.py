"""
One-shot Bangalore ward geometry seeder.

Downloads BBMP ward boundaries from a public GeoJSON source, upserts each
ward into the `wards` table with its PostGIS geometry, and then runs a
bulk ST_Contains update to assign all ingested stations to their ward.

Run once:
    .venv\\Scripts\\python -m Person_C.ingestion.seed_wards
"""
import os
import sys
import json
import logging
import requests
from dotenv import load_dotenv

# Load env before any DB imports
_env_file = os.path.join(os.path.dirname(__file__), "..", ".env")
load_dotenv(_env_file)

import sqlalchemy as sa
from sqlalchemy.orm import Session

from Person_C.database.session import SessionLocal
from Person_C.models.ward import Ward

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger("nimbus.seed_wards")

# ── Bangalore BBMP ward boundaries ────────────────────────────────────────────
# Primary: Karnataka Open Data / BBMP public GeoJSON (198 wards, EPSG:4326)
GEOJSON_URLS = [
    # Verified: 243 BBMP wards, EPSG:4326 — datameet Municipal Spatial Data
    "https://raw.githubusercontent.com/datameet/Municipal_Spatial_Data/master/Bangalore/BBMP.geojson",
]

# Rough census-based vulnerability scores per ward zone (proxy: older/dense areas higher)
# Will be overridden by actual per-ward population if present in the GeoJSON properties
DEFAULT_VULNERABILITY = 0.5

def _download_geojson() -> dict | None:
    for url in GEOJSON_URLS:
        try:
            logger.info(f"Trying: {url}")
            resp = requests.get(url, timeout=15)
            resp.raise_for_status()
            data = resp.json()
            if data.get("type") == "FeatureCollection" and data.get("features"):
                logger.info(f"Downloaded {len(data['features'])} features from {url}")
                return data
        except Exception as e:
            logger.warning(f"Failed to fetch {url}: {e}")
    return None

def _get_prop(props: dict, *keys, default=None):
    """Try multiple possible property key names."""
    for k in keys:
        if k in props and props[k] is not None:
            return props[k]
    return default

def seed_wards(db: Session) -> int:
    logger.info("Starting ward seeding...")
    data = _download_geojson()

    if data is None:
        logger.error("All GeoJSON sources failed. Seeding from built-in minimal Bangalore bbox.")
        return _seed_fallback_wards(db)

    upserted = 0
    for feature in data["features"]:
        props = feature.get("properties") or {}
        geom  = feature.get("geometry")
        if not geom:
            continue

        name = _get_prop(props, "ward_name", "WARD_NAME", "Ward_Name", "name", "NAME", default=f"Ward-{upserted+1}")
        pop  = _get_prop(props, "population", "POPULATION", "pop", default=None)
        vuln = float(_get_prop(props, "vulnerability_score", default=DEFAULT_VULNERABILITY))

        geom_json = json.dumps(geom)

        try:
            existing = db.query(Ward).filter(Ward.name == name).first()
            if existing:
                # Update geometry in case it changed
                db.execute(
                    sa.text("""
                        UPDATE wards
                        SET geom = ST_SetSRID(ST_GeomFromGeoJSON(:g), 4326),
                            population = :p,
                            vulnerability_score = :v
                        WHERE name = :n
                    """),
                    {"g": geom_json, "p": pop, "v": vuln, "n": name}
                )
            else:
                db.execute(
                    sa.text("""
                        INSERT INTO wards (name, geom, population, vulnerability_score)
                        VALUES (
                            :n,
                            ST_SetSRID(ST_GeomFromGeoJSON(:g), 4326),
                            :p,
                            :v
                        )
                    """),
                    {"n": name, "g": geom_json, "p": pop, "v": vuln}
                )
            upserted += 1
        except Exception as e:
            logger.warning(f"Ward upsert failed for '{name}': {e}")
            db.rollback()
            continue

    db.commit()
    logger.info(f"Seeded {upserted} wards.")

    # ── Assign stations to wards via ST_Contains ──────────────────────────────
    logger.info("Assigning stations to wards via ST_Contains...")
    try:
        result = db.execute(sa.text("""
            UPDATE stations s
            SET ward_id = w.id
            FROM wards w
            WHERE ST_Contains(w.geom, s.geom)
              AND s.ward_id IS NULL
        """))
        db.commit()
        logger.info(f"Assigned {result.rowcount} stations to wards.")
    except Exception as e:
        logger.error(f"Station→ward assignment failed: {e}")
        db.rollback()

    return upserted

def _seed_fallback_wards(db: Session) -> int:
    """
    Seeds 4 representative Bangalore wards as simple bounding-box polygons
    when the external GeoJSON is unavailable. Enough for local dev / CI.
    """
    fallback = [
        {"name": "Koramangala", "coords": [[77.614, 12.927], [77.645, 12.927], [77.645, 12.940], [77.614, 12.940], [77.614, 12.927]], "pop": 300000, "vuln": 0.65},
        {"name": "Whitefield",  "coords": [[77.739, 12.963], [77.780, 12.963], [77.780, 12.995], [77.739, 12.995], [77.739, 12.963]], "pop": 450000, "vuln": 0.45},
        {"name": "Marathahalli", "coords": [[77.697, 12.948], [77.730, 12.948], [77.730, 12.968], [77.697, 12.968], [77.697, 12.948]], "pop": 380000, "vuln": 0.60},
        {"name": "HSR Layout",  "coords": [[77.637, 12.906], [77.665, 12.906], [77.665, 12.925], [77.637, 12.925], [77.637, 12.906]], "pop": 280000, "vuln": 0.55},
    ]
    inserted = 0
    for w in fallback:
        ring = ", ".join(f"{c[0]} {c[1]}" for c in w["coords"])
        wkt  = f"POLYGON(({ring}))"
        try:
            db.execute(sa.text("""
                INSERT INTO wards (name, geom, population, vulnerability_score)
                VALUES (:n, ST_GeomFromText(:g, 4326), :p, :v)
                ON CONFLICT DO NOTHING
            """), {"n": w["name"], "g": wkt, "p": w["pop"], "v": w["vuln"]})
            inserted += 1
        except Exception as e:
            logger.warning(f"Fallback ward insert failed: {e}")
            db.rollback()
    db.commit()
    logger.info(f"Fallback: seeded {inserted} wards.")
    return inserted

if __name__ == "__main__":
    db = SessionLocal()
    try:
        count = seed_wards(db)
        logger.info(f"Done — {count} wards in DB.")
        sys.exit(0)
    except Exception as e:
        logger.error(f"Seeding failed: {e}")
        sys.exit(1)
    finally:
        db.close()
