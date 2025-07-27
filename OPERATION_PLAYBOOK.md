# Production & Development Deployment Playbook

## Overview
This playbook covers updating the frontend (GitHub Pages), backend (Google Cloud Run), and local development servers.

## Prerequisites
- GitHub repository with GitHub Pages enabled
- Google Cloud Run service deployed
- Local development environment set up
- Environment variables configured

---

## 1. Frontend Production Deployment (GitHub Pages)

### Pre-deployment Checklist
- [ ] All changes committed to `main` branch
- [ ] Environment variables set correctly in GitHub repository
- [ ] `REACT_APP_API_URL` points to production backend
- [ ] `REACT_APP_BASENAME` set to `/hello-bravo` for GitHub Pages

### Deployment Steps

```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Install dependencies (if needed)
npm install

# 3. Build for production
npm run build

# 4. Deploy to production
npm run deploy

# 5. Commit and push changes
git add .
git commit -m "Update frontend: [describe changes]"
git push origin main

# 6. Verify deployment
# Wait 2-3 minutes, then check: https://bravocui.github.io/hello-bravo/
```

### Environment Variables (GitHub Repository Settings)
- `REACT_APP_API_URL`: `https://hello-bravo-api-772654378329.us-central1.run.app`
- `REACT_APP_BASENAME`: `/hello-bravo`
- `REACT_APP_GOOGLE_CLIENT_ID`: Your Google OAuth client ID

### Troubleshooting
- **"You need to enable JavaScript"**: Check `REACT_APP_BASENAME` setting
- **API calls failing**: Verify `REACT_APP_API_URL` points to correct backend
- **Login not working**: Check `REACT_APP_GOOGLE_CLIENT_ID` and Google OAuth settings

---

## 2. Backend Production Deployment (Google Cloud Run)

### Pre-deployment Checklist
- [ ] Backend code tested locally
- [ ] Environment variables configured in Google Cloud Run
- [ ] Google Cloud CLI authenticated
- [ ] Docker image builds successfully

### Environment Variables (Google Cloud Run)
```bash
Update backend/.env file

- GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
- JWT_SECRET=your-secure-jwt-secret
- ALLOWED_ORIGINS=https://bravocui.github.io,http://localhost:3000

```

### Deployment Steps

```bash
# 1. Navigate to backend directory
cd backend

# 2. Build Docker image and tag
docker build --platform linux/amd64 -t gcr.io/bravocui-site/hello-bravo-api .

# 3. Push to registry
docker push gcr.io/bravocui-site/hello-bravo-api

# 4. Deploy to Cloud Run
gcloud run deploy hello-bravo-api \
  --image gcr.io/bravocui-site/hello-bravo-api \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### Troubleshooting
- **Build failures**: Check Dockerfile and requirements.txt
- **Environment variables**: Verify all required vars are set in Cloud Run
- **CORS errors**: Check `ALLOWED_ORIGINS` includes your frontend URL

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

**Backend `.env`:**
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
cd backend
# Make changes, test locally
gcloud run deploy hello-bravo-api --source . --platform managed --region us-central1

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
cd backend
gcloud run deploy hello-bravo-api --source . --platform managed --region us-central1
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