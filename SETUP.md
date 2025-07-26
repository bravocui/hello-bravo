# Personal Life Tracking - Setup Guide

This guide will help you set up and run the Personal Life Tracking application with React frontend and FastAPI backend.

## Prerequisites

Before you begin, make sure you have the following installed:

- **Python 3.8+** - [Download Python](https://www.python.org/downloads/)
- **Node.js 16+** - [Download Node.js](https://nodejs.org/)
- **npm** - Usually comes with Node.js
- **Git** - [Download Git](https://git-scm.com/)

## Quick Start (Recommended)

The easiest way to get started is using our automated startup script:

```bash
./start-dev.sh
```

This script will:
1. Check prerequisites
2. Set up Python virtual environment
3. Install all dependencies
4. Start both backend and frontend servers
5. Open the application in your browser

## Manual Setup

If you prefer to set up manually or the automated script doesn't work, follow these steps:

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The backend will be available at: http://localhost:8000
API documentation: http://localhost:8000/docs

### 2. Frontend Setup

Open a new terminal window and run:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm start
```

The frontend will be available at: http://localhost:3000

## Environment Configuration

### Backend Environment Variables

Copy the example environment file and configure it:

```bash
cd backend
cp env.example .env
```

Edit `.env` with your actual values:

```env
# Database Configuration (optional for development)
DATABASE_URL=postgresql://user:password@localhost/life_tracker

# JWT Configuration
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Google OAuth Configuration (optional for development)
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Weather API Configuration (optional for development)
WEATHER_API_KEY=your-weather-api-key

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

### Frontend Environment Variables

Create a `.env` file in the frontend directory:

```bash
cd frontend
touch .env
```

Add the following content:

```env
REACT_APP_API_URL=http://localhost:8000
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

## Features

### 🔐 Authentication
- Google OAuth integration
- JWT token-based authentication
- Protected routes

### 💪 Fitness Tracking
- Log workouts and activities
- Track duration and calories
- View activity history
- Responsive design

### 🗺️ Travel Log
- Record trips and destinations
- Photo galleries
- Trip ratings and descriptions
- Date range tracking

### 🌤️ Switzerland Weather
- Real-time weather data for Swiss cities
- Temperature, humidity, and wind speed
- Weather alerts
- Interactive weather cards

### 📱 Responsive Design
- Mobile-friendly interface
- Desktop-optimized layout
- Touch-friendly interactions
- Cross-browser compatibility

## Development

### Project Structure

```
hello-bravo/
├── backend/                 # FastAPI backend
│   ├── main.py             # Main application file
│   ├── requirements.txt    # Python dependencies
│   └── env.example         # Environment variables template
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── contexts/       # React contexts
│   │   ├── App.tsx         # Main app component
│   │   └── index.tsx       # App entry point
│   ├── public/             # Static files
│   ├── package.json        # Node.js dependencies
│   └── tailwind.config.js  # Tailwind CSS configuration
├── start-dev.sh            # Development startup script
├── README.md               # Project overview
└── SETUP.md               # This setup guide
```

### Available Scripts

#### Backend
```bash
# Start development server
uvicorn main:app --reload

# Run tests (when implemented)
pytest

# Format code
black .
```

#### Frontend
```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Format code
npm run format
```

## Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Kill process using port 8000
   lsof -ti:8000 | xargs kill -9
   
   # Kill process using port 3000
   lsof -ti:3000 | xargs kill -9
   ```

2. **Python virtual environment issues**
   ```bash
   # Remove and recreate virtual environment
   rm -rf backend/venv
   cd backend
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

3. **Node.js dependency issues**
   ```bash
   # Clear npm cache and reinstall
   cd frontend
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **CORS issues**
   - Make sure both servers are running
   - Check that the frontend is accessing the correct backend URL
   - Verify CORS configuration in backend

### Getting Help

If you encounter any issues:

1. Check the console output for error messages
2. Verify all prerequisites are installed correctly
3. Ensure all environment variables are set
4. Check that both servers are running on the correct ports

## Next Steps

Once the application is running:

1. **Explore the features**: Try logging in and navigating through the different sections
2. **Customize the data**: Modify the mock data in the backend to add your own content
3. **Add real APIs**: Integrate with real weather APIs and Google OAuth
4. **Database setup**: Configure a real database instead of using mock data
5. **Deployment**: Deploy to production using services like Vercel, Heroku, or AWS

## Contributing

To contribute to this project:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License. 