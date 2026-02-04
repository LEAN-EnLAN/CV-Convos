import json
import logging
from datetime import datetime
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, UploadFile, File, HTTPException, Query, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from app.services.parser_service import extract_text_from_file
from app.services.ai_service import (
    extract_cv_data,
    optimize_cv_data,
    critique_cv_data,
    optimize_for_role,
    generate_linkedin_post,
    generate_cover_letter,
    analyze_ats,
    generate_conversation_response,
    generate_conversation_response_stream,
    extract_cv_data_from_message,
    generate_next_question,
    analyze_job_description,
)
from app.services.cv_generator import generate_complete_cv
from app.api.schemas import (
    CVDataInput,
    CVData,
    ChatRequest,
    ChatResponse,
    ChatMessage,
    DataExtraction,
    ConversationPhase,
    JobAnalysisRequest,
    JobAnalysisResponse,
    ChatSession,
    CritiqueResponse,
)
from app.core.exceptions import (
    APIError,
    CVProcessingError,
    FileProcessingError,
    AIServiceError,
    InternalServerError,
    NotFoundError,
    ValidationError,
)
from app.core.limiter import limiter
from app.services.session_store import store as session_store

logger = logging.getLogger(__name__)

def _get_session(session_id: str) -> Optional[ChatSession]:
    """Obtiene una sesión de chat por ID."""
    return session_store.get_session(session_id)


def _save_session(session: ChatSession) -> None:
    """Guarda una sesión de chat."""
    session_store.save_session(session)


def _update_session_cv_data(session_id: str, new_data: Dict[str, Any]) -> None:
    """Actualiza los datos del CV en una sesión."""
    session = _get_session(session_id)
    if session:
        # Deep merge de los datos
        current_cv = session.cv_data
        merged = _deep_merge(current_cv, new_data)
        session.cv_data = merged
        session.updated_at = datetime.utcnow()
        _save_session(session)


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


class GenerateCompleteCVRequest(BaseModel):
    """Request model for complete CV generation."""
    cv_data: Dict[str, Any]
    template_type: str = Field(..., description="Template type: professional, harvard, minimal, creative, tech, bian, finance, health, education")


class GenerateCompleteCVResponse(BaseModel):
    """Response model for complete CV generation."""
    data: Dict[str, Any]
    metadata: Dict[str, Any]
    template_type: str
    generated_at: str


router = APIRouter()

MAX_FILE_SIZE_MB = 12
MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024


@router.post("/generate-cv", response_model=CVData, response_model_by_alias=True, tags=["cv-gen"])
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

            if len(content) > MAX_FILE_SIZE_BYTES:
                raise FileProcessingError(f"El archivo {filename} supera el límite de {MAX_FILE_SIZE_MB} MB")

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

    except (CVProcessingError, FileProcessingError, ValidationError) as e:
        # Re-raise validation and file processing errors as-is
        raise e
    except AIServiceError as e:
        raise e
    except Exception:
        logger.exception("Unexpected error in generate_cv")
        raise InternalServerError("Error interno al procesar el CV. Intentá de nuevo.")


@router.post("/optimize-cv", response_model=CVData, response_model_by_alias=True, tags=["cv-gen"])
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
        raise e
    except Exception:
        logger.exception("Unexpected error in optimize_cv")
        raise InternalServerError("Error interno al optimizar el CV. Intentá de nuevo.")


@router.post("/critique-cv", response_model=CritiqueResponse)
@limiter.limit("10/minute")
async def critique_cv(request: Request, cv_data: CVDataInput):
    try:
        critique_results = await critique_cv_data(cv_data.model_dump())

        if not critique_results:
            logger.error("Critique service returned None")
            raise CVProcessingError("El servicio de IA no devolvió resultados.")

        return critique_results
    except APIError:
        raise
    except Exception as e:
        logger.exception(f"Error in critique_cv endpoint: {str(e)}")
        if "ValidationError" in str(type(e)):
            raise CVProcessingError("La IA devolvió un formato incompatible. Probá de nuevo.")
        raise InternalServerError("Error interno al procesar el análisis. Intentá de nuevo.")


@router.post("/interview-cv", response_model=CVData, response_model_by_alias=True)
@limiter.limit("10/minute")
async def interview_cv(
    request: Request,
    cv_data: CVDataInput,
    target_role: str = Query(..., description="Target job position"),
):
    """Optimize CV for a specific target role."""
    try:
        result = await optimize_for_role(cv_data.model_dump(), target_role)

        if not result:
            raise CVProcessingError("No se pudo optimizar el CV para el puesto.")

        return result
    except APIError:
        raise
    except AIServiceError as e:
        raise e
    except Exception:
        logger.exception("Unexpected error in interview_cv")
        raise InternalServerError("Error al optimizar el CV para el puesto. Intentá de nuevo.")


@router.post("/generate-linkedin-post")
@limiter.limit("10/minute")
async def generate_linkedin_post_endpoint(request: Request, cv_data: CVDataInput):
    """Generate a LinkedIn post content based on CV data."""
    try:
        result = await generate_linkedin_post(cv_data.model_dump())

        if not result:
            raise CVProcessingError("No se pudo generar el post de LinkedIn.")

        return result
    except APIError:
        raise
    except AIServiceError as e:
        raise e
    except Exception:
        logger.exception("Unexpected error in generate_linkedin_post_endpoint")
        raise InternalServerError("Error al generar el post de LinkedIn. Intentá de nuevo.")


@router.post("/generate-cover-letter", response_model=CoverLetterResponse)
@limiter.limit("10/minute")
async def generate_cover_letter_endpoint(request: Request, cover_letter_request: CoverLetterRequest):
    """Generate a personalized cover letter based on CV data and job info."""
    try:
        result = await generate_cover_letter(
            cv_data=cover_letter_request.cv_data,
            company_name=cover_letter_request.company_name,
            recipient_name=cover_letter_request.recipient_name,
            job_description=cover_letter_request.job_description or "",
            tone=cover_letter_request.tone,
        )

        if not result:
            raise CVProcessingError("No se pudo generar la carta de presentación.")

        return CoverLetterResponse(
            opening=result.get("opening", ""),
            body=result.get("body", ""),
            closing=result.get("closing", ""),
            signature=result.get("signature", ""),
        )
    except APIError:
        raise
    except AIServiceError as e:
        raise e
    except Exception:
        logger.exception("Unexpected error in generate_cover_letter_endpoint")
        raise InternalServerError("Error al generar la carta de presentación. Intentá de nuevo.")


@router.post("/generate-complete-cv", response_model=GenerateCompleteCVResponse, response_model_by_alias=True, tags=["cv-gen"])
@limiter.limit("10/minute")
async def generate_complete_cv_endpoint(
    request: Request, cv_request: GenerateCompleteCVRequest
):
    """
    Generate a complete CV with AI enhancement for a specific template.

    Args:
        cv_request: CV data and template type selection

    Returns:
        Complete generated CV with metadata for frontend rendering

    Raises:
        400: Invalid request data
        422: CV processing failed
        503: AI service error
    """
    try:
        # Validate template type
        valid_templates = [
            "professional",
            "harvard",
            "minimal",
            "creative",
            "tech",
            "bian",
            "finance",
            "health",
            "education",
        ]

        if cv_request.template_type not in valid_templates:
            raise ValidationError(
                f"Invalid template type: {cv_request.template_type}. "
                f"Must be one of: {', '.join(valid_templates)}"
            )

        # Generate complete CV
        result = await generate_complete_cv(
            cv_data=cv_request.cv_data,
            template_type=cv_request.template_type,
        )

        return GenerateCompleteCVResponse(
            data=result["data"],
            metadata=result["metadata"],
            template_type=result["template_type"],
            generated_at=result["generatedAt"],
        )

    except (CVProcessingError, ValidationError) as e:
        raise e
    except AIServiceError as e:
        raise e
    except Exception:
        logger.exception("Unexpected error in generate_complete_cv_endpoint")
        raise InternalServerError("Error interno al generar el CV. Intentá de nuevo.")


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


@router.post("/ats-check", response_model=ATSCheckResponse, response_model_by_alias=True, tags=["cv-gen"])
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
        raise e
    except Exception:
        logger.exception("Unexpected error in ats_check")
        raise InternalServerError("Error interno al analizar el CV. Intentá de nuevo.")


# =============================================================================
# CHAT ENDPOINTS
# =============================================================================

@router.post("/chat/stream")
@limiter.limit("10/minute")
async def chat_stream(request: Request, chat_request: ChatRequest):
    """
    Endpoint de chat con streaming SSE (Server-Sent Events).

    Permite una conversación natural para construir el CV,
    con respuestas en tiempo real y extracción de datos.
    """
    try:
        # Obtener o crear sesión
        session = _get_session(chat_request.session_id)
        if not session:
            session = ChatSession(
                session_id=chat_request.session_id,
                cv_data=chat_request.cv_data,
                current_phase=chat_request.phase,
            )
        else:
            # ACTUALIZACIÓN CRÍTICA: Sincronizar datos del CV desde el frontend
            # para evitar que la sesión en memoria tenga datos obsoletos
            session.cv_data = chat_request.cv_data
            session.current_phase = chat_request.phase

        # Agregar mensaje del usuario al historial
        user_message = ChatMessage(
            id=f"msg_{datetime.utcnow().timestamp()}_user",
            role="user",
            content=chat_request.message,
            timestamp=datetime.utcnow(),
        )
        session.messages.append(user_message)

        # Guardar sesión
        _save_session(session)

        async def event_generator():
            """Generador de eventos SSE."""
            try:
                async for event in generate_conversation_response_stream(
                    message=chat_request.message,
                    history=session.messages,
                    cv_data=session.cv_data,
                    current_phase=session.current_phase,
                    job_description=chat_request.job_description,
                ):
                    yield event

                # Actualizar sesión al completar
                session.updated_at = datetime.utcnow()
                _save_session(session)

            except Exception as e:
                logger.error(f"Error in stream generator: {e}")
                yield f"data: {json.dumps({'type': 'error', 'error': str(e), 'code': 'STREAM_ERROR'})}\n\n"

        return StreamingResponse(
            event_generator(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no",
            },
        )

    except Exception:
        logger.exception("Error in chat_stream endpoint")
        raise InternalServerError("Error en el servicio de chat. Intentá de nuevo.")


@router.post("/chat", response_model=ChatResponse, response_model_by_alias=True)
@limiter.limit("10/minute")
async def chat(request: Request, chat_request: ChatRequest):
    """
    Endpoint de chat sin streaming (respuesta completa).

    Útil para clientes que no soportan SSE o para testing.
    """
    try:
        # Obtener o crear sesión
        session = _get_session(chat_request.session_id)
        if not session:
            session = ChatSession(
                session_id=chat_request.session_id,
                cv_data=chat_request.cv_data,
                current_phase=chat_request.phase,
            )

        # Agregar mensaje del usuario
        user_message = ChatMessage(
            id=f"msg_{datetime.utcnow().timestamp()}_user",
            role="user",
            content=chat_request.message,
            timestamp=datetime.utcnow(),
        )
        session.messages.append(user_message)

        # Generar respuesta
        result = await generate_conversation_response(
            message=chat_request.message,
            history=session.messages,
            cv_data=session.cv_data,
            current_phase=session.current_phase,
            job_description=chat_request.job_description,
        )

        # Extraer datos
        extraction = await extract_cv_data_from_message(
            message=chat_request.message,
            history=session.messages,
            cv_data=session.cv_data,
            current_phase=session.current_phase,
        )

        # Actualizar datos del CV si hay extracción con alta confianza
        if extraction and extraction.extracted:
            _update_session_cv_data(chat_request.session_id, extraction.extracted)

        # Actualizar fase si cambió
        new_phase = result.get("new_phase")
        if new_phase and new_phase != session.current_phase:
            session.current_phase = new_phase

        # Crear mensaje de respuesta
        assistant_message = ChatMessage(
            id=f"msg_{datetime.utcnow().timestamp()}_assistant",
            role="assistant",
            content=result["response"],
            timestamp=datetime.utcnow(),
            extraction=extraction.model_dump(by_alias=True) if extraction else None,
        )
        session.messages.append(assistant_message)
        session.updated_at = datetime.utcnow()
        _save_session(session)

        return ChatResponse(
            message=assistant_message,
            extraction=extraction,
            new_phase=new_phase,
            suggestions=result.get("suggestions"),
        )

    except Exception:
        logger.exception("Error in chat endpoint")
        raise InternalServerError("Error en el servicio de chat. Intentá de nuevo.")


@router.post("/chat/extract", response_model=DataExtraction, response_model_by_alias=True)
@limiter.limit("10/minute")
async def chat_extract(request: Request, chat_request: ChatRequest):
    """
    Extrae datos estructurados del CV desde un mensaje.

    Útil para extraer información sin generar una respuesta conversacional.
    """
    try:
        session = _get_session(chat_request.session_id)
        history = session.messages if session else []

        extraction = await extract_cv_data_from_message(
            message=chat_request.message,
            history=history,
            cv_data=chat_request.cv_data,
            current_phase=chat_request.phase,
        )

        if not extraction:
            raise CVProcessingError("No se pudieron extraer datos del mensaje.")

        return extraction

    except HTTPException:
        raise
    except Exception:
        logger.exception("Error in chat_extract endpoint")
        raise InternalServerError("Error al extraer datos del mensaje. Intentá de nuevo.")


@router.post("/chat/job-analysis", response_model=JobAnalysisResponse, response_model_by_alias=True)
@limiter.limit("10/minute")
async def chat_job_analysis(request: Request, job_request: JobAnalysisRequest):
    """
    Analiza una descripción de puesto y compara con el CV.

    Proporciona sugerencias de mejora y un score de coincidencia.
    """
    try:
        result = await analyze_job_description(
            job_description=job_request.job_description,
            cv_data=job_request.cv_data,
        )

        if not result:
            raise CVProcessingError("No se pudo analizar la descripción del puesto.")

        return result

    except HTTPException:
        raise
    except Exception:
        logger.exception("Error in chat_job_analysis endpoint")
        raise InternalServerError("Error al analizar el puesto. Intentá de nuevo.")


@router.get("/chat/session/{session_id}")
@limiter.limit("30/minute")
async def get_chat_session(request: Request, session_id: str):
    """
    Obtiene el estado de una sesión de chat.

    Incluye historial de mensajes y datos del CV acumulados.
    """
    session = _get_session(session_id)

    if not session:
        # Crear nueva sesión si no existe
        session = ChatSession(
            session_id=session_id,
            cv_data={},
            current_phase=ConversationPhase.WELCOME,
        )
        _save_session(session)

    return {
        "sessionId": session.session_id,
        "messages": [msg.model_dump(by_alias=True) for msg in session.messages],
        "cvData": session.cv_data,
        "currentPhase": session.current_phase.value,
        "createdAt": session.created_at.isoformat(),
        "updatedAt": session.updated_at.isoformat(),
    }


@router.post("/chat/session/{session_id}/next-question")
@limiter.limit("10/minute")
async def get_next_question(request: Request, session_id: str):
    """
    Obtiene la siguiente pregunta sugerida para la conversación.

    Basado en el estado actual del CV y la fase de la conversación.
    """
    session = _get_session(session_id)

    if not session:
        raise NotFoundError("No se encontró la sesión solicitada.")

    try:
        result = await generate_next_question(
            cv_data=session.cv_data,
            current_phase=session.current_phase,
            history=session.messages,
        )

        return result

    except Exception:
        logger.exception("Error in get_next_question endpoint")
        raise InternalServerError("Error al generar la siguiente pregunta. Intentá de nuevo.")


# =============================================================================
# HELPER FUNCTIONS
# =============================================================================

def _deep_merge(base: Dict[str, Any], update: Dict[str, Any]) -> Dict[str, Any]:
    """Realiza un merge profundo de dos diccionarios."""
    result = base.copy()

    for key, value in update.items():
        if key in result and isinstance(result[key], dict) and isinstance(value, dict):
            result[key] = _deep_merge(result[key], value)
        elif key in result and isinstance(result[key], list) and isinstance(value, list):
            # Para listas, agregamos elementos nuevos (evitando duplicados simples)
            existing = {json.dumps(item, sort_keys=True) for item in result[key] if isinstance(item, dict)}
            for item in value:
                if isinstance(item, dict):
                    item_key = json.dumps(item, sort_keys=True)
                    if item_key not in existing:
                        result[key].append(item)
                        existing.add(item_key)
                else:
                    if item not in result[key]:
                        result[key].append(item)
        else:
            result[key] = value

    return result
