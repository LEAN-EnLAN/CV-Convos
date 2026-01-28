from fastapi import APIRouter, UploadFile, File, HTTPException, Query, Request
from typing import List, Optional
from pydantic import BaseModel
import logging
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
from app.core.exceptions import (
    CVProcessingError,
    FileProcessingError,
    AIServiceError,
    ValidationError,
)
from app.core.limiter import limiter

logger = logging.getLogger(__name__)


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


@router.post("/generate-cv", response_model=CVData, tags=["cv-gen"])
@limiter.limit("10/minute")
async def generate_cv(request: Request, files: List[UploadFile] = File(...)):
    """
    Generate CV data from uploaded files (PDF/DOCX)

    Args:
        files: List of PDF/DOCX files containing CV information

    Returns:
        Structured CV data in JSON format

    Raises:
        400: No files uploaded or file processing failed
        422: CV processing failed
        503: AI service error
    """
    combined_text = ""

    if not files:
        raise ValidationError("No files uploaded")

    try:
        for file in files:
            content = await file.read()
            filename = file.filename or "unknown"

            if not filename.lower().endswith((".pdf", ".docx", ".txt")):
                raise FileProcessingError(f"Unsupported file type: {filename}")

            text = await extract_text_from_file(content, filename)
            if not text.strip():
                raise FileProcessingError(f"Could not extract text from {filename}")

            combined_text += f"\n--- FILE: {filename} ---\n{text}\n"

        if not combined_text.strip():
            raise FileProcessingError("Could not extract text from files")

        # Limit text size for Groq API
        combined_text = combined_text[:20000]

        cv_data = await extract_cv_data(combined_text)

        if not cv_data:
            raise CVProcessingError("AI processing failed to generate CV data")

        return cv_data

    except (FileProcessingError, ValidationError) as e:
        # Re-raise validation and file processing errors as-is
        raise e
    except AIServiceError as e:
        raise HTTPException(status_code=503, detail="AI Service is temporarily unavailable")
    except Exception as e:
        logger.exception("Unexpected error in generate_cv")
        raise HTTPException(status_code=500, detail="Internal Server Error")


@router.post("/optimize-cv", response_model=CVData, tags=["cv-gen"])
@limiter.limit("10/minute")
async def optimize_cv(
    request: Request, cv_data: CVDataInput, target: str = "shrink", section: str = "all"
):
    """
    Optimize CV data for better presentation

    Args:
        cv_data: CV data to optimize
        target: Optimization target (shrink/improve)
        section: Section to optimize (all/summary/skills)

    Returns:
        Optimized CV data

    Raises:
        422: CV processing failed
        503: AI service error
    """
    try:
        optimized_data = await optimize_cv_data(cv_data.model_dump(), target, section)

        if not optimized_data:
            raise CVProcessingError("AI optimization failed")

        return optimized_data

    except (CVProcessingError, ValidationError) as e:
        raise e
    except AIServiceError as e:
        raise HTTPException(status_code=503, detail="AI Service is temporarily unavailable")
    except Exception as e:
        logger.exception("Unexpected error in optimize_cv")
        raise HTTPException(status_code=500, detail="Internal Server Error")


@router.post("/critique-cv")
@limiter.limit("10/minute")
async def critique_cv(request: Request, cv_data: CVDataInput):
    critique_results = await critique_cv_data(cv_data.model_dump())

    if not critique_results:
        raise HTTPException(status_code=500, detail="AI critique failed")

    return critique_results


@router.post("/interview-cv", response_model=CVData)
@limiter.limit("10/minute")
async def interview_cv(
    request: Request,
    cv_data: CVDataInput,
    target_role: str = Query(..., description="Target job position"),
):
    """Optimize CV for a specific target role."""
    result = await optimize_for_role(cv_data.model_dump(), target_role)

    if not result:
        raise HTTPException(status_code=500, detail="AI role optimization failed")

    return result


@router.post("/generate-linkedin-post")
@limiter.limit("10/minute")
async def generate_linkedin_post_endpoint(request: Request, cv_data: CVDataInput):
    """Generate a LinkedIn post content based on CV data."""
    result = await generate_linkedin_post(cv_data.model_dump())

    if not result:
        raise HTTPException(status_code=500, detail="AI post generation failed")

    return result


@router.post("/generate-cover-letter", response_model=CoverLetterResponse)
@limiter.limit("10/minute")
async def generate_cover_letter_endpoint(request: Request, cover_letter_request: CoverLetterRequest):
    """Generate a personalized cover letter based on CV data and job info."""
    result = await generate_cover_letter(
        cv_data=cover_letter_request.cv_data,
        company_name=cover_letter_request.company_name,
        recipient_name=cover_letter_request.recipient_name,
        job_description=cover_letter_request.job_description or "",
        tone=cover_letter_request.tone,
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


@router.post("/ats-check", response_model=ATSCheckResponse, tags=["cv-gen"])
@limiter.limit("10/minute")
async def ats_check(
    request: Request,
    files: List[UploadFile] = File(...),
    target_industry: str = Query(
        "general",
        description="Target industry: tech, finance, healthcare, creative, education, general",
    ),
):
    """Analyze a CV PDF/DOCX for ATS compatibility."""
    combined_text = ""

    if not files:
        raise ValidationError("No files uploaded")

    try:
        for file in files:
            content = await file.read()
            filename = file.filename or "unknown"

            if not filename.lower().endswith((".pdf", ".docx", ".txt")):
                raise FileProcessingError(f"Unsupported file type: {filename}")

            text = await extract_text_from_file(content, filename)
            if not text.strip():
                raise FileProcessingError(f"Could not extract text from {filename}")

            combined_text += f"\n--- FILE: {filename} ---\n{text}\n"

        if not combined_text.strip():
            raise FileProcessingError("Could not extract text from files")

        result = await analyze_ats(combined_text, target_industry)

        if not result:
            raise CVProcessingError("ATS analysis failed")

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

    except (FileProcessingError, ValidationError) as e:
        # Re-raise validation and file processing errors as-is
        raise e
    except AIServiceError as e:
        raise HTTPException(status_code=503, detail="AI Service is temporarily unavailable")
    except Exception as e:
        logger.exception("Unexpected error in ats_check")
        raise HTTPException(status_code=500, detail="Internal Server Error")
