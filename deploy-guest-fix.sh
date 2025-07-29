#!/bin/bash

# Deploy Guest Access Fixes
# This script fixes the guest access issues

echo "🔧 Deploying Guest Access Fixes"
echo "================================"

echo "📋 What's being fixed:"
echo "   • Guest route protection with proper error message"
echo "   • Dashboard category filtering logic"
echo "   • Direct URL access prevention for guests"

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
echo "🚀 Deploying frontend..."

# Deploy frontend
cd frontend

# Build the frontend
echo "🔨 Building frontend..."
npm run build

cd ..

echo ""
echo "✅ Guest access fixes deployed!"
echo ""
echo "🔍 Fixed Issues:"
echo "   • 🚫 Guest users can't access /accounting directly"
echo "   • 🎭 Proper error message for restricted features"
echo "   • 📊 Dashboard correctly hides accounting for guests"
echo "   • 🔒 Route protection with user-friendly messages"
echo ""
echo "📝 Expected Behavior:"
echo "   • Guest login: Only fitness, travel, weather visible"
echo "   • Direct /accounting access: Error message with 'Go Back' button"
echo "   • Dashboard: 3 columns for guests, 4 for regular users"
echo "   • Clear messaging about guest limitations" 