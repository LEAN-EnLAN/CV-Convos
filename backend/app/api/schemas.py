from pydantic import BaseModel, Field, EmailStr, ConfigDict, field_validator, AliasGenerator
from pydantic.alias_generators import to_camel
from typing import List, Optional, Any, Dict, Literal
from datetime import datetime
from enum import Enum


# =============================================================================
# CONVERSATION PHASE ENUM
# =============================================================================

class ConversationPhase(str, Enum):
    """Fases de la conversación del wizard conversacional."""
    WELCOME = "welcome"
    PERSONAL_INFO = "personal_info"
    EXPERIENCE = "experience"
    EDUCATION = "education"
    SKILLS = "skills"
    PROJECTS = "projects"
    SUMMARY = "summary"
    JOB_TAILORING = "job_tailoring"
    OPTIMIZATION = "optimization"
    REVIEW = "review"


# =============================================================================
# BASE MODEL CONFIGURATION
# =============================================================================

class BaseSchema(BaseModel):
    """Base schema with camelCase support for both input and output."""
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
    )


# =============================================================================
# CHAT MESSAGE SCHEMAS
# =============================================================================

class ChatMessage(BaseSchema):
    """Estructura de un mensaje en la conversación."""
    id: str = Field(..., description="ID único del mensaje")
    role: Literal["user", "assistant", "system"] = Field(..., description="Rol del emisor")
    content: str = Field(..., description="Contenido del mensaje")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Timestamp del mensaje")
    extraction: Optional[Dict[str, Any]] = Field(None, description="Datos extraídos del mensaje")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Metadatos adicionales")


class DataExtraction(BaseSchema):
    """Resultado de la extracción de datos de un mensaje."""
    extracted: Dict[str, Any] = Field(default_factory=dict, description="Datos extraídos estructurados")
    confidence: Dict[str, float] = Field(default_factory=dict, description="Scores de confianza por campo")
    needs_clarification: List[str] = Field(default_factory=list, description="Campos que necesitan aclaración")
    follow_up_questions: List[str] = Field(default_factory=list, description="Preguntas de seguimiento sugeridas")


class ExtractionResult(BaseSchema):
    """Resultado completo de extracción con completitud."""
    data: Dict[str, Any] = Field(default_factory=dict, description="Datos extraídos")
    completeness: Dict[str, Dict[str, Any]] = Field(
        default_factory=dict,
        description="Análisis de completitud por sección"
    )
    next_questions: List[str] = Field(default_factory=list, description="Próximas preguntas recomendadas")


# =============================================================================
# CHAT REQUEST/RESPONSE SCHEMAS
# =============================================================================

class ChatRequest(BaseSchema):
    """Request para el endpoint de chat."""
    message: str = Field(..., min_length=1, max_length=5000, description="Mensaje del usuario")
    session_id: str = Field(..., description="ID de sesión de conversación")
    cv_data: Dict[str, Any] = Field(default_factory=dict, description="Datos actuales del CV")
    history: List[ChatMessage] = Field(default_factory=list, description="Historial de mensajes recientes")
    phase: ConversationPhase = Field(default=ConversationPhase.WELCOME, description="Fase actual")
    job_description: Optional[str] = Field(None, description="Descripción del puesto (para fase de tailoring)")


class ChatDeltaEvent(BaseSchema):
    """Evento de streaming: fragmento de texto."""
    type: Literal["delta"] = "delta"
    content: str = Field(..., description="Fragmento de contenido")


class ChatExtractionEvent(BaseSchema):
    """Evento de streaming: extracción de datos."""
    type: Literal["extraction"] = "extraction"
    extraction: DataExtraction = Field(..., description="Datos extraídos")


class ChatPhaseChangeEvent(BaseSchema):
    """Evento de streaming: cambio de fase."""
    type: Literal["phase_change"] = "phase_change"
    new_phase: ConversationPhase = Field(..., description="Nueva fase")
    reason: str = Field(..., description="Razón del cambio")


class ChatCompleteEvent(BaseSchema):
    """Evento de streaming: mensaje completo."""
    type: Literal["complete"] = "complete"
    message: ChatMessage = Field(..., description="Mensaje completo")
    final_extraction: Optional[DataExtraction] = Field(None, description="Extracción final")


class ChatErrorEvent(BaseSchema):
    """Evento de streaming: error."""
    type: Literal["error"] = "error"
    error: str = Field(..., description="Mensaje de error")
    code: str = Field(..., description="Código de error")


# =============================================================================
# JOB ANALYSIS SCHEMAS
# =============================================================================

class JobAnalysisRequest(BaseSchema):
    """Request para análisis de puesto."""
    job_description: str = Field(..., min_length=50, max_length=10000, description="Descripción del puesto")
    cv_data: Dict[str, Any] = Field(..., description="Datos del CV a analizar")


class TailoringSuggestion(BaseSchema):
    """Sugerencia de mejora para el CV."""
    section: str = Field(..., description="Sección a modificar")
    current: str = Field(..., description="Contenido actual")
    suggested: str = Field(..., description="Contenido sugerido")
    reason: str = Field(..., description="Razón del cambio")
    priority: Literal["high", "medium", "low"] = Field(..., description="Prioridad")


class JobAnalysisResponse(BaseSchema):
    """Response del análisis de puesto."""
    match_score: int = Field(..., ge=0, le=100, description="Score de coincidencia 0-100")
    key_requirements: List[str] = Field(default_factory=list, description="Requisitos clave del puesto")
    matched_skills: List[str] = Field(default_factory=list, description="Habilidades que coinciden")
    missing_skills: List[str] = Field(default_factory=list, description="Habilidades faltantes")
    suggestions: List[TailoringSuggestion] = Field(default_factory=list, description="Sugerencias de mejora")
    optimized_cv: Optional[Dict[str, Any]] = Field(None, description="CV optimizado")


class ChatResponse(BaseSchema):
    """Response completo del chat (no-streaming)."""
    message: ChatMessage = Field(..., description="Mensaje de respuesta")
    extraction: Optional[DataExtraction] = Field(None, description="Datos extraídos")
    new_phase: Optional[ConversationPhase] = Field(None, description="Nueva fase si cambió")
    suggestions: Optional[List[str]] = Field(None, description="Sugerencias de respuesta rápida")


# =============================================================================
# SESSION SCHEMAS
# =============================================================================

class ChatSession(BaseSchema):
    """Estado de una sesión de chat."""
    session_id: str = Field(..., description="ID de sesión")
    messages: List[ChatMessage] = Field(default_factory=list, description="Mensajes de la sesión")
    cv_data: Dict[str, Any] = Field(default_factory=dict, description="Datos del CV acumulados")
    current_phase: ConversationPhase = Field(default=ConversationPhase.WELCOME, description="Fase actual")
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Fecha de creación")
    updated_at: datetime = Field(default_factory=datetime.utcnow, description="Última actualización")
    job_description: Optional[str] = Field(None, description="Descripción del puesto si existe")


class PersonalInfo(BaseSchema):
    fullName: str = Field(..., max_length=100, examples=["John Doe"])
    email: Optional[EmailStr] = Field(None, examples=["john@example.com"])
    phone: Optional[str] = Field(
        None, pattern=r"^[\+\(\)0-9\s-]{7,20}$", examples=["+1234567890"]
    )
    location: Optional[str] = Field(None, max_length=100, examples=["New York, USA"])
    website: Optional[str] = Field(None, examples=["https://johndoe.com"])
    linkedin: Optional[str] = Field(None, examples=["https://linkedin.com/in/johndoe"])
    github: Optional[str] = Field(None, examples=["https://github.com/johndoe"])
    summary: Optional[str] = Field(
        None, max_length=500, examples=["Experienced software engineer"]
    )

    @field_validator("website", "linkedin", "github")
    @classmethod
    def validate_url(cls, v):
        if v and not v.startswith(("http://", "https://", "www.")):
            raise ValueError("URL must start with http://, https://, or www.")
        return v


class Experience(BaseSchema):
    company: Optional[str] = Field(None, max_length=100, examples=["Tech Corp"])
    position: Optional[str] = Field(
        None, max_length=100, examples=["Software Engineer"]
    )
    startDate: Optional[str] = Field(
        None, pattern=r"^(\d{4}|\d{4}-\d{2})$", examples=["2020-01"]
    )
    endDate: Optional[str] = Field(
        None, pattern=r"^(\d{4}|\d{4}-\d{2}|Presente?|presente?|Current|current|Now|now)$",
        examples=["2023-12"]
    )
    current: Optional[bool] = Field(None, examples=[False])
    location: Optional[str] = Field(None, max_length=100, examples=["Remote"])
    description: Optional[str] = Field(
        None, max_length=1000, examples=["Developed web applications"]
    )
    highlights: Optional[List[str]] = Field(
        [], max_length=5, examples=[["Built REST APIs", "Led team of 5"]]
    )

    @field_validator("startDate", "endDate", mode="before")
    @classmethod
    def empty_str_to_none(cls, v):
        """Convert empty strings to None to avoid regex validation errors."""
        if v == "" or v is None:
            return None
        return v

    @field_validator("endDate")
    @classmethod
    def normalize_end_date(cls, v):
        if v and isinstance(v, str):
            # Normalize "Presente" and other current indicators to "Present"
            if v.lower() in ("presente", "current", "now", "actual", "hoy"):
                return "Present"
        return v


class Education(BaseSchema):
    institution: Optional[str] = Field(
        None, max_length=100, examples=["Harvard University"]
    )
    degree: Optional[str] = Field(
        None, max_length=100, examples=["Bachelor of Science"]
    )
    fieldOfStudy: Optional[str] = Field(
        None, max_length=100, examples=["Computer Science"]
    )
    startDate: Optional[str] = Field(
        None, pattern=r"^(\d{4}|\d{4}-\d{2})$", examples=["2016-09"]
    )
    endDate: Optional[str] = Field(
        None, pattern=r"^(\d{4}|\d{4}-\d{2}|Presente?|presente?|Current|current|Now|now)$",
        examples=["2020-06"]
    )
    location: Optional[str] = Field(None, max_length=100, examples=["Cambridge, MA"])
    description: Optional[str] = Field(
        None, max_length=500, examples=["Focus on AI and ML"]
    )

    @field_validator("startDate", "endDate", mode="before")
    @classmethod
    def empty_str_to_none(cls, v):
        """Convert empty strings to None to avoid regex validation errors."""
        if v == "" or v is None:
            return None
        return v

    @field_validator("endDate")
    @classmethod
    def normalize_end_date(cls, v):
        if v and isinstance(v, str):
            # Normalize "Presente" and other current indicators to "Present"
            if v.lower() in ("presente", "current", "now", "actual", "hoy"):
                return "Present"
        return v


class Skill(BaseSchema):
    name: str = Field(..., max_length=50, examples=["Python"])
    level: Optional[str] = Field(
        None,
        pattern=r"^(Beginner|Intermediate|Advanced|Expert|Principiante|Intermedio|Avanzado|Experto)$",
        examples=["Advanced"],
    )
    category: Optional[str] = Field(None, max_length=50, examples=["Programming"])

    @field_validator("level")
    @classmethod
    def normalize_level(cls, v):
        if v and isinstance(v, str):
            mapping = {
                "principiante": "Beginner",
                "intermedio": "Intermediate",
                "avanzado": "Advanced",
                "experto": "Expert",
            }
            return mapping.get(v.lower(), v)
        return v


class CVData(BaseSchema):
    personalInfo: PersonalInfo
    experience: List[Experience] = []
    education: List[Education] = []
    skills: List[Skill] = []
    projects: List[Dict[str, Any]] = []
    languages: List[Dict[str, Any]] = []
    certifications: List[Dict[str, Any]] = []
    interests: List[Any] = []

    model_config = ConfigDict(
        extra="allow",
        alias_generator=to_camel,
        populate_by_name=True
    )


class CVInput(BaseSchema):
    """Input model for CV data with skills and experience focus"""

    skills: List[str] = Field(
        ..., min_length=1, examples=[["Python", "JavaScript", "React"]]
    )
    experience: List[str] = Field(
        ...,
        min_length=1,
        examples=[["5 years web development", "Team lead experience"]],
    )
    education: Optional[List[str]] = Field(None, examples=[["Computer Science degree"]])
    certifications: Optional[List[str]] = Field(None, examples=[["AWS Certified"]])

    @field_validator("skills", "experience", "education", "certifications", mode="after")
    @classmethod
    def validate_list_items(cls, v):
        if v is not None and any(not isinstance(item, str) or not item.strip() for item in v):
            raise ValueError("All list items must be non-empty strings")
        return v


class CVDataInput(CVData):
    pass


class OptimizeRequest(BaseSchema):
    target: str = Field("shrink", pattern="^(shrink|improve)$")


class OptimizationRequest(BaseSchema):
    cv_data: CVDataInput
    target: str = Field("shrink", pattern="^(shrink|improve)$")


class CritiqueRequest(BaseSchema):
    cv_data: CVDataInput


class ImprovementCard(BaseSchema):
    """Sugerencia de mejora detallada para el CV."""
    id: str = Field(..., description="ID único para la mejora")
    target_field: str = Field(..., description="Campo o sección afectada (ej: personalInfo.summary, experience[0])")
    category: Literal["Impact", "Brevity", "Grammar", "Formatting", "Impacto", "Brevedad", "Gramática", "Formato"] = Field(..., description="Categoría de la mejora")
    severity: Literal["Critical", "Suggested", "Nitpick", "Crítico", "Sugerido", "Detalle"] = Field(..., description="Gravedad/Importancia")
    title: str = Field(..., description="Título corto y directo")
    description: str = Field(..., description="Explicación detallada de por qué se sugiere el cambio")
    impact_reason: str = Field(..., description="Por qué este cambio ayudará al candidato")
    original_text: str = Field(default="", description="Texto original en el CV")
    suggested_text: str = Field(default="", description="Propuesta de texto mejorado")


class CritiqueResponse(BaseSchema):
    """Respuesta completa del análisis Sentinel."""
    score: int = Field(..., ge=0, le=100, description="Score general de calidad 0-100")
    one_page_viable: bool = Field(..., description="¿Es viable mantenerlo en una sola página?")
    word_count_estimate: int = Field(..., description="Estimación de palabras")
    overall_verdict: str = Field(..., description="Resumen ejecutivo del análisis")
    critique: List[ImprovementCard] = Field(default_factory=list, description="Lista de mejoras detectadas")
