# study.ai - AI-Powered Quiz Generator

Transform your documents into interactive quizzes with AI. study.ai extracts text from various document formats and generates personalized quizzes using multiple AI providers (Gemini, OpenAI, Anthropic).

## 🚀 Quick Start

### 1. Setup Environment Variables

Run the interactive setup script:

```bash
./setup-env.sh
```

This will prompt you for multiple Gemini API keys (recommended: 2-5 keys for better reliability and automatic rotation).

Or manually create `.env.local` with your API keys (see `env.template` for reference).

### 2. Install Dependencies

```bash
npm install
```

### 3. Install OCR Dependencies (Optional)

For image and handwritten text extraction:

```bash
cd backend
./install_ocr.sh
```

This installs EasyOCR and Tesseract for OCR capabilities.

### 4. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 🚀 Features

- **Multi-format Document Support**: PDF, DOCX, DOC, PPTX, PPT, TXT
- **OCR Text Extraction**: Extract text from images, handwritten notes, and scanned documents
- **AI-Powered Quiz Generation**: Uses Google Gemini 2.0 AI for intelligent question creation
- **Multiple API Key Support**: Automatic rotation and fallback with up to 5 Gemini API keys
- **Customizable Quiz Settings**: Difficulty, question count, focus areas
- **Interactive Quiz Interface**: Beautiful, responsive design with real-time feedback
- **Progressive Loading**: Immediate feedback and background question generation
- **Separated Architecture**: FastAPI backend + Next.js frontend for easy deployment

## 🏗️ Architecture

```
SmartStudy/
├── smart-study/          # Next.js Frontend
│   ├── src/
│   │   ├── pages/        # Next.js pages
│   │   ├── components/   # React components
│   │   ├── lib/          # API clients
│   │   └── ...
│   └── package.json
└── backend/              # FastAPI Backend
    ├── main.py           # FastAPI application
    ├── extract_text.py   # Text extraction logic
    ├── requirements.txt  # Python dependencies
    ├── Dockerfile        # Container configuration
    └── docker-compose.yml
```

## 🛠️ Quick Start

### Prerequisites

- Node.js 18+ and npm
- Python 3.8+
- Google Gemini API key

### 1. Start the Backend

```bash
cd backend
./start.sh
```

The FastAPI backend will be available at `http://localhost:8000`

### 2. Start the Frontend

```bash
cd smart-study
npm install
npm run dev
```

The Next.js frontend will be available at `http://localhost:3000`

### 3. Configure API Key

1. Get your free API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Enter it in the SmartStudy interface

## 📚 API Documentation

Once the backend is running, visit:

- **Interactive Docs**: http://localhost:8000/docs
- **Alternative Docs**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/health

## 🚀 Deployment

### Backend Deployment Options

1. **Docker (Recommended)**:

   ```bash
   cd backend
   docker-compose up --build -d
   ```

2. **Cloud Platforms**:
   - Railway: `railway up`
   - Render: Web service deployment
   - Heroku: `git push heroku main`

### Frontend Deployment Options

1. **Vercel (Recommended)**:

   - Connect GitHub repository
   - Set environment variable: `NEXT_PUBLIC_API_URL`

2. **Other Platforms**:
   - Netlify
   - Docker containers

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## 🔧 Configuration

### Environment Variables

**Frontend** (`.env.local`):

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Backend** (`.env`):

```env
CORS_ORIGINS=https://your-frontend-domain.com
LOG_LEVEL=INFO
```

## 🧪 Testing

Test the backend API:

```bash
cd backend
python test_api.py
```

## 📁 Project Structure

```
SmartStudy/
├── smart-study/                 # Next.js Frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── index.tsx       # Main application
│   │   │   └── api/            # Legacy API routes
│   │   ├── components/
│   │   │   └── ui/             # UI components
│   │   ├── lib/
│   │   │   ├── api.ts          # Gemini API client
│   │   │   └── fastapi-client.ts # FastAPI client
│   │   ├── types/
│   │   │   └── index.ts        # TypeScript types
│   │   └── utils/
│   │       └── helpers.ts      # Utility functions
│   ├── public/                 # Static assets
│   └── package.json
├── backend/                    # FastAPI Backend
│   ├── main.py                # FastAPI application
│   ├── extract_text.py        # Text extraction logic
│   ├── requirements.txt       # Python dependencies
│   ├── Dockerfile             # Container configuration
│   ├── docker-compose.yml     # Docker Compose setup
│   ├── start.sh               # Startup script
│   ├── test_api.py            # API tests
│   └── README.md              # Backend documentation
├── DEPLOYMENT.md              # Deployment guide
├── env.example                # Environment variables example
└── README.md                  # This file
```

## 🔒 Security Considerations

- Configure CORS origins for production
- Use environment variables for sensitive data
- Consider rate limiting for API endpoints
- Implement proper file upload validation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

- Check the API documentation at `/docs`
- Review deployment logs
- Test with the provided curl commands in DEPLOYMENT.md

## 🎯 Roadmap

- [ ] User authentication and quiz history
- [ ] Database integration for persistent storage
- [ ] Advanced quiz types (fill-in-the-blank, matching)
- [ ] Export quiz results
- [ ] Mobile app version
- [ ] Multi-language support
