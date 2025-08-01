# Personal Life Tracking Website

A comprehensive personal life tracking application with React frontend and FastAPI backend.

## Features

- Google OAuth login
- Fitness tracking
- Travel log
- Switzerland weather forecast
- Responsive design (desktop & mobile friendly)

## Project Structure

```
hello-bravo/
├── frontend/          # React application
├── backend/           # FastAPI application
├── README.md          # This file
└── .gitignore         # Git ignore rules
```

## Setup Instructions

### Backend Setup
1. Navigate to backend directory: `cd backend`
2. Create virtual environment: `python -m venv venv`
3. Activate virtual environment:
   - Windows: `venv\Scripts\activate`
   - macOS/Linux: `source venv/bin/activate`
4. Install dependencies: `pip install -r requirements.txt`
5. Run the server: `uvicorn main:app --reload`

### Frontend Setup
1. Navigate to frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Start development server: `npm start`

## Environment Variables

Create `.env` files in both frontend and backend directories with necessary API keys and configuration.

## Technologies Used

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: FastAPI, Python
- **Authentication**: Google OAuth
- **Styling**: Tailwind CSS for responsive design
# Test workflow trigger
