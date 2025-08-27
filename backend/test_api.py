#!/usr/bin/env python3
"""
Test script for the SmartStudy FastAPI backend
"""

import requests
import json
import tempfile
import os

# Test configuration
BASE_URL = "http://localhost:8000"

def test_health_endpoint():
    """Test the health check endpoint"""
    print("🔍 Testing health endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code == 200:
            print("✅ Health check passed")
            print(f"   Response: {response.json()}")
            return True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to the API. Is the server running?")
        return False

def test_root_endpoint():
    """Test the root endpoint"""
    print("\n🔍 Testing root endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/")
        if response.status_code == 200:
            print("✅ Root endpoint working")
            print(f"   Response: {response.json()}")
            return True
        else:
            print(f"❌ Root endpoint failed: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to the API")
        return False

def test_text_extraction():
    """Test text extraction with a sample text file"""
    print("\n🔍 Testing text extraction...")
    
    # Create a temporary text file
    with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False) as f:
        f.write("This is a test document for SmartStudy.\nIt contains multiple lines of text.\nThis should be extracted successfully.")
        temp_file_path = f.name
    
    try:
        with open(temp_file_path, 'rb') as f:
            files = {'files': ('test.txt', f, 'text/plain')}
            response = requests.post(f"{BASE_URL}/extract-text", files=files)
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Text extraction successful")
            print(f"   Extracted text length: {len(result.get('text', ''))} characters")
            print(f"   Preview: {result.get('text', '')[:100]}...")
            return True
        else:
            print(f"❌ Text extraction failed: {response.status_code}")
            print(f"   Error: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Text extraction error: {e}")
        return False
    finally:
        # Clean up temporary file
        try:
            os.unlink(temp_file_path)
        except:
            pass

def test_invalid_file():
    """Test with an invalid file type"""
    print("\n🔍 Testing invalid file type...")
    
    # Create a temporary file with invalid extension
    with tempfile.NamedTemporaryFile(suffix='.invalid', delete=False) as f:
        f.write(b"Invalid file content")
        temp_file_path = f.name
    
    try:
        with open(temp_file_path, 'rb') as f:
            files = {'files': ('test.invalid', f, 'application/octet-stream')}
            response = requests.post(f"{BASE_URL}/extract-text", files=files)
        
        if response.status_code == 400:
            print("✅ Invalid file type correctly rejected")
            print(f"   Error message: {response.json().get('detail', '')}")
            return True
        else:
            print(f"❌ Invalid file type not properly handled: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Invalid file test error: {e}")
        return False
    finally:
        # Clean up temporary file
        try:
            os.unlink(temp_file_path)
        except:
            pass

def main():
    """Run all tests"""
    print("🚀 SmartStudy FastAPI Backend Test Suite")
    print("=" * 50)
    
    tests = [
        test_health_endpoint,
        test_root_endpoint,
        test_text_extraction,
        test_invalid_file,
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        if test():
            passed += 1
    
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! The API is working correctly.")
    else:
        print("⚠️  Some tests failed. Please check the API configuration.")
    
    return passed == total

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
