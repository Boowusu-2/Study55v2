from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import tempfile
import os
import shutil
from typing import List
import traceback
from extract_text import extract_text_from_files

app = FastAPI(
    title="SmartStudy Text Extraction API",
    description="API for extracting text from various document formats",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "SmartStudy Text Extraction API", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.post("/extract-text")
async def extract_text(files: List[UploadFile] = File(...)):
    """
    Extract text from uploaded files.
    Supports: PDF, DOCX, DOC, PPTX, TXT
    """
    if not files:
        raise HTTPException(status_code=400, detail="No files uploaded")
    
    # Validate file types
    allowed_extensions = {'.pdf', '.docx', '.doc', '.pptx', '.ppt', '.txt'}
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

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
