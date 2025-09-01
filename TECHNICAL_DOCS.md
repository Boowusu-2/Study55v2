# SmartStudy Technical Documentation

## 🏗️ System Architecture

### Overview

SmartStudy follows a modern microservices architecture with a clear separation between frontend and backend services:

```
┌─────────────────┐    HTTP/HTTPS    ┌─────────────────┐
│   Frontend      │ ◄──────────────► │    Backend      │
│   (Next.js)     │                  │   (FastAPI)     │
│                 │                  │                 │
│ - React 18      │                  │ - Python 3.8+   │
│ - TypeScript    │                  │ - FastAPI       │
│ - Tailwind CSS  │                  │ - Google Gemini │
│ - Static Export │                  │ - Railway       │
└─────────────────┘                  └─────────────────┘
```

### Frontend Architecture

#### Component Structure

```
src/
├── components/
│   ├── FileUpload.tsx          # Document upload with drag & drop
│   ├── QuizInterface.tsx       # Quiz display and interaction
│   ├── SettingsModal.tsx       # Settings and preferences modal
│   ├── GuidedLearning.tsx      # Guided learning interface
│   ├── LoadingOverlay.tsx      # Loading states and progress
│   └── Header.tsx              # Navigation and branding
├── hooks/
│   ├── useQuizState.ts         # Global state management
│   ├── useQuizNavigation.ts    # Quiz navigation logic
│   ├── useQuizGeneration.ts    # Quiz generation utilities
│   └── useAuth.ts              # Authentication context
├── pages/
│   └── index.tsx               # Main application page
├── types/
│   └── index.ts                # TypeScript type definitions
└── contexts/
    └── ThemeContext.tsx        # Theme management
```

#### State Management

The application uses React's Context API with custom hooks for state management:

```typescript
interface SmartStudyState {
  uploadedFiles: File[];
  currentQuiz: { questions: QuizQuestion[] } | null;
  currentQuestionIndex: number;
  userAnswers: (number | null)[];
  isLoading: boolean;
  loadingMessage: string;
  selectedAnswer: number | null;
  showResult: boolean;
  quizSettings: QuizSettings;
  quizComplete: boolean;
  autoAdvancing: boolean;
  isGeneratingMore: boolean;
  targetQuestionCount: number;
  isCancelling: boolean;
  freeGenerationsLeft: number;
  isProUser: boolean;
  showPaymentModal: boolean;
  showApiLimitModal: boolean;
  apiLimitMessage: string;
  questionsReady: boolean;
  showSettingsModal: boolean;
  isOfflineMode: boolean;
  extractedText: string;
  isUploading: boolean;
  uploadProgress: number;
  customApiKey: string;
  useCustomApiKey: boolean;
}
```

### Backend Architecture

#### API Structure

```
backend/
├── main.py                     # FastAPI application entry point
├── requirements.txt            # Python dependencies
├── utils/
│   ├── text_extraction.py      # Document processing utilities
│   ├── ai_integration.py       # AI service integration
│   └── validation.py           # Input validation
└── tests/
    └── test_api.py             # API endpoint tests
```

#### API Endpoints

##### 1. Text Extraction (`POST /extract-text`)

```python
async def extract_text(file: UploadFile):
    """
    Extract text from uploaded documents
    Supports: PDF, TXT, DOCX, DOC, PPTX, PPT
    Returns: Extracted text content
    """
```

##### 2. Quiz Generation (`POST /generate-quiz`)

```python
async def generate_quiz(request: dict):
    """
    Generate AI-powered quiz questions
    Parameters:
    - content: Document text
    - questionCount: Number of questions
    - difficulty: easy/medium/hard/mixed
    - questionType: multiple_choice/true_false/mixed
    - focusArea: Optional topic focus
    - customApiKey: Optional user API key
    Returns: Quiz questions with options and explanations
    """
```

##### 3. Guided Learning (`POST /guided-learning`)

```python
async def guided_learning(request: dict):
    """
    Generate guided learning steps
    Parameters:
    - documentContent: Document text
    - step: Learning step type
    - customApiKey: Optional user API key
    Returns: Structured learning steps
    """
```

## 🔧 Core Technologies

### Frontend Stack

- **Next.js 15**: React framework with static export
- **React 18**: UI library with hooks and context
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library
- **Node.js**: JavaScript runtime

### Backend Stack

- **FastAPI**: High-performance Python web framework
- **Python 3.8+**: Programming language
- **Google Gemini API**: AI service for question generation
- **PyPDF2**: PDF text extraction
- **python-docx**: Word document processing
- **python-pptx**: PowerPoint processing

### AI Integration

```python
# AI Model Configuration
GEMINI_MODELS = [
    "gemini-2.0-flash",    # Fastest, good quality
    "gemini-1.5-pro",      # High quality, slower
    "gemini-1.5-flash"     # Balanced performance
]

# Retry Logic
MAX_RETRIES = 3
RETRY_DELAY = 1000  # milliseconds
```

## 🔄 Data Flow

### Quiz Generation Flow

```
1. User uploads document
   ↓
2. Text extraction (backend)
   ↓
3. User configures quiz settings
   ↓
4. Quiz generation request (frontend → backend)
   ↓
5. AI processing (Gemini API)
   ↓
6. Question deduplication
   ↓
7. Response formatting
   ↓
8. Quiz display (frontend)
```

### State Management Flow

```
User Action → Hook → Context → State Update → UI Re-render
```

## 🔒 Security & Privacy

### Data Protection

- **Local Storage**: API keys stored in browser localStorage
- **No Server Storage**: User data never stored on server
- **Secure Transmission**: HTTPS for all API calls
- **Input Validation**: Server-side validation of all inputs

### API Key Management

```typescript
// Frontend: Secure API key handling
const handleApiKeyUpdate = (key: string, useCustom: boolean) => {
  if (useCustom && key) {
    localStorage.setItem("customApiKey", key);
  } else {
    localStorage.removeItem("customApiKey");
  }
  updateState({ customApiKey: key, useCustomApiKey: useCustom });
};
```

## 🧪 Testing Strategy

### Frontend Testing

```typescript
// Component Testing
describe("QuizInterface", () => {
  it("should display questions correctly", () => {
    // Test implementation
  });

  it("should handle answer selection", () => {
    // Test implementation
  });
});

// Hook Testing
describe("useQuizState", () => {
  it("should manage quiz state correctly", () => {
    // Test implementation
  });
});
```

### Backend Testing

```python
# API Endpoint Testing
def test_generate_quiz():
    response = client.post("/generate-quiz", json={
        "content": "Test content",
        "questionCount": 5,
        "difficulty": "easy",
        "questionType": "multiple_choice"
    })
    assert response.status_code == 200
    assert "questions" in response.json()
```

### Integration Testing

```bash
# E2E Testing
npm run test:e2e

# API Testing
cd backend && python -m pytest
```

## 🚀 Performance Optimization

### Frontend Optimizations

- **Static Export**: Pre-built static files for fast loading
- **Code Splitting**: Lazy loading of components
- **Image Optimization**: Next.js image optimization
- **Bundle Analysis**: Webpack bundle analyzer

### Backend Optimizations

- **Async Processing**: Non-blocking API calls
- **Connection Pooling**: Database connection management
- **Caching**: Redis caching for frequent requests
- **Load Balancing**: Multiple API key rotation

### AI Optimization

```python
# Batch Processing
BATCH_SIZE = 5  # Questions per batch
MAX_CONCURRENT_REQUESTS = 3

# Rate Limiting
RATE_LIMIT_PER_MINUTE = 60
RATE_LIMIT_PER_HOUR = 1000
```

## 🔧 Configuration Management

### Environment Variables

```bash
# Frontend (.env.local)
NEXT_PUBLIC_BACKEND_URL=https://api.smartstudy.com
NEXT_PUBLIC_APP_NAME=SmartStudy
NEXT_PUBLIC_VERSION=1.0.0

# Backend (Railway)
GEMINI_API_KEY_1=your_key_1
GEMINI_API_KEY_2=your_key_2
GEMINI_API_KEY_3=your_key_3
GEMINI_API_KEY_4=your_key_4
GEMINI_API_KEY_5=your_key_5
CORS_ORIGINS=https://smartstudy.com
LOG_LEVEL=INFO
```

### Feature Flags

```typescript
// Feature flag configuration
const FEATURE_FLAGS = {
  CUSTOM_API_KEYS: true,
  EXPORT_FUNCTIONALITY: true,
  GUIDED_LEARNING: true,
  THEME_CUSTOMIZATION: true,
  PRO_FEATURES: false,
};
```

## 📊 Monitoring & Analytics

### Error Tracking

```typescript
// Frontend error tracking
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  // Send to error tracking service
});

// Backend error tracking
import logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
```

### Performance Monitoring

```typescript
// Performance metrics
const measureQuizGeneration = async () => {
  const start = performance.now();
  await generateQuiz();
  const duration = performance.now() - start;
  console.log(`Quiz generation took ${duration}ms`);
};
```

## 🔄 Deployment Pipeline

### CI/CD Configuration

```yaml
# GitHub Actions
name: Deploy SmartStudy
on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run tests
        run: npm test

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Railway
        run: railway up

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Vercel
        run: vercel --prod
```

### Deployment Checklist

- [ ] All tests passing
- [ ] Environment variables configured
- [ ] API keys rotated and updated
- [ ] Database migrations (if applicable)
- [ ] SSL certificates valid
- [ ] Monitoring alerts configured
- [ ] Backup procedures tested

## 🛠️ Development Guidelines

### Code Style

```typescript
// TypeScript best practices
interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

// React best practices
const QuizInterface: React.FC<QuizInterfaceProps> = ({ questions }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleAnswer = useCallback((answer: number) => {
    // Implementation
  }, []);

  return <div className="quiz-interface">{/* Component JSX */}</div>;
};
```

### Git Workflow

```bash
# Feature development
git checkout -b feature/new-feature
git add .
git commit -m "feat: add new feature"
git push origin feature/new-feature

# Create pull request
# Code review
# Merge to main
```

### Documentation Standards

- **Code Comments**: Explain complex logic
- **API Documentation**: OpenAPI/Swagger specs
- **Component Documentation**: Storybook stories
- **Architecture Decisions**: ADR (Architecture Decision Records)

## 🔮 Future Technical Considerations

### Scalability

- **Microservices**: Split into smaller services
- **Database**: Add persistent storage
- **Caching**: Implement Redis caching
- **CDN**: Global content delivery

### Security Enhancements

- **Authentication**: JWT-based auth system
- **Authorization**: Role-based access control
- **Rate Limiting**: API rate limiting
- **Audit Logging**: Security event logging

### Performance Improvements

- **Server-Side Rendering**: SSR for better SEO
- **Progressive Web App**: PWA capabilities
- **Offline Support**: Service worker caching
- **Real-time Updates**: WebSocket integration

---

_This technical documentation is maintained by the SmartStudy development team._

