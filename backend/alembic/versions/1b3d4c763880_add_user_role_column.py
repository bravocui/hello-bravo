"""Add user role column

Revision ID: 1b3d4c763880
Revises: cf3c0a3a6236
Create Date: 2025-07-29 00:57:29.554643

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '1b3d4c763880'
down_revision: Union[str, None] = 'cf3c0a3a6236'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    # Create the enum type first
    userrole_enum = sa.Enum('ADMIN', 'REGULAR', 'READONLY', name='userrole')
    userrole_enum.create(op.get_bind())
    
    # Add the column with the enum type
    op.add_column('users', sa.Column('role', userrole_enum, nullable=False, server_default='REGULAR'))
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('users', 'role')
    # Drop the enum type
    sa.Enum(name='userrole').drop(op.get_bind())
    # ### end Alembic commands ###
