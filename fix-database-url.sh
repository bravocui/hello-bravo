#!/bin/bash

# Quick fix for database URL issue
# This script updates the Cloud Run service with the correct Cloud SQL connection

echo "🔧 Fixing database URL issue..."

# Get your Cloud SQL credentials
echo "Please provide your Cloud SQL database credentials:"
read -p "Database username: " DB_USER
read -s -p "Database password: " DB_PASSWORD
echo ""

# Update the Cloud Run service
gcloud run services update hello-bravo-api \
    --region=us-central1 \
    --set-env-vars="DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@/life_tracker?host=/cloudsql/bravocui-site:us-central1:bravocuisite,ENVIRONMENT=production"

echo "✅ Database URL updated!"
echo "🌐 Service URL: $(gcloud run services describe hello-bravo-api --region=us-central1 --format='value(status.url)')"
echo "🔗 Test health: $(gcloud run services describe hello-bravo-api --region=us-central1 --format='value(status.url)')/health" 