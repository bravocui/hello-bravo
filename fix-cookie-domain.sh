#!/bin/bash

# Fix Cookie Domain Issue
# This script deploys the updated cookie configuration

echo "🔧 Fixing Cookie Domain Issue"
echo "============================="

echo "📋 The issue: Cookies are not being sent with requests to sub-features"
echo "🔍 Root cause: SameSite policy blocking cross-domain cookies"
echo "✅ Fix: Updated SameSite to 'none' for production"

echo ""
echo "🚀 Deploying the fix..."

# Build and deploy with the updated cookie configuration
cd backend

# Build the Docker image
echo "🔨 Building Docker image..."
docker build -t gcr.io/772654378329/hello-bravo-api .

# Push to Google Container Registry
echo "📤 Pushing to Google Container Registry..."
docker push gcr.io/772654378329/hello-bravo-api

cd ..

# Deploy to Cloud Run
echo "🚀 Deploying to Cloud Run..."
gcloud run deploy hello-bravo-api \
    --image gcr.io/772654378329/hello-bravo-api \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated \
    --port 8080 \
    --memory 1Gi \
    --cpu 2 \
    --max-instances 20 \
    --min-instances 1 \
    --timeout 300 \
    --concurrency 80 \
    --add-cloudsql-instances bravocui-site:us-central1:bravocuisite

echo ""
echo "✅ Cookie domain fix deployed!"
echo ""
echo "🔍 What changed:"
echo "   • SameSite: lax → none (for production)"
echo "   • Domain: None (let browser handle automatically)"
echo "   • Secure: True (required for SameSite=none)"
echo ""
echo "📝 Next steps:"
echo "1. Clear browser cookies for the domain"
echo "2. Try logging in again"
echo "3. Navigate to sub-features (fitness, travel, etc.)"
echo "4. Check if cookies persist across requests"
echo ""
echo "🔍 Test commands:"
echo "• Test login: curl -X POST 'https://hello-bravo-api-772654378329.us-central1.run.app/auth/google'"
echo "• View logs: gcloud logs tail -f --project=772654378329 --filter=resource.type=cloud_run_revision" 