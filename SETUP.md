# study.ai Setup Guide

## Demo/Freemium Model Implementation

This application has been configured for a demo/freemium business model where:

1. **Free Demo**: Users can generate one quiz for free
2. **Premium Upgrade**: After the demo, users must pay to continue using the service
3. **Backend API Keys**: All AI provider API keys are managed securely on the backend

## Environment Variables

### Option 1: Use the Setup Script (Recommended)

Run the interactive setup script:

```bash
./setup-env.sh
```

This will prompt you for your API keys and create the `.env.local` file automatically.

### Option 2: Manual Setup

Create a `.env.local` file in the root directory with your API keys:

```env
# Google Gemini API Keys (required) - Multiple keys for better reliability
# You can add up to 5 Gemini API keys for automatic rotation and fallback
GEMINI_API_KEY_1=your_gemini_api_key_1_here
GEMINI_API_KEY_2=your_gemini_api_key_2_here
GEMINI_API_KEY_3=your_gemini_api_key_3_here
GEMINI_API_KEY_4=your_gemini_api_key_4_here
GEMINI_API_KEY_5=your_gemini_api_key_5_here

# OpenAI API Key (optional - for fallback)
OPENAI_API_KEY=your_openai_api_key_here

# Anthropic API Key (optional - for fallback)
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# JWT Secret (auto-generated)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Next.js Environment
NODE_ENV=development
```

## Features Implemented

### ✅ **Demo System**

- Users get one free quiz generation
- Demo status is tracked in the frontend state
- Payment modal appears after demo is used

### ✅ **Backend API Security**

- API keys are stored securely on the backend
- Frontend never sees or handles API keys
- Multiple Gemini API keys with automatic rotation and fallback
- Multiple AI providers for reliability

### ✅ **Payment Integration Ready**

- Payment modal with premium features list
- Placeholder for payment gateway integration
- Upgrade flow ready for implementation

### ✅ **Enhanced UI/UX**

- Clean demo information section
- Progress tracking for question generation
- Better error handling and user feedback

## Next Steps for Production

1. **Database Integration**: Add user management and demo tracking
2. **Payment Gateway**: Integrate Stripe, PayPal, or similar
3. **User Authentication**: Add login/signup system
4. **Usage Analytics**: Track usage patterns and conversions
5. **Rate Limiting**: Add API rate limiting for abuse prevention

## Running the Application

```bash
# Install dependencies
npm install

# Set up environment variables (choose one method)
./setup-env.sh                    # Interactive setup
# OR manually create .env.local    # Manual setup

# Test environment configuration
node test-env.js

# Run development server
npm run dev

# Build for production
npm run build
npm start
```

## API Endpoints

- `POST /api/generate-quiz`: Generate quiz with backend API keys
- `POST /api/extract-text`: Extract text from uploaded documents

## Business Model

- **Free Tier**: 1 quiz generation per user
- **Premium Tier**: Unlimited quiz generation (payment required)
- **Revenue**: Subscription or pay-per-use model
