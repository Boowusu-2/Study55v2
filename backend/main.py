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
        custom_api_key = request.get("customApiKey", "")
        
        if not content:
            raise HTTPException(status_code=400, detail="Document content is required")
        
        # Use custom API key if provided, otherwise use server keys
        if custom_api_key:
            api_key = custom_api_key
            print(f"Using custom API key: {custom_api_key[:10]}...")
        else:
            # Get API keys from server
            gemini_keys = get_gemini_api_keys()
            if not gemini_keys:
                raise HTTPException(status_code=500, detail="No Gemini API keys configured")
            api_key = gemini_keys[0]
        
        # Create prompt for quiz generation
        prompt = f"""
You are an expert quiz generator. Create {question_count} {difficulty} difficulty {question_type} questions based on the following document content.

DOCUMENT CONTENT:
{content}

{f"FOCUS AREA: {focus_area}" if focus_area else ""}

INSTRUCTIONS:
1. Generate questions that are SPECIFIC to the document content provided
2. Use details, concepts, and examples mentioned in the document
3. Make questions challenging but appropriate for {difficulty} difficulty
4. Ensure all options are plausible but only one is correct
5. Provide clear explanations for the correct answer
6. CRITICAL: Make all answer options similar in length and detail level
7. Do NOT make the correct answer longer or more detailed than other options
8. Each option should be concise and equally plausible at first glance
9. Vary the position of correct answers (don't always put them in the same position)

CRITICAL: You must return ONLY valid JSON. No markdown, no code blocks, no additional text.

REQUIRED JSON FORMAT:
{{
  "questions": [
    {{
      "question": "Specific question about the document content",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct": 0,
      "explanation": "Detailed explanation of why this answer is correct, referencing the document content"
    }}
  ]
}}

IMPORTANT RULES FOR ANSWER OPTIONS:
- All options must be similar in length (within 20% of each other)
- All options must be equally plausible and well-written
- The correct answer should NOT be longer or more detailed
- Each option should be 1-2 sentences maximum
- Avoid making any option obviously correct through length or detail

Remember: Base your questions on the ACTUAL content provided above, not generic knowledge.
"""
        
        # Call Gemini API with multiple retries and different models
        gemini_models = [
            "gemini-2.0-flash",
            "gemini-1.5-pro",
            "gemini-1.5-flash"
        ]
        
        ai_success = False
        generated_text = ""
        
        for model in gemini_models:
            try:
                print(f"Trying Gemini model: {model}")
                
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
                        "temperature": 0.3,  # Lower temperature for more consistent JSON
                        "maxOutputTokens": 4096,
                    }
                }
                
                response = requests.post(
                    f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}",
                    headers=headers,
                    json=data,
                    timeout=30
                )
                
                if response.status_code == 200:
                    result = response.json()
                    generated_text = result["candidates"][0]["content"]["parts"][0]["text"]
                    print(f"AI Response from {model}: {generated_text[:200]}...")
                    
                    # Try to parse JSON (handle markdown code blocks)
                    try:
                        # Extract JSON from markdown code blocks if present
                        cleaned_text = generated_text
                        if "```json" in generated_text:
                            start = generated_text.find("```json") + 7
                            end = generated_text.find("```", start)
                            if end != -1:
                                cleaned_text = generated_text[start:end].strip()
                        elif "```" in generated_text:
                            start = generated_text.find("```") + 3
                            end = generated_text.find("```", start)
                            if end != -1:
                                cleaned_text = generated_text[start:end].strip()
                        
                        quiz_data = json.loads(cleaned_text)
                        if quiz_data.get("questions") and len(quiz_data["questions"]) > 0:
                            # Post-process questions to ensure balanced answer options
                            quiz_data = post_process_quiz_data(quiz_data)
                            print(f"Successfully parsed AI response from {model}: {len(quiz_data.get('questions', []))} questions")
                            ai_success = True
                            break
                        else:
                            print(f"AI response from {model} has no questions")
                    except json.JSONDecodeError as e:
                        print(f"JSON parsing failed for {model}: {e}")
                        print(f"Raw AI response from {model}: {generated_text}")
                        print(f"Cleaned text: {cleaned_text}")
                else:
                    print(f"AI service error for {model}: {response.status_code} - {response.text}")
                    
            except Exception as e:
                print(f"Error with {model}: {e}")
                continue
        
        if ai_success:
            return JSONResponse(content=quiz_data)
        else:
            print("All AI models failed, using fallback questions")
            # If all AI attempts fail, create fallback questions
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
        custom_api_key = request.get("customApiKey", "")
        
        if not content:
            raise HTTPException(status_code=400, detail="Document content is required")
        
        # Use custom API key if provided, otherwise use server keys
        if custom_api_key:
            api_key = custom_api_key
            print(f"Using custom API key for guided learning: {custom_api_key[:10]}...")
        else:
            # Get API keys from server
            gemini_keys = get_gemini_api_keys()
            if not gemini_keys:
                raise HTTPException(status_code=500, detail="No Gemini API keys configured")
            api_key = gemini_keys[0]
        
        if step == "analyze":
            # Create learning plan
            prompt = f"""
You are an expert educational tutor. Analyze the following document and create a comprehensive learning plan that helps students understand the key concepts.

DOCUMENT CONTENT:
{content}

INSTRUCTIONS:
1. Create 4-5 learning steps that progressively build understanding
2. Each step should focus on specific concepts from the document
3. Include a mix of explanations, examples, and practice questions
4. Make the content engaging and educational
5. Base everything on the ACTUAL document content provided

CRITICAL: You must return ONLY valid JSON. No markdown, no code blocks, no additional text.

REQUIRED JSON FORMAT:
{{
  "learningSteps": [
    {{
      "id": "intro",
      "title": "Introduction to [Main Topic]",
      "content": "Detailed introduction based on the document content",
      "type": "explanation"
    }},
    {{
      "id": "concept1",
      "title": "[Specific Concept from Document]",
      "content": "Detailed explanation of this concept as mentioned in the document",
      "type": "explanation"
    }},
    {{
      "id": "concept2",
      "title": "[Another Key Concept from Document]",
      "content": "Detailed explanation of this concept as mentioned in the document",
      "type": "explanation"
    }},
    {{
      "id": "practice",
      "title": "Practice Questions",
      "content": "Let's test your understanding of the concepts we've covered",
      "type": "question",
      "question": "Specific question about the document content",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Correct option",
      "explanation": "Detailed explanation referencing the document content"
    }},
    {{
      "id": "summary",
      "title": "Learning Summary",
      "content": "Comprehensive summary of the key points from the document",
      "type": "explanation"
    }}
  ]
}}

Remember: Base your learning plan on the ACTUAL content provided above, not generic knowledge.
"""
        else:
            # Handle other steps (evaluate, etc.)
            prompt = f"""
Based on the document content, provide guidance for step: {step}

{content}

Return a simple JSON response with guidance.
"""
        
        # Call Gemini API with multiple retries and different models
        gemini_models = [
            "gemini-2.0-flash",
            "gemini-1.5-pro",
            "gemini-1.5-flash"
        ]
        
        ai_success = False
        generated_text = ""
        
        for model in gemini_models:
            try:
                print(f"Trying Gemini model for learning: {model}")
                
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
                        "temperature": 0.3,  # Lower temperature for more consistent JSON
                        "maxOutputTokens": 4096,
                    }
                }
                
                response = requests.post(
                    f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}",
                    headers=headers,
                    json=data,
                    timeout=30
                )
                
                if response.status_code == 200:
                    result = response.json()
                    generated_text = result["candidates"][0]["content"]["parts"][0]["text"]
                    print(f"AI Learning Response from {model}: {generated_text[:200]}...")
                    
                    # Try to parse JSON (handle markdown code blocks)
                    try:
                        # Extract JSON from markdown code blocks if present
                        cleaned_text = generated_text
                        if "```json" in generated_text:
                            start = generated_text.find("```json") + 7
                            end = generated_text.find("```", start)
                            if end != -1:
                                cleaned_text = generated_text[start:end].strip()
                        elif "```" in generated_text:
                            start = generated_text.find("```") + 3
                            end = generated_text.find("```", start)
                            if end != -1:
                                cleaned_text = generated_text[start:end].strip()
                        
                        learning_data = json.loads(cleaned_text)
                        if learning_data.get("learningSteps") and len(learning_data["learningSteps"]) > 0:
                            print(f"Successfully parsed AI learning response from {model}: {len(learning_data.get('learningSteps', []))} steps")
                            ai_success = True
                            break
                        else:
                            print(f"AI learning response from {model} has no learning steps")
                    except json.JSONDecodeError as e:
                        print(f"Learning JSON parsing failed for {model}: {e}")
                        print(f"Raw AI learning response from {model}: {generated_text}")
                        print(f"Cleaned text: {cleaned_text}")
                else:
                    print(f"AI service error for learning {model}: {response.status_code} - {response.text}")
                    
            except Exception as e:
                print(f"Error with learning {model}: {e}")
                continue
        
        if ai_success:
            return JSONResponse(content=learning_data)
        else:
            print("All AI models failed for learning, using fallback steps")
            # If all AI attempts fail, create fallback learning steps
            fallback_steps = create_fallback_learning_steps(content)
            return JSONResponse(content={"learningSteps": fallback_steps})
            
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error during guided learning: {e}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Guided learning failed: {str(e)}")

@app.post("/learning-assistant")
async def learning_assistant(request: dict):
    """
    Provide general learning assistance and answer questions about any subject.
    """
    try:
        message = request.get("message", "")
        conversation_history = request.get("conversationHistory", [])
        current_topic = request.get("currentTopic", "")
        custom_api_key = request.get("customApiKey", "")
        
        if not message:
            raise HTTPException(status_code=400, detail="Message is required")
        
        # Use custom API key if provided, otherwise use server keys
        if custom_api_key:
            api_key = custom_api_key
            print(f"Using custom API key for learning assistant: {custom_api_key[:10]}...")
        else:
            # Get API keys from server
            gemini_keys = get_gemini_api_keys()
            if not gemini_keys:
                raise HTTPException(status_code=500, detail="No Gemini API keys configured")
            api_key = gemini_keys[0]
        
        # Create context-aware prompt
        context = ""
        if current_topic:
            context = f"Context: The user is currently studying or interested in: {current_topic}\n\n"
        
        # Build conversation history context
        history_context = ""
        if conversation_history and len(conversation_history) > 0:
            recent_messages = conversation_history[-5:]  # Last 5 messages for context
            history_context = "Recent conversation context:\n"
            for msg in recent_messages:
                role = "User" if msg.get("role") == "user" else "Assistant"
                history_context += f"{role}: {msg.get('content', '')}\n"
            history_context += "\n"
        
        prompt = f"""
You are an expert AI Learning Assistant, a patient and knowledgeable tutor who can explain any concept in simple, engaging terms. Your goal is to help students learn and understand any subject, regardless of complexity.

{context}
{history_context}
User's current question: {message}

INSTRUCTIONS:
1. Provide a clear, comprehensive answer that addresses the user's question
2. Use simple language that a 10-year-old could understand
3. Include relevant examples, analogies, and real-world applications
4. If the question relates to the current topic, make connections to that context
5. Be encouraging and supportive - learning is a journey
6. If appropriate, suggest related concepts or next steps for learning
7. Keep responses conversational and engaging
8. If the question is about learning techniques, provide practical, actionable advice
9. NEVER truncate content with ellipses - provide complete, comprehensive answers

RESPONSE FORMAT:
Provide a helpful, educational response that directly answers the user's question. Use clear language, examples, and encouragement. If relevant, suggest related topics or learning strategies.

Remember: You're a patient tutor who wants to help the user succeed. Make learning accessible and enjoyable! Provide complete, comprehensive answers without any truncation.
"""
        
        # Call Gemini API with multiple retries and different models
        gemini_models = [
            "gemini-2.0-flash",
            "gemini-1.5-pro",
            "gemini-1.5-flash"
        ]
        
        ai_success = False
        generated_text = ""
        
        for model in gemini_models:
            try:
                print(f"Trying Gemini model for learning assistant: {model}")
                
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
                        "temperature": 0.7,  # Slightly higher for more creative responses
                        "maxOutputTokens": 8192,  # Increased to prevent truncation
                    }
                }
                
                response = requests.post(
                    f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}",
                    headers=headers,
                    json=data,
                    timeout=30
                )
                
                if response.status_code == 200:
                    response_data = response.json()
                    if "candidates" in response_data and len(response_data["candidates"]) > 0:
                        candidate = response_data["candidates"][0]
                        if "content" in candidate and "parts" in candidate["content"]:
                            parts = candidate["content"]["parts"]
                            if len(parts) > 0 and "text" in parts[0]:
                                generated_text = parts[0]["text"].strip()
                                ai_success = True
                                print(f"Success with {model}")
                                break
                
                if not ai_success:
                    print(f"AI service error for {model}: {response.status_code} - {response.text}")
                    
            except Exception as e:
                print(f"Error with {model}: {e}")
                continue
        
        if ai_success:
            # Extract related concepts from the response
            related_concepts = []
            try:
                # Simple keyword extraction for related concepts
                common_learning_terms = [
                    "memory", "focus", "study", "learn", "understand", "practice",
                    "technique", "method", "strategy", "approach", "concept", "topic",
                    "subject", "skill", "knowledge", "education", "training"
                ]
                
                response_lower = generated_text.lower()
                for term in common_learning_terms:
                    if term in response_lower:
                        related_concepts.append(term.title())
                
                # Limit to 3-5 related concepts
                related_concepts = list(set(related_concepts))[:5]
            except:
                related_concepts = []
            
            return JSONResponse(content={
                "response": generated_text,
                "relatedConcepts": related_concepts
            })
        else:
            print("All AI models failed, using fallback response")
            # Generate fallback response
            fallback_response = generate_fallback_learning_response(message, current_topic)
            return JSONResponse(content={
                "response": fallback_response,
                "relatedConcepts": ["Learning", "Study", "Education"]
            })
            
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error during learning assistant: {e}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Learning assistant failed: {str(e)}")

def generate_fallback_learning_response(message: str, current_topic: str = "") -> str:
    """Generate a fallback response when AI fails."""
    message_lower = message.lower()
    
    if "study" in message_lower or "learn" in message_lower:
        return "Great question! Effective studying involves active engagement with the material. Try techniques like spaced repetition, practice testing, and explaining concepts to others. What specific subject are you trying to learn?"
    
    if "memory" in message_lower or "remember" in message_lower:
        return "Memory techniques can significantly improve learning! Some effective methods include: creating associations, using mnemonic devices, practicing retrieval, and connecting new information to what you already know. Which technique would you like to explore?"
    
    if "focus" in message_lower or "concentration" in message_lower:
        return "Maintaining focus is crucial for effective learning. Try techniques like the Pomodoro method (25-minute focused sessions), eliminating distractions, and taking regular breaks. What's your current study environment like?"
    
    if "difficult" in message_lower or "hard" in message_lower:
        return "Learning difficult concepts takes time and patience. Break them down into smaller parts, use analogies and examples, and don't be afraid to ask questions. What specific concept are you finding challenging?"
    
    if current_topic:
        return f"That's an interesting question about {current_topic}! I'd love to help you explore this topic further. Could you provide more details about what you'd like to learn or understand?"
    
    return "That's an interesting question! I'd love to help you explore this topic further. Could you provide more details about what you'd like to learn or understand?"

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

def post_process_quiz_data(quiz_data: dict) -> dict:
    """Post-process quiz data to ensure balanced answer options."""
    if not quiz_data.get("questions"):
        return quiz_data
    
    for question in quiz_data["questions"]:
        if not question.get("options") or len(question["options"]) < 2:
            continue
        
        options = question["options"]
        option_lengths = [len(opt.strip()) for opt in options]
        
        # Check if any option is significantly longer than others (more than 50% longer)
        max_length = max(option_lengths)
        min_length = min(option_lengths)
        
        if max_length > min_length * 1.5:
            print(f"Warning: Answer options have unbalanced lengths. Max: {max_length}, Min: {min_length}")
            
            # If the correct answer is the longest, try to shorten it
            correct_index = question.get("correct", 0)
            if option_lengths[correct_index] == max_length:
                print(f"Correct answer is the longest option. Attempting to balance...")
                
                # Try to make all options more balanced by truncating long ones
                for i, option in enumerate(options):
                    if len(option.strip()) > min_length * 1.3:
                        # Truncate to be closer to the average length
                        target_length = int(sum(option_lengths) / len(option_lengths))
                        if len(option) > target_length:
                            # Truncate and add ellipsis if needed
                            truncated = option[:target_length].strip()
                            if not truncated.endswith('.') and not truncated.endswith('!') and not truncated.endswith('?'):
                                truncated += '...'
                            options[i] = truncated
                
                # Recalculate lengths after truncation
                option_lengths = [len(opt.strip()) for opt in options]
                print(f"After balancing - Max: {max(option_lengths)}, Min: {min(option_lengths)}")
    
    return quiz_data

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
# Trigger redeploy
