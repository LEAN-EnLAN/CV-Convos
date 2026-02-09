import json
import logging
import copy
import asyncio
import os
import re
import uuid
from typing import List, Dict, Any, Optional, AsyncGenerator
from datetime import datetime
from google import genai
from google.genai import types
from groq import Groq
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
from pydantic import ValidationError as PydanticValidationError
from app.core.config import settings
from app.core.exceptions import AIServiceError, CVProcessingError
from app.services.chat_prompts import (
    CONVERSATION_ORCHESTRATOR_PROMPT,
    DATA_EXTRACTION_PROMPT,
    NEXT_QUESTION_GENERATOR_PROMPT,
    JOB_ANALYSIS_PROMPT,
    get_phase_prompt,
)
from app.api.schemas import (
    ChatMessage,
    DataExtraction,
    ConversationPhase,
    JobAnalysisResponse,
    TailoringSuggestion,
    CVData,
    CritiqueResponse,
)

# Valid Groq Models
MODEL_ID = "llama-3.3-70b-versatile"

logger = logging.getLogger(__name__)

def _raise_if_no_ai_provider() -> None:
    missing_keys = settings.missing_ai_keys()
    if len(missing_keys) == 2:
        settings.raise_if_missing_ai_keys(missing_keys)

# --- SYSTEM PROMPTS (THE BIBLE OF TRUTH) ---

def get_system_rules() -> str:
    """Returns the unified system rules with current date context."""
    now = datetime.now()
    return f"""
You are a TECHNICAL RESUME COMPILER. You operate under 100% factual integrity.
- CURRENT DATE: {now.strftime("%Y-%m-%d")} (Use this for relative date calculations like "2 years ago").
- IDENTITY LOCK: Never change the candidate's Name, Email, Phone, Location, LinkedIn, or GitHub.
- NO HALLUCINATIONS: Do not invent metrics, percentages, or achievements not explicitly stated.
- LANGUAGE LOYALTY: You must respond in the EXACT same language as the input. 
- FORMAT: You only output valid JSON (unless in chat mode).
- TEMPORAL REASONING: If the user says they worked for "2 years" at a company and the current year is {now.year}, set the startDate to {now.year - 2}.
- VERB CONJUGATION (CRITICAL):
  - If the input is in SPANISH, you MUST use FIRST PERSON SINGULAR (e.g., "Realicé", "Lideré", "Desarrollé"). 
  - NEVER use third person (e.g., "Realizó", "Lideró", "Desarrolló").
  - This is non-negotiable for Spanish CVs.
"""

SYSTEM_RULES = get_system_rules()

EXTRACT_CV_PROMPT = """
Task: Convert the provided text into a structured CV JSON.
Rules:
- If a value is missing, use "".
- If the text is in Spanish, keep it in Spanish.
- EDUCATION: Always try to separate the 'degree' (e.g., "Técnico", "Licenciatura") from the 'fieldOfStudy' (e.g., "Radiología", "Informática"). If the text says "Técnico en Informática", degree is "Técnico" and fieldOfStudy is "Informática".
- EDUCATION SPLIT (CRITICAL): If degree contains "in/en/de/of", split into:
  - degree: the credential (e.g., "Master", "Licenciatura")
  - fieldOfStudy: the subject (e.g., "Data Science", "Informática")
  Example: "Master in Data Science" → degree="Master", fieldOfStudy="Data Science"
- Do NOT normalize job titles.
- DATE FORMATS (CRITICAL):
  - For dates, use YYYY-MM format (e.g., "2020-01") when month is known, or just YYYY (e.g., "2024") when only year is available.
  - For current positions, use "Present" for endDate (English) or "Presente" (Spanish).
- SKILL LEVELS (CRITICAL):
  - Use ONLY ONE of these exact values: "Beginner", "Intermediate", "Advanced", "Expert" (or Spanish: "Principiante", "Intermedio", "Avanzado", "Experto").
  - Do NOT use the example text "Beginner/Intermediate/Advanced/Expert" - pick ONE value.
- PHONE NUMBERS: Keep as-is, including parentheses and spaces.
- Strictly follow this schema:
{{
  "personalInfo": {{ "fullName": "", "email": "", "phone": "", "location": "", "summary": "", "website": "", "linkedin": "", "github": "" }},
  "experience": [ {{ "company": "", "position": "", "location": "", "startDate": "", "endDate": "", "current": false, "description": "" }} ],
  "education": [ {{ "institution": "", "degree": "", "fieldOfStudy": "", "location": "", "startDate": "", "endDate": "" }} ],
  "skills": [ {{ "name": "", "level": "" }} ],
  "languages": [ {{ "language": "", "fluency": "" }} ],
  "projects": [ {{ "name": "", "description": "", "technologies": [] }} ],
  "certifications": [ {{ "name": "", "issuer": "", "date": "" }} ]
}}

Input: {text}
"""

# --- SPECIALIZED PROMPTS ---

SUMMARIZE_PROMPT = """
Task: Write a high-impact Professional Summary for this CV.
Goal: Create a powerful "Elevator Pitch" (2-3 lines max, 45-70 words).

Instructions:
1. Analyze the candidate's Experience and Skills.
2. Highlight: Years of experience, Key Role/Title, Top 1-2 Achievements, and Core Value Proposition.
3. Tone: Confident, professional, result-oriented.
4. LANGUAGE: {language} (Strictly match CV language).
5. FORMAT: JSON {{ "personalInfo": {{ "summary": "..." }} }}

Input CV:
{cv_json}
"""

SUMMARY_SHRINK_PROMPT = """
Task: Shorten the Professional Summary to be brutally concise.
Goal: Max 2 lines, 35-45 words. Must be shorter than the current summary.

Instructions:
1. Keep role/title, years of experience, and one standout strength.
2. Remove filler and soft claims without evidence.
3. Do NOT add new facts or metrics.
4. LANGUAGE: {language} (Strictly match CV language).
5. FORMAT: JSON {{ "personalInfo": {{ "summary": "..." }} }}

Input CV:
{cv_json}
"""

EXPERIENCE_IMPROVE_PROMPT = """
Task: Improve the experience descriptions without expanding length.

Instructions:
1. Keep company, position, dates, and location unchanged.
2. Rewrite each description into 2-4 bullet-like sentences (<=22 words each).
3. Preserve facts; do NOT invent metrics.
4. Avoid redundancy and passive voice.
5. LANGUAGE: Same as input.
6. FORMAT: JSON {{ "experience": [ {{ "description": "..." }} ] }} with the same order/count.

Input CV:
{cv_json}
"""

EXPERIENCE_SHRINK_PROMPT = """
Task: Condense experience descriptions by 30-50%.

Instructions:
1. Keep company, position, dates, and location unchanged.
2. Each role: max 2-3 bullet-like sentences (<=18 words each).
3. Preserve facts; do NOT invent metrics.
4. Remove filler and repeated statements.
5. LANGUAGE: Same as input.
6. FORMAT: JSON {{ "experience": [ {{ "description": "..." }} ] }} with the same order/count.

Input CV:
{cv_json}
"""

SUGGEST_SKILLS_PROMPT = """
Task: Suggest technical and soft skills based on the candidate's experience.
Goal: maximize keyword coverage without lying.

Instructions:
1. INFER skills: If they say "Built React app", add "React", "JavaScript", "Frontend Development".
2. If they say "Led team", add "Leadership", "Team Management".
3. Return a mix of Hard and Soft skills (70% Hard, 30% Soft).
4. Total suggestions: 10-15 relevant skills.
5. LANGUAGE: {language} (Match CV language).
6. SKILL LEVELS (CRITICAL): Use ONLY ONE of these exact values:
   - English: "Beginner", "Intermediate", "Advanced", "Expert"
   - Spanish: "Principiante", "Intermedio", "Avanzado", "Experto"
   - Do NOT use the example text "Beginner/Intermediate/Advanced/Expert" - pick ONE value.
7. FORMAT: JSON {{ "skills": [ {{ "name": "Skill Name", "level": "Advanced" }}, ... ] }}

Input CV:
{cv_json}
"""

ONE_PAGE_OPTIMIZER_PROMPT = """
Task: CONDENSE this CV to fit strictly on ONE PAGE (~600-750 words).
Strategy: "Kill your darlings".

1. SUMMARY: Limit to 2 lines max.
2. EXPERIENCE: 
   - Keep last 10 years only. 
   - Top 2 most recent roles: 3-4 bullet points max.
   - Older roles: reduce to 1-2 lines or just Title/Company/Dates.
   - Remove "filler" words. Use concise active voice.
3. EDUCATION: Compact format (Degree, Institution, Year). Remove GPA/Activities if not recent.
4. SKILLS: formatting only.
5. PROJECTS: Keep top 2 relevant ones only.

Constraint: Maintain strict JSON structure. Do NOT remove contact info.

Input CV:
{cv_json}
"""

ROLE_ALIGNMENT_PROMPT = """
Task: REWRITE this CV to perfectly target the role: "{target_role}".
Goal: Strategic alignment for the target position while maintaining factual integrity.
CURRENT DATE: {current_date}

Instructions:
1. SUMMARY: Rewrite to position the candidate as a "{target_role}" expert. Highlight years of experience and core value proposition.
2. EXPERIENCE (CRITICAL STRATEGY):
   - RELEVANCE CHECK: For each experience item, evaluate its impact for a "{target_role}" position.
   - HIGH RELEVANCE: Expand. Add 3-5 high-impact bullet points using action verbs and quantifying results (%, $). Detail specific technologies mentioned in the job context.
   - LOW RELEVANCE (e.g., worked at unrelated retail/service jobs like McDonald's when targeting a Tech role):
     - **REMOVE** the item completely if it does not contribute to the professional narrative of a "{target_role}".
     - Exception: If removing it leaves a massive gap (> 2 years) and there's nothing else, keep it but MINIMIZE to 1 short line.
   - IRRELEVANT/OLD: If an experience is >10 years old and not critical, remove it.
3. SKILLS: Reorder to place "{target_role}" core skills at the top. Add inferred skills based on experience.
4. PROJECTS: Keep and prioritize projects that demonstrate skills needed for "{target_role}".
5. LANGUAGE: {language} (Strictly match input language).

Input CV JSON:
{cv_json}

IMPORTANT: You MUST return the FULL VALID CV JSON object. Do not omit any required sections.
"""

SENTINEL_CRITIQUE_PROMPT = """
Eres el sistema SENTINEL, una IA experta en Análisis de Talento y Arquitectura de Carrera con 15 años de experiencia en reclutamiento técnico de élite. 
Tu tarea es diseccionar este CV con un estándar de crítica implacable, buscando la excelencia en impacto, claridad y minimalismo intencional.

INSTRUCCIONES DE ANÁLISIS:
1. PERSPECTIVA DE CRITICA: No des elogios vacíos. Analiza por qué el contenido actual falla en capturar la atención de un reclutador en 6 segundos.
2. DETALLE PROFUNDO: Para cada mejora, explica la psicología detrás del cambio. ¿Por qué el texto original es débil? ¿Qué comunica la nueva versión sobre el candidato?
3. SIN CONTRADICCIONES: Asegúrate de que tus sugerencias sean coherentes. No pidas "expandir" y "resumir" la misma sección. Mantén una visión unificada.
4. CALIDAD > CANTIDAD: Identifica exactamente las 4-6 mejores oportunidades de mejora. No satures de trivialidades. Focus en IMPACTO.
5. LENGUAJE: Responde SIEMPRE en el mismo idioma del CV (Español o Inglés).

RÚBRICA DE SCORE (OBLIGATORIA):
- Comienza en 60.
- Sube solo si hay evidencia clara de impacto y claridad.
- Si hay al menos 1 "Crítico", el score NO puede superar 85.
- Si faltan métricas en experiencia, el score NO puede superar 80.
- 90+ solo si no hay problemas y el CV es excepcional.

CAMPOS DEL CRITIQUE (ESTRICTAMENTE ELIGE UNO DE ESTOS VALORES TÉCNICOS):
- category: ["Impact", "Brevity", "Grammar", "Formatting"] o su traducción ["Impacto", "Brevedad", "Gramática", "Formato"]
- severity: ["Critical", "Suggested", "Nitpick"] o su traducción ["Crítico", "Sugerido", "Detalle"]
- target_field: Ruta exacta al campo (ej: 'experience.0.description', 'personalInfo.summary'). Usa puntos para los índices de arreglos.
- impact_reason: Explicación de qué KPI o percepción profesional mejora con este cambio.

INPUT CV:
{cv_json}

REGLAS DE SALIDA (JSON):
{{
  "score": 0-100 (Sé honesto, 100 es perfección absoluta),
  "one_page_viable": boolean,
  "word_count_estimate": number,
  "overall_verdict": "Un análisis ejecutivo de 2 oraciones sobre el estado actual del CV y su potencial.",
  "critique": [
    {{
      "id": "short-uuid",
      "target_field": "string",
      "category": "string",
      "severity": "string",
      "title": "Título directo",
      "description": "Análisis profundo de la deficiencia y el por qué del cambio.",
      "impact_reason": "Valor aportado",
      "original_text": "Cita exacta del CV",
      "suggested_text": "Propuesta optimizada"
    }}
  ]
}}
"""

# --- SERVICE FUNCTIONS ---


@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    retry=retry_if_exception_type((Exception,)),
    reraise=False
)
def _call_groq_api(prompt: str, system_msg: str, use_json: bool = True) -> Any:
    """Internal function to call Groq API with retry logic."""
    try:
        settings.raise_if_missing_ai_keys(["GROQ_API_KEY"])
        client = Groq(api_key=settings.GROQ_API_KEY)
        completion = client.chat.completions.create(
            model=MODEL_ID,
            messages=[
                {"role": "system", "content": system_msg},
                {"role": "user", "content": prompt},
            ],
            temperature=0.1,
            response_format={"type": "json_object"} if use_json else None,
        )
        message_content = completion.choices[0].message.content
        if message_content is None:
            raise ValueError("Empty response from AI")
        
        if use_json:
            try:
                return json.loads(message_content)
            except json.JSONDecodeError:
                logger.error(f"Failed to parse JSON from AI: {message_content}")
                return None
        return message_content

    except Exception as e:
        logger.error(f"Groq API Error: {str(e)}")
        raise


def _call_gemini_api(prompt: str, system_msg: str, use_json: bool = True) -> Any:
    """Internal function to call Google Gemini API as fallback."""
    try:
        settings.raise_if_missing_ai_keys(["GOOGLE_API_KEY"])

        client = genai.Client(api_key=settings.GOOGLE_API_KEY)
        
        # Combine system prompt with user prompt for Gemini (it handles system instructions differently but this is safe)
        full_prompt = f"{system_msg}\n\nUSER REQUEST:\n{prompt}"
        
        config = types.GenerateContentConfig(
            temperature=0.1,
            response_mime_type="application/json" if use_json else "text/plain"
        )

        response = client.models.generate_content(
            model='gemini-2.0-flash-exp', 
            contents=full_prompt,
            config=config
        )
        
        if not response.text:
             return None

        if use_json:
            try:
                # Gemini often wraps json in ```json ... ```
                clean_text = response.text.replace('```json', '').replace('```', '').strip()
                return json.loads(clean_text)
            except json.JSONDecodeError:
                logger.error(f"Failed to parse JSON from Gemini: {response.text}")
                return None
        
        return response.text

    except Exception as e:
        logger.error(f"Gemini API Error: {str(e)}")
        return None


def _get_mock_fallback(prompt: str, system_msg: str, use_json: bool = True) -> Any:
    """Return context-aware mock data when all AI providers fail."""
    logger.warning("All AI providers failed. Using Mock Fallback.")
    
    if not use_json:
        return "The AI service is currently unavailable (Offline Mode). Please try again later."
        
    if "CV JSON" in system_msg or "structured CV" in prompt:
        return {
            "personalInfo": {
                "fullName": "Johnathan Doe-Smith (Offline Mode)", 
                "summary": "This CV was generated in Offline Mode. Both Groq and Gemini services are currently unreachable.",
                "location": "San Francisco, CA",
                "email": "offline@example.com"
            },
            "experience": [
                {
                    "company": "Fallback Systems Inc.", 
                    "position": "Disaster Recovery Specialist", 
                    "startDate": "2024-01", 
                    "current": True,
                    "description": "System automatically engaged purely heuristic operational mode."
                }
            ],
            "skills": [{"name": "Resilience", "level": "Expert"}, {"name": "Fallback Logic", "level": "Advanced"}],
            "education": [],
            "languages": [],
            "projects": [],
            "certifications": []
        }
    elif "critique" in system_msg.lower() or "critique" in prompt.lower():
        return {
            "score": 99,
            "overall_verdict": "Offline Mode Active - Critique Unavailable",
            "critique": [{
                "id": "offline_1",
                "title": "Service Unavailable",
                "description": "All AI providers (Groq & Gemini) are down.",
                "severity": "Critical",
                "category": "System",
                "target_field": "system",
                "original_text": "N/A",
                "suggested_text": "Please check API quotas."
            }]
        }
    return {}


async def get_ai_completion(prompt: str, system_msg: str = None, use_json: bool = True):
    _raise_if_no_ai_provider()
    if system_msg is None:
        system_msg = get_system_rules()
    # 1. Try Groq (Primary)
    if settings.GROQ_API_KEY and settings.GROQ_API_KEY != "placeholder_key":
        loop = asyncio.get_event_loop()
        try:
            result = await loop.run_in_executor(
                None, _call_groq_api, prompt, system_msg, use_json
            )
        except Exception as e:
            logger.warning(f"Groq API failed after retries: {e}")
            result = None
        if result:
            return result

    # 2. Try Gemini (Fallback)
    if settings.GOOGLE_API_KEY and settings.GOOGLE_API_KEY != "placeholder_key":
        logger.info("Failing over to Gemini API...")
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(
            None, _call_gemini_api, prompt, system_msg, use_json
        )
        if result:
            return result

    # 3. Mock Fallback (Last Resort)
    return _get_mock_fallback(prompt, system_msg, use_json)


def _parse_ai_payload(response: Any) -> Optional[Dict[str, Any]]:
    """Convierte la respuesta de la IA en un diccionario, si es posible."""
    if isinstance(response, dict):
        return response
    if isinstance(response, str):
        try:
            return json.loads(response)
        except json.JSONDecodeError:
            return None
    return None


def _validate_ai_payload(model_cls: Any, payload: Optional[Dict[str, Any]], context: str) -> Optional[Any]:
    """Valida un payload con el modelo Pydantic indicado."""
    if not payload or not isinstance(payload, dict):
        logger.warning(f"[AI-VALIDATION] Payload inválido en {context}.")
        return None
    try:
        return model_cls.model_validate(payload)
    except PydanticValidationError as exc:
        logger.warning(f"[AI-VALIDATION] Error en {context}: {exc}")
        return None


async def extract_cv_data(text: str):
    prompt = EXTRACT_CV_PROMPT.format(text=text)
    raw_response = await get_ai_completion(prompt)
    parsed_response = _parse_ai_payload(raw_response)

    if parsed_response is None:
        retry_prompt = f"{prompt}\n\nIMPORTANTE: Devuelve solo JSON válido con el esquema exacto."
        parsed_response = _parse_ai_payload(await get_ai_completion(retry_prompt))

    if parsed_response is None:
        raise CVProcessingError(
            "No pudimos procesar tu CV en este momento. Por favor, intenta nuevamente."
        )

    normalized = _normalize_extracted_payload(parsed_response)
    candidate = _ensure_cv_schema(normalized)
    validated = _validate_ai_payload(CVData, candidate, "extract_cv_data")

    if not validated:
        retry_prompt = f"{prompt}\n\nIMPORTANTE: Devuelve solo JSON válido con el esquema exacto."
        retry_response = _parse_ai_payload(await get_ai_completion(retry_prompt))
        if retry_response:
            normalized = _normalize_extracted_payload(retry_response)
            candidate = _ensure_cv_schema(normalized)
            validated = _validate_ai_payload(CVData, candidate, "extract_cv_data_retry")

    if not validated:
        raise CVProcessingError(
            "La IA devolvió un formato incompatible. Intenta nuevamente en unos segundos."
        )

    return validated.model_dump(by_alias=True)

def _merge_experience_descriptions(
    original: List[Dict[str, Any]],
    updates: List[Dict[str, Any]],
) -> List[Dict[str, Any]]:
    merged = copy.deepcopy(original)
    for idx, update in enumerate(updates):
        if idx >= len(merged):
            break
        if isinstance(update, dict) and update.get("description"):
            merged[idx]["description"] = update["description"]
    return merged


def _ensure_cv_schema(cv_data: Dict[str, Any]) -> Dict[str, Any]:
    base = {
        "personalInfo": {
            "fullName": "",
            "email": None,
            "phone": None,
            "location": None,
            "summary": None,
            "website": None,
            "linkedin": None,
            "github": None,
        },
        "experience": [],
        "education": [],
        "skills": [],
        "projects": [],
        "languages": [],
        "certifications": [],
        "interests": [],
    }

    if not isinstance(cv_data, dict):
        return base

    merged = copy.deepcopy(base)

    personal = cv_data.get("personalInfo")
    if isinstance(personal, dict):
        cleaned_personal = {}
        for key, value in personal.items():
            if value is None:
                continue
            if key != "fullName" and value == "":
                cleaned_personal[key] = None
                continue
            cleaned_personal[key] = value
        merged["personalInfo"].update(cleaned_personal)

    for key in [
        "experience",
        "education",
        "skills",
        "projects",
        "languages",
        "certifications",
        "interests",
    ]:
        value = cv_data.get(key)
        if isinstance(value, list):
            merged[key] = value

    for key, value in cv_data.items():
        if key not in merged:
            merged[key] = value

    if not merged["personalInfo"].get("fullName"):
        merged["personalInfo"]["fullName"] = ""

    email_value = merged["personalInfo"].get("email")
    if email_value and not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", str(email_value)):
        merged["personalInfo"]["email"] = None

    phone_value = merged["personalInfo"].get("phone")
    if phone_value and not re.match(r"^[\+\(\)0-9\s-]{7,20}$", str(phone_value)):
        merged["personalInfo"]["phone"] = None

    for url_field in ["website", "linkedin", "github"]:
        url_value = merged["personalInfo"].get(url_field)
        if not url_value:
            continue
        if not str(url_value).startswith(("http://", "https://", "www.")):
            if "." in str(url_value):
                merged["personalInfo"][url_field] = f"https://{url_value}"
            else:
                merged["personalInfo"][url_field] = None

    return merged


def _apply_optimization_response(
    ai_response: Dict[str, Any],
    original_copy: Dict[str, Any],
    section: str,
    target: str,
) -> Dict[str, Any]:
    result_cv = copy.deepcopy(original_copy)

    def _normalize_skills_list(raw_skills: Any) -> Optional[List[Dict[str, Any]]]:
        skills = _normalize_list(raw_skills)
        skill_clean: List[Dict[str, Any]] = []
        for item in skills:
            if isinstance(item, str):
                name = _clean_text(item)
                if name:
                    skill_clean.append({"name": name, "level": "Intermediate"})
            elif isinstance(item, dict):
                name = _clean_text(item.get("name") or item.get("skill"))
                level = _clean_text(item.get("level")) or "Intermediate"
                if name:
                    skill_clean.append({"name": name, "level": level})
        return skill_clean or None

    # 1. Summary Optimization
    if section == "summary" or target == "summarize_profile":
        new_summary = ai_response.get("personalInfo", {}).get(
            "summary"
        ) or ai_response.get("summary")
        if new_summary:
            if target in {"shrink", "shorten", "compact"}:
                original_summary = original_copy.get("personalInfo", {}).get("summary", "")
                if original_summary and len(new_summary) > len(original_summary):
                    new_summary = original_summary
            result_cv["personalInfo"]["summary"] = new_summary

    # 2. Skills Optimization (always replace list if provided)
    elif section == "skills" or target == "suggest_skills":
        if "skills" in ai_response:
            normalized_skills = _normalize_skills_list(ai_response.get("skills"))
            if normalized_skills:
                result_cv["skills"] = normalized_skills

    # 3. One Page Optimizer (Full CV Replacement but keep contact info)
    elif target in ["one_page", "try_one_page"]:
        if "experience" in ai_response:
            # AI returned full sections, merge them
            for key in ["experience", "education", "skills", "projects", "languages", "certifications"]:
                if key in ai_response and isinstance(ai_response[key], list):
                    result_cv[key] = ai_response[key]
            if "personalInfo" in ai_response and "summary" in ai_response["personalInfo"]:
                result_cv["personalInfo"]["summary"] = ai_response["personalInfo"]["summary"]
            return result_cv

    # 4. Experience Optimization (Surgical description update)
    elif section == "experience":
        if "experience" in ai_response and isinstance(ai_response["experience"], list):
            original_experience = original_copy.get("experience", [])
            result_cv["experience"] = _merge_experience_descriptions(
                original_experience, ai_response["experience"]
            )

    # 5. Generic Section Optimization
    elif section in ai_response:
        result_cv[section] = ai_response[section]

    return result_cv


async def optimize_cv_data(cv_data: dict, target: str, section: str):
    original_copy = copy.deepcopy(cv_data)
    target = (target or "").lower()
    section = (section or "").lower()

    # Extract template info for context
    config = cv_data.get("config", {})
    template_id = config.get("template_id") or config.get("templateId") or "professional"
    layout = config.get("layout", {})
    density = layout.get("density", "standard")

    cv_json = json.dumps(cv_data, indent=2)

    # Detect language
    language_instruction = "Spanish if the input is Spanish, English if English."

    prompt = ""
    system_msg = get_system_rules()

    # Template awareness instruction
    template_context = f"\n- TARGET TEMPLATE: {template_id} (Density: {density})."
    if density == "compact" or template_id in ["terminal", "pure", "minimal"]:
        template_context += " Be extra concise. Use shorter bullet points."
    elif density == "relaxed" or template_id == "harvard":
        template_context += " You can be more descriptive and detailed."

    # ROUTING LOGIC
    if section == "summary" or target == "summarize_profile":
        if target in {"shrink", "shorten", "compact"}:
            prompt = SUMMARY_SHRINK_PROMPT.format(
                cv_json=cv_json, language=language_instruction
            )
        else:
            prompt = SUMMARIZE_PROMPT.format(
                cv_json=cv_json, language=language_instruction
        ) + template_context

    elif section == "skills" or target == "suggest_skills":
        prompt = SUGGEST_SKILLS_PROMPT.format(
            cv_json=cv_json, language=language_instruction
        ) + template_context

    elif target == "one_page" or target == "try_one_page":
        prompt = ONE_PAGE_OPTIMIZER_PROMPT.format(cv_json=cv_json) + template_context

    elif section == "experience":
        if target in {"shrink", "shorten", "compact"}:
            prompt = EXPERIENCE_SHRINK_PROMPT.format(cv_json=cv_json)
        else:
            prompt = EXPERIENCE_IMPROVE_PROMPT.format(cv_json=cv_json) + template_context

    else:
        # Fallback to generic optimization
        # Use a simpler generic prompt if needed, or re-use the old logic structure
        GENERIC_OPTIMIZE_PROMPT = """
        Task: Improve the writing and impact of the '{section}' section.
        Target goal: {target}
        
        Rules:
        1. Use active voice and strong verbs (e.g. "Spearheaded", "Architected").
        2. Fix grammar and clarity.
        3. Do NOT invent facts.
        4. Language: Same as input.
        
        Input CV:
        {cv_json}
        
        Return JSON with the updated '{section}'.
        """
        prompt = GENERIC_OPTIMIZE_PROMPT.format(
            target=target, section=section, cv_json=cv_json
        )

    ai_response = await get_ai_completion(prompt, system_msg)

    if not ai_response or not isinstance(ai_response, dict):
        return original_copy

    result_cv = _apply_optimization_response(ai_response, original_copy, section, target)
    validated = _validate_ai_payload(CVData, result_cv, "optimize_cv_data")

    if not validated:
        retry_prompt = f"{prompt}\n\nIMPORTANTE: Devuelve solo JSON válido con el esquema exacto."
        retry_response = await get_ai_completion(retry_prompt, system_msg)
        if isinstance(retry_response, dict):
            result_cv = _apply_optimization_response(
                retry_response, original_copy, section, target
            )
            validated = _validate_ai_payload(CVData, result_cv, "optimize_cv_data_retry")

    if not validated:
        raise CVProcessingError(
            "No pudimos validar la optimización del CV. Intenta nuevamente."
        )

    return validated.model_dump(by_alias=True)


def _collect_cv_text(cv_data: dict) -> str:
    parts: List[str] = []
    personal = cv_data.get("personalInfo", {})
    for field in ["fullName", "email", "phone", "location", "role", "summary", "website", "linkedin", "github"]:
        value = personal.get(field)
        if value:
            parts.append(str(value))

    for list_field in ["experience", "education", "skills", "projects", "languages", "certifications", "interests"]:
        items = cv_data.get(list_field, [])
        if not isinstance(items, list):
            continue
        for item in items:
            if isinstance(item, dict):
                for value in item.values():
                    if isinstance(value, str):
                        parts.append(value)
                    elif isinstance(value, list):
                        parts.extend([str(v) for v in value if isinstance(v, str)])
            elif isinstance(item, str):
                parts.append(item)

    return " ".join(parts)


def _estimate_word_count(cv_data: dict) -> int:
    text = _collect_cv_text(cv_data)
    return len(re.findall(r"\b\w+\b", text))


def _shorten_text(text: str, max_words: int) -> str:
    words = text.split()
    if len(words) <= max_words:
        return text
    return " ".join(words[:max_words]).rstrip(" ,.;:") + "..."


def _build_rule_based_critique(cv_data: dict, language_code: str) -> List[Dict[str, Any]]:
    labels = {
        "es": {
            "brevity": "Brevedad",
            "impact": "Impacto",
            "critical": "Crítico",
            "suggested": "Sugerido",
            "summary_title": "Resumen demasiado largo",
            "summary_desc": "El resumen pierde fuerza porque es largo y diluye tu propuesta de valor.",
            "summary_impact": "Un resumen breve aumenta la retención en la primera lectura.",
            "metrics_title": "Faltan métricas en la experiencia",
            "metrics_desc": "Sin números, el impacto se percibe como genérico.",
            "metrics_impact": "Las métricas convierten tareas en resultados tangibles.",
            "metrics_placeholder": "impacto: +[métrica]",
        },
        "en": {
            "brevity": "Brevity",
            "impact": "Impact",
            "critical": "Critical",
            "suggested": "Suggested",
            "summary_title": "Summary is too long",
            "summary_desc": "The summary feels diluted because it is too long.",
            "summary_impact": "A concise summary improves first-pass retention.",
            "metrics_title": "Missing metrics in experience",
            "metrics_desc": "Without numbers, impact reads as generic.",
            "metrics_impact": "Metrics turn tasks into measurable outcomes.",
            "metrics_placeholder": "impact: +[metric]",
        },
    }
    lang_labels = labels["es"] if language_code == "es" else labels["en"]

    results: List[Dict[str, Any]] = []
    summary = (cv_data.get("personalInfo", {}) or {}).get("summary", "") or ""
    summary_words = len(summary.split())
    if summary and summary_words > 70:
        results.append({
            "id": uuid.uuid4().hex[:8],
            "target_field": "personalInfo.summary",
            "category": lang_labels["brevity"],
            "severity": lang_labels["suggested"],
            "title": lang_labels["summary_title"],
            "description": lang_labels["summary_desc"],
            "impact_reason": lang_labels["summary_impact"],
            "original_text": summary,
            "suggested_text": _shorten_text(summary, 45),
        })

    experience = cv_data.get("experience", []) or []
    description_index = None
    description_text = ""
    for idx, item in enumerate(experience):
        if isinstance(item, dict):
            desc = item.get("description") or ""
            if isinstance(desc, str) and desc.strip():
                description_index = idx
                description_text = desc
                break

    if description_text:
        has_metrics = any(
            re.search(r"\d", (item.get("description") or "")) 
            for item in experience 
            if isinstance(item, dict)
        )
        if not has_metrics:
            results.append({
                "id": uuid.uuid4().hex[:8],
                "target_field": f"experience.{description_index}.description",
                "category": lang_labels["impact"],
                "severity": lang_labels["critical"],
                "title": lang_labels["metrics_title"],
                "description": lang_labels["metrics_desc"],
                "impact_reason": lang_labels["metrics_impact"],
                "original_text": description_text,
                "suggested_text": f"{description_text.rstrip('.')} ({lang_labels['metrics_placeholder']})",
            })

    return results


def _normalize_critique_response(cv_data: dict, ai_response: Any) -> Dict[str, Any]:
    response = ai_response if isinstance(ai_response, dict) else {}

    language_code = _detect_language(_collect_cv_text(cv_data))
    fallback_title = "Mejora sugerida" if language_code == "es" else "Suggested improvement"
    allowed_categories = {
        "impact": "Impact",
        "impacto": "Impacto",
        "brevity": "Brevity",
        "brevedad": "Brevedad",
        "grammar": "Grammar",
        "gramática": "Gramática",
        "formato": "Formato",
        "formatting": "Formatting",
    }
    allowed_severities = {
        "critical": "Critical",
        "crítico": "Crítico",
        "suggested": "Suggested",
        "sugerido": "Sugerido",
        "nitpick": "Nitpick",
        "detalle": "Detalle",
    }

    word_count_estimate = response.get("word_count_estimate")
    if not isinstance(word_count_estimate, int):
        word_count_estimate = _estimate_word_count(cv_data)

    one_page_viable = response.get("one_page_viable")
    if not isinstance(one_page_viable, bool):
        one_page_viable = word_count_estimate <= 750

    raw_critique = response.get("critique") if isinstance(response.get("critique"), list) else []
    def _normalize_card(card: Dict[str, Any]) -> Dict[str, Any]:
        raw_category = (card.get("category") or "").strip()
        raw_severity = (card.get("severity") or "").strip()
        normalized_category = allowed_categories.get(raw_category.lower())
        normalized_severity = allowed_severities.get(raw_severity.lower())

        return {
            "id": card.get("id") or uuid.uuid4().hex[:8],
            "target_field": card.get("target_field") or "personalInfo.summary",
            "category": normalized_category or ("Impacto" if language_code == "es" else "Impact"),
            "severity": normalized_severity or ("Sugerido" if language_code == "es" else "Suggested"),
            "title": card.get("title") or fallback_title,
            "description": card.get("description") or "",
            "impact_reason": card.get("impact_reason") or "",
            "original_text": card.get("original_text") or "",
            "suggested_text": card.get("suggested_text") or "",
        }

    critique: List[Dict[str, Any]] = []
    for item in raw_critique:
        if isinstance(item, dict):
            critique.append(_normalize_card(item))

    rule_based = _build_rule_based_critique(cv_data, language_code)

    existing_keys = {(c.get("target_field"), c.get("title")) for c in critique if isinstance(c, dict)}
    for item in rule_based:
        key = (item.get("target_field"), item.get("title"))
        if key not in existing_keys:
            critique.append(_normalize_card(item))
            existing_keys.add(key)

    if not critique:
        critique = [_normalize_card(item) for item in rule_based]

    critical_count = sum(
        1 for c in critique if c.get("severity") in {"Critical", "Crítico"}
    )

    score = response.get("score")
    if not isinstance(score, int):
        score = 72

    if critical_count >= 3:
        score = min(score, 70)
    elif critical_count == 2:
        score = min(score, 78)
    elif critical_count == 1:
        score = min(score, 88)

    if word_count_estimate > 850:
        score = min(score, 75)
    if not one_page_viable:
        score = min(score, 80)

    score = max(20, min(score, 95))

    overall_verdict = response.get("overall_verdict")
    if not isinstance(overall_verdict, str) or not overall_verdict.strip():
        if language_code == "es":
            overall_verdict = (
                "Tu CV tiene buen potencial, pero aún hay puntos críticos que frenan el impacto. "
                "Corregí las mejoras marcadas para subir tu score."
            )
        else:
            overall_verdict = (
                "Your CV has solid potential, but critical gaps are holding back impact. "
                "Fix the flagged items to raise your score."
            )

    return {
        "score": score,
        "one_page_viable": one_page_viable,
        "word_count_estimate": word_count_estimate,
        "overall_verdict": overall_verdict,
        "critique": critique,
    }


async def critique_cv_data(cv_data: dict):
    cv_json = json.dumps(cv_data, indent=2)
    prompt = SENTINEL_CRITIQUE_PROMPT.format(cv_json=cv_json)
    ai_response = await get_ai_completion(prompt)
    normalized = _normalize_critique_response(cv_data, ai_response)
    validated = _validate_ai_payload(CritiqueResponse, normalized, "critique_cv_data")

    if not validated:
        retry_prompt = f"{prompt}\n\nIMPORTANTE: Devuelve solo JSON válido con el esquema exacto."
        retry_response = await get_ai_completion(retry_prompt)
        normalized = _normalize_critique_response(cv_data, retry_response)
        validated = _validate_ai_payload(CritiqueResponse, normalized, "critique_cv_data_retry")

    if not validated:
        raise CVProcessingError(
            "No pudimos validar el análisis del CV. Intenta nuevamente."
        )

    return validated.model_dump(by_alias=True)


async def optimize_for_role(cv_data: dict, target_role: str):
    """Optimize CV for a specific target job role."""
    original_copy = copy.deepcopy(cv_data)

    # Extract template info for context
    config = cv_data.get("config", {})
    template_id = config.get("template_id") or config.get("templateId") or "professional"
    layout = config.get("layout", {})
    density = layout.get("density", "standard")

    cv_json = json.dumps(cv_data, indent=2)
    language_instruction = "Spanish if the input is Spanish, English if English."

    # Adjust prompt based on template density
    verbosity_instruction = ""
    if density == "compact" or template_id in ["terminal", "pure", "minimal"]:
        verbosity_instruction = "\n- DENSITY ALERT: Use extra-concise bullet points for this compact template."

    ai_response = await get_ai_completion(
        ROLE_ALIGNMENT_PROMPT.format(
            target_role=target_role,
            cv_json=cv_json,
            language=language_instruction,
            current_date=datetime.now().strftime("%Y-%m-%d"),
        ) + verbosity_instruction
    )

    if not ai_response or not isinstance(ai_response, dict):
        logger.warning(f"Role optimization failed for role: {target_role}")
        return original_copy

    # SURGICAL MERGE: Ensure we don't lose whole sections if AI returns partial data
    result_cv = copy.deepcopy(original_copy)

    sections = [
        "experience", "education", "skills", "projects",
        "languages", "certifications", "interests", "tools"
    ]

    for section in sections:
        if section in ai_response and isinstance(ai_response[section], list):
            result_cv[section] = ai_response[section]

    # Handle personalInfo summary specifically
    if "personalInfo" in ai_response and isinstance(ai_response["personalInfo"], dict):
        if "summary" in ai_response["personalInfo"]:
            result_cv["personalInfo"]["summary"] = ai_response["personalInfo"]["summary"]
        if "role" in ai_response["personalInfo"]:
            result_cv["personalInfo"]["role"] = ai_response["personalInfo"]["role"]

    # Identity Lock: Restore critical fields to avoid hallucinations
    if "personalInfo" in original_copy:
        for field in ["fullName", "email", "phone", "location", "linkedin", "github"]:
            result_cv["personalInfo"][field] = original_copy["personalInfo"].get(field, "")

    # Final validation pass
    try:
        candidate = _ensure_cv_schema(result_cv)
        validated = _validate_ai_payload(CVData, candidate, "optimize_for_role")
        return validated.model_dump(by_alias=True) if validated else result_cv
    except Exception as e:
        logger.error(f"Validation failed in optimize_for_role: {e}")
        return result_cv


LINKEDIN_PROMPT = """
Actúa como un experto en Personal Branding de élite. 
Escribe un post de LinkedIn VIRAL y PROFESIONAL para este CV: {cv_json}

ESTRUCTURA OBLIGATORIA:
1. HOOK: Una frase provocadora o un logro masivo (ej. "Pasé de X a Y..." o "Después de 5 años en...").
2. CUERPO: 3 puntos de valor "punchy" usando emojis minimalistas.
3. PERSONALIDAD: Menciona una pasión o skill blanda que los haga humanos.
4. CTA: "Si buscas a alguien que [PROBLEMA QUE RESUELVEN], hablemos."
5. HASHTAGS: 3 relevantes (ej. #TechTrends #OpenToWork).

REGLAS:
- Máximo 150 palabras.
- Tono: Seguro, no desesperado.
- Idioma: El mismo del CV.

Return JSON: {{ "post_content": "texto aquí" }}
"""


async def generate_linkedin_post(cv_data: dict):
    cv_json = json.dumps(cv_data, indent=2)
    return await get_ai_completion(LINKEDIN_PROMPT.format(cv_json=cv_json))


# --- COVER LETTER GENERATION ---

COVER_LETTER_PROMPT = """
Genera una Carta de Presentación profesional basada en este CV para una empresa específica.

DATOS DEL CANDIDATO:
{cv_json}

INFORMACIÓN DE LA POSTULACIÓN:
- Empresa: {company_name}
- Destinatario: {recipient_name}
- Descripción del puesto (si aplica): {job_description}
- Tono: {tone}

REGLAS:
1. La carta debe ser concisa (máximo 400 palabras).
2. No inventar experiencia o logros que no estén en el CV.
3. Destacar habilidades y experiencias RELEVANTES para el puesto.
4. Mantener el mismo IDIOMA del CV.
5. El saludo debe ser apropiado según el tono (formal, semi-formal, friendly).

ESTRUCTURA:
- Saludo inicial (apropiado al tono)
- Párrafo de apertura: Quién es y por qué aplica a ESTE puesto en ESTA empresa
- Párrafo de valor: 2-3 razones por las que es ideal (basado en su experiencia)
- Cierre: Llama a la acción y ofrece disponibilidad

Return JSON con la estructura exacta:
{{
  "opening": "Estimado/a [Nombre], o variant según tono",
  "body": "Párrafos completos de la carta...",
  "closing": "Frase de cierre profesional...",
  "signature": "Atentamente, [Nombre] o variant"
}}
"""


async def generate_cover_letter(
    cv_data: dict,
    company_name: str,
    recipient_name: str,
    job_description: str = "",
    tone: str = "formal",
):
    cv_json = json.dumps(cv_data, indent=2)
    prompt = COVER_LETTER_PROMPT.format(
        cv_json=cv_json,
        company_name=company_name,
        recipient_name=recipient_name,
        job_description=job_description or "No especificada",
        tone=tone,
    )
    return await get_ai_completion(
        prompt,
        system_msg="Eres un experto en redacción de cartas de presentación profesionales.",
    )


# --- ATS CHECKER ---

# =============================================================================
# FIELD-CONTEXTUAL VALIDATION SYSTEM
# =============================================================================
# This module implements strict industry-specific validation for ATS checking.
# Key principles:
# 1. Every recommendation must be relevant to the selected industry
# 2. Irrelevant technical suggestions are suppressed for non-technical roles
# 3. Resume content is verified against selected industry indicators
# 4. Mismatches between resume content and selected industry are flagged
# =============================================================================

INDUSTRY_KEYWORDS = {
    "tech": {
        "name": "Tecnología / IT / Desarrollo de Software",
        "keywords": [
            "Python",
            "JavaScript",
            "TypeScript",
            "React",
            "Angular",
            "Vue.js",
            "Node.js",
            "Django",
            "Flask",
            "FastAPI",
            "Spring Boot",
            "SQL",
            "NoSQL",
            "MongoDB",
            "PostgreSQL",
            "MySQL",
            "Redis",
            "Git",
            "GitHub",
            "GitLab",
            "AWS",
            "Azure",
            "GCP",
            "Docker",
            "Kubernetes",
            "Terraform",
            "CI/CD",
            "Jenkins",
            "GitHub Actions",
            "API",
            "REST",
            "GraphQL",
            "gRPC",
            "Agile",
            "Scrum",
            "Kanban",
            "Machine Learning",
            "TensorFlow",
            "PyTorch",
            "NLP",
            "Full Stack",
            "Backend",
            "Frontend",
            "DevOps",
            "Cloud",
            "Microservices",
            "Architecture",
            "Testing",
            "Unit Testing",
            "TDD",
            "Security",
            "OAuth",
            "JWT",
        ],
        "focus": "habilidades técnicas, tecnologías específicas, proyectos de código, metodologías ágiles, arquitectura de sistemas",
        "structure": "Priorizar sección de Skills y Proyectos técnicos. Usar un formato cronológico inverso claro.",
        # Terms that SHOULD NOT be suggested for tech industry
        "anti_keywords": [
            "Photoshop",
            "Illustrator",
            "Figma",
            "Branding",
            "Copywriting",
            "Paciente",
            "Clínica",
            "Auditoría",
            "Contabilidad",
            "Docencia",
            "Curriculum",
            "Pedagogía",
        ],
        # Words that indicate genuine tech experience
        "content_indicators": [
            "desarroll",
            "program",
            "code",
            "coding",
            "software",
            "engineer",
            "developer",
            "frontend",
            "backend",
            "fullstack",
            "api",
            "database",
            "server",
            "deploy",
            "cloud",
            "aws",
            "azure",
            "docker",
            "kubernetes",
            "git",
            "framework",
            "javascript",
            "python",
            "java",
            "react",
            "node",
            "sql",
            "nosql",
        ],
    },
    "finance": {
        "name": "Finanzas / Banca / Contabilidad",
        "keywords": [
            "Excel",
            "Análisis financiero",
            "Contabilidad",
            "Presupuestos",
            "Auditoría",
            "Reporting",
            "SAP",
            "ERP",
            "Compliance",
            "Riesgo",
            "Inversiones",
            "Balance",
            "P&L",
            "Forecasting",
            "Power BI",
            "Tableau",
            "KPIs",
            "Due Diligence",
            "Regulación",
            "IFRS",
            "GAAP",
            "Tesorería",
            "Cash Flow",
            "Modelado financiero",
            "Valoración",
            "M&A",
            "Fusiones",
            "Adquisiciones",
            "Crédito",
            "Financiamiento",
            "Capital",
            "Rentabilidad",
            "Margen",
            "ROI",
        ],
        "focus": "análisis numérico, herramientas de reporting, regulaciones financieras, experiencia en auditoría y compliance, modelado financiero",
        "structure": "Enfatizar certificaciones (CFA, CPA) y logros cuantificables con métricas financieras precisas.",
        # Terms that SHOULD NOT be suggested for finance industry
        "anti_keywords": [
            "Photoshop",
            "Illustrator",
            "Figma",
            "React",
            "Node.js",
            "JavaScript",
            "Python",
            "Docker",
            "Kubernetes",
            "Paciente",
            "Clínica",
            "Docencia",
            "Curriculum",
            "Pedagogía",
            "Portfolio",
            "Branding",
        ],
        # Words that indicate genuine finance experience
        "content_indicators": [
            "financiero",
            "contabil",
            "auditor",
            "presupuesto",
            "balance",
            "p&l",
            "forecast",
            "reporting",
            "excel",
            "sap",
            "erp",
            "compliance",
            "riesgo",
            "inversion",
            "valoracion",
            "tesoreria",
            "cash flow",
            "credito",
            "banca",
            "acciones",
            "bolsa",
        ],
    },
    "healthcare": {
        "name": "Salud / Medicina / Enfermería",
        "keywords": [
            "Paciente",
            "Clínica",
            "Hospital",
            "Diagnóstico",
            "Tratamiento",
            "Historial clínico",
            "HIPAA",
            "Emergencias",
            "Farmacología",
            "Enfermería",
            "Cirugía",
            "Laboratorio",
            "Radiología",
            "Atención primaria",
            "Cuidados intensivos",
            "Protocolos",
            "Esterilización",
            "Signos vitales",
            "Triage",
            "Medicina",
            "Farmacia",
            "Terapia",
            "Rehabilitación",
            "Epic",
            "Cerner",
            "Medication",
            "Patient care",
            "Clinical",
            "Healthcare",
        ],
        "focus": "certificaciones médicas, experiencia clínica, atención al paciente, protocolos de seguridad, cumplimiento regulatorio",
        "structure": "Destacar licencias y certificaciones al inicio. Listar rotaciones clínicas detalladas si es perfil junior.",
        # Terms that SHOULD NOT be suggested for healthcare industry
        "anti_keywords": [
            "Photoshop",
            "Illustrator",
            "Figma",
            "React",
            "Node.js",
            "JavaScript",
            "Python",
            "Docker",
            "Kubernetes",
            "API",
            "DevOps",
            "AWS",
            "Auditoría",
            "Contabilidad",
            "Docencia",
            "Curriculum",
        ],
        # Words that indicate genuine healthcare experience
        "content_indicators": [
            "paciente",
            "clinica",
            "hospital",
            "medico",
            "enfermer",
            "diagnostic",
            "tratamiento",
            "terapia",
            "farmaco",
            "cirugia",
            "laboratorio",
            "radiologia",
            "cuidado",
            "hipaa",
            "epic",
            "cerner",
            "historial",
            "signos vitales",
            "triage",
        ],
    },
    "creative": {
        "name": "Diseño / Marketing / Comunicación",
        "keywords": [
            "Photoshop",
            "Illustrator",
            "InDesign",
            "Figma",
            "Sketch",
            "UI/UX",
            "Branding",
            "Identidad visual",
            "Copywriting",
            "SEO",
            "SEM",
            "Social Media",
            "Campañas",
            "Estrategia digital",
            "Google Ads",
            "Facebook Ads",
            "Content Marketing",
            "Email Marketing",
            "Creatividad",
            "Portfolio",
            "Adobe Creative Suite",
            "Canva",
            "Motion Graphics",
            "Video",
            "Fotografía",
            "Dirección de arte",
            "Packaging",
            "Tipografía",
            "Colorimetría",
            "Storytelling",
            "Engagement",
            "Conversion",
        ],
        "focus": "portfolio de trabajos, herramientas de diseño, métricas de campañas, creatividad y storytelling visual, identidad de marca",
        "structure": "Incluir enlace prominente al Portfolio. Secciones de Skills visuales y herramientas de diseño son críticas.",
        # Terms that SHOULD NOT be suggested for creative industry
        "anti_keywords": [
            "React",
            "Node.js",
            "JavaScript",
            "Python",
            "Docker",
            "Kubernetes",
            "AWS",
            "API",
            "DevOps",
            "CI/CD",
            "Auditoría",
            "Contabilidad",
            "Paciente",
            "Clínica",
            "Docencia",
        ],
        # Words that indicate genuine creative experience
        "content_indicators": [
            "diseño",
            "diseno",
            "grafico",
            "visual",
            "brand",
            "identidad",
            "ux",
            "ui",
            "fotografia",
            "video",
            "motion",
            "animacion",
            "ilustracion",
            "arte",
            "tipografia",
            "marketing",
            "campana",
            "seo",
            "copywriting",
            "contenido",
            "social media",
        ],
    },
    "education": {
        "name": "Educación / Docencia / Capacitación",
        "keywords": [
            "Docencia",
            "Curriculum",
            "Planificación",
            "Evaluación",
            "Pedagogía",
            "E-learning",
            "Moodle",
            "Canvas",
            "Blackboard",
            "Estudiantes",
            "Aula",
            "Didáctica",
            "Capacitación",
            "Tutoría",
            "Metodología",
            "Inclusión",
            "NEE",
            "Desarrollo curricular",
            "Materiales didácticos",
            "Formación profesional",
            "Certificaciones",
            "SQA",
            "Competencias",
            "Aprendizaje",
            "Enseñanza",
            "Evaluación",
            "Calificaciones",
            "Tesis",
            "Investigación educativa",
        ],
        "focus": "experiencia docente, metodologías educativas, gestión de aula, desarrollo de programas, formación de competencias",
        "structure": "Enfatizar filosofía educativa y publicaciones. Detallar niveles de enseñanza y materias impartidas.",
        # Terms that SHOULD NOT be suggested for education industry
        "anti_keywords": [
            "React",
            "Node.js",
            "JavaScript",
            "Python",
            "Docker",
            "Kubernetes",
            "AWS",
            "API",
            "DevOps",
            "Photoshop",
            "Illustrator",
            "Branding",
            "Paciente",
            "Clínica",
            "Auditoría",
        ],
        # Words that indicate genuine education experience
        "content_indicators": [
            "docencia",
            "docente",
            "enseñanza",
            "educacion",
            "curriculum",
            "pedagog",
            "aula",
            "estudiante",
            "alumno",
            "evaluacion",
            "didactica",
            "tutoria",
            "capacitacion",
            "formacion",
            "moodle",
            "e-learning",
            "curso",
        ],
    },
    "general": {
        "name": "General / Multiindustria",
        "keywords": [
            "Liderazgo",
            "Gestión",
            "Comunicación",
            "Trabajo en equipo",
            "Organización",
            "Resolución de problemas",
            "Excel",
            "Inglés",
            "Atención al cliente",
            "Ventas",
            "Negociación",
            "Planificación",
            "Adaptabilidad",
            "Proactividad",
            "Gestión de proyectos",
            "Análisis",
            "Microsoft Office",
            "PowerPoint",
            "Word",
            "Outlook",
            "CRM",
            "ERP",
            "Reporting",
            "KPIs",
            "Metas",
            "Objetivos",
            "Resultados",
        ],
        "focus": "habilidades transferibles, logros cuantificables, experiencia general relevante, competencias blandas",
        "structure": "Mantener un balance entre experiencia y habilidades. Asegurar que el resumen profesional sea muy claro.",
        # No specific anti-keywords for general - it's flexible
        "anti_keywords": [],
        # Generic indicators for any professional experience
        "content_indicators": [
            "gestion",
            "liderazgo",
            "proyecto",
            "equipo",
            "cliente",
            "ventas",
            "atencion",
            "comunicacion",
            "organizacion",
            "analisis",
            "planificacion",
        ],
    },
}


# =============================================================================
# CONTENT VERIFICATION HELPER FUNCTIONS
# =============================================================================

def check_resume_content_indicators(
    cv_text: str,
    industry: str,
    threshold: float = 0.2
) -> Dict[str, Any]:
    """
    Verifies if resume content contains indicators for the selected industry.

    Args:
        cv_text: Lowercase text of the resume
        industry: Selected industry key (e.g., 'tech', 'creative')
        threshold: Minimum ratio of indicators to keywords (default 20%)

    Returns:
        Dict with mismatch_detected, match_ratio, found_indicators, and recommendations
    """
    industry_data = INDUSTRY_KEYWORDS.get(industry, INDUSTRY_KEYWORDS["general"])
    indicators = industry_data.get("content_indicators", [])
    anti_keywords = industry_data.get("anti_keywords", [])

    # Count how many content indicators are present
    found_indicators = []
    for indicator in indicators:
        if indicator.lower() in cv_text:
            found_indicators.append(indicator)

    # Count anti-keywords that ARE present (these indicate OTHER industries)
    found_anti_keywords = []
    for anti_kw in anti_keywords:
        if anti_kw.lower() in cv_text:
            found_anti_keywords.append(anti_kw)

    # Calculate match ratio
    match_ratio = len(found_indicators) / max(len(indicators), 1)

    # Detect mismatch: few indicators but many anti-keywords
    mismatch_detected = (
        match_ratio < threshold and len(found_anti_keywords) > 0
    ) or (match_ratio < threshold and industry != "general")

    return {
        "mismatch_detected": mismatch_detected,
        "match_ratio": round(match_ratio, 3),
        "found_indicators": found_indicators,
        "found_anti_keywords": found_anti_keywords,
        "indicator_count": len(found_indicators),
        "anti_keyword_count": len(found_anti_keywords),
    }


def filter_anti_keywords_for_industry(
    keywords: List[str],
    industry: str,
) -> List[str]:
    """
    Filters out keywords that are anti-keywords for the selected industry.

    Args:
        keywords: List of suggested keywords
        industry: Selected industry key

    Returns:
        Filtered list without anti-keywords
    """
    industry_data = INDUSTRY_KEYWORDS.get(industry, INDUSTRY_KEYWORDS["general"])
    anti_keywords = industry_data.get("anti_keywords", [])

    # Create lowercase sets for case-insensitive matching
    anti_keywords_lower = {kw.lower() for kw in anti_keywords}

    filtered = [
        kw for kw in keywords if kw.lower() not in anti_keywords_lower
    ]

    return filtered


# =============================================================================
# ENHANCED ATS CHECKER PROMPT WITH STRICT VALIDATION
# =============================================================================

ATS_CHECKER_PROMPT = """
Actúa como un sistema ATS (Applicant Tracking System) profesional especializado en la industria de {industry_name}.

═══════════════════════════════════════════════════════════════════════════════
CRITICAL VALIDATION RULES - READ FIRST
═══════════════════════════════════════════════════════════════════════════════

1. CONTEXTUAL RELEVANCE: You MUST ONLY suggest keywords and recommendations
   that are RELEVANT to {industry_name}. Do NOT suggest keywords from other industries.

2. ANTI-KEYWORD SUPPRESSION: You MUST NOT recommend any of these terms for
   this industry because they are IRRELEVANT or COUNTER-PRODUCTIVE:
   {anti_keywords_list}

3. CONTENT VERIFICATION: Before making suggestions, verify that the resume
   actually contains INDICATORS for {industry_name}.
   - If the resume shows NO indicators for this industry, flag a MISMATCH
   - Content indicators found: {content_indicators_found}
   - Anti-keywords found: {anti_keywords_found}

4. MISMATCH DETECTION:
   - If mismatch_detected is true: Warn the user about the industry selection
   - Suggest the ACTUAL industry the resume appears to target
   - Do NOT force recommendations for a mismatched industry

═══════════════════════════════════════════════════════════════════════════════
INDUSTRY-SPECIFIC REQUIREMENTS
═══════════════════════════════════════════════════════════════════════════════

ENFOQUE PRINCIPAL: {industry_focus}
ESTRUCTURA RECOMENDADA: {industry_structure}

KEYWORDS ESPERADAS PARA ESTA INDUSTRIA (SOLO RELEVANTES):
{industry_keywords}

═══════════════════════════════════════════════════════════════════════════════
ANÁLISIS REQUERIDO
═══════════════════════════════════════════════════════════════════════════════

1. SCORE ATS (0-100): Basado en:
   - Formato: ¿Es el texto parseable (no imágenes, no tablas complejas)?
   - Keywords de {industry_name}: ¿Tiene palabras clave relevantes para ESTA industria?
   - Longitud: ¿Es apropiado (1-2 páginas)?
   - Contacto: ¿Tiene email y teléfono visibles?
   - Extras relevantes para {industry_name}: LinkedIn, portfolio, certificaciones específicas
   - CONTEXTUAL FIT: ¿Las recomendaciones coinciden con la industria seleccionada?

2. KEYWORDS ENCONTRADAS (RELEVANTES): Lista SOLO las skills y términos
   relevantes para {industry_name} que detectaste. NO incluyas anti-keywords.

3. KEYWORDS FALTANTES: Sugiere palabras clave que DEBERÍAN estar para
   destacar en {industry_name}. CRITICAL: Only suggest from the approved list.
   - Do NOT suggest: {anti_keywords_list}

4. PROBLEMAS DETECTADOS: Lista issues que podrían filtrar el CV en
   procesos de selección de {industry_name}

5. MEJORAS SUGERIDAS: Acciones concretas para mejorar el score en la
   industria de {industry_name}. Ensure all suggestions are contextual.

6. MISMATCH ANALYSIS (CRITICAL): If content_indicators_found is empty or
   anti_keywords_found is significant, explain the potential mismatch:
   - "Your resume appears to target [ACTUAL INDUSTRY] but you selected {industry_name}"
   - Suggest the correct industry based on resume content

7. GUARDRAILS DE CONSISTENCIA (MEJORAS PREVIAS):
   - Contexto de mejora previo (si existe): {improvement_context}
   - Si el CV actual incorpora mejoras claras sobre el contexto (keywords faltantes ahora presentes,
     issues resueltos o estructura más alineada a {industry_name}), el score debe reflejar una mejora
     tangible y no puede quedar igual o peor que el baseline.
   - Si NO hay mejoras claras, mantené el score sin inflarlo artificialmente.

═══════════════════════════════════════════════════════════════════════════════
IDIOMA Y FORMATO
═══════════════════════════════════════════════════════════════════════════════

IDIOMA: Responde en el mismo idioma del CV.

Return JSON exactamente así:
{{
  "ats_score": 0-100,
  "grade": "A/B/C/D/F",
  "summary": "Resumen de 1-2 oraciones evaluando el CV para {industry_name}",
  "format_score": 0-100,
  "keyword_score": 0-100,
  "completeness_score": 0-100,
  "found_keywords": ["keyword1", "keyword2", ...],
  "missing_keywords": ["keyword1", "keyword2", ...],
  "industry_recommendation": "{target_industry}",
  "mismatch_detected": boolean,
  "mismatch_warning": "Warning message if mismatch detected",
  "suggested_industry": "Actual industry if mismatch detected",
  "issues": [
    {{"severity": "high/medium/low", "message": "descripción del problema", "fix": "cómo solucionarlo"}}
  ],
  "quick_wins": ["acción 1", "acción 2"],
  "detailed_tips": "consejos específicos para mejorar el CV para {industry_name}",
  "relevance_justification": "Explicación de por qué cada sugerencia es relevante para {industry_name}"
}}

═══════════════════════════════════════════════════════════════════════════════
CV A ANALIZAR:
═══════════════════════════════════════════════════════════════════════════════
{cv_text}
"""

def _build_ats_rule_issues(cv_text: str, language_code: str) -> List[dict]:
    labels = {
        "es": {
            "missing_email": ("Falta email visible", "Agregá un email profesional en el encabezado."),
            "missing_phone": ("Falta teléfono visible", "Incluí un número de contacto claro en el encabezado."),
            "too_long": ("CV demasiado extenso", "Reducí contenido para mantener 1-2 páginas."),
        },
        "en": {
            "missing_email": ("Missing visible email", "Add a professional email in the header."),
            "missing_phone": ("Missing visible phone", "Include a clear contact number in the header."),
            "too_long": ("CV too long", "Reduce content to keep it within 1-2 pages."),
        },
    }
    lang_labels = labels["es"] if language_code == "es" else labels["en"]
    issues: List[dict] = []

    if not re.search(r"[\w\.-]+@[\w\.-]+\.\w+", cv_text):
        title, fix = lang_labels["missing_email"]
        issues.append({"severity": "high", "message": title, "fix": fix})

    if not re.search(r"\+?\d[\d\s().-]{7,}", cv_text):
        title, fix = lang_labels["missing_phone"]
        issues.append({"severity": "high", "message": title, "fix": fix})

    word_count = len(re.findall(r"\b\w+\b", cv_text))
    if word_count > 900:
        title, fix = lang_labels["too_long"]
        issues.append({"severity": "medium", "message": title, "fix": fix})

    return issues


async def analyze_ats(
    cv_text: str,
    target_industry: str = "general",
    improvement_context: Optional[str] = None,
):
    """
    Analyze CV for ATS compatibility in a specific industry with strict
    field-contextual validation.

    Args:
        cv_text: The resume text to analyze
        target_industry: The industry to check against (tech, finance, etc.)

    Returns:
        Dict with ATS analysis including mismatch detection and contextual recommendations
    """
    _raise_if_no_ai_provider()

    industry_data = INDUSTRY_KEYWORDS.get(target_industry, INDUSTRY_KEYWORDS["general"])

    # Perform content verification BEFORE generating the prompt
    cv_text_lower = cv_text.lower()
    verification_result = check_resume_content_indicators(
        cv_text_lower, target_industry
    )

    # Get anti-keywords for the selected industry
    anti_keywords = industry_data.get("anti_keywords", [])
    anti_keywords_list = ", ".join(anti_keywords) if anti_keywords else "None for this industry"

    # Format content indicators for the prompt
    content_indicators_found = ", ".join(verification_result["found_indicators"]) or "None detected"
    anti_keywords_found = ", ".join(verification_result["found_anti_keywords"]) or "None detected"

    # Build the prompt with all contextual information
    prompt = ATS_CHECKER_PROMPT.format(
        cv_text=cv_text,
        industry_name=industry_data["name"],
        industry_keywords=", ".join(industry_data["keywords"]),
        industry_focus=industry_data["focus"],
        industry_structure=industry_data.get("structure", "N/A"),
        target_industry=target_industry,
        anti_keywords_list=anti_keywords_list,
        content_indicators_found=content_indicators_found,
        anti_keywords_found=anti_keywords_found,
        improvement_context=improvement_context or "Sin contexto previo",
    )

    # Generate the analysis
    result = await get_ai_completion(
        prompt,
        system_msg=f"""Eres un sistema ATS experto especializado en la industria de {industry_data['name']}. 
        IMPORTANTE: 
        - Solo haz recomendaciones RELEVANTES para esta industria
        - NO sugieras términos técnicos (React, Node, Python, etc.) para roles no-técnicos
        - NO sugieras términos creativos (Photoshop, Branding, etc.) para roles no-creativos
        - NO sugieras términos financieros (Auditoría, Contabilidad, etc.) para roles no-financieros
        - NO sugieras términos médicos (Paciente, Clínica, etc.) para roles no-médicos
        - NO sugieras términos educativos (Docencia, Curriculum, etc.) para roles no-educativos
        - Sé riguroso y específico en tu análisis, enfocándote en lo que realmente importa para esta industria.
        - Si detectas un desbalance entre la industria seleccionada y el contenido del CV, adviértelo claramente.""",
    )

    if not result or not isinstance(result, dict):
        raise AIServiceError("ATS analysis failed to return valid results.")

    if not result.get("issues"):
        language_code = _detect_language(cv_text)
        fallback_issues = _build_ats_rule_issues(cv_text, language_code)
        if fallback_issues:
            result["issues"] = fallback_issues

    # Post-process to ensure anti-keywords are filtered from suggestions
    if result and "missing_keywords" in result:
        result["missing_keywords"] = filter_anti_keywords_for_industry(
            result["missing_keywords"],
            target_industry,
        )

    # Add verification metadata to the result
    if result:
        result["content_verification"] = {
            "mismatch_detected": verification_result["mismatch_detected"],
            "match_ratio": verification_result["match_ratio"],
            "found_indicators": verification_result["found_indicators"],
            "found_anti_keywords": verification_result["found_anti_keywords"],
        }

    return result




# --- CONVERSATIONAL ENGINE (MULTI-PROVIDER FALLBACK) ---

# gemini-2.0-flash-lite does NOT properly call functions (outputs as text)
# gemini-1.5-flash has reliable function calling support
GEMINI_MODEL_PRIMARY = "gemini-1.5-flash"
GEMINI_MODEL_FALLBACK = "gemini-2.0-flash-exp"  # More expensive but higher limits
GEMINI_MODEL = GEMINI_MODEL_PRIMARY

# Fallback tracking for this session
_gemini_quota_exhausted = False
_quota_error_count = 0
_last_quota_error_time: Optional[datetime] = None
_QUOTA_COOLDOWN_SECONDS = 60  # Retry Gemini after 60 seconds

def _should_retry_gemini() -> bool:
    """Check if we should retry Gemini after quota cooldown."""
    global _gemini_quota_exhausted, _last_quota_error_time
    
    if not _gemini_quota_exhausted:
        return True
    
    if _last_quota_error_time is None:
        return True
    
    elapsed = (datetime.utcnow() - _last_quota_error_time).total_seconds()
    if elapsed > _QUOTA_COOLDOWN_SECONDS:
        logger.info(f"[QUOTA-COOLDOWN] {elapsed:.0f}s elapsed. Resetting Gemini exhausted flag.")
        _gemini_quota_exhausted = False
        return True
    
    logger.debug(f"[QUOTA-COOLDOWN] Only {elapsed:.0f}s elapsed. Skipping Gemini, using fallback.")
    return False

def _gemini_supports_tools(model_id: str) -> bool:
    """Detecta si el modelo Gemini soporta function calling confiable."""
    return "flash-lite" not in model_id

GEMINI_SYSTEM_INSTRUCTION = """
YOU ARE: A world-class Executive Career Coach and Technical Recruiter with 20+ years of experience.
YOUR MISSION: Build an elite, high-impact CV through strategic conversation. You don't just "take notes"; you architect a career narrative that wins interviews at top-tier companies.

## CRITICAL BEHAVIOR - FUNCTION CALLING (MANDATORY):

**YOU MUST CALL FUNCTIONS. DO NOT WRITE FUNCTION NAMES IN YOUR TEXT RESPONSE.**

❌ WRONG: "I'll use update_resume_draft to save this..." (This is just text, data is LOST)
❌ WRONG: "(update_resume_draft: saving...)" (This is just text, data is LOST)  
✅ CORRECT: Actually invoke the `update_resume_draft` function with JSON parameters (data is SAVED)

### WHEN TO CALL `update_resume_draft`:
- User provides any information → IMMEDIATELY call the function.
- User wants to REMOVE something → CALL with `deletedItems`.
- User corrects info → CALL with the new values.

### WHEN TO CALL `update_visual_identity`:
- User asks about template, spacing, typography, colors, or section visibility → CALL with appropriate parameters.
- User wants a more compact or more airy layout → update `layout.density`, `sectionGap`, or `contentGap`.
- User wants to rename section titles (e.g., "Skills" → "Tecnologías") → update `sections`.

## CONVERSATION STYLE & PERSONALITY:
1. AUTHORITY & ADVICE: Act as a mentor. If a user provides weak info, say: "I've added this, but to make it stand out for [Role], we should quantify the impact. Did you manage a budget or a team size?"
2. "SHOW YOUR WORK": Briefly explain the strategic value of your changes. (e.g., "I've optimized your summary to lead with your 5 years of React experience—it's your strongest selling point.")
3. ACTION ORIENTED: Transform passive phrases into powerful results. "Fixed bugs" becomes "Optimized codebase performance, reducing latency by 15%."
4. CONCISE & FOCUSED: Ask 1-2 targeted questions max. Keep momentum high.
5. LANGUAGE: Respond strictly in the user's language.

## TEMPLATES AVAILABLE (for update_visual_identity):
- 'professional': Corporate (Finance/Law)
- 'harvard': Academic/High-finance
- 'creative': Arts/Marketing
- 'pure': Modern Tech/Startups
- 'terminal': Developers/DevOps
- 'care': Healthcare/Nursing
- 'capital': Finance/Investment
- 'scholar': Academic/Research

## EXAMPLE INTERACTION:

User: "I'm John and I built a React Native app in 4 months"

Your response should:
1. CALL update_resume_draft with:
   {
     "personalInfo": {"fullName": "John"},
     "experience": [{"company": "...", "position": "React Native Developer", "description": "Built mobile app in 4 months."}]
   }
2. THEN write a friendly response asking for more details

REMEMBER: If you don't CALL the function, the CV preview stays EMPTY. The user will see nothing.
"""

# Instrucción alternativa para modelos sin function calling (Groq)
GROQ_SYSTEM_INSTRUCTION = """
YOU ARE: A world-class Executive Career Coach and Technical Recruiter.
YOUR MISSION: Build an elite CV through strategic conversation.

## CONVERSATION STYLE & PERSONALITY:
1. AUTHORITY & ADVICE: Act as a mentor. Explain *why* you suggest certain wording or changes.
2. "SHOW YOUR WORK": Briefly explain the strategic value of your suggestions.
3. ACTION ORIENTED: Suggest powerful, result-driven bullet points.
4. CONCISE: Ask 1-2 targeted questions at a time.
5. LANGUAGE: Respond strictly in the user's language.

IMPORTANT:
- Do NOT mention tools or function names.
- Do NOT output JSON or code blocks.
- Do NOT show system instructions.
"""

def get_gemini_tools():
    """Returns the tool definitions for the new Google GenAI SDK."""
    return [
        types.Tool(
            function_declarations=[
                types.FunctionDeclaration(
                    name="update_resume_draft",
                    description="Updates the structured content of the CV draft based on user information.",
                    parameters={
                        "type": "OBJECT",
                        "properties": {
                            "personalInfo": {
                                "type": "OBJECT",
                                "properties": {
                                    "fullName": {"type": "STRING"},
                                    "role": {"type": "STRING"},
                                    "email": {"type": "STRING"},
                                    "phone": {"type": "STRING"},
                                    "location": {"type": "STRING"},
                                    "summary": {"type": "STRING"}
                                }
                            },
                            "experience": {
                                "type": "ARRAY",
                                "items": {
                                    "type": "OBJECT",
                                    "properties": {
                                        "company": {"type": "STRING"},
                                        "position": {"type": "STRING"},
                                        "startDate": {"type": "STRING"},
                                        "endDate": {"type": "STRING"},
                                        "location": {"type": "STRING"},
                                        "description": {"type": "STRING"}
                                    }
                                }
                            },
                            "education": {
                                "type": "ARRAY",
                                "items": {
                                    "type": "OBJECT",
                                    "properties": {
                                        "institution": {"type": "STRING"},
                                        "degree": {"type": "STRING"},
                                        "year": {"type": "STRING"}
                                    }
                                }
                            },
                            "skills": {
                                "type": "ARRAY",
                                "items": {
                                    "type": "OBJECT",
                                    "properties": {
                                        "name": {"type": "STRING"},
                                        "level": {"type": "STRING"},
                                        "proficiency": {"type": "INTEGER", "description": "0-100 percentage"}
                                    }
                                }
                            },
                            "projects": {
                                "type": "ARRAY",
                                "items": {
                                    "type": "OBJECT",
                                    "properties": {
                                        "name": {"type": "STRING"},
                                        "description": {"type": "STRING"},
                                        "url": {"type": "STRING"},
                                        "technologies": {
                                            "type": "ARRAY",
                                            "items": {"type": "STRING"}
                                        }
                                    }
                                }
                            },
                            "languages": {
                                "type": "ARRAY",
                                "items": {
                                    "type": "OBJECT",
                                    "properties": {
                                        "language": {"type": "STRING"},
                                        "fluency": {"type": "STRING", "enum": ["Native", "Fluent", "Conversational", "Basic"]}
                                    }
                                }
                            },
                            "certifications": {
                                "type": "ARRAY",
                                "items": {
                                    "type": "OBJECT",
                                    "properties": {
                                        "name": {"type": "STRING"},
                                        "issuer": {"type": "STRING"},
                                        "date": {"type": "STRING"}
                                    }
                                }
                            },
                            "interests": {
                                "type": "ARRAY",
                                "items": {
                                    "type": "OBJECT",
                                    "properties": {
                                        "name": {"type": "STRING"}
                                    }
                                }
                            },
                            "tools": {
                                "type": "ARRAY",
                                "items": {"type": "STRING"},
                                "description": "Software tools or systems (e.g., Jira, AWS, Git)"
                            },
                            "deletedItems": {
                                "type": "ARRAY",
                                "items": {
                                    "type": "OBJECT",
                                    "properties": {
                                        "section": {"type": "STRING", "enum": ["experience", "education", "skills", "projects", "languages", "certifications", "interests", "tools"]},
                                        "id": {"type": "STRING", "description": "The unique ID of the item to delete"},
                                        "name": {"type": "STRING", "description": "Name/Company of the item to delete if ID is unknown"}
                                    },
                                    "required": ["section"]
                                },
                                "description": "List of items the user wants to remove from their CV"
                            }
                        }
                    }
                ),
                types.FunctionDeclaration(
                    name="update_visual_identity",
                    description="Updates the visual style, template, and colors of the CV.",
                    parameters={
                        "type": "OBJECT",
                        "properties": {
                            "templateId": {
                                "type": "STRING",
                                "enum": ["professional", "harvard", "creative", "pure", "terminal", "care", "capital", "scholar"]
                            },
                            "colors": {
                                "type": "OBJECT",
                                "properties": {
                                    "primary": {"type": "STRING", "description": "Hex or OKLCH color for main elements"},
                                    "secondary": {"type": "STRING", "description": "Hex or OKLCH color for secondary elements"},
                                    "accent": {"type": "STRING", "description": "Hex or OKLCH color for accents"},
                                    "background": {"type": "STRING", "description": "Hex or OKLCH background color"},
                                    "text": {"type": "STRING", "description": "Hex or OKLCH text color"}
                                }
                            },
                            "fonts": {
                                "type": "OBJECT",
                                "properties": {
                                    "heading": {
                                        "type": "STRING",
                                        "enum": [
                                            "\"Inter\"",
                                            "\"Roboto\"",
                                            "\"Open Sans\"",
                                            "\"Lato\"",
                                            "\"Montserrat\"",
                                            "\"Playfair Display\"",
                                            "\"Raleway\"",
                                            "\"Source Sans Pro\"",
                                            "\"Fira Code\"",
                                            "\"Space Mono\""
                                        ]
                                    },
                                    "body": {
                                        "type": "STRING",
                                        "enum": [
                                            "\"Inter\"",
                                            "\"Roboto\"",
                                            "\"Open Sans\"",
                                            "\"Lato\"",
                                            "\"Montserrat\"",
                                            "\"Playfair Display\"",
                                            "\"Raleway\"",
                                            "\"Source Sans Pro\"",
                                            "\"Fira Code\"",
                                            "\"Space Mono\""
                                        ]
                                    }
                                }
                            },
                            "layout": {
                                "type": "OBJECT",
                                "properties": {
                                    "density": {"type": "STRING", "enum": ["compact", "standard", "relaxed"]},
                                    "sectionGap": {"type": "NUMBER", "description": "Espaciado entre secciones en px"},
                                    "contentGap": {"type": "NUMBER", "description": "Espaciado de contenido en px"},
                                    "fontSize": {"type": "NUMBER", "description": "Font size multiplier (0.7 to 1.3)"},
                                    "showExpertiseBar": {"type": "BOOLEAN"},
                                    "expertiseBarStyle": {"type": "STRING", "enum": ["dots", "bars", "gradient"]}
                                }
                            },
                            "sections": {
                                "type": "OBJECT",
                                "properties": {
                                    "summary": {"type": "OBJECT", "properties": {"visible": {"type": "BOOLEAN"}, "title": {"type": "STRING"}}},
                                    "experience": {"type": "OBJECT", "properties": {"visible": {"type": "BOOLEAN"}, "title": {"type": "STRING"}}},
                                    "education": {"type": "OBJECT", "properties": {"visible": {"type": "BOOLEAN"}, "title": {"type": "STRING"}}},
                                    "skills": {"type": "OBJECT", "properties": {"visible": {"type": "BOOLEAN"}, "title": {"type": "STRING"}}},
                                    "projects": {"type": "OBJECT", "properties": {"visible": {"type": "BOOLEAN"}, "title": {"type": "STRING"}}},
                                    "languages": {"type": "OBJECT", "properties": {"visible": {"type": "BOOLEAN"}, "title": {"type": "STRING"}}},
                                    "certifications": {"type": "OBJECT", "properties": {"visible": {"type": "BOOLEAN"}, "title": {"type": "STRING"}}},
                                    "interests": {"type": "OBJECT", "properties": {"visible": {"type": "BOOLEAN"}, "title": {"type": "STRING"}}},
                                    "tools": {"type": "OBJECT", "properties": {"visible": {"type": "BOOLEAN"}, "title": {"type": "STRING"}}}
                                }
                            }
                        }
                    }
                )
            ]
        )
    ]

async def generate_conversation_response(
    message: str,
    history: List[ChatMessage],
    cv_data: Dict[str, Any],
    current_phase: ConversationPhase,
    job_description: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Genera una respuesta conversacional para el chat del CV builder.
    """
    if not settings.GOOGLE_API_KEY or settings.GOOGLE_API_KEY == "placeholder_key":
        return {
            "response": "Lo siento, el servicio de IA no está disponible en este momento.",
            "extraction": None,
            "new_phase": None,
        }

    try:
        client = genai.Client(api_key=settings.GOOGLE_API_KEY)
        
        gemini_history = []
        for msg in history[-10:]:
            role = "user" if msg.role == "user" else "model"
            gemini_history.append(types.Content(role=role, parts=[types.Part(text=msg.content)]))

        language_code = _detect_language_preference(message, history)
        supports_tools = _gemini_supports_tools(GEMINI_MODEL)
        base_instruction = GEMINI_SYSTEM_INSTRUCTION if supports_tools else GROQ_SYSTEM_INSTRUCTION
        system_instruction = _apply_language_instruction(base_instruction, language_code)

        config_kwargs: Dict[str, Any] = {
            "system_instruction": system_instruction,
        }
        if supports_tools:
            config_kwargs["tools"] = get_gemini_tools()

        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=message,
            config=types.GenerateContentConfig(**config_kwargs)
        )

        response_text = response.text
        
        # Detectar nueva fase (mantenemos la lógica de heurística por ahora o confiamos en Gemini)
        new_phase = _detect_phase_transition(message, response_text, current_phase, cv_data)

        return {
            "response": response_text,
            "extraction": None,
            "new_phase": new_phase,
        }

    except Exception as e:
        logger.error(f"Error generating conversation response: {e}")
        return {
            "response": "Disculpa, tuve un problema procesando tu mensaje.",
            "extraction": None,
            "new_phase": None,
        }


async def generate_conversation_response_stream(
    message: str,
    history: List[ChatMessage],
    cv_data: Dict[str, Any],
    current_phase: ConversationPhase,
    job_description: Optional[str] = None,
) -> AsyncGenerator[str, None]:
    """
    Genera una respuesta conversacional en streaming (SSE).
    
    FALLBACK CHAIN:
    1. Gemini Flash Lite (fast, cheap) 
    2. Groq LLaMA 3.3 (fallback if Gemini quota exhausted)
    3. Heuristic Engine (offline mode, last resort)
    """
    _raise_if_no_ai_provider()
    global _gemini_quota_exhausted, _quota_error_count, _last_quota_error_time
    
    # Log entry for debugging
    logger.info(f"[CHAT-STREAM] New request | Phase: {current_phase} | Gemini exhausted: {_gemini_quota_exhausted}")
    
    # Detect language preference once per request
    language_code = _detect_language_preference(message, history)

    # =========================================================================
    # STRATEGY 1: Try Gemini (if not exhausted or cooldown elapsed)
    # =========================================================================
    if _should_retry_gemini() and settings.GOOGLE_API_KEY and settings.GOOGLE_API_KEY != "placeholder_key":
        try:
            logger.info("[AI-PROVIDER] Attempting Gemini Flash Lite...")
            
            client = genai.Client(api_key=settings.GOOGLE_API_KEY)
            
            gemini_history = []
            for msg in history[-10:]:
                role = "user" if msg.role == "user" else "model"
                gemini_history.append(types.Content(role=role, parts=[types.Part(text=msg.content)]))

            supports_tools = _gemini_supports_tools(GEMINI_MODEL_PRIMARY)
            base_instruction = GEMINI_SYSTEM_INSTRUCTION if supports_tools else GROQ_SYSTEM_INSTRUCTION
            system_instruction = _apply_language_instruction(base_instruction, language_code)

            config_kwargs: Dict[str, Any] = {
                "system_instruction": system_instruction,
            }
            if supports_tools:
                config_kwargs["tools"] = get_gemini_tools()
                # Force the model to call functions when appropriate
                config_kwargs["tool_config"] = types.ToolConfig(
                    function_calling_config=types.FunctionCallingConfig(
                        mode="AUTO"  # AUTO = model decides when to call functions
                    )
                )

            chat = client.chats.create(
                model=GEMINI_MODEL_PRIMARY,
                config=types.GenerateContentConfig(**config_kwargs),
                history=gemini_history
            )

            accumulated_content = ""
            last_extraction: Optional[DataExtraction] = None
            last_visual_update = None

            response_stream = chat.send_message_stream(message)

            for chunk in response_stream:
                # Log raw chunk for debugging
                logger.debug(f"[CHUNK] Text: {chunk.text[:100] if chunk.text else 'None'}...")
                
                if chunk.text:
                    accumulated_content += chunk.text
                    yield _format_sse_event({"type": "delta", "content": chunk.text})

                # Check for function calls in the response
                if chunk.candidates and chunk.candidates[0].content.parts:
                    for part in chunk.candidates[0].content.parts:
                        if hasattr(part, 'function_call') and part.function_call:
                            fn = part.function_call
                            fn_name = fn.name
                            fn_args = dict(fn.args) if fn.args else {}
                            
                            # ═══════════════════════════════════════════════════════════
                            # CRITICAL LOG: Function call detected!
                            # ═══════════════════════════════════════════════════════════
                            logger.info("="*60)
                            logger.info(f"[FUNCTION-CALL] Detected: {fn_name}")
                            logger.info(f"[FUNCTION-ARGS] {json.dumps(fn_args, indent=2, default=str)[:500]}")
                            logger.info("="*60)
                            
                            if fn_name == "update_resume_draft":
                                # Extract deletions if any
                                deleted_items = fn_args.pop("deletedItems", None)
                                normalized_payload = _normalize_extracted_payload(fn_args)
                                last_extraction = DataExtraction(
                                    extracted=normalized_payload,
                                    deleted_items=deleted_items,
                                    confidence={"overall": 1.0},
                                )
                                yield _format_sse_event({
                                    "type": "extraction",
                                    "extraction": last_extraction.model_dump(by_alias=True),
                                })
                            elif fn_name == "update_visual_identity":
                                last_visual_update = fn_args
                                yield _format_sse_event({"type": "visual_update", "config": fn_args})

            # Si no hubo function call, intentamos extracción con el extractor dedicado
            if last_extraction is None:
                fallback_extraction = await extract_cv_data_from_message(
                    message=message,
                    history=history,
                    cv_data=cv_data,
                    current_phase=current_phase,
                )
                if fallback_extraction and fallback_extraction.extracted:
                    last_extraction = fallback_extraction
                    yield _format_sse_event({
                        "type": "extraction",
                        "extraction": last_extraction.model_dump(by_alias=True),
                    })

            yield _format_sse_event({
                "type": "complete",
                "message": {
                    "id": f"msg_{datetime.utcnow().timestamp()}",
                    "role": "assistant",
                    "content": accumulated_content,
                    "timestamp": datetime.utcnow().isoformat(),
                },
                "finalExtraction": last_extraction.model_dump(by_alias=True) if last_extraction else None,
                "visualUpdate": last_visual_update,
                "provider": "gemini"
            })
            
            logger.info(f"[AI-PROVIDER] Gemini success | Response length: {len(accumulated_content)} chars")
            return  # Success, exit

        except Exception as e:
            error_str = str(e)
            is_quota_error = any(x in error_str for x in ["429", "RESOURCE_EXHAUSTED", "Quota exceeded", "quota", "limit"])
            
            if is_quota_error:
                _quota_error_count += 1
                _gemini_quota_exhausted = True
                _last_quota_error_time = datetime.utcnow()
                
                # ═══════════════════════════════════════════════════════════════
                # CONSOLE LOG: Quota exhaustion detected
                # ═══════════════════════════════════════════════════════════════
                logger.warning("="*60)
                logger.warning("[QUOTA-EXHAUSTED] Gemini Flash Lite token limit reached!")
                logger.warning(f"Error count: {_quota_error_count}")
                logger.warning(f"Error details: {error_str[:200]}")
                logger.warning(f"Cooldown: {_QUOTA_COOLDOWN_SECONDS}s before retrying Gemini")
                logger.warning("Switching to Groq fallback...")
                logger.warning("="*60)
            else:
                logger.error(f"[AI-PROVIDER] Gemini error (non-quota): {error_str}")

    # =========================================================================
    # STRATEGY 2: Try Groq as Fallback
    # =========================================================================
    if settings.GROQ_API_KEY and settings.GROQ_API_KEY != "placeholder_key":
        try:
            logger.info("[AI-PROVIDER] Attempting Groq LLaMA fallback...")
            
            # Build context for Groq (non-streaming, then emit as stream)
            groq_messages = [{"role": "system", "content": _apply_language_instruction(GROQ_SYSTEM_INSTRUCTION, language_code)}]
            for msg in history[-8:]:
                groq_messages.append({"role": msg.role, "content": msg.content})
            groq_messages.append({"role": "user", "content": message})
            
            client = Groq(api_key=settings.GROQ_API_KEY)
            
            # Stream from Groq
            stream = client.chat.completions.create(
                model=MODEL_ID,
                messages=groq_messages,
                temperature=0.7,
                stream=True,
            )
            
            accumulated_content = ""
            for chunk in stream:
                delta = chunk.choices[0].delta
                if delta.content:
                    accumulated_content += delta.content
                    yield _format_sse_event({"type": "delta", "content": delta.content})

            # Extraer datos estructurados después de la respuesta (Groq no tiene tools aquí)
            last_extraction: Optional[DataExtraction] = None
            fallback_extraction = await extract_cv_data_from_message(
                message=message,
                history=history,
                cv_data=cv_data,
                current_phase=current_phase,
            )
            if fallback_extraction and fallback_extraction.extracted:
                last_extraction = fallback_extraction
                yield _format_sse_event({
                    "type": "extraction",
                    "extraction": last_extraction.model_dump(by_alias=True),
                })
            
            yield _format_sse_event({
                "type": "complete",
                "message": {
                    "id": f"msg_{datetime.utcnow().timestamp()}_groq",
                    "role": "assistant",
                    "content": accumulated_content,
                    "timestamp": datetime.utcnow().isoformat(),
                },
                "finalExtraction": last_extraction.model_dump(by_alias=True) if last_extraction else None,
                "provider": "groq",
                "fallback_active": True
            })
            
            logger.info(f"[AI-PROVIDER] Groq success | Response length: {len(accumulated_content)} chars")
            return  # Success, exit

        except Exception as e:
            error_str = str(e)
            is_groq_quota = any(x in error_str for x in ["429", "rate_limit", "quota"])
            
            if is_groq_quota:
                logger.warning("="*60)
                logger.warning("[QUOTA-EXHAUSTED] Groq also hit rate limit!")
                logger.warning(f"Error: {error_str[:200]}")
                logger.warning("Falling back to Heuristic Engine...")
                logger.warning("="*60)
            else:
                logger.error(f"[AI-PROVIDER] Groq error: {error_str}")

    # =========================================================================
    # STRATEGY 3: Heuristic Engine (Offline Mode)
    # =========================================================================
    logger.warning("[AI-PROVIDER] All AI providers exhausted. Using Heuristic Engine.")
    logger.warning("="*60)
    logger.warning("[OFFLINE-MODE] Heuristic fallback activated")
    logger.warning("User will see limited AI capabilities")
    logger.warning("="*60)
    
    await asyncio.sleep(0.5)  # Brief delay for UX
    
    fallback_response = _generate_heuristic_response(message, current_phase, language_code)
    
    yield _format_sse_event({
        "type": "delta",
        "content": fallback_response["content"]
    })
    
    if fallback_response.get("extraction"):
        normalized_fallback = _normalize_extracted_payload(fallback_response["extraction"])
        yield _format_sse_event({
            "type": "extraction",
            "extraction": {"extracted": normalized_fallback, "confidence": {"overall": 0.6}},
        })

    yield _format_sse_event({
        "type": "complete",
        "message": {
            "id": f"msg_{datetime.utcnow().timestamp()}_heuristic",
            "role": "assistant",
            "content": fallback_response["content"],
            "timestamp": datetime.utcnow().isoformat(),
        },
        "finalExtraction": {"extracted": normalized_fallback} if fallback_response.get("extraction") else None,
        "provider": "heuristic",
        "offline_mode": True
    })


async def extract_cv_data_from_message(
    message: str,
    history: List[ChatMessage],
    cv_data: Dict[str, Any],
    current_phase: ConversationPhase,
) -> Optional[DataExtraction]:
    """
    Extrae datos estructurados del CV desde un mensaje del usuario.

    Args:
        message: Mensaje del usuario
        history: Historial de conversación
        cv_data: Datos actuales del CV
        current_phase: Fase actual

    Returns:
        DataExtraction con los datos extraídos y confianza
    """
    if (
        (not settings.GROQ_API_KEY or settings.GROQ_API_KEY == "placeholder_key")
        and (not settings.GOOGLE_API_KEY or settings.GOOGLE_API_KEY == "placeholder_key")
    ):
        return None

    try:
        chat_history = _format_chat_history(history[-3:])
        cv_data_json = json.dumps(cv_data, indent=2, default=str)

        prompt = DATA_EXTRACTION_PROMPT.format(
            current_phase=current_phase.value,
            user_message=message,
            chat_history=chat_history,
            current_cv_data=cv_data_json,
            current_date=datetime.now().strftime("%Y-%m-%d"),
        )

        system_msg = "Eres un extractor de datos preciso y cuidadoso."
        response = await get_ai_completion(prompt, system_msg)

        if not response:
            return None

        extraction_data = _parse_ai_payload(response)
        if extraction_data is None:
            logger.error(f"Failed to parse extraction response: {response}")
            return None

        # Limpiar datos extraídos (eliminar campos vacíos para no sobreescribir con nada)
        def clean_extracted(obj):
            if isinstance(obj, dict):
                return {k: clean_extracted(v) for k, v in obj.items() if v not in (None, "", [], {})}
            elif isinstance(obj, list):
                return [clean_extracted(i) for i in obj if i not in (None, "", [], {})]
            return obj

        clean_data = clean_extracted(extraction_data.get("extracted", {}))
        normalized_data = _normalize_extracted_payload(clean_data)

        payload = {
            "extracted": normalized_data,
            "confidence": extraction_data.get("confidence", {}),
            "needs_clarification": extraction_data.get("needs_clarification", []),
            "follow_up_questions": extraction_data.get("follow_up_questions", []),
        }
        validated = _validate_ai_payload(DataExtraction, payload, "extract_cv_data_from_message")

        if not validated:
            retry_prompt = f"{prompt}\n\nIMPORTANTE: Devuelve solo JSON válido con el esquema exacto."
            retry_response = await get_ai_completion(retry_prompt, system_msg)
            retry_data = _parse_ai_payload(retry_response)
            if retry_data:
                clean_data = clean_extracted(retry_data.get("extracted", {}))
                normalized_data = _normalize_extracted_payload(clean_data)
                retry_payload = {
                    "extracted": normalized_data,
                    "confidence": retry_data.get("confidence", {}),
                    "needs_clarification": retry_data.get("needs_clarification", []),
                    "follow_up_questions": retry_data.get("follow_up_questions", []),
                }
                validated = _validate_ai_payload(
                    DataExtraction, retry_payload, "extract_cv_data_from_message_retry"
                )

        if not validated:
            raise CVProcessingError(
                "No pudimos validar la extracción de datos. Intenta nuevamente."
            )

        return validated

    except CVProcessingError:
        raise
    except Exception as e:
        logger.error(f"Error extracting CV data: {e}")
        return None


async def generate_next_question(
    cv_data: Dict[str, Any],
    current_phase: ConversationPhase,
    history: List[ChatMessage],
) -> Dict[str, Any]:
    """
    Genera la siguiente pregunta apropiada basada en el estado actual.

    Args:
        cv_data: Datos actuales del CV
        current_phase: Fase actual
        history: Historial de mensajes

    Returns:
        Dict con la pregunta, fase objetivo y prioridad
    """
    if not settings.GROQ_API_KEY or settings.GROQ_API_KEY == "placeholder_key":
        return {
            "next_question": "¿Podrías contarme más sobre tu experiencia?",
            "target_phase": current_phase.value,
            "priority": "high",
            "suggested_answers": [],
        }

    try:
        chat_history = _format_chat_history(history[-3:])
        cv_data_json = json.dumps(cv_data, indent=2, default=str)

        # Calcular completitud por sección
        completeness = _calculate_completeness(cv_data, current_phase)

        prompt = NEXT_QUESTION_GENERATOR_PROMPT.format(
            current_phase=current_phase.value,
            cv_data=cv_data_json,
            chat_history=chat_history,
            completeness=json.dumps(completeness, indent=2),
        )

        response = await get_ai_completion(prompt, "Eres un asistente experto en reclutamiento.")

        if not response:
            raise Exception("Empty response")

        if isinstance(response, dict):
            return {
                "next_question": response.get("next_question", "¿Qué más puedes contarme?"),
                "target_phase": response.get("target_phase", current_phase.value),
                "priority": response.get("priority", "medium"),
                "suggested_answers": response.get("suggested_answers", []),
            }
        else:
            try:
                parsed = json.loads(response)
                return {
                    "next_question": parsed.get("next_question", "¿Qué más puedes contarme?"),
                    "target_phase": parsed.get("target_phase", current_phase.value),
                    "priority": parsed.get("priority", "medium"),
                    "suggested_answers": parsed.get("suggested_answers", []),
                }
            except json.JSONDecodeError:
                return {
                    "next_question": str(response),
                    "target_phase": current_phase.value,
                    "priority": "medium",
                    "suggested_answers": [],
                }

    except Exception as e:
        logger.error(f"Error generating next question: {e}")
        return {
            "next_question": _get_default_question(current_phase),
            "target_phase": current_phase.value,
            "priority": "high",
            "suggested_answers": [],
        }


async def analyze_job_description(
    job_description: str,
    cv_data: Dict[str, Any],
) -> Optional[JobAnalysisResponse]:
    """
    Analiza una descripción de puesto y compara con el CV.

    Args:
        job_description: Descripción del puesto
        cv_data: Datos del CV

    Returns:
        JobAnalysisResponse con análisis y sugerencias
    """
    if not settings.GROQ_API_KEY or settings.GROQ_API_KEY == "placeholder_key":
        return None

    try:
        cv_data_json = json.dumps(cv_data, indent=2, default=str)

        prompt = JOB_ANALYSIS_PROMPT.format(
            job_description=job_description,
            cv_data=cv_data_json,
        )

        system_msg = "Eres un experto en reclutamiento y optimización de CVs."
        response = await get_ai_completion(
            prompt,
            system_msg,
        )

        if not response:
            return None

        data = _parse_ai_payload(response)
        if data is None:
            logger.error(f"Failed to parse job analysis response: {response}")
            return None

        # Parsear sugerencias
        suggestions_data = data.get("suggestions", [])
        suggestions = [
            TailoringSuggestion(
                section=s.get("section", ""),
                current=s.get("current", ""),
                suggested=s.get("suggested", ""),
                reason=s.get("reason", ""),
                priority=s.get("priority", "medium"),
            )
            for s in suggestions_data
            if isinstance(s, dict)
        ]

        payload = {
            "match_score": data.get("match_score", 50),
            "key_requirements": data.get("key_requirements", []),
            "matched_skills": data.get("matched_skills", []),
            "missing_skills": data.get("missing_skills", []),
            "suggestions": [s.model_dump() for s in suggestions],
            "optimized_cv": data.get("optimized_cv"),
        }

        validated = _validate_ai_payload(JobAnalysisResponse, payload, "analyze_job_description")
        if not validated:
            retry_prompt = f"{prompt}\n\nIMPORTANTE: Devuelve solo JSON válido con el esquema exacto."
            retry_response = await get_ai_completion(retry_prompt, system_msg)
            retry_data = _parse_ai_payload(retry_response)
            if retry_data:
                retry_suggestions = [
                    TailoringSuggestion(
                        section=s.get("section", ""),
                        current=s.get("current", ""),
                        suggested=s.get("suggested", ""),
                        reason=s.get("reason", ""),
                        priority=s.get("priority", "medium"),
                    )
                    for s in retry_data.get("suggestions", [])
                    if isinstance(s, dict)
                ]
                retry_payload = {
                    "match_score": retry_data.get("match_score", 50),
                    "key_requirements": retry_data.get("key_requirements", []),
                    "matched_skills": retry_data.get("matched_skills", []),
                    "missing_skills": retry_data.get("missing_skills", []),
                    "suggestions": [s.model_dump() for s in retry_suggestions],
                    "optimized_cv": retry_data.get("optimized_cv"),
                }
                validated = _validate_ai_payload(
                    JobAnalysisResponse, retry_payload, "analyze_job_description_retry"
                )

        if not validated:
            raise CVProcessingError(
                "La IA devolvió un formato incompatible para el análisis del puesto. "
                "Intenta nuevamente."
            )

        return validated

    except CVProcessingError:
        raise
    except Exception as e:
        logger.error(f"Error analyzing job description: {e}")
        return None


# =============================================================================
# HELPER FUNCTIONS
# =============================================================================

def _format_chat_history(messages: List[ChatMessage]) -> str:
    """Formatea el historial de mensajes para el prompt."""
    formatted = []
    for msg in messages:
        role_label = "Usuario" if msg.role == "user" else "Asistente"
        formatted.append(f"{role_label}: {msg.content}")
    return "\n".join(formatted)


def _format_sse_event(data: Dict[str, Any]) -> str:
    """Formatea un evento SSE."""
    return f"data: {json.dumps(data)}\n\n"


def _detect_language(text: str) -> str:
    """Detecta el idioma del texto (es/en)."""
    spanish_indicators = [
        "hola", "me llamo", "años", "experiencia", "educación",
        "habilidades", "proyectos", "certificaciones", "trabaj",
        "desarroll", "realic", "lider", "presente", "licenciatura", "ingeniería"
    ]
    text_lower = text.lower()
    spanish_count = sum(1 for word in spanish_indicators if word in text_lower)
    return "es" if spanish_count > 0 else "en"


def _detect_language_preference(message: str, history: List[ChatMessage]) -> str:
    """Detecta preferencia de idioma con prioridad a solicitudes explícitas."""
    explicit_text = " ".join(
        [message] + [msg.content for msg in history[-5:] if msg.role == "user"]
    ).lower()

    if any(phrase in explicit_text for phrase in ["español", "espanol", "spanish", "en español", "solo español", "solo espanol", "castellano"]):
        return "es"
    if any(phrase in explicit_text for phrase in ["english", "inglés", "ingles", "en inglés", "en ingles"]):
        return "en"

    spanish_indicators = [
        "hola",
        "me llamo",
        "años",
        "experiencia",
        "educación",
        "habilidades",
        "proyectos",
        "certificaciones",
        "trabaj",
        "desarroll",
        "realic",
        "lider",
        "presente",
    ]

    english_indicators = [
        "hello",
        "hi",
        "experience",
        "education",
        "skills",
        "projects",
        "certifications",
        "worked",
        "developer",
        "engineer",
        "resume",
        "cv",
        "current",
        "present",
    ]

    spanish_count = sum(1 for word in spanish_indicators if word in explicit_text)
    english_count = sum(1 for word in english_indicators if word in explicit_text)

    if english_count > 0 and spanish_count == 0:
        return "en"
    return "es"


def _apply_language_instruction(system_instruction: str, language_code: str) -> str:
    language_name = "Spanish" if language_code == "es" else "English"
    return (
        f"{system_instruction}\n\n"
        f"LANGUAGE OVERRIDE: Respond only in {language_name}. Do not mix languages."
    )


def _clean_text(value: Any) -> Optional[str]:
    """Normaliza strings y descarta valores vacíos."""
    if value is None:
        return None
    if isinstance(value, (int, float)):
        return str(value)
    if isinstance(value, str):
        cleaned = value.strip()
        return cleaned if cleaned else None
    return None


def _is_empty(value: Any) -> bool:
    """Detecta valores vacíos sin eliminar booleanos válidos."""
    return value is None or value == "" or value == [] or value == {}


def _normalize_experience_item(item: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    if not isinstance(item, dict):
        return None

    company = _clean_text(item.get("company") or item.get("employer") or item.get("organization"))
    position = _clean_text(item.get("position") or item.get("role") or item.get("title"))
    start_date = _clean_text(item.get("startDate") or item.get("start") or item.get("from"))
    end_date = _clean_text(item.get("endDate") or item.get("end") or item.get("to"))
    location = _clean_text(item.get("location"))
    current = item.get("current") if isinstance(item.get("current"), bool) else None

    description_parts: List[str] = []
    base_description = _clean_text(item.get("description") or item.get("summary"))
    if base_description:
        description_parts.append(base_description.rstrip("."))

    highlights = item.get("highlights") or item.get("achievements")
    if isinstance(highlights, list):
        for h in highlights:
            cleaned = _clean_text(h)
            if cleaned:
                description_parts.append(cleaned.rstrip("."))
    elif isinstance(highlights, str):
        description_parts.append(highlights.strip().rstrip("."))

    technologies = item.get("technologies") or item.get("tech")
    if technologies:
        if isinstance(technologies, list):
            tech_list = [t for t in (_clean_text(t) for t in technologies) if t]
        else:
            tech_list = [_clean_text(technologies)] if _clean_text(technologies) else []
        if tech_list:
            description_parts.append(f"Tecnologías: {', '.join(tech_list)}")

    duration = _clean_text(item.get("duration"))
    if duration:
        description_parts.append(f"Duración: {duration}")

    project_name = _clean_text(item.get("projectName") or item.get("project"))
    if project_name:
        description_parts.append(f"Proyecto: {project_name}")

    description = ". ".join(description_parts) if description_parts else None

    normalized: Dict[str, Any] = {}
    if company:
        normalized["company"] = company
    if position:
        normalized["position"] = position
    if start_date:
        normalized["startDate"] = start_date
    if end_date:
        normalized["endDate"] = end_date
    if current is not None:
        normalized["current"] = current
    if location:
        normalized["location"] = location
    if description:
        normalized["description"] = description

    return normalized or None


def _normalize_list(value: Any) -> List[Any]:
    return value if isinstance(value, list) else []


def _merge_descriptions(primary: Optional[str], secondary: Optional[str]) -> Optional[str]:
    if not primary:
        return secondary
    if not secondary:
        return primary

    def split_sentences(text: str) -> List[str]:
        parts = re.split(r"[.\n]+", text)
        return [p.strip() for p in parts if p and p.strip()]

    seen = []
    for sentence in split_sentences(primary) + split_sentences(secondary):
        if sentence not in seen:
            seen.append(sentence)
    return ". ".join(seen) if seen else None


def _dedupe_experience(entries: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    deduped: Dict[tuple, Dict[str, Any]] = {}
    for exp in entries:
        key = (
            (exp.get("company") or "").lower(),
            (exp.get("position") or "").lower(),
            exp.get("startDate") or "",
            exp.get("endDate") or "",
        )
        if key in deduped:
            deduped[key]["description"] = _merge_descriptions(
                deduped[key].get("description"), exp.get("description")
            )
        else:
            deduped[key] = exp

    deduped_list = list(deduped.values())
    no_company = [exp for exp in deduped_list if not exp.get("company")]
    if len(no_company) > 1:
        best_position = max(
            (exp.get("position") for exp in no_company if exp.get("position")),
            key=lambda value: len(value),
            default=None,
        )
        merged_desc: Optional[str] = None
        for exp in no_company:
            merged_desc = _merge_descriptions(merged_desc, exp.get("description"))

        merged_entry = dict(no_company[0])
        if best_position:
            merged_entry["position"] = best_position
        if merged_desc:
            merged_entry["description"] = merged_desc

        deduped_list = [exp for exp in deduped_list if exp.get("company")] + [merged_entry]

    return deduped_list


def _normalize_extracted_payload(extracted: Dict[str, Any]) -> Dict[str, Any]:
    """Limpia y normaliza la extracción para alinear con el schema del frontend."""
    if not isinstance(extracted, dict):
        return {}

    normalized: Dict[str, Any] = {}

    personal = extracted.get("personalInfo")
    if isinstance(personal, dict):
        personal_clean = {k: _clean_text(v) for k, v in personal.items()}
        personal_clean = {k: v for k, v in personal_clean.items() if not _is_empty(v)}
        if personal_clean:
            normalized["personalInfo"] = personal_clean

    experience = _normalize_list(extracted.get("experience"))
    exp_clean: List[Dict[str, Any]] = []
    for item in experience:
        normalized_item = _normalize_experience_item(item)
        if normalized_item:
            exp_clean.append(normalized_item)
    if exp_clean:
        normalized["experience"] = _dedupe_experience(exp_clean)

    def _split_degree_and_field(raw_degree: Optional[str]) -> tuple[str, Optional[str]]:
        if not raw_degree:
            return "", None

        normalized_degree = raw_degree.strip()

        split_match = re.match(
            r"^(?P<degree>.+?)\s+(?:in|en|de|of)\s+(?P<field>.+)$",
            normalized_degree,
            flags=re.IGNORECASE,
        )
        if split_match:
            return split_match.group("degree").strip(), split_match.group("field").strip()

        split_match = re.match(
            r"^(?P<degree>.+?)\s*[:\-–—]\s*(?P<field>.+)$",
            normalized_degree,
        )
        if split_match:
            return split_match.group("degree").strip(), split_match.group("field").strip()

        tokens = normalized_degree.split()
        if len(tokens) >= 2:
            head = tokens[0].rstrip(".").lower()
            known_abbrev = {
                "mba", "msc", "m.sc", "ms", "ma",
                "bsc", "b.sc", "bs", "ba",
                "phd", "ph.d", "jd", "md", "dds", "dvm",
                "ing", "lic", "tec", "tecnologo",
            }
            if head in known_abbrev:
                return tokens[0], " ".join(tokens[1:]).strip() or None

        return normalized_degree, None

    education = _normalize_list(extracted.get("education"))
    edu_clean: List[Dict[str, Any]] = []
    for item in education:
        if not isinstance(item, dict):
            continue
        edu_item: Dict[str, Any] = {}
        institution = _clean_text(item.get("institution") or item.get("school") or item.get("university"))
        degree = _clean_text(item.get("degree") or item.get("title"))
        field = _clean_text(item.get("fieldOfStudy") or item.get("field") or item.get("major"))
        start_date = _clean_text(item.get("startDate") or item.get("start") or item.get("from"))
        end_date = _clean_text(item.get("endDate") or item.get("end") or item.get("to"))
        location = _clean_text(item.get("location"))
        description = _clean_text(item.get("description"))

        if degree and not field:
            degree, inferred_field = _split_degree_and_field(degree)
            field = field or inferred_field

        if institution:
            edu_item["institution"] = institution
        if degree:
            edu_item["degree"] = degree
        if field:
            edu_item["fieldOfStudy"] = field
        if start_date:
            edu_item["startDate"] = start_date
        if end_date:
            edu_item["endDate"] = end_date
        if location:
            edu_item["location"] = location
        if description:
            edu_item["description"] = description

        if edu_item:
            edu_clean.append(edu_item)
    if edu_clean:
        normalized["education"] = edu_clean

    skills = _normalize_list(extracted.get("skills"))
    skill_clean: List[Dict[str, Any]] = []
    for item in skills:
        if isinstance(item, str):
            name = _clean_text(item)
            if name:
                skill_clean.append({"name": name, "level": "Intermediate"})
        elif isinstance(item, dict):
            name = _clean_text(item.get("name") or item.get("skill"))
            level = _clean_text(item.get("level")) or "Intermediate"
            if name:
                skill_clean.append({"name": name, "level": level})
    if skill_clean:
        normalized["skills"] = skill_clean

    projects = _normalize_list(extracted.get("projects"))
    project_clean: List[Dict[str, Any]] = []
    for item in projects:
        if not isinstance(item, dict):
            continue
        proj_item: Dict[str, Any] = {}
        name = _clean_text(item.get("name") or item.get("projectName"))
        description = _clean_text(item.get("description"))
        url = _clean_text(item.get("url") or item.get("link"))
        technologies = item.get("technologies") or item.get("tech")
        tech_list = []
        if technologies:
            if isinstance(technologies, list):
                tech_list = [t for t in (_clean_text(t) for t in technologies) if t]
            else:
                tech_list = [_clean_text(technologies)] if _clean_text(technologies) else []

        if name:
            proj_item["name"] = name
        if description:
            proj_item["description"] = description
        if url:
            proj_item["url"] = url
        if tech_list:
            proj_item["technologies"] = tech_list

        if proj_item:
            project_clean.append(proj_item)
    if project_clean:
        normalized["projects"] = project_clean

    languages = _normalize_list(extracted.get("languages"))
    lang_clean: List[Dict[str, Any]] = []
    for item in languages:
        if not isinstance(item, dict):
            continue
        language = _clean_text(item.get("language"))
        fluency = _clean_text(item.get("fluency"))
        if language:
            lang_item = {"language": language}
            if fluency:
                lang_item["fluency"] = fluency
            lang_clean.append(lang_item)
    if lang_clean:
        normalized["languages"] = lang_clean

    certifications = _normalize_list(extracted.get("certifications"))
    cert_clean: List[Dict[str, Any]] = []
    for item in certifications:
        if not isinstance(item, dict):
            continue
        name = _clean_text(item.get("name"))
        issuer = _clean_text(item.get("issuer"))
        date = _clean_text(item.get("date"))
        if name:
            cert_item = {"name": name}
            if issuer:
                cert_item["issuer"] = issuer
            if date:
                cert_item["date"] = date
            cert_clean.append(cert_item)
    if cert_clean:
        normalized["certifications"] = cert_clean

    return normalized


def _detect_phase_transition(
    user_message: str,
    ai_response: str,
    current_phase: ConversationPhase,
    cv_data: Dict[str, Any],
) -> Optional[ConversationPhase]:
    """Detecta si debe haber una transición de fase de forma agresiva para evitar bucles."""
    
    phase_order = [
        ConversationPhase.WELCOME,
        ConversationPhase.PERSONAL_INFO,
        ConversationPhase.EXPERIENCE,
        ConversationPhase.EDUCATION,
        ConversationPhase.SKILLS,
        ConversationPhase.PROJECTS,
        ConversationPhase.SUMMARY,
        ConversationPhase.REVIEW,
    ]

    try:
        current_idx = phase_order.index(current_phase)
    except ValueError:
        return None

    # 1. Detección de intención explícita de avanzar o saltar
    skip_keywords = ["skip", "next", "siguiente", "paso", "continuar", "listo", "ya está", "no tengo", "omitir", "después", "luego"]
    if any(k in user_message.lower() for k in skip_keywords):
        if current_idx < len(phase_order) - 1:
            return phase_order[current_idx + 1]

    # 2. Transición basada en si el usuario ya dio información de la siguiente fase
    # (Heurística simple: si estamos en PERSONAL_INFO y menciona una empresa, probablemente ya pasamos a EXPERIENCE)
    if current_phase == ConversationPhase.PERSONAL_INFO and ("empresa" in user_message.lower() or "trabaj" in user_message.lower()):
        return ConversationPhase.EXPERIENCE
    
    if current_phase == ConversationPhase.EXPERIENCE and ("estudi" in user_message.lower() or "universidad" in user_message.lower() or "grado" in user_message.lower()):
        return ConversationPhase.EDUCATION

    # 3. Transición basada en completitud mínima (muy permisiva)
    completeness = _calculate_completeness(cv_data, current_phase)
    
    # Si tenemos ALGO de información en la fase actual, permitimos avanzar rápido
    if completeness.get("overall", 0) > 0.1 and current_idx < len(phase_order) - 1:
        # Si la respuesta de la IA parece cerrar el tema, avanzamos
        closing_patterns = ["¿qué hay de tu", "¿cuéntame sobre", "pasemos a", "ahora", "siguiente"]
        if any(p in ai_response.lower() for p in closing_patterns):
            return phase_order[current_idx + 1]

    return None


def _calculate_completeness(cv_data: Dict[str, Any], current_phase: ConversationPhase) -> Dict[str, Any]:
    """Calcula la completitud de los datos del CV por sección de forma relajada."""
    personal_info = cv_data.get("personalInfo", {})
    experience = cv_data.get("experience", [])
    education = cv_data.get("education", [])
    skills = cv_data.get("skills", [])
    projects = cv_data.get("projects", [])
    languages = cv_data.get("languages", [])
    certifications = cv_data.get("certifications", [])

    # Completitud de información personal (Solo nombre es crítico para empezar)
    personal_required = ["fullName"]
    personal_complete = sum(1 for f in personal_required if personal_info.get(f))
    personal_total = len(personal_required)
    personal_score = personal_complete / personal_total if personal_total > 0 else 0

    # Completitud de experiencia (Flexible)
    exp_score = min(len(experience) / 1, 1.0) if len(experience) > 0 else 0.5 # 0.5 de base para no bloquear

    # Completitud de educación (Flexible)
    edu_score = min(len(education) / 1, 1.0) if len(education) > 0 else 0.5

    # Completitud de habilidades (Mínimo 1)
    skills_score = min(len(skills) / 1, 1.0)

    # Otras secciones
    projects_score = min(len(projects) / 1, 1.0)
    languages_score = min(len(languages) / 1, 1.0)
    certs_score = min(len(certifications) / 1, 1.0)

    # Score ponderado según la fase actual
    # Si estamos en 'welcome' o 'personal_info', solo importa personal_score
    overall = 0.0
    
    if current_phase == ConversationPhase.WELCOME or current_phase == ConversationPhase.PERSONAL_INFO:
        overall = personal_score
    elif current_phase == ConversationPhase.EXPERIENCE:
        overall = exp_score
    elif current_phase == ConversationPhase.EDUCATION:
        overall = edu_score
    elif current_phase == ConversationPhase.SKILLS:
        overall = skills_score
    else:
        # Promedio general para fases avanzadas
        overall = (personal_score + exp_score + edu_score + skills_score + projects_score + languages_score + certs_score) / 7

    return {
        "overall": overall,
        "personal_info": personal_score,
        "experience": exp_score,
        "education": edu_score,
        "skills": skills_score,
        "projects": projects_score,
        "languages": languages_score,
        "certifications": certs_score,
    }


def _get_default_question(phase: ConversationPhase) -> str:
    """Retorna una pregunta por defecto según la fase."""
    defaults = {
        ConversationPhase.WELCOME: "¡Hola! ¿Cómo te llamas?",
        ConversationPhase.PERSONAL_INFO: "¿Cuál es tu correo electrónico?",
        ConversationPhase.EXPERIENCE: "¿Dónde has trabajado recientemente?",
        ConversationPhase.EDUCATION: "¿Cuál es tu formación académica?",
        ConversationPhase.SKILLS: "¿Qué habilidades tienes?",
        ConversationPhase.PROJECTS: "¿Has trabajado en algún proyecto interesante?",
        ConversationPhase.SUMMARY: "¿Cómo describirías tu perfil profesional?",
        ConversationPhase.JOB_TAILORING: "¿Tienes una descripción de puesto específica?",
        ConversationPhase.OPTIMIZATION: "¿Qué te gustaría mejorar de tu CV?",
        ConversationPhase.REVIEW: "¿Todo se ve bien? ¿Quieres hacer algún ajuste?",
    }
    return defaults.get(phase, "¿Qué más puedes contarme?")


def _generate_heuristic_response(message: str, phase: ConversationPhase, language_code: str = "es") -> Dict[str, Any]:
    """
    FALLBACK ENGINE: Generates a response when the AI is offline/limited.
    Uses regex patterns to extract basic info and move the conversation forward.
    """
    import re
    
    msg_lower = message.lower()
    response_content = "Entendido. (Modo offline)" if language_code == "es" else "Understood. (Offline mode)"
    extraction = {}

    # 1. WELCOME / PERSONAL INFO
    if phase in [ConversationPhase.WELCOME, ConversationPhase.PERSONAL_INFO]:
        # Extract Name
        if "llamo" in msg_lower or "is" in msg_lower or "soy" in msg_lower or len(message.split()) < 5:
            # Simple heuristic: assume capitalized words might be a name if short
            # or extraction from "Me llamo [NAME]"
            name_match = re.search(r"(?:llamo|soy|name is)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)", message)
            if name_match:
                name = name_match.group(1)
                extraction["personalInfo"] = {"fullName": name}
                response_content = (
                    f"¡Un gusto, {name}! Para continuar, ¿podrías decirme tu correo electrónico y a qué rol aspiras?"
                    if language_code == "es"
                    else f"Nice to meet you, {name}! Could you share your email and the role you're targeting?"
                )
            else:
                # Fallback implementation for just a name provided directly
                if len(message.split()) <= 3:
                     extraction["personalInfo"] = {"fullName": message.strip()}
                     response_content = (
                         "¡Gracias! He anotado tu nombre. ¿Cuál es tu correo electrónico?"
                         if language_code == "es"
                         else "Thanks! I've noted your name. What's your email address?"
                     )
        
        # Extract Email
        email_match = re.search(r"[\w\.-]+@[\w\.-]+\.\w+", message)
        if email_match:
            extraction.setdefault("personalInfo", {})["email"] = email_match.group(0)
            response_content = (
                "Correo registrado. Ahora, háblame de tu experiencia laboral más reciente. ¿Dónde trabajaste?"
                if language_code == "es"
                else "Email recorded. Now, tell me about your most recent work experience. Where did you work?"
            )

    # 2. EXPERIENCE
    elif phase == ConversationPhase.EXPERIENCE:
        if any(w in msg_lower for w in ["trabaj", "work", "puesto", "cargo", "empresa", "company"]):
             response_content = (
                 "Entendido. ¿Qué logros destacarías de este rol? (Intenta incluir números o resultados)."
                 if language_code == "es"
                 else "Got it. What key achievements would you highlight? (Try to include numbers or results)."
             )
             # Try to extract company/position
             company_match = re.search(r"(?:en|para|at|for)\s+([A-Z][a-zA-Z0-9\s&]+)", message)
             pos_match = re.search(r"(?:como|soy|as)\s+([A-Z][a-zA-Z0-9\s]+)", message)

             exp_item = {}
             if company_match: exp_item["company"] = company_match.group(1).strip()
             if pos_match: exp_item["position"] = pos_match.group(1).strip()

             if exp_item:
                 extraction["experience"] = [exp_item]

    # 3. SKILLS & LANGUAGES
    elif phase in [ConversationPhase.SKILLS, ConversationPhase.LANGUAGES]:
        # Simple list extraction by commas or "y"
        items = re.split(r",|\sy\s|\sand\s", message)
        if len(items) > 1:
            if phase == ConversationPhase.SKILLS:
                extraction["skills"] = [{"name": i.strip(), "level": "Intermediate"} for i in items if len(i.strip()) > 1]
            else:
                extraction["languages"] = [{"language": i.strip(), "fluency": "Conversational"} for i in items if len(i.strip()) > 1]

            response_content = (
                "He anotado esas habilidades. ¿Alguna otra herramienta o tecnología que domines?"
                if language_code == "es"
                else "I've noted those skills. Any other tools or technologies you're proficient in?"
            )

    # 4. EDUCATION
    elif phase == ConversationPhase.EDUCATION:
        edu_match = re.search(r"(?:estudi|en|at)\s+([A-Z][a-zA-Z0-9\s]+)", message)
        if edu_match:
            extraction["education"] = [{"institution": edu_match.group(1).strip()}]
            response_content = (
                "Excelente institución. ¿En qué año terminaste o cuándo esperas graduarte?"
                if language_code == "es"
                else "Great institution. What year did you finish or when do you expect to graduate?"
            )

    # 5. GENERIC FALLBACK
    else:
        response_content = (
            "Gracias por compartir eso. Lo he registrado en tu borrador. ¿Qué más te gustaría añadir?"
            if language_code == "es"
            else "Thanks for sharing that. I've updated your draft. What else would you like to add?"
        )

    return {
        "content": f"{response_content} (Nota: El asistente está en modo de alta demanda, operando con capacidad limitada pero guardando tus datos).",
        "extraction": extraction if extraction else None
    }
