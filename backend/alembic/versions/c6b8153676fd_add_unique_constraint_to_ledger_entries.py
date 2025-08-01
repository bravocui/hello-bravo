"""add_unique_constraint_to_ledger_entries

Revision ID: c6b8153676fd
Revises: 2c4e070f6920
Create Date: 2025-07-29 23:42:44.827662

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c6b8153676fd'
down_revision: Union[str, None] = '2c4e070f6920'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_unique_constraint('unique_ledger_entry', 'ledger_entries', ['year', 'month', 'user_name', 'credit_card', 'category'])
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint('unique_ledger_entry', 'ledger_entries', type_='unique')
    # ### end Alembic commands ###
