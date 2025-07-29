#!/bin/bash

# Production Database Migration Script
# This script runs Alembic migrations on the production database

# Set the production database URL for Alembic
export DATABASE_FOR_ALEMBIC="postgresql://prod_user:812-Galt-prod@127.0.0.1:5432/life_tracker_prod"
export ENVIRONMENT=production

echo "🔧 Production Database Migration Script"
echo "   DATABASE_FOR_ALEMBIC: $DATABASE_FOR_ALEMBIC"
echo "   ENVIRONMENT: $ENVIRONMENT"
echo ""

# Check if command is provided
if [ $# -eq 0 ]; then
    echo "Usage: $0 <alembic_command>"
    echo ""
    echo "Examples:"
    echo "  $0 current          # Check current migration version"
    echo "  $0 history          # Show migration history"
    echo "  $0 upgrade head     # Run all pending migrations"
    echo "  $0 stamp head       # Mark migrations as applied without running"
    echo "  $0 downgrade -1     # Rollback one migration"
    echo ""
    exit 1
fi

# Run the Alembic command
echo "🚀 Running: alembic $@"
echo ""
alembic "$@" 