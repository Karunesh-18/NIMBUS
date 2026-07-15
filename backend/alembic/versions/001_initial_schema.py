"""Initial schema — all 8 NIMBUS tables.

Revision ID: 001
Create Date: 2026-07-15
"""
from alembic import op
import sqlalchemy as sa
from geoalchemy2 import Geometry

revision = "001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # --- wards (must be first — referenced by all other tables) -----------
    op.create_table(
        "wards",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("name", sa.Text(), nullable=True),
        sa.Column("geom", Geometry(geometry_type="POLYGON", srid=4326), nullable=True),
        sa.Column("population", sa.Integer(), nullable=True),
        sa.Column("vulnerability_score", sa.Float(), nullable=True),
    )

    # --- stations ----------------------------------------------------------
    op.create_table(
        "stations",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("external_id", sa.Text(), nullable=True, unique=True),
        sa.Column("name", sa.Text(), nullable=True),
        sa.Column("lat", sa.Float(), nullable=True),
        sa.Column("lon", sa.Float(), nullable=True),
        sa.Column("geom", Geometry(geometry_type="POINT", srid=4326), nullable=True),
        sa.Column("ward_id", sa.Integer(), sa.ForeignKey("wards.id"), nullable=True),
        sa.Column("source", sa.Text(), nullable=True),
    )

    # --- readings ----------------------------------------------------------
    op.create_table(
        "readings",
        sa.Column("id", sa.BigInteger(), primary_key=True, autoincrement=True),
        sa.Column("station_id", sa.Integer(), sa.ForeignKey("stations.id"), nullable=True),
        sa.Column("ts", sa.DateTime(timezone=True), nullable=False),
        sa.Column("pollutant", sa.Text(), nullable=True),
        sa.Column("value", sa.Float(), nullable=True),
        sa.Column("unit", sa.Text(), nullable=True),
        sa.Column("aqi_category", sa.Text(), nullable=True),
    )
    op.create_index("idx_readings_station_ts", "readings", ["station_id", "ts"])

    # --- permits -----------------------------------------------------------
    op.create_table(
        "permits",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("geom", Geometry(geometry_type="POINT", srid=4326), nullable=True),
        sa.Column("type", sa.Text(), nullable=True),
        sa.Column("status", sa.Text(), nullable=True),
        sa.Column("issued_date", sa.Date(), nullable=True),
        sa.Column("ward_id", sa.Integer(), sa.ForeignKey("wards.id"), nullable=True),
    )

    # --- industries --------------------------------------------------------
    op.create_table(
        "industries",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("geom", Geometry(geometry_type="POINT", srid=4326), nullable=True),
        sa.Column("name", sa.Text(), nullable=True),
        sa.Column("category", sa.Text(), nullable=True),
        sa.Column("ward_id", sa.Integer(), sa.ForeignKey("wards.id"), nullable=True),
    )

    # --- weather -----------------------------------------------------------
    op.create_table(
        "weather",
        sa.Column("id", sa.BigInteger(), primary_key=True, autoincrement=True),
        sa.Column("ward_id", sa.Integer(), sa.ForeignKey("wards.id"), nullable=True),
        sa.Column("ts", sa.DateTime(timezone=True), nullable=True),
        sa.Column("wind_speed", sa.Float(), nullable=True),
        sa.Column("wind_dir", sa.Float(), nullable=True),
        sa.Column("temp", sa.Float(), nullable=True),
        sa.Column("humidity", sa.Float(), nullable=True),
        sa.Column("is_forecast", sa.Boolean(), nullable=True),
    )

    # --- attributions ------------------------------------------------------
    op.create_table(
        "attributions",
        sa.Column("id", sa.BigInteger(), primary_key=True, autoincrement=True),
        sa.Column("ward_id", sa.Integer(), sa.ForeignKey("wards.id"), nullable=True),
        sa.Column("ts", sa.DateTime(timezone=True), nullable=True),
        sa.Column("cause", sa.Text(), nullable=True),
        sa.Column("confidence", sa.Float(), nullable=True),
        sa.Column("evidence_json", sa.JSON(), nullable=True),
    )

    # --- enforcement_actions -----------------------------------------------
    op.create_table(
        "enforcement_actions",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("target_id", sa.Integer(), nullable=True),
        sa.Column("target_type", sa.Text(), nullable=True),
        sa.Column("priority_score", sa.Float(), nullable=True),
        sa.Column("status", sa.Text(), nullable=True),
        sa.Column("outcome", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )


def downgrade() -> None:
    op.drop_table("enforcement_actions")
    op.drop_table("attributions")
    op.drop_table("weather")
    op.drop_table("industries")
    op.drop_table("permits")
    op.drop_index("idx_readings_station_ts", table_name="readings")
    op.drop_table("readings")
    op.drop_table("stations")
    op.drop_table("wards")
