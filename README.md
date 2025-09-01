# SmartStudy - AI-Powered Learning Platform

## 🎯 Overview

SmartStudy is a cutting-edge AI-powered learning platform that transforms documents into interactive quizzes and guided learning experiences. Built with Next.js, FastAPI, and Google Gemini AI, it provides an intelligent way to study and test knowledge from any uploaded document.

## ✨ Key Features

### 🧠 AI-Powered Quiz Generation

- **Document Analysis**: Extract and analyze text from PDF, TXT, and other document formats
- **Intelligent Question Creation**: Generate contextually relevant questions using Google Gemini AI
- **Multiple Question Types**: Support for multiple choice, true/false, and mixed question formats
- **Difficulty Levels**: Easy, medium, hard, and mixed difficulty options
- **Focus Areas**: Target specific topics or concepts within documents

### 🎮 Interactive Learning Experience

- **Guided Learning**: Step-by-step learning paths with explanations and practice questions
- **Real-time Progress**: Track learning progress and performance
- **Immediate Feedback**: Instant feedback on answers with detailed explanations
- **Auto-advance Options**: Configurable question progression

### ⚙️ Advanced Settings & Customization

- **Custom API Keys**: Use your own Gemini API keys for unlimited access
- **Quiz Preferences**: Customize question count, difficulty, and question types
- **Theme Support**: Light, dark, and system theme options
- **Export Capabilities**: Export quizzes in JSON and CSV formats

### 🔒 Privacy & Security

- **Local Storage**: API keys and preferences stored locally
- **No Data Sharing**: Your documents and quiz data never leave your device
- **Secure Processing**: All AI processing handled securely through Google's infrastructure

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Python 3.8+
- Google Gemini API key (optional, server keys available)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Boowusu-2/Study55v2.git
   cd Study55v2
   ```

2. **Install frontend dependencies**

   ```bash
   npm install
   ```

3. **Install backend dependencies**

   ```bash
   cd backend
   pip install -r requirements.txt
   cd ..
   ```

4. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   # Add your Gemini API keys to .env.local
   ```

5. **Start the development servers**

   ```bash
   # Terminal 1: Frontend
   npm run dev

   # Terminal 2: Backend
   cd backend
   uvicorn main:app --reload
   ```

6. **Open your browser**
   ```
   http://localhost:3000
   ```

## 📖 User Guide

### Getting Started

1. **Upload a Document**

   - Drag and drop or click to upload PDF, TXT, or other text documents
   - Wait for text extraction to complete

2. **Generate a Quiz**

   - Click "Generate Quiz" to create AI-powered questions
   - Customize settings: question count, difficulty, focus area
   - Wait for all questions to be generated

3. **Take the Quiz**

   - Answer questions and receive immediate feedback
   - Review explanations for correct answers
   - Track your progress and performance

4. **Explore Guided Learning**
   - Try "Guided Learning" for step-by-step instruction
   - Follow structured learning paths
   - Practice with interactive questions

### Settings & Customization

#### Quiz Settings

- **Question Count**: 1-50 questions per quiz
- **Difficulty**: Easy, Medium, Hard, or Mixed
- **Question Type**: Multiple Choice, True/False, or Mixed
- **Focus Area**: Specify topics to emphasize

#### API Key Management

- **Custom API Keys**: Add your own Gemini API key for unlimited access
- **Server Keys**: Use built-in server keys (limited generations)
- **Secure Storage**: Keys stored locally and never shared

#### Export Options

- **JSON Export**: Complete quiz data with metadata
- **CSV Export**: Spreadsheet-friendly format
- **Automatic Naming**: Date-stamped file names

## 🏗️ Architecture

### Frontend (Next.js)

```
src/
├── components/          # React components
│   ├── FileUpload.tsx   # Document upload interface
│   ├── QuizInterface.tsx # Quiz display and interaction
│   ├── SettingsModal.tsx # Settings and preferences
│   └── GuidedLearning.tsx # Guided learning interface
├── hooks/              # Custom React hooks
│   ├── useQuizState.ts # Global state management
│   ├── useQuizNavigation.ts # Quiz navigation logic
│   └── useQuizGeneration.ts # Quiz generation utilities
├── pages/              # Next.js pages
│   └── index.tsx       # Main application page
├── types/              # TypeScript type definitions
└── contexts/           # React contexts
    └── ThemeContext.tsx # Theme management
```

### Backend (FastAPI)

```
backend/
├── main.py             # FastAPI application
├── requirements.txt    # Python dependencies
└── utils/              # Utility functions
    ├── text_extraction.py # Document text extraction
    └── ai_integration.py  # AI service integration
```

### Key Technologies

- **Frontend**: Next.js 15, React 18, TypeScript
- **Backend**: FastAPI, Python 3.8+
- **AI**: Google Gemini API (gemini-2.0-flash, gemini-1.5-pro, gemini-1.5-flash)
- **Styling**: Tailwind CSS, Lucide React icons
- **Deployment**: Railway (backend), Vercel/Netlify (frontend)

## 🔧 Configuration

### Environment Variables

#### Frontend (.env.local)

```env
NEXT_PUBLIC_BACKEND_URL=https://your-backend-url.railway.app
NEXT_PUBLIC_APP_NAME=SmartStudy
```

#### Backend (Railway Environment)

```env
GEMINI_API_KEY_1=your_gemini_api_key_1
GEMINI_API_KEY_2=your_gemini_api_key_2
GEMINI_API_KEY_3=your_gemini_api_key_3
GEMINI_API_KEY_4=your_gemini_api_key_4
GEMINI_API_KEY_5=your_gemini_api_key_5
```

### API Endpoints

#### Quiz Generation

```http
POST /generate-quiz
Content-Type: application/json

{
  "content": "document text content",
  "questionCount": 10,
  "difficulty": "medium",
  "questionType": "multiple_choice",
  "focusArea": "Software Engineering",
  "customApiKey": "optional_user_api_key"
}
```

#### Guided Learning

```http
POST /guided-learning
Content-Type: application/json

{
  "documentContent": "document text content",
  "step": "analyze",
  "customApiKey": "optional_user_api_key"
}
```

#### Text Extraction

```http
POST /extract-text
Content-Type: multipart/form-data

file: [uploaded document file]
```

## 🚀 Deployment

### Backend Deployment (Railway)

1. Connect your GitHub repository to Railway
2. Set environment variables in Railway dashboard
3. Deploy automatically on push to main branch

### Frontend Deployment (Vercel/Netlify)

1. Connect your GitHub repository
2. Configure build settings:
   - Build command: `npm run build`
   - Output directory: `out`
3. Deploy automatically on push to main branch

## 🧪 Testing

### Running Tests

```bash
# Frontend tests
npm test

# Backend tests
cd backend
python -m pytest

# E2E tests
npm run test:e2e
```

### Test Coverage

- Unit tests for components and hooks
- Integration tests for API endpoints
- E2E tests for user workflows

## 🤝 Contributing

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Commit your changes: `git commit -m 'Add amazing feature'`
5. Push to the branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

### Code Style

- Follow TypeScript best practices
- Use ESLint and Prettier for code formatting
- Write meaningful commit messages
- Add tests for new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Google Gemini AI for intelligent question generation
- Next.js team for the amazing React framework
- FastAPI team for the high-performance Python web framework
- Railway for seamless backend deployment
- All contributors and users of SmartStudy

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/Boowusu-2/Study55v2/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Boowusu-2/Study55v2/discussions)
- **Email**: [Your Email]

---

**Made with ❤️ for better learning experiences**
