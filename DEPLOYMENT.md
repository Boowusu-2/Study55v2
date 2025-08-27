# SmartStudy Deployment Guide

This guide will help you deploy both the FastAPI backend and Next.js frontend of SmartStudy.

## Architecture Overview

- **Frontend**: Next.js application (runs on port 3000 by default)
- **Backend**: FastAPI application (runs on port 8000 by default)
- **Communication**: Frontend makes HTTP requests to backend API

## Backend Deployment (FastAPI)

### Option 1: Docker Deployment (Recommended)

1. **Navigate to the backend directory:**

   ```bash
   cd backend
   ```

2. **Build and run with Docker Compose:**

   ```bash
   docker-compose up --build -d
   ```

3. **Verify the backend is running:**
   ```bash
   curl http://localhost:8000/health
   ```

### Option 2: Local Python Deployment

1. **Navigate to the backend directory:**

   ```bash
   cd backend
   ```

2. **Run the startup script:**

   ```bash
   ./start.sh
   ```

3. **Or manually:**
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   uvicorn main:app --host 0.0.0.0 --port 8000
   ```

### Option 3: Cloud Deployment

#### Deploy to Railway

1. **Install Railway CLI:**

   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway:**

   ```bash
   railway login
   ```

3. **Deploy from backend directory:**
   ```bash
   cd backend
   railway init
   railway up
   ```

#### Deploy to Render

1. **Create a new Web Service on Render**
2. **Connect your GitHub repository**
3. **Set build command:** `pip install -r requirements.txt`
4. **Set start command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. **Set environment variables:**
   - `PYTHON_VERSION`: `3.11`

#### Deploy to Heroku

1. **Create a `Procfile` in the backend directory:**

   ```
   web: uvicorn main:app --host 0.0.0.0 --port $PORT
   ```

2. **Deploy using Heroku CLI:**
   ```bash
   cd backend
   heroku create your-app-name
   git add .
   git commit -m "Deploy FastAPI backend"
   git push heroku main
   ```

## Frontend Deployment (Next.js)

### Option 1: Vercel Deployment (Recommended)

1. **Push your code to GitHub**

2. **Connect to Vercel:**

   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Set the root directory to `smart-study`

3. **Configure environment variables:**

   - `NEXT_PUBLIC_API_URL`: Your backend URL (e.g., `https://your-backend.railway.app`)

4. **Deploy**

### Option 2: Netlify Deployment

1. **Build the project:**

   ```bash
   npm run build
   ```

2. **Deploy to Netlify:**
   - Connect your GitHub repository
   - Set build command: `npm run build`
   - Set publish directory: `out`
   - Add environment variable: `NEXT_PUBLIC_API_URL`

### Option 3: Docker Deployment

1. **Create a Dockerfile for the frontend:**

   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY . .
   RUN npm run build
   EXPOSE 3000
   CMD ["npm", "start"]
   ```

2. **Build and run:**
   ```bash
   docker build -t smartstudy-frontend .
   docker run -p 3000:3000 -e NEXT_PUBLIC_API_URL=http://your-backend-url smartstudy-frontend
   ```

## Environment Configuration

### Backend Environment Variables

Create a `.env` file in the backend directory:

```env
# Optional: Configure CORS origins for production
CORS_ORIGINS=https://your-frontend-domain.com,https://another-domain.com

# Optional: Configure logging
LOG_LEVEL=INFO
```

### Frontend Environment Variables

Create a `.env.local` file in the root directory:

```env
# Backend API URL
NEXT_PUBLIC_API_URL=https://your-backend-domain.com

# Optional: Analytics and monitoring
NEXT_PUBLIC_GA_ID=your-google-analytics-id
```

## Production Considerations

### Security

1. **CORS Configuration:**
   Update the CORS settings in `backend/main.py`:

   ```python
   allow_origins=["https://your-frontend-domain.com"]
   ```

2. **API Rate Limiting:**
   Consider adding rate limiting middleware to the FastAPI backend.

3. **File Upload Limits:**
   Configure maximum file size limits in your deployment platform.

### Performance

1. **CDN:**
   Use a CDN for static assets in production.

2. **Caching:**
   Implement caching strategies for API responses.

3. **Database:**
   Consider adding a database for user management and quiz history.

### Monitoring

1. **Health Checks:**
   The backend provides a `/health` endpoint for monitoring.

2. **Logging:**
   Configure proper logging for production debugging.

3. **Error Tracking:**
   Integrate error tracking services like Sentry.

## Troubleshooting

### Common Issues

1. **CORS Errors:**

   - Ensure the backend CORS settings include your frontend domain
   - Check that the `NEXT_PUBLIC_API_URL` is correct

2. **File Upload Failures:**

   - Check file size limits on your deployment platform
   - Verify supported file types

3. **API Connection Issues:**
   - Test the backend health endpoint: `curl https://your-backend-url/health`
   - Check network connectivity and firewall settings

### Debug Commands

```bash
# Test backend health
curl https://your-backend-url/health

# Test text extraction (replace with actual file)
curl -X POST "https://your-backend-url/extract-text" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "files=@test.pdf"

# Check frontend environment
echo $NEXT_PUBLIC_API_URL
```

## Support

For issues and questions:

1. Check the API documentation at `https://your-backend-url/docs`
2. Review the logs in your deployment platform
3. Test with the provided curl commands above
