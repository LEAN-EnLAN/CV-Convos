from fastapi import APIRouter, UploadFile, File, HTTPException, Query
from typing import List, Optional
from pydantic import BaseModel
from app.services.parser_service import extract_text_from_file
from app.services.ai_service import (
    extract_cv_data,
    optimize_cv_data,
    critique_cv_data,
    optimize_for_role,
    generate_linkedin_post,
    generate_cover_letter,
    analyze_ats,
)
from app.api.schemas import CVDataInput, CVData


class CoverLetterRequest(BaseModel):
    cv_data: dict
    job_description: Optional[str] = None
    company_name: str
    recipient_name: str
    tone: str = "formal"


class CoverLetterResponse(BaseModel):
    opening: str
    body: str
    closing: str
    signature: str


router = APIRouter()


@router.post("/generate-cv", response_model=CVData)
async def generate_cv(files: List[UploadFile] = File(...)):
    combined_text = ""

    if not files:
        raise HTTPException(status_code=400, detail="No files uploaded")

    for file in files:
        content = await file.read()
        filename = file.filename or "unknown"
        text = await extract_text_from_file(content, filename)
        combined_text += f"\n--- FILE: {filename} ---\n{text}\n"

    if not combined_text.strip():
        raise HTTPException(status_code=400, detail="Could not extract text from files")

    # Limit text size if necessary (Groq has limits)
    # combined_text = combined_text[:20000]

    cv_data = await extract_cv_data(combined_text)

    if not cv_data:
        raise HTTPException(status_code=500, detail="AI processing failed")

    return cv_data


@router.post("/optimize-cv", response_model=CVData)
async def optimize_cv(
    cv_data: CVDataInput, target: str = "shrink", section: str = "all"
):
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
async def interview_cv(
    cv_data: CVDataInput,
    target_role: str = Query(..., description="Target job position"),
):
    """Optimize CV for a specific target role."""
    result = await optimize_for_role(cv_data.model_dump(), target_role)

    if not result:
        raise HTTPException(status_code=500, detail="AI role optimization failed")

    return result


@router.post("/generate-linkedin-post")
async def generate_linkedin_post_endpoint(cv_data: CVDataInput):
    """Generate a LinkedIn post content based on CV data."""
    result = await generate_linkedin_post(cv_data.model_dump())

    if not result:
        raise HTTPException(status_code=500, detail="AI post generation failed")

    return result


@router.post("/generate-cover-letter", response_model=CoverLetterResponse)
async def generate_cover_letter_endpoint(request: CoverLetterRequest):
    """Generate a personalized cover letter based on CV data and job info."""
    result = await generate_cover_letter(
        cv_data=request.cv_data,
        company_name=request.company_name,
        recipient_name=request.recipient_name,
        job_description=request.job_description or "",
        tone=request.tone,
    )

    if not result:
        raise HTTPException(status_code=500, detail="AI cover letter generation failed")

    return CoverLetterResponse(
        opening=result.get("opening", ""),
        body=result.get("body", ""),
        closing=result.get("closing", ""),
        signature=result.get("signature", ""),
    )


class ATSCheckResponse(BaseModel):
    ats_score: int
    grade: str
    summary: str
    format_score: int
    keyword_score: int
    completeness_score: int
    found_keywords: List[str]
    missing_keywords: List[str]
    industry_recommendation: str
    issues: List[dict]
    quick_wins: List[str]
    detailed_tips: str


@router.post("/ats-check", response_model=ATSCheckResponse)
async def ats_check(
    files: List[UploadFile] = File(...),
    target_industry: str = Query(
        "general",
        description="Target industry: tech, finance, healthcare, creative, education, general",
    ),
):
    """Analyze a CV PDF/DOCX for ATS compatibility."""
    combined_text = ""

    if not files:
        raise HTTPException(status_code=400, detail="No files uploaded")

    for file in files:
        content = await file.read()
        filename = file.filename or "unknown"
        text = await extract_text_from_file(content, filename)
        combined_text += f"\n--- FILE: {filename} ---\n{text}\n"

    if not combined_text.strip():
        raise HTTPException(status_code=400, detail="Could not extract text from files")

    result = await analyze_ats(combined_text, target_industry)

    if not result:
        raise HTTPException(status_code=500, detail="ATS analysis failed")

    return ATSCheckResponse(
        ats_score=result.get("ats_score", 50),
        grade=result.get("grade", "C"),
        summary=result.get("summary", "CV analysed"),
        format_score=result.get("format_score", 50),
        keyword_score=result.get("keyword_score", 50),
        completeness_score=result.get("completeness_score", 50),
        found_keywords=result.get("found_keywords", []),
        missing_keywords=result.get("missing_keywords", []),
        industry_recommendation=result.get("industry_recommendation", "general"),
        issues=result.get("issues", []),
        quick_wins=result.get("quick_wins", []),
        detailed_tips=result.get("detailed_tips", ""),
    )
