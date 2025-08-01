# 🚀 GCP Deployment Guide

This guide will help you build and deploy your Hello Bravo backend to Google Cloud Platform.

## 📋 Prerequisites

### 1. Install Google Cloud CLI
```bash
# macOS (using Homebrew)
brew install google-cloud-sdk

# Or download from Google Cloud Console
# https://cloud.google.com/sdk/docs/install
```

### 2. Authenticate with Google Cloud
```bash
# Login to your Google account
gcloud auth login

# Set your project ID
gcloud config set project YOUR_PROJECT_ID
```

### 3. Enable Required APIs if not already
```bash
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

## 🐳 Option 1: Manual Docker Build and Push

Use this if you want to manually build and push the Docker image to Google Container Registry:

```bash
# Navigate to backend directory
cd backend

# Configure Docker authentication
gcloud auth configure-docker

# Build the image
docker build -t gcr.io/YOUR_PROJECT_ID/hello-bravo-api .

# Push to Google Container Registry
docker push gcr.io/YOUR_PROJECT_ID/hello-bravo-api

cd ..
```

This will:
- ✅ Build the Docker image locally
- 📤 Push to Google Container Registry
- 📝 Manual deployment needed

## 🚀 Option 2: Full Deployment to Cloud Run

Use this to build, push, and deploy to Cloud Run in one step:

```bash
# Make the script executable
chmod +x deploy-to-gcp.sh

# Run the script
./deploy-to-gcp.sh
```

This will:
- ✅ Check prerequisites
- 🔨 Build the Docker image
- 📤 Push to Google Container Registry
- 🚀 Deploy to Cloud Run
- 🧪 Test the deployment
- 📝 Show service URLs

## 🔧 Manual Commands

If you prefer to run commands manually:

### 1. Build and Push Docker Image
```bash
# Navigate to backend directory
cd backend

# Configure Docker authentication
gcloud auth configure-docker

# Build the image
docker build -t gcr.io/YOUR_PROJECT_ID/hello-bravo-api .

# Push to Google Container Registry
docker push gcr.io/YOUR_PROJECT_ID/hello-bravo-api

cd ..
```

### 2. Deploy to Cloud Run
```bash
gcloud run deploy hello-bravo-api \
    --image gcr.io/YOUR_PROJECT_ID/hello-bravo-api \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated \
    --port 8080 \
    --memory 512Mi \
    --cpu 1 \
    --max-instances 10 \
    --min-instances 0
```

## 🌐 Environment Variables

After deployment, you may need to set environment variables in Cloud Run:

```bash
gcloud run services update hello-bravo-api \
    --region us-central1 \
    --update-env-vars ENVIRONMENT=production,DATABASE_URL=your-database-url
```

## 📊 Monitoring and Management

### View Logs
```bash
gcloud logs tail -f --project=YOUR_PROJECT_ID --filter=resource.type=cloud_run_revision
```

### Update Service
```bash
gcloud run services update hello-bravo-api --region=us-central1
```

### Delete Service
```bash
gcloud run services delete hello-bravo-api --region=us-central1
```

### List Images
```bash
gcloud container images list --repository=gcr.io/YOUR_PROJECT_ID
```

## 🔍 Troubleshooting

### Common Issues:

1. **"Permission denied" errors**
   - Run: `gcloud auth configure-docker`

2. **"Project not found"**
   - Check your project ID: `gcloud config get-value project`
   - Set correct project: `gcloud config set project YOUR_PROJECT_ID`

3. **"API not enabled"**
   - Enable required APIs (see Prerequisites section)

4. **"Image not found"**
   - Make sure you're in the backend directory when building
   - Check the Dockerfile exists: `ls backend/Dockerfile`

### Health Check
After deployment, test your service:
```bash
curl https://your-service-url/health
```

## 📝 Next Steps

1. **Update Frontend**: Update your frontend environment variables with the new API URL
2. **Configure Database**: Set up your database connection in Cloud Run
3. **Set Environment Variables**: Configure all required environment variables
4. **Monitor**: Set up monitoring and alerting
5. **SSL**: Cloud Run automatically provides HTTPS

## 🎯 Quick Start

For the fastest deployment:

```bash
# 1. Set your project
gcloud config set project YOUR_PROJECT_ID

# 2. Run the full deployment
chmod +x deploy-to-gcp.sh && ./deploy-to-gcp.sh

# 3. Update your frontend with the new API URL
```

Your service will be available at: `https://hello-bravo-api-xxxxx-uc.a.run.app` 