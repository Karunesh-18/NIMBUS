"""add_satellite_readings

Revision ID: 030f9750a1c4
Revises: 001
Create Date: 2026-07-18 01:35:07.971266

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '030f9750a1c4'
down_revision: Union[str, Sequence[str], None] = '001'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table('satellite_readings',
    sa.Column('id', sa.BigInteger(), nullable=False),
    sa.Column('ward_id', sa.Integer(), nullable=True),
    sa.Column('ts', sa.DateTime(timezone=True), nullable=False),
    sa.Column('aerosol_index', sa.Float(), nullable=True),
    sa.ForeignKeyConstraint(['ward_id'], ['wards.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_satellite_readings_id'), 'satellite_readings', ['id'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_satellite_readings_id'), table_name='satellite_readings')
    op.drop_table('satellite_readings')

    # ### end Alembic commands ###
