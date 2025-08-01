"""remove_owner_column_from_credit_cards

Revision ID: bf9405a3d606
Revises: c6b8153676fd
Create Date: 2025-08-01 12:22:51.373567

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'bf9405a3d606'
down_revision: Union[str, None] = 'c6b8153676fd'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Remove the owner column from credit_cards table
    op.drop_column('credit_cards', 'owner')


def downgrade() -> None:
    # Add back the owner column to credit_cards table
    op.add_column('credit_cards', sa.Column('owner', sa.String(length=255), nullable=False))
