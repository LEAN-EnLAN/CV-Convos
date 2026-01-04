from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List
from app.services.parser_service import extract_text_from_file
from app.services.ai_service import extract_cv_data

router = APIRouter()

@router.post("/generate-cv")
async def generate_cv(files: List[UploadFile] = File(...)):
    combined_text = ""
    
    if not files:
        raise HTTPException(status_code=400, detail="No files uploaded")

    for file in files:
        content = await file.read()
        text = await extract_text_from_file(content, file.filename)
        combined_text += f"\n--- FILE: {file.filename} ---\n{text}\n"

    if not combined_text.strip():
        raise HTTPException(status_code=400, detail="Could not extract text from files")

    # Limit text size if necessary (Groq has limits)
    # combined_text = combined_text[:20000] 

    cv_data = await extract_cv_data(combined_text)
    
    if not cv_data:
        raise HTTPException(status_code=500, detail="AI processing failed")

    return cv_data

@router.post("/optimize-cv")
async def optimize_cv(cv_data: dict, target: str = "shrink"):
    from app.services.ai_service import optimize_cv_data
    
    optimized_data = await optimize_cv_data(cv_data, target)
    
    if not optimized_data:
        raise HTTPException(status_code=500, detail="AI optimization failed")
        
    return optimized_data
