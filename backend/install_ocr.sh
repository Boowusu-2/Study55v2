#!/bin/bash

echo "Installing OCR dependencies for study.ai..."

# Update package list
echo "Updating package list..."
sudo apt-get update

# Install system dependencies for OCR
echo "Installing system dependencies..."
sudo apt-get install -y \
    tesseract-ocr \
    tesseract-ocr-eng \
    libtesseract-dev \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1

# Install Python OCR dependencies
echo "Installing Python OCR packages..."
pip install easyocr==1.7.0
pip install pytesseract==0.3.10
pip install Pillow==10.0.1

# Optional: Install Google Cloud Vision (uncomment if using Google Cloud)
# echo "Installing Google Cloud Vision..."
# pip install google-cloud-vision==3.4.4

echo "OCR dependencies installed successfully!"
echo ""
echo "Note:"
echo "- EasyOCR will download models on first use (may take a few minutes)"
echo "- Tesseract OCR is now available for text extraction from images"
echo "- For Google Cloud Vision, set up authentication and uncomment in requirements.txt"
echo ""
echo "You can now upload images and extract text using OCR!"
