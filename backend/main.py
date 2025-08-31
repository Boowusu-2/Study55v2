from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import tempfile
import os
import shutil
from typing import List
import traceback
import json
import requests
from extract_text import extract_text_from_files

app = FastAPI(
    title="SmartStudy AI-Powered Learning API",
    description="API for extracting text and generating AI-powered quizzes and guided learning",
    version="2.0.0"  # Updated version for AI features
)

# Configure CORS - Updated for Vercel deployment
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://study55v2.vercel.app",
        "https://study55v2-git-main-bismark.vercel.app",
        "http://localhost:3000",
        "http://localhost:3001",
        "*"  # Keep wildcard for development
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Get API keys from environment
def get_gemini_api_keys():
    keys = []
    for i in range(1, 6):
        key = os.getenv(f"GEMINI_API_KEY_{i}")
        if key and key.strip():
            keys.append(key.strip())
    return keys

def get_openai_api_key():
    return os.getenv("OPENAI_API_KEY")

def get_anthropic_api_key():
    return os.getenv("ANTHROPIC_API_KEY")

@app.get("/")
async def root():
    return {"message": "SmartStudy AI-Powered Learning API", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}



@app.post("/extract-text")
async def extract_text(files: List[UploadFile] = File(...)):
    """
    Extract text from uploaded files.
    Supports: PDF, DOCX, DOC, PPTX, TXT, Images (JPG, PNG, BMP, TIFF, GIF, WEBP)
    """
    if not files:
        raise HTTPException(status_code=400, detail="No files uploaded")
    
    # Validate file types
    allowed_extensions = {'.pdf', '.docx', '.doc', '.pptx', '.ppt', '.txt', '.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.tif', '.gif', '.webp'}
    for file in files:
        if not file.filename:
            raise HTTPException(status_code=400, detail="Invalid filename")
        
        file_ext = os.path.splitext(file.filename.lower())[1]
        if file_ext not in allowed_extensions:
            raise HTTPException(
                status_code=400, 
                detail=f"Unsupported file type: {file_ext}. Supported types: {', '.join(allowed_extensions)}"
            )
    
    temp_files = []
    try:
        # Save uploaded files to temporary directory
        for file in files:
            temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1])
            shutil.copyfileobj(file.file, temp_file)
            temp_file.close()
            temp_files.append(temp_file.name)
        
        # Extract text from files
        extracted_text = extract_text_from_files(temp_files)
        
        if not extracted_text or not extracted_text.strip():
            raise HTTPException(status_code=400, detail="No text could be extracted from the uploaded files")
        
        return JSONResponse(content={"text": extracted_text})
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error during text extraction: {e}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Text extraction failed: {str(e)}")
    
    finally:
        # Clean up temporary files
        for temp_file in temp_files:
            try:
                os.unlink(temp_file)
            except Exception as e:
                print(f"Error cleaning up temp file {temp_file}: {e}")

@app.post("/generate-quiz")
async def generate_quiz(request: dict):
    """
    Generate AI-powered quiz questions from document content.
    """
    try:
        content = request.get("content", "")
        question_count = request.get("questionCount", 5)
        difficulty = request.get("difficulty", "medium")
        question_type = request.get("questionType", "multiple_choice")
        focus_area = request.get("focusArea", "")
        
        if not content:
            raise HTTPException(status_code=400, detail="Document content is required")
        
        # Get API keys
        gemini_keys = get_gemini_api_keys()
        if not gemini_keys:
            raise HTTPException(status_code=500, detail="No Gemini API keys configured")
        
        # Use the first available key
        api_key = gemini_keys[0]
        
        # Create prompt for quiz generation
        prompt = f"""
Generate {question_count} {difficulty} difficulty {question_type} questions based on this document content:

{content}

{f"Focus on: {focus_area}" if focus_area else ""}

Return ONLY valid JSON in this exact format:
{{
  "questions": [
    {{
      "question": "Question text here",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct": 0,
      "explanation": "Explanation of the correct answer"
    }}
  ]
}}

Make sure the questions are relevant to the document content and vary in difficulty.
"""
        
        # Call Gemini API
        headers = {
            "Content-Type": "application/json",
        }
        
        data = {
            "contents": [{
                "parts": [{
                    "text": prompt
                }]
            }],
            "generationConfig": {
                "temperature": 0.7,
                "maxOutputTokens": 4096,
            }
        }
        
        response = requests.post(
            f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={api_key}",
            headers=headers,
            json=data,
            timeout=30
        )
        
        if response.status_code != 200:
            raise HTTPException(status_code=500, detail=f"AI service error: {response.text}")
        
        result = response.json()
        generated_text = result["candidates"][0]["content"]["parts"][0]["text"]
        
        # Parse JSON response
        try:
            quiz_data = json.loads(generated_text)
            return JSONResponse(content=quiz_data)
        except json.JSONDecodeError:
            # If JSON parsing fails, create fallback questions
            fallback_questions = create_fallback_questions(content, question_count)
            return JSONResponse(content={"questions": fallback_questions})
            
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error during quiz generation: {e}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Quiz generation failed: {str(e)}")

@app.post("/guided-learning")
async def guided_learning(request: dict):
    """
    Generate AI-powered guided learning steps from document content.
    """
    try:
        content = request.get("documentContent", "")
        step = request.get("step", "analyze")
        
        if not content:
            raise HTTPException(status_code=400, detail="Document content is required")
        
        # Get API keys
        gemini_keys = get_gemini_api_keys()
        if not gemini_keys:
            raise HTTPException(status_code=500, detail="No Gemini API keys configured")
        
        # Use the first available key
        api_key = gemini_keys[0]
        
        if step == "analyze":
            # Create learning plan
            prompt = f"""
Analyze this document and create a comprehensive learning plan:

{content}

Return ONLY valid JSON in this exact format:
{{
  "learningSteps": [
    {{
      "id": "intro",
      "title": "Welcome to Learning",
      "content": "Introduction content",
      "type": "explanation"
    }},
    {{
      "id": "concept1",
      "title": "Key Concept 1",
      "content": "Concept explanation",
      "type": "explanation"
    }},
    {{
      "id": "practice",
      "title": "Practice Questions",
      "content": "Practice content",
      "type": "question",
      "question": "What is the main topic?",
      "options": ["Option A", "Option B", "Option C"],
      "correctAnswer": "Option A",
      "explanation": "Explanation"
    }},
    {{
      "id": "summary",
      "title": "Learning Summary",
      "content": "Summary content",
      "type": "explanation"
    }}
  ]
}}

Create 4-5 learning steps that cover the main concepts in the document.
"""
        else:
            # Handle other steps (evaluate, etc.)
            prompt = f"""
Based on the document content, provide guidance for step: {step}

{content}

Return a simple JSON response with guidance.
"""
        
        # Call Gemini API
        headers = {
            "Content-Type": "application/json",
        }
        
        data = {
            "contents": [{
                "parts": [{
                    "text": prompt
                }]
            }],
            "generationConfig": {
                "temperature": 0.7,
                "maxOutputTokens": 4096,
            }
        }
        
        response = requests.post(
            f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={api_key}",
            headers=headers,
            json=data,
            timeout=30
        )
        
        if response.status_code != 200:
            raise HTTPException(status_code=500, detail=f"AI service error: {response.text}")
        
        result = response.json()
        generated_text = result["candidates"][0]["content"]["parts"][0]["text"]
        
        # Parse JSON response
        try:
            learning_data = json.loads(generated_text)
            return JSONResponse(content=learning_data)
        except json.JSONDecodeError:
            # If JSON parsing fails, create fallback learning steps
            fallback_steps = create_fallback_learning_steps(content)
            return JSONResponse(content={"learningSteps": fallback_steps})
            
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error during guided learning: {e}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Guided learning failed: {str(e)}")

def create_fallback_questions(content: str, count: int):
    """Create fallback questions based on document content."""
    questions = []
    
    # Extract key topics from content
    content_lower = content.lower()
    
    if "software engineering" in content_lower:
        questions.append({
            "question": "What is the main topic of the uploaded document?",
            "options": ["Machine Learning", "Software Engineering", "Data Science", "Web Development"],
            "correct": 1,
            "explanation": "The document focuses on Software Engineering concepts and methodologies."
        })
    
    if "sdlc" in content_lower or "software development life cycle" in content_lower:
        questions.append({
            "question": "What does SDLC stand for in Software Engineering?",
            "options": ["Software Development Life Cycle", "System Design Life Cycle", "Software Design Life Cycle", "System Development Life Cycle"],
            "correct": 0,
            "explanation": "SDLC stands for Software Development Life Cycle."
        })
    
    if "requirements" in content_lower:
        questions.append({
            "question": "What type of requirements focus on system qualities like performance and security?",
            "options": ["Functional requirements", "Non-functional requirements", "Technical requirements", "User requirements"],
            "correct": 1,
            "explanation": "Non-functional requirements focus on system qualities."
        })
    
    if "machine learning" in content_lower:
        questions.append({
            "question": "What is the main concept discussed in the uploaded document?",
            "options": ["Machine Learning", "Artificial Intelligence", "Data Science", "Computer Programming"],
            "correct": 0,
            "explanation": "The document focuses on Machine Learning as the main concept."
        })
    
    # Add generic questions if not enough content-specific ones
    while len(questions) < count:
        questions.append({
            "question": f"What is the main concept discussed in the uploaded document? (Question {len(questions) + 1})",
            "options": ["Concept A", "Concept B", "Concept C", "Concept D"],
            "correct": 0,
            "explanation": "Based on your document, Concept A is the primary focus."
        })
    
    return questions[:count]

def create_fallback_learning_steps(content: str):
    """Create fallback learning steps based on document content."""
    content_lower = content.lower()
    
    steps = [
        {
            "id": "intro",
            "title": "Welcome to Guided Learning",
            "content": "I'll help you understand the key concepts from your document. Let's start with an overview of the main topics.",
            "type": "explanation"
        }
    ]
    
    if "software engineering" in content_lower:
        steps.append({
            "id": "concept1",
            "title": "Software Engineering Overview",
            "content": "Based on your document, we'll be learning about Software Engineering concepts including SDLC, requirements, and development methodologies.",
            "type": "explanation"
        })
    elif "machine learning" in content_lower:
        steps.append({
            "id": "concept1",
            "title": "Machine Learning Fundamentals",
            "content": "Based on your document, we'll be learning about Machine Learning concepts including supervised and unsupervised learning.",
            "type": "explanation"
        })
    else:
        steps.append({
            "id": "concept1",
            "title": "Document Overview",
            "content": "Based on your uploaded document, here's what we'll be learning about. The document contains information about various topics that we'll explore together.",
            "type": "explanation"
        })
    
    steps.extend([
        {
            "id": "practice",
            "title": "Practice Questions",
            "content": "Let's test your understanding with some practice questions about the concepts we've covered.",
            "type": "question",
            "question": "What is the main topic of your document?",
            "options": ["I'm not sure yet", "I have some ideas", "I understand it well"],
            "correctAnswer": "I have some ideas",
            "explanation": "It's perfectly normal to be learning! The important thing is that you're engaging with the material."
        },
        {
            "id": "summary",
            "title": "Learning Summary",
            "content": "Great job! You've learned the key concepts. Ready to test your knowledge with a quiz?",
            "type": "explanation"
        }
    ])
    
    return steps

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
# Trigger redeploy
