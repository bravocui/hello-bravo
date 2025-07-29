#!/bin/bash

# Update Cloud Run Environment Variables
# This script updates the environment variables for your existing Cloud Run deployment

set -e

# Configuration
SERVICE_NAME="hello-bravo-api"
REGION="us-central1"
PROJECT_ID=$(gcloud config get-value project)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔧 Updating Cloud Run Environment Variables${NC}"
echo "=============================================="

# Check if gcloud is authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo -e "${RED}❌ You are not authenticated with Google Cloud.${NC}"
    echo "Please run: gcloud auth login"
    exit 1
fi

# Check if project is set
if [ -z "$PROJECT_ID" ]; then
    echo -e "${YELLOW}⚠️  No project is set.${NC}"
    echo "Please run: gcloud config set project YOUR_PROJECT_ID"
    exit 1
fi

echo -e "${GREEN}✅ Using project: ${PROJECT_ID}${NC}"

# Prompt for database credentials
echo -e "${YELLOW}⚠️  Please provide your Cloud SQL database credentials:${NC}"
read -p "Database username: " DB_USER
read -s -p "Database password: " DB_PASSWORD
echo ""

# Construct the Cloud SQL connection string
DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@/life_tracker?host=/cloudsql/bravocui-site:us-central1:bravocuisite"

echo -e "${BLUE}🔧 Updating environment variables...${NC}"

# Update the Cloud Run service with correct environment variables
gcloud run services update ${SERVICE_NAME} \
    --region=${REGION} \
    --set-env-vars="ENVIRONMENT=production,DATABASE_URL=${DATABASE_URL},JWT_SECRET=your-super-secret-jwt-key-change-this-in-production,JWT_ALGORITHM=HS256,JWT_EXPIRE_MINUTES=10080,GOOGLE_CLIENT_ID=772654378329-jq959gvbsuier0oefumlte5ci6hdnsuf.apps.googleusercontent.com,ALLOWED_ORIGINS=https://bravocui.github.io,http://localhost:3000,GCS_BUCKET_NAME=bravocui-site,GCS_PREFIX=prod/"

echo -e "${GREEN}✅ Environment variables updated successfully!${NC}"

# Get the service URL
SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} --region=${REGION} --format="value(status.url)")

echo ""
echo -e "${GREEN}🌐 Service URL: ${SERVICE_URL}${NC}"
echo -e "${GREEN}🔗 Health Check: ${SERVICE_URL}/health${NC}"

# Test the deployment
echo -e "${BLUE}🧪 Testing deployment...${NC}"
if curl -s "${SERVICE_URL}/health" > /dev/null; then
    echo -e "${GREEN}✅ Health check passed!${NC}"
else
    echo -e "${YELLOW}⚠️  Health check failed. Service might still be starting up.${NC}"
fi

echo ""
echo -e "${BLUE}📝 Next steps:${NC}"
echo "1. Check the logs to verify database connection:"
echo "   gcloud logs tail -f --project=${PROJECT_ID} --filter=resource.type=cloud_run_revision"
echo "2. Test the API endpoints"
echo "3. Update your frontend with the new API URL if needed" 