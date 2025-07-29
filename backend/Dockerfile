# Use the official Python image.
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV ENVIRONMENT=production

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
        && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt

# Copy the rest of the backend code
COPY . .

# Create a script to handle environment loading
RUN echo '#!/bin/bash\n\
# Load environment file if it exists and ENVIRONMENT is not overridden\n\
if [ -f ".env.production" ] && [ "$ENVIRONMENT" = "production" ]; then\n\
    echo "Loading .env.production file..."\n\
    export $(cat .env.production | grep -v "^#" | xargs)\n\
fi\n\
\n\
# Start the application\n\
exec uvicorn main:app --host 0.0.0.0 --port $PORT\n\
' > /app/start.sh && chmod +x /app/start.sh

# Expose port (Cloud Run uses $PORT env variable, default to 8080)
ENV PORT=8080

# Command to run the app with environment loading
CMD ["/app/start.sh"]
