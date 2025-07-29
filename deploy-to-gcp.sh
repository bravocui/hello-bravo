#!/bin/bash

# Deploy Hello Bravo Backend to Google Cloud Run
# This script builds the Docker image and deploys it to Google Cloud Run

set -e  # Exit on any error

# Configuration
PROJECT_ID="your-gcp-project-id"  # Replace with your actual project ID
SERVICE_NAME="hello-bravo-api"
REGION="us-central1"
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Hello Bravo Backend Deployment to GCP${NC}"
echo "=========================================="

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}❌ Google Cloud CLI (gcloud) is not installed.${NC}"
    echo "Please install it from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check if user is authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo -e "${YELLOW}⚠️  You are not authenticated with Google Cloud.${NC}"
    echo "Please run: gcloud auth login"
    exit 1
fi

# Check if project is set
CURRENT_PROJECT=$(gcloud config get-value project 2>/dev/null)
if [ -z "$CURRENT_PROJECT" ]; then
    echo -e "${YELLOW}⚠️  No project is set.${NC}"
    echo "Please run: gcloud config set project YOUR_PROJECT_ID"
    exit 1
fi

echo -e "${GREEN}✅ Using project: ${CURRENT_PROJECT}${NC}"

# Update PROJECT_ID with current project
PROJECT_ID="$CURRENT_PROJECT"
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

# Enable required APIs
echo -e "${BLUE}📋 Enabling required Google Cloud APIs...${NC}"
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com

# Build and push the Docker image
echo -e "${BLUE}🔨 Building Docker image...${NC}"
cd backend

# Build the image
echo "Building image: ${IMAGE_NAME}"
docker build -t ${IMAGE_NAME} .

# Push to Google Container Registry
echo -e "${BLUE}📤 Pushing image to Google Container Registry...${NC}"
docker push ${IMAGE_NAME}

cd ..

# Deploy to Cloud Run
echo -e "${BLUE}🚀 Deploying to Cloud Run...${NC}"
gcloud run deploy ${SERVICE_NAME} \
    --image ${IMAGE_NAME} \
    --platform managed \
    --region ${REGION} \
    --allow-unauthenticated \
    --port 8080 \
    --memory 512Mi \
    --cpu 1 \
    --max-instances 10 \
    --min-instances 0 \
    --timeout 300 \
    --concurrency 80

# Get the service URL
SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} --region=${REGION} --format="value(status.url)")

echo -e "${GREEN}✅ Deployment successful!${NC}"
echo "=========================================="
echo -e "${GREEN}🌐 Service URL: ${SERVICE_URL}${NC}"
echo -e "${GREEN}🔗 Health Check: ${SERVICE_URL}/health${NC}"
echo -e "${GREEN}📊 API Docs: ${SERVICE_URL}/docs${NC}"

# Test the deployment
echo -e "${BLUE}🧪 Testing deployment...${NC}"
if curl -s "${SERVICE_URL}/health" > /dev/null; then
    echo -e "${GREEN}✅ Health check passed!${NC}"
else
    echo -e "${YELLOW}⚠️  Health check failed. Service might still be starting up.${NC}"
fi

echo ""
echo -e "${BLUE}📝 Next steps:${NC}"
echo "1. Update your frontend environment variables with the new API URL"
echo "2. Configure environment variables in Cloud Run if needed"
echo "3. Set up your database connection"
echo ""
echo -e "${BLUE}🔧 Useful commands:${NC}"
echo "• View logs: gcloud logs tail -f --project=${PROJECT_ID} --filter=resource.type=cloud_run_revision"
echo "• Update service: gcloud run services update ${SERVICE_NAME} --region=${REGION}"
echo "• Delete service: gcloud run services delete ${SERVICE_NAME} --region=${REGION}" 