from fastapi import APIRouter, UploadFile, File, HTTPException, Query
from typing import List
from app.services.parser_service import extract_text_from_file
from app.services.ai_service import extract_cv_data, optimize_cv_data, critique_cv_data, optimize_for_role
from app.api.schemas import CVDataInput, CVData

router = APIRouter()

@router.post("/generate-cv", response_model=CVData)
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

@router.post("/optimize-cv", response_model=CVData)
async def optimize_cv(cv_data: CVDataInput, target: str = "shrink", section: str = "all"):
    optimized_data = await optimize_cv_data(cv_data.model_dump(), target, section)
    
    if not optimized_data:
        raise HTTPException(status_code=500, detail="AI optimization failed")
        
    return optimized_data

@router.post("/critique-cv")
async def critique_cv(cv_data: CVDataInput):
    critique_results = await critique_cv_data(cv_data.model_dump())
    
    if not critique_results:
        raise HTTPException(status_code=500, detail="AI critique failed")
        
    return critique_results

@router.post("/interview-cv", response_model=CVData)
async def interview_cv(cv_data: CVDataInput, target_role: str = Query(..., description="Target job position")):
    """Optimize CV for a specific target role."""
    result = await optimize_for_role(cv_data.model_dump(), target_role)
    
    if not result:
        raise HTTPException(status_code=500, detail="AI role optimization failed")
        
    return result
