#!/bin/bash

# study.ai Environment Setup Script

echo "🚀 Setting up study.ai environment variables..."
echo ""

# Check if .env.local already exists
if [ -f ".env.local" ]; then
    echo "⚠️  .env.local already exists. Do you want to overwrite it? (y/n)"
    read -r response
    if [[ "$response" != "y" && "$response" != "Y" ]]; then
        echo "Setup cancelled."
        exit 0
    fi
fi

echo "📝 Please enter your API keys:"
echo ""

# Get multiple Gemini API Keys
echo "🔑 Google Gemini API Keys (recommended: 2-5 keys for better reliability)"
echo "   You can add up to 5 API keys for automatic rotation and fallback"
echo ""

GEMINI_KEYS=()
for i in {1..5}; do
    if [ $i -eq 1 ]; then
        echo "🔑 Gemini API Key ${i} (required):"
    else
        echo "🔑 Gemini API Key ${i} (optional - press Enter to skip):"
    fi
    read -r key
    
    if [ $i -eq 1 ] && [ -z "$key" ]; then
        echo "❌ First Gemini API key is required!"
        exit 1
    fi
    
    if [ -n "$key" ]; then
        GEMINI_KEYS+=("$key")
    fi
done

# Get OpenAI API Key (optional)
echo ""
echo "🔑 OpenAI API Key (optional - press Enter to skip):"
read -r OPENAI_API_KEY

# Get Anthropic API Key (optional)
echo ""
echo "🔑 Anthropic API Key (optional - press Enter to skip):"
read -r ANTHROPIC_API_KEY

# Generate JWT Secret
JWT_SECRET=$(openssl rand -base64 32 2>/dev/null || echo "your-super-secret-jwt-key-change-this-in-production")

# Create .env.local file
cat > .env.local << EOF
# study.ai Environment Variables
# Generated on $(date)

# Google Gemini API Keys (multiple keys for better reliability)
EOF

# Add Gemini API keys
for i in "${!GEMINI_KEYS[@]}"; do
    echo "GEMINI_API_KEY_$((i+1))=${GEMINI_KEYS[$i]}" >> .env.local
done

# Add remaining environment variables
cat >> .env.local << EOF

# OpenAI API Key (optional - for fallback)
OPENAI_API_KEY=$OPENAI_API_KEY

# Anthropic API Key (optional - for fallback)
ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY

# Database URL (for future user management)
DATABASE_URL=

# JWT Secret (for future authentication)
JWT_SECRET=$JWT_SECRET

# Next.js Environment
NODE_ENV=development
EOF

echo ""
echo "✅ Environment file created successfully!"
echo "📁 File: .env.local"
echo "🔑 Gemini API Keys configured: ${#GEMINI_KEYS[@]}"
echo ""
echo "🔒 Security notes:"
echo "   - .env.local is already in .gitignore"
echo "   - Never commit this file to version control"
echo "   - Keep your API keys secure"
echo ""
echo "🚀 You can now start the application with: npm run dev"


