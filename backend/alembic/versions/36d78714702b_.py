"""empty message

Revision ID: 36d78714702b
Revises: 8241aaf3bffa
Create Date: 2025-08-01 12:41:54.514496

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '36d78714702b'
down_revision: Union[str, None] = '8241aaf3bffa'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
