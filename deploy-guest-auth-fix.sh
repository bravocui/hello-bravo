#!/bin/bash

# Deploy Guest Authentication Fix
# This script fixes the guest user authentication issue

echo "🔧 Deploying Guest Authentication Fix"
echo "====================================="

echo "📋 What's being fixed:"
echo "   • Guest users no longer require database lookup"
echo "   • Authentication handles guest users properly"
echo "   • JWT tokens with id=0 work correctly"
echo "   • Guest users can access protected routes"

echo ""
echo "🚀 Deploying backend..."

# Deploy backend first
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
    --allow-unauthenticated

echo ""
echo "✅ Guest authentication fix deployed!"
echo ""
echo "🔍 Fixed Issues:"
echo "   • 🎭 Guest users authenticated without database lookup"
echo "   • 🔐 JWT tokens with id=0 work properly"
echo "   • 🚫 No more 'User not found' errors for guests"
echo "   • ✅ Guest users can access fitness, travel, weather"
echo ""
echo "📝 Expected Behavior:"
echo "   • Guest login: Works without database errors"
echo "   • Guest access: Can use fitness, travel, weather features"
echo "   • Guest restrictions: Cannot access accounting"
echo "   • Regular users: Still require database lookup" 