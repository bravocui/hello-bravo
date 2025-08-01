"""remove_user_name_column_from_ledger_entries

Revision ID: 8241aaf3bffa
Revises: bf9405a3d606
Create Date: 2025-08-01 12:34:01.468401

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '8241aaf3bffa'
down_revision: Union[str, None] = 'bf9405a3d606'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Drop the existing unique constraint that includes user_name
    op.drop_constraint('unique_ledger_entry', 'ledger_entries', type_='unique')
    
    # Remove the user_name column from ledger_entries table
    op.drop_column('ledger_entries', 'user_name')
    
    # Create new unique constraint without user_name
    op.create_unique_constraint('unique_ledger_entry', 'ledger_entries', ['year', 'month', 'user_id', 'credit_card', 'category'])


def downgrade() -> None:
    # Drop the new unique constraint
    op.drop_constraint('unique_ledger_entry', 'ledger_entries', type_='unique')
    
    # Add back the user_name column to ledger_entries table
    op.add_column('ledger_entries', sa.Column('user_name', sa.String(length=100), nullable=False))
    
    # Recreate the original unique constraint with user_name
    op.create_unique_constraint('unique_ledger_entry', 'ledger_entries', ['year', 'month', 'user_name', 'credit_card', 'category'])
