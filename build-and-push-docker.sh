#!/bin/bash

# Build and Push Docker Image to Google Container Registry
# This script builds the Docker image and pushes it to GCR

set -e  # Exit on any error

# Configuration
PROJECT_ID="your-gcp-project-id"  # Replace with your actual project ID
SERVICE_NAME="hello-bravo-api"
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🐳 Docker Build and Push to GCP${NC}"
echo "======================================"

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

# Configure Docker to use gcloud as a credential helper
echo -e "${BLUE}🔐 Configuring Docker authentication...${NC}"
gcloud auth configure-docker

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

echo -e "${GREEN}✅ Docker image built and pushed successfully!${NC}"
echo "======================================"
echo -e "${GREEN}🐳 Image: ${IMAGE_NAME}${NC}"
echo ""
echo -e "${BLUE}📝 Next steps:${NC}"
echo "1. Deploy to Cloud Run: gcloud run deploy ${SERVICE_NAME} --image ${IMAGE_NAME} --platform managed --region us-central1 --allow-unauthenticated"
echo "2. Or use the full deployment script: ./deploy-to-gcp.sh"
echo ""
echo -e "${BLUE}🔧 Useful commands:${NC}"
echo "• List images: gcloud container images list --repository=gcr.io/${PROJECT_ID}"
echo "• Delete image: gcloud container images delete ${IMAGE_NAME} --force-delete-tags"
echo "• View image details: gcloud container images describe ${IMAGE_NAME}" 