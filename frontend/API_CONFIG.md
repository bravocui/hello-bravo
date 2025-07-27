# API Configuration

This project now uses environment variables to configure the API URL instead of the proxy configuration.

## Environment Variables

Create a `.env` file in the `frontend/` directory with the following content:

### For Development (Local Backend)
```
REACT_APP_API_URL=http://localhost:8000
```

### For Production (Deployed Backend)
```
REACT_APP_API_URL=https://your-backend-url.com
```

### For Google Cloud Run
```
REACT_APP_API_URL=https://your-service-name-xxxxx-uc.a.run.app
```

## Changes Made

1. **Removed proxy configuration** from `package.json`
2. **Created centralized API configuration** in `src/config/api.ts`
3. **Updated all components** to use the new API configuration
4. **Added automatic token handling** and error interceptors

## Benefits

- **Environment-specific configuration**: Different URLs for dev/prod
- **Better error handling**: Automatic 401 redirects to login
- **Centralized configuration**: All API calls use the same base configuration
- **Production ready**: Works with deployed backends

## Usage

The API configuration automatically:
- Uses the environment variable `REACT_APP_API_URL`
- Falls back to `http://localhost:8000` for development
- Includes authentication tokens in requests
- Handles unauthorized responses (redirects to login)
- Provides consistent error handling

## Deployment

When deploying to production, make sure to:
1. Set the `REACT_APP_API_URL` environment variable
2. Build the frontend with `npm run build`
3. Serve the built files from your web server 