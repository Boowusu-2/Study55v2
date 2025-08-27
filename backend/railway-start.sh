#!/bin/bash

# Railway startup script for SmartStudy FastAPI Backend

echo "🚀 Starting SmartStudy Text Extraction API on Railway..."

# Get port from Railway environment variable
PORT=${PORT:-8000}
echo "📡 Using port: $PORT"

# Install dependencies if needed
if [ -f "requirements.txt" ]; then
    echo "📚 Installing dependencies..."
    pip install -r requirements.txt
fi

# Start the FastAPI server
echo "🌟 Starting FastAPI server on port $PORT"
echo "📖 API documentation available at http://localhost:$PORT/docs"
echo "🔍 Health check available at http://localhost:$PORT/health"

uvicorn main:app --host 0.0.0.0 --port $PORT
