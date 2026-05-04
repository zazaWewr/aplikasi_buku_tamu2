#!/bin/bash
set -a
source /vercel/share/.env.project
set +a

# Run the migration using psql with the non-pooling connection
psql "$POSTGRES_URL_NON_POOLING" -f /vercel/share/v0-project/scripts/002_add_verification_columns.sql

echo "Migration completed!"
