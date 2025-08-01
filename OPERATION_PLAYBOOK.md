# Production & Development Deployment Playbook

## Overview
This playbook covers updating the frontend (GitHub Pages), backend (Google Cloud Run), and local development servers.

## Prerequisites
- GitHub repository with GitHub Pages enabled
- Google Cloud Run service deployed
- Local development environment set up
- Environment variables configured

---

## 1. Frontend Production Deployment

### 1.1 GitHub Actions Deployment (Recommended)

#### Pre-deployment Checklist
- [ ] All changes committed to `main` branch
- [ ] Environment variables set as GitHub repository secrets
- [ ] `REACT_APP_API_URL` points to production backend, get it from cloudrun page
- [ ] `REACT_APP_BASENAME` set to `/hello-bravo` for GitHub Pages
- [ ] `REACT_APP_GOOGLE_CLIENT_ID` set to Google oAuth ID. Get it from aistudio

#### Deployment Steps

```bash
# 1. Commit and push changes
git add .
git commit -m "Update frontend: [describe changes]"
git push origin main

# 2. GitHub Actions automatically builds and deploys
# Check Actions tab in GitHub repository for deployment status

# 3. Verify deployment
# Wait 2-3 minutes, then check: https://bravocui.github.io/hello-bravo/
```

#### Environment Variables (GitHub Repository Secrets)
Set these in GitHub repository Settings → Secrets and variables → Actions → Secrets:

| Secret Name | Value |
|-------------|-------|
| `REACT_APP_API_URL` | `https://your-service-name-{PROJECT_ID}.us-central1.run.app` |
| `REACT_APP_BASENAME` | `/hello-bravo` |
| `REACT_APP_GOOGLE_CLIENT_ID` | `your-google-oauth-client-id.apps.googleusercontent.com` |

#### Benefits
- ✅ **Automated deployment** on push to main
- ✅ **Consistent build environment**
- ✅ **Deployment status tracking**
- ✅ **No local dependencies required**

#### Troubleshooting
- **"You need to enable JavaScript"**: Check `REACT_APP_BASENAME` setting
- **API calls failing**: Verify `REACT_APP_API_URL` points to correct backend
- **Login not working**: Check `REACT_APP_GOOGLE_CLIENT_ID` and Google OAuth settings

### 1.2 Local Deployment (Alternative)

#### Environment Variables (Local File)
Set these in `frontend/.env.production`:

```
REACT_APP_API_URL=https://your-service-name-{PROJECT_ID}.us-central1.run.app
REACT_APP_BASENAME=/hello-bravo
REACT_APP_GOOGLE_CLIENT_ID=your-google-oauth-client-id.apps.googleusercontent.com
REACT_APP_DEPLOYMENT_METHOD=manual
```

#### Deployment Steps

```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Build for production
npm run build

# 3. Deploy to GitHub Pages
npm run deploy

# 4. Verify deployment
# Wait 2-3 minutes, then check: https://bravocui.github.io/hello-bravo/
```

#### Benefits
- ✅ **Quick testing** of changes
- ✅ **Offline deployment** capability
- ✅ **Direct control** over build process
- ✅ **Immediate feedback** on build issues

#### Troubleshooting
- **Build failures**: Check Node.js version and dependencies
- **Environment variables**: Verify all required vars are set
- **Deployment failures**: Check GitHub Pages settings

---

## 2. Backend Production Deployment (Google Cloud Build)

### Pre-deployment Checklist
- [ ] Backend code tested locally
- [ ] Environment variables configured in Google Cloud Run console
- [ ] Google Cloud CLI authenticated
- [ ] CloudBuild API enabled

### Environment Variables (Google Cloud Run Console)
Set these directly in the Google Cloud Run console under "Edit & Deploy New Revision" → "Variables & Secrets":

```
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
JWT_SECRET=your-secure-jwt-secret
ALLOWED_ORIGINS=https://bravocui.github.io,http://localhost:3000
DATABASE_URL=your-database-connection-string
GOOGLE_API_KEY=your-google-ai-api-key
```

### Deployment Steps

```bash
# 1. Navigate to project root
cd /Users/bocui/Workspace/hello-bravo

# 2. Deploy using CloudBuild
gcloud builds submit --config cloudbuild-production.yaml

# 3. Verify deployment
# Check Cloud Run console or use health endpoint
curl https://your-service-name-{PROJECT_ID}.us-central1.run.app/health
```

### Troubleshooting
- **Build failures**: Check CloudBuild logs in Google Cloud Console
- **Environment variables**: Verify all required vars are set in Cloud Run console
- **CORS errors**: Check `ALLOWED_ORIGINS` includes your frontend URL
- **Deployment failures**: Check CloudBuild API is enabled and authenticated

---

## 3. Local Development Server

### Pre-deployment Checklist
- [ ] Python virtual environment activated
- [ ] Node.js dependencies installed
- [ ] Environment variables set in `.env` files
- [ ] Ports 3000 (frontend) and 8000 (backend) available

### Quick Start (Using Script)
```bash
# 1. Navigate to project root
cd /Users/bocui/Workspace/hello-bravo

# 2. Run development script
./start-dev.sh

# 3. Access applications
# Frontend: http://localhost:3000
# Backend: http://localhost:8000
```

### Manual Start
```bash
# Terminal 1: Backend
cd backend
source venv/bin/activate  # or your venv path
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2: Frontend
cd frontend
npm install
npm start
```

### Environment Variables (Local Development)

**Backend `.env.dev`:**
```bash
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
JWT_SECRET=your-secure-jwt-secret
ALLOWED_ORIGINS=http://localhost:3000
```

**Frontend `.env.development`:**
```bash
REACT_APP_API_URL=http://localhost:8000
REACT_APP_BASENAME=
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

### Troubleshooting
- **Port conflicts**: Kill processes using ports 3000/8000
- **Module not found**: Run `npm install` or `pip install -r requirements.txt`
- **Auth issues**: Check environment variables match between frontend/backend

---

## 4. Complete Deployment Workflow

### For Major Updates
```bash
# 1. Update backend first
cd /Users/bocui/Workspace/hello-bravo
# Make changes, test locally
gcloud builds submit --config cloudbuild-production.yaml

# 2. Update frontend
cd frontend
# Make changes, test locally
npm run build
git add . && git commit -m "Update frontend" && git push

# 3. Test production
# Wait for GitHub Pages deployment, then test full flow
```

### For Quick Fixes
```bash
# Frontend only (if backend unchanged)
cd frontend
npm run build
git add . && git commit -m "Quick fix" && git push

# Backend only (if frontend unchanged)
cd /Users/bocui/Workspace/hello-bravo
gcloud builds submit --config cloudbuild-production.yaml
```

---

## 5. Monitoring & Verification

### Health Checks
```bash
# Backend health
curl https://hello-bravo-api-772654378329.us-central1.run.app/health

# Frontend accessibility
curl -I https://bravocui.github.io/hello-bravo/
```

### Common Issues & Solutions

| Issue | Frontend | Backend | Dev |
|-------|----------|---------|-----|
| Build fails | Check `package.json` dependencies | Check `requirements.txt` | Check both |
| Auth not working | Verify Google OAuth settings | Check JWT_SECRET | Check .env files |
| CORS errors | Check API_URL | Check ALLOWED_ORIGINS | Check both |
| Routing issues | Check REACT_APP_BASENAME | N/A | Check basename |

### Rollback Procedures
```bash
# Frontend rollback
git revert HEAD
git push origin main

# Backend rollback
gcloud run services update-traffic hello-bravo-api --to-revisions=REVISION_NAME=100
```

---

## 6. Security Checklist

### Before Production Deployment
- [ ] No hardcoded secrets in code
- [ ] Environment variables properly set
- [ ] Google OAuth configured correctly
- [ ] CORS origins restricted to production domains
- [ ] HTTPS enforced (handled by Cloud Run/GitHub Pages)

### Regular Maintenance
- [ ] Update dependencies monthly
- [ ] Rotate JWT_SECRET quarterly
- [ ] Monitor Google Cloud Run logs
- [ ] Check GitHub Pages deployment status

---

## 7. Emergency Procedures

### If Production is Down
1. **Check health endpoints** for both frontend and backend
2. **Review recent deployments** for potential issues
3. **Rollback to last known good version** if needed
4. **Check environment variables** in both GitHub and Google Cloud
5. **Monitor logs** for error patterns

### If Authentication Fails
1. **Verify Google OAuth settings** in Google Cloud Console
2. **Check JWT_SECRET** is set correctly
3. **Test with demo login** to isolate the issue
4. **Review CORS settings** for frontend-backend communication

### If Database/Data Issues
1. **Check mock data** is properly formatted
2. **Verify API endpoints** return expected data
3. **Test individual endpoints** to isolate the problem
4. **Review recent code changes** that might affect data handling

---

## 8. Performance Optimization

### Frontend Optimization
- [ ] Enable gzip compression on GitHub Pages
- [ ] Optimize bundle size with code splitting
- [ ] Use React.memo for expensive components
- [ ] Implement lazy loading for routes

### Backend Optimization
- [ ] Enable caching for static data
- [ ] Optimize database queries (when using real DB)
- [ ] Use connection pooling
- [ ] Implement rate limiting for API endpoints

---

## 9. Backup & Recovery

### Code Backup
- [ ] Regular commits to GitHub
- [ ] Feature branches for major changes
- [ ] Tagged releases for stable versions

### Configuration Backup
- [ ] Document all environment variables
- [ ] Backup Google Cloud Run configuration
- [ ] Store secrets securely (not in code)

### Data Backup
- [ ] Export mock data regularly
- [ ] Backup user sessions (when implemented)
- [ ] Document data schemas

---

This playbook ensures consistent, secure deployments across all environments! 🚀 