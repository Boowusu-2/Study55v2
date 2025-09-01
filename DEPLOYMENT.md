# SmartStudy Deployment Guide

## 🚀 Overview

This guide covers deploying SmartStudy to production environments. The application consists of two main components:

- **Frontend**: Next.js static export
- **Backend**: FastAPI application

## 📋 Prerequisites

### Required Accounts

- **GitHub**: For source code repository
- **Railway**: For backend deployment (recommended)
- **Vercel/Netlify**: For frontend deployment
- **Google AI Studio**: For Gemini API keys

### Required Tools

- **Node.js 18+**: For frontend development
- **Python 3.8+**: For backend development
- **Git**: For version control
- **Docker**: For containerized deployment (optional)

## 🏗️ Backend Deployment (Railway)

### Step 1: Prepare Backend Code

1. **Verify Backend Structure**

   ```bash
   backend/
   ├── main.py              # FastAPI application
   ├── requirements.txt     # Python dependencies
   ├── Dockerfile          # Container configuration
   └── .env.example        # Environment variables template
   ```

2. **Check Requirements**

   ```bash
   cd backend
   cat requirements.txt
   ```

   Ensure these packages are included:

   ```
   fastapi==0.104.1
   uvicorn==0.24.0
   python-multipart==0.0.6
   PyPDF2==3.0.1
   python-docx==1.1.0
   python-pptx==0.6.23
   google-generativeai==0.3.2
   ```

### Step 2: Railway Setup

1. **Create Railway Account**

   - Visit [Railway.app](https://railway.app)
   - Sign up with GitHub account
   - Create new project

2. **Connect Repository**

   ```bash
   # In Railway dashboard
   - Click "Deploy from GitHub repo"
   - Select your SmartStudy repository
   - Choose "backend" directory as source
   ```

3. **Configure Environment Variables**

   ```bash
   # In Railway dashboard → Variables tab
   GEMINI_API_KEY_1=your_gemini_api_key_1
   GEMINI_API_KEY_2=your_gemini_api_key_2
   GEMINI_API_KEY_3=your_gemini_api_key_3
   GEMINI_API_KEY_4=your_gemini_api_key_4
   GEMINI_API_KEY_5=your_gemini_api_key_5
   CORS_ORIGINS=https://your-frontend-domain.com
   LOG_LEVEL=INFO
   ```

4. **Deploy Backend**
   ```bash
   # Railway will automatically deploy on push
   git add .
   git commit -m "Deploy backend to Railway"
   git push origin main
   ```

### Step 3: Verify Backend Deployment

1. **Check Deployment Status**

   - Visit Railway dashboard
   - Check deployment logs
   - Verify service is running

2. **Test API Endpoints**

   ```bash
   # Health check
   curl https://your-railway-app.railway.app/health

   # API documentation
   curl https://your-railway-app.railway.app/docs
   ```

3. **Get Backend URL**
   - Copy the Railway deployment URL
   - Format: `https://your-app-name.railway.app`

## 🌐 Frontend Deployment (Vercel)

### Step 1: Prepare Frontend Code

1. **Update Environment Variables**

   ```bash
   # Create .env.local
   NEXT_PUBLIC_BACKEND_URL=https://your-railway-app.railway.app
   NEXT_PUBLIC_APP_NAME=SmartStudy
   ```

2. **Verify Build Configuration**

   ```javascript
   // next.config.js
   /** @type {import('next').NextConfig} */
   const nextConfig = {
     output: "export",
     trailingSlash: true,
     images: {
       unoptimized: true,
     },
   };

   module.exports = nextConfig;
   ```

3. **Test Local Build**
   ```bash
   npm run build
   # Should create 'out' directory with static files
   ```

### Step 2: Vercel Setup

1. **Create Vercel Account**

   - Visit [Vercel.com](https://vercel.com)
   - Sign up with GitHub account
   - Create new project

2. **Import Repository**

   ```bash
   # In Vercel dashboard
   - Click "Import Git Repository"
   - Select your SmartStudy repository
   - Configure project settings
   ```

3. **Configure Build Settings**

   ```bash
   # Build settings in Vercel
   Framework Preset: Next.js
   Build Command: npm run build
   Output Directory: out
   Install Command: npm install
   ```

4. **Set Environment Variables**

   ```bash
   # In Vercel dashboard → Settings → Environment Variables
   NEXT_PUBLIC_BACKEND_URL=https://your-railway-app.railway.app
   NEXT_PUBLIC_APP_NAME=SmartStudy
   ```

5. **Deploy Frontend**
   ```bash
   # Vercel will automatically deploy on push
   git add .
   git commit -m "Deploy frontend to Vercel"
   git push origin main
   ```

### Step 3: Verify Frontend Deployment

1. **Check Deployment Status**

   - Visit Vercel dashboard
   - Check deployment logs
   - Verify build success

2. **Test Application**

   ```bash
   # Visit your Vercel URL
   https://your-app-name.vercel.app

   # Test functionality
   - Upload a document
   - Generate a quiz
   - Check API connectivity
   ```

## 🔧 Alternative Deployment Options

### Backend Alternatives

#### Render

```bash
# 1. Create Render account
# 2. Connect GitHub repository
# 3. Configure service
Service Type: Web Service
Build Command: pip install -r requirements.txt
Start Command: uvicorn main:app --host 0.0.0.0 --port $PORT
```

#### Heroku

```bash
# 1. Create Heroku account
# 2. Install Heroku CLI
# 3. Deploy
heroku create your-app-name
git push heroku main
```

#### DigitalOcean App Platform

```bash
# 1. Create DigitalOcean account
# 2. Create app from GitHub
# 3. Configure environment variables
# 4. Deploy
```

### Frontend Alternatives

#### Netlify

```bash
# 1. Create Netlify account
# 2. Connect GitHub repository
# 3. Configure build settings
Build command: npm run build
Publish directory: out
```

#### GitHub Pages

```bash
# 1. Enable GitHub Pages in repository settings
# 2. Configure GitHub Actions for deployment
# 3. Set up custom domain (optional)
```

## 🐳 Docker Deployment

### Backend Dockerfile

```dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Frontend Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=0 /app/out /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose

```yaml
version: "3.8"

services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - GEMINI_API_KEY_1=${GEMINI_API_KEY_1}
      - GEMINI_API_KEY_2=${GEMINI_API_KEY_2}
    restart: unless-stopped

  frontend:
    build: .
    ports:
      - "3000:80"
    depends_on:
      - backend
    restart: unless-stopped
```

## 🔒 Security Configuration

### CORS Configuration

```python
# backend/main.py
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://your-frontend-domain.com",
        "http://localhost:3000"  # Development
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Environment Variables Security

```bash
# Never commit sensitive data
# Use environment variables for all secrets
# Rotate API keys regularly
# Use different keys for development/production
```

### SSL/TLS Configuration

```bash
# Railway/Vercel provide SSL automatically
# For custom domains, configure SSL certificates
# Use HTTPS for all production traffic
```

## 📊 Monitoring & Analytics

### Health Checks

```python
# backend/main.py
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow(),
        "version": "1.0.0"
    }
```

### Logging Configuration

```python
# backend/main.py
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)
```

### Performance Monitoring

```bash
# Railway provides built-in monitoring
# Vercel provides performance analytics
# Consider additional monitoring tools:
# - Sentry for error tracking
# - Google Analytics for usage
# - Uptime monitoring services
```

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy SmartStudy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: "18"
      - name: Install dependencies
        run: npm install
      - name: Run tests
        run: npm test

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Railway
        run: |
          # Railway CLI deployment
          railway up

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Vercel
        run: |
          # Vercel CLI deployment
          vercel --prod
```

## 🚨 Troubleshooting

### Common Deployment Issues

#### Backend Issues

```bash
# 1. Check Railway logs
railway logs

# 2. Verify environment variables
railway variables

# 3. Test API endpoints
curl https://your-app.railway.app/health

# 4. Check CORS configuration
# Ensure frontend domain is in allowed origins
```

#### Frontend Issues

```bash
# 1. Check Vercel build logs
# 2. Verify environment variables
# 3. Test API connectivity
# 4. Check browser console for errors
```

#### API Connection Issues

```bash
# 1. Verify backend URL in frontend
# 2. Check CORS configuration
# 3. Test API endpoints directly
# 4. Verify SSL certificates
```

### Performance Optimization

#### Backend Optimization

```python
# 1. Enable response caching
# 2. Optimize database queries
# 3. Use connection pooling
# 4. Implement rate limiting
```

#### Frontend Optimization

```javascript
// 1. Enable code splitting
// 2. Optimize images
// 3. Use CDN for static assets
// 4. Implement caching strategies
```

## 📈 Scaling Considerations

### Backend Scaling

- **Railway**: Automatic scaling based on traffic
- **Load Balancing**: Multiple instances
- **Caching**: Redis for session storage
- **Database**: Consider managed database service

### Frontend Scaling

- **CDN**: Global content delivery
- **Caching**: Browser and CDN caching
- **Optimization**: Bundle size optimization
- **Monitoring**: Performance monitoring

## 🔄 Maintenance

### Regular Tasks

- [ ] **API Key Rotation**: Rotate Gemini API keys monthly
- [ ] **Security Updates**: Update dependencies regularly
- [ ] **Backup Verification**: Test backup procedures
- [ ] **Performance Monitoring**: Monitor application performance
- [ ] **User Feedback**: Collect and address user feedback

### Update Procedures

```bash
# 1. Test updates in development
# 2. Create staging environment
# 3. Deploy to staging
# 4. Run integration tests
# 5. Deploy to production
# 6. Monitor for issues
```

---

**Need Help?** Contact the development team or check the [GitHub repository](https://github.com/Boowusu-2/Study55v2) for issues and discussions.

**Last Updated**: January 2024  
**Version**: 1.0.0
