#!/bin/bash

# Fix CORS Configuration for Cloud Run
# This script updates the CORS settings to allow your frontend domain

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

echo -e "${BLUE}🔧 Fixing CORS Configuration${NC}"
echo "================================"

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

# Get the current service URL
SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} --region=${REGION} --format="value(status.url)")
echo -e "${GREEN}🌐 Service URL: ${SERVICE_URL}${NC}"

# Prompt for frontend domain
echo -e "${YELLOW}⚠️  Please provide your frontend domain:${NC}"
echo "Examples:"
echo "  - https://bravocui.github.io"
echo "  - http://localhost:3000"
echo "  - https://your-custom-domain.com"
read -p "Frontend domain: " FRONTEND_DOMAIN

# Construct the ALLOWED_ORIGINS string
ALLOWED_ORIGINS="${FRONTEND_DOMAIN},http://localhost:3000,https://bravocui.github.io"

echo -e "${BLUE}🔧 Updating CORS configuration...${NC}"
echo "Allowed origins: ${ALLOWED_ORIGINS}"

# Update the Cloud Run service with correct CORS settings
gcloud run services update ${SERVICE_NAME} \
    --region=${REGION} \
    --set-env-vars="ALLOWED_ORIGINS=${ALLOWED_ORIGINS}"

echo -e "${GREEN}✅ CORS configuration updated successfully!${NC}"

# Test the configuration
echo -e "${BLUE}🧪 Testing CORS configuration...${NC}"

# Test with a simple request
curl -s -X OPTIONS "${SERVICE_URL}/user/profile" \
    -H "Origin: ${FRONTEND_DOMAIN}" \
    -H "Access-Control-Request-Method: GET" \
    -H "Access-Control-Request-Headers: content-type" \
    -v 2>&1 | grep -E "(Access-Control-Allow-Origin|Access-Control-Allow-Credentials)" || echo "CORS headers not visible in curl output"

echo ""
echo -e "${BLUE}📝 Next steps:${NC}"
echo "1. Refresh your frontend application"
echo "2. Try logging in again"
echo "3. Check browser developer tools for CORS errors"
echo "4. Monitor logs: gcloud logs tail -f --project=${PROJECT_ID} --filter=resource.type=cloud_run_revision"
echo ""
echo -e "${BLUE}🔍 Debug commands:${NC}"
echo "• Test CORS: curl -X OPTIONS '${SERVICE_URL}/user/profile' -H 'Origin: ${FRONTEND_DOMAIN}' -v"
echo "• Check cookies: curl '${SERVICE_URL}/debug/cookies' -H 'Origin: ${FRONTEND_DOMAIN}'"
echo "• View logs: gcloud logs tail -f --project=${PROJECT_ID} --filter=resource.type=cloud_run_revision" 