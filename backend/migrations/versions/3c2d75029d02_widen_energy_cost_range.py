"""widen energy cost range

Revision ID: 3c2d75029d02
Revises: 56ea0a6d2672
Create Date: 2026-09-29 15:58:43.293098

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '3c2d75029d02'
down_revision: Union[str, Sequence[str], None] = '56ea0a6d2672'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_constraint(op.f("ck_events_energy_cost_range"), "events", type_="check")
    op.create_check_constraint(
        op.f("ck_events_energy_cost_range"), "events", "energy_cost BETWEEN -50 AND 50"
    )


def downgrade() -> None:
    op.drop_constraint(op.f("ck_events_energy_cost_range"), "events", type_="check")
    op.create_check_constraint(
        op.f("ck_events_energy_cost_range"), "events", "energy_cost BETWEEN -5 AND 5"
    )
