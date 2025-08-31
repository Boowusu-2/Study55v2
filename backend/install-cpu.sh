#!/bin/bash

echo "🚀 Installing SmartStudy Backend (CPU-only version)"
echo "=================================================="

# Check if we're in a virtual environment
if [[ "$VIRTUAL_ENV" == "" ]]; then
    echo "⚠️  Warning: You're not in a virtual environment."
    echo "   Consider creating one: python3 -m venv venv && source venv/bin/activate"
    echo ""
fi

echo "📦 Step 1: Installing web framework and document processing..."
pip install fastapi==0.104.1 uvicorn[standard]==0.24.0 python-multipart==0.0.6

echo "📄 Step 2: Installing document processing libraries..."
pip install PyPDF2==3.0.1 python-docx==1.1.0 docx2txt==0.8 python-pptx==0.6.23

echo "🖼️  Step 3: Installing image processing libraries..."
pip install pytesseract==0.3.10 Pillow==10.0.1

echo "🧠 Step 4: Installing PyTorch CPU version..."
pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu

echo "🔤 Step 5: Installing EasyOCR..."
pip install easyocr==1.7.0

echo ""
echo "✅ Installation complete!"
echo "🎯 Your backend is now ready for CPU-only OCR processing."
echo ""
echo "To start the backend server:"
echo "   cd backend && python main.py"
echo ""
echo "Or use uvicorn directly:"
echo "   cd backend && uvicorn main:app --reload --host 0.0.0.0 --port 8000"
