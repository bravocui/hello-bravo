"""rename_owner_to_user_name

Revision ID: b928ebfe58a7
Revises: 1b3d4c763880
Create Date: 2025-07-29 20:24:04.718696

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b928ebfe58a7'
down_revision: Union[str, None] = '1b3d4c763880'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Rename owner column to user_name in ledger_entries table
    op.alter_column('ledger_entries', 'owner', new_column_name='user_name')


def downgrade() -> None:
    # Rename user_name column back to owner in ledger_entries table
    op.alter_column('ledger_entries', 'user_name', new_column_name='owner')
