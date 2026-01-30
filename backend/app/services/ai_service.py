import json
import logging
import copy
import asyncio
from typing import List, Dict, Any, Optional, AsyncGenerator
from datetime import datetime
from groq import Groq
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
from app.core.config import settings
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
)

# Valid Groq Models
MODEL_ID = "llama-3.1-8b-instant"

logger = logging.getLogger(__name__)

# --- SYSTEM PROMPTS (THE BIBLE OF TRUTH) ---

SYSTEM_RULES = """
You are a TECHNICAL RESUME COMPILER. You operate under 100% factual integrity.
- IDENTITY LOCK: Never change the candidate's Name, Email, Phone, Location, Company Names, or Job Titles.
- NO HALLUCINATIONS: Do not invent metrics, percentages, or achievements not explicitly stated.
- LANGUAGE LOYALTY: You must respond in the EXACT same language as the input. 
- FORMAT: You only output valid JSON. No conversational text.
- VERB CONJUGATION (CRITICAL):
  - If the input is in SPANISH, you MUST use FIRST PERSON SINGULAR (e.g., "Realicé", "Lideré", "Desarrollé"). 
  - NEVER use third person (e.g., "Realizó", "Lideró", "Desarrolló").
  - This is non-negotiable for Spanish CVs.
"""

EXTRACT_CV_PROMPT = """
Task: Convert the provided text into a structured CV JSON.
Rules:
- If a value is missing, use "".
- If the text is in Spanish, keep it in Spanish.
- EDUCATION: Always try to separate the 'degree' (e.g., "Técnico", "Licenciatura") from the 'fieldOfStudy' (e.g., "Radiología", "Informática"). If the text says "Técnico en Informática", degree is "Técnico" and fieldOfStudy is "Informática".
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
Goal: Create a powerful "Elevator Pitch" (3-4 lines max).

Instructions:
1. Analyze the candidate's Experience and Skills.
2. Highlight: Years of experience, Key Role/Title, Top 1-2 Achievements, and Core Value Proposition.
3. Tone: Confident, professional, result-oriented.
4. LANGUAGE: {language} (Strictly match CV language).
5. FORMAT: JSON {{ "personalInfo": {{ "summary": "..." }} }}

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
Goal: Make the recruiter think "This is the exact person we need".

Instructions:
1. SUMMARY: Rewrite to position the candidate as a "{target_role}" expert.
2. EXPERIENCE (CRITICAL OPTIMIZATION): 
   - FOR RELEVANT ROLES (e.g. if target is Dev and role is Dev): EXPAND significantly. Add 3-4 distinct bullet points. Detail technologies, achievements and complexity. Make it look impressive.
   - FOR IRRELEVANT ROLES (e.g. Freelancer, Technician, Support, etc. if not related to target): 
     - Option A: REMOVE completely if it adds no value.
     - Option B: MINIMIZE to a single simplified line or 1 short bullet point.
     - EXAMPLE: If target is "Dev React" and role is "Repair Technician", minimize or delete it.
   - SPECIFIC OVERRIDE: If the role is "Freelancer" or "Rosario Tecno" and target is logical, reduce them to the bare minimum. If role is "Pildhora", expand it.
3. SKILLS: Reorder to put "{target_role}" relevant skills first. Add missing standard skills for this role if the candidate likely has them based on context.
4. LANGUAGE: {language} (Match CV language).

Input CV:
{cv_json}

Return the FULL CV JSON.
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
        return None
    
    if use_json:
        try:
            return json.loads(message_content)
        except json.JSONDecodeError:
            logger.error(f"Failed to parse JSON from AI: {message_content}")
            return None
    return message_content


async def get_ai_completion(prompt: str, system_msg: str = SYSTEM_RULES, use_json: bool = True):
    if not settings.GROQ_API_KEY or settings.GROQ_API_KEY == "placeholder_key":
        return None

    try:
        # Run the synchronous Groq call in a thread pool
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(
            None, _call_groq_api, prompt, system_msg, use_json
        )
        return result
    except Exception as e:
        logger.error(f"AI Error after retries: {str(e)}")
        return None


async def extract_cv_data(text: str):
    return await get_ai_completion(EXTRACT_CV_PROMPT.format(text=text))


async def optimize_cv_data(cv_data: dict, target: str, section: str):
    original_copy = copy.deepcopy(cv_data)
    cv_json = json.dumps(cv_data, indent=2)

    # Detect language (simplified helper or assumption)
    # We'll assume the prompt instruction "Match CV language" handles it enough.
    language_instruction = "Spanish if the input is Spanish, English if English."

    prompt = ""
    system_msg = SYSTEM_RULES

    # ROUTING LOGIC
    if section == "summary" or target == "summarize_profile":
        prompt = SUMMARIZE_PROMPT.format(cv_json=cv_json, language=language_instruction)

    elif section == "skills" or target == "suggest_skills":
        prompt = SUGGEST_SKILLS_PROMPT.format(
            cv_json=cv_json, language=language_instruction
        )

    elif target == "one_page" or target == "try_one_page":
        prompt = ONE_PAGE_OPTIMIZER_PROMPT.format(cv_json=cv_json)

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

    if not ai_response:
        return original_copy

    result_cv = copy.deepcopy(original_copy)

    # SECURE MERGE LOGIC
    if section == "summary" or target == "summarize_profile":
        new_summary = ai_response.get("personalInfo", {}).get(
            "summary"
        ) or ai_response.get("summary")
        if new_summary:
            result_cv["personalInfo"]["summary"] = new_summary

    elif section == "skills" or target == "suggest_skills":
        if "skills" in ai_response and isinstance(ai_response["skills"], list):
            # Strategy: Replace or Merge? User complained "Useless", implies they want NEW stuff.
            # We will overwrite to ensure they see the suggestions, effectively "refining" the list.
            # Ideally we might want to keep proficiency, but the prompt reconstructs it.
            result_cv["skills"] = ai_response["skills"]

    elif target in ["one_page", "try_one_page"]:
        # Full CV replacement for one-page
        # We need to be careful not to lose contact info if AI messed up.
        # But for one-page, we trust the AI to return the full structure as requested.
        # We'll validte critical fields exist.
        if "experience" in ai_response:
            return ai_response  # Return the full condensed CV

    elif section in ai_response:
        result_cv[section] = ai_response[section]

    # Handle the "optimize for specific section" generic case return
    if section != "all" and section in ai_response:
        result_cv[section] = ai_response[section]

    return result_cv


async def critique_cv_data(cv_data: dict):
    cv_json = json.dumps(cv_data, indent=2)
    return await get_ai_completion(SENTINEL_CRITIQUE_PROMPT.format(cv_json=cv_json))


async def optimize_for_role(cv_data: dict, target_role: str):
    """Optimize CV for a specific target job role."""
    original_copy = copy.deepcopy(cv_data)
    cv_json = json.dumps(cv_data, indent=2)
    language_instruction = "Spanish if the input is Spanish, English if English."

    ai_response = await get_ai_completion(
        ROLE_ALIGNMENT_PROMPT.format(
            target_role=target_role, cv_json=cv_json, language=language_instruction
        )
    )

    if not ai_response:
        return original_copy

    # Post-processing to ensure safety
    # Restore contact info to prevent hallucinations there
    if "personalInfo" in ai_response and "personalInfo" in original_copy:
        for field in ["fullName", "email", "phone", "location", "linkedin", "github"]:
            ai_response["personalInfo"][field] = original_copy["personalInfo"].get(
                field, ""
            )

        # Allow summary change
        if "summary" not in ai_response["personalInfo"]:
            ai_response["personalInfo"]["summary"] = original_copy["personalInfo"].get(
                "summary", ""
            )

    return ai_response


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

INDUSTRY_KEYWORDS = {
    "tech": {
        "name": "Tecnología / IT / Desarrollo de Software",
        "keywords": [
            "Python",
            "JavaScript",
            "React",
            "Node.js",
            "SQL",
            "Git",
            "AWS",
            "Docker",
            "Kubernetes",
            "CI/CD",
            "API",
            "Agile",
            "Scrum",
            "Machine Learning",
            "Full Stack",
            "Backend",
            "Frontend",
            "DevOps",
            "Cloud",
            "Microservices",
        ],
        "focus": "habilidades técnicas, tecnologías específicas, proyectos de código, metodologías ágiles",
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
        ],
        "focus": "análisis numérico, herramientas de reporting, regulaciones financieras, experiencia en auditoría y compliance",
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
        ],
        "focus": "certificaciones médicas, experiencia clínica, atención al paciente, protocolos de seguridad",
    },
    "creative": {
        "name": "Diseño / Marketing / Comunicación",
        "keywords": [
            "Photoshop",
            "Illustrator",
            "Figma",
            "UI/UX",
            "Branding",
            "Copywriting",
            "SEO",
            "Social Media",
            "Campañas",
            "Estrategia digital",
            "Google Ads",
            "Content",
            "Creatividad",
            "Portfolio",
            "Adobe",
            "Canva",
            "Motion Graphics",
            "Video",
            "Fotografía",
        ],
        "focus": "portfolio de trabajos, herramientas de diseño, métricas de campañas, creatividad y storytelling",
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
        ],
        "focus": "experiencia docente, metodologías educativas, gestión de aula, desarrollo de programas",
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
        ],
        "focus": "habilidades transferibles, logros cuantificables, experiencia general relevante",
    },
}

ATS_CHECKER_PROMPT = """
Actúa como un sistema ATS (Applicant Tracking System) profesional especializado en la industria de {industry_name}.

CONTEXTO: El candidato busca trabajo en el sector de {industry_name}. Tu análisis DEBE enfocarse en evaluar qué tan adecuado es este CV para esa industria específica.

KEYWORDS ESPERADAS PARA ESTA INDUSTRIA:
{industry_keywords}

ENFOQUE PRINCIPAL: {industry_focus}

ANÁLISIS REQUERIDO:

1. SCORE ATS (0-100): Basado en:
   - Formato: ¿Es el texto parseable (no imágenes, no tablas complejas)?
   - Keywords de {industry_name}: ¿Tiene palabras clave relevantes para ESTA industria?
   - Longitud: ¿Es apropiado (1-2 páginas)?
   - Contacto: ¿Tiene email y teléfono visibles?
   - Extras relevantes para {industry_name}: LinkedIn, portfolio, certificaciones específicas

2. KEYWORDS ENCONTRADAS: Lista las skills y términos relevantes para {industry_name} que detectaste

3. KEYWORDS FALTANTES: Sugiere palabras clave que DEBERÍAN estar para destacar en {industry_name}

4. PROBLEMAS DETECTADOS: Lista issues que podrían filtrar el CV en procesos de selección de {industry_name}

5. MEJORAS SUGERIDAS: Acciones concretas para mejorar el score en la industria de {industry_name}

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
  "issues": [
    {{"severity": "high/medium/low", "message": "descripción del problema", "fix": "cómo solucionarlo"}}
  ],
  "quick_wins": ["acción 1", "acción 2"],
  "detailed_tips": "consejos específicos para mejorar el CV para {industry_name}"
}}

CV a analizar:
{cv_text}
"""


async def analyze_ats(cv_text: str, target_industry: str = "general"):
    """Analyze CV for ATS compatibility in a specific industry."""
    industry_data = INDUSTRY_KEYWORDS.get(target_industry, INDUSTRY_KEYWORDS["general"])

    prompt = ATS_CHECKER_PROMPT.format(
        cv_text=cv_text,
        industry_name=industry_data["name"],
        industry_keywords=", ".join(industry_data["keywords"]),
        industry_focus=industry_data["focus"],
        target_industry=target_industry,
    )

    return await get_ai_completion(
        prompt,
        system_msg=f"Eres un sistema ATS experto especializado en la industria de {industry_data['name']}. Sé riguroso y específico en tu análisis, enfocándote en lo que realmente importa para esta industria.",
    )


# =============================================================================
# CONVERSATIONAL CHAT SERVICE
# =============================================================================

async def generate_conversation_response(
    message: str,
    history: List[ChatMessage],
    cv_data: Dict[str, Any],
    current_phase: ConversationPhase,
    job_description: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Genera una respuesta conversacional para el chat del CV builder.

    Args:
        message: Mensaje del usuario
        history: Historial de mensajes
        cv_data: Datos actuales del CV
        current_phase: Fase actual de la conversación
        job_description: Descripción del puesto (opcional)

    Returns:
        Dict con la respuesta, extracción y nueva fase si aplica
    """
    if not settings.GROQ_API_KEY or settings.GROQ_API_KEY == "placeholder_key":
        logger.warning("GROQ_API_KEY not configured, returning fallback response")
        return {
            "response": "Lo siento, el servicio de IA no está disponible en este momento. Por favor, intenta más tarde.",
            "extraction": None,
            "new_phase": None,
        }

    # Preparar contexto de conversación
    chat_history = _format_chat_history(history[-5:])  # Últimos 5 mensajes
    cv_data_json = json.dumps(cv_data, indent=2, default=str)

    # Seleccionar prompt según fase
    system_prompt = get_phase_prompt(current_phase.value)

    # Construir prompt completo
    full_prompt = CONVERSATION_ORCHESTRATOR_PROMPT.format(
        current_phase=current_phase.value,
        cv_data=cv_data_json,
        chat_history=chat_history,
    ) + f"\n\nMENSAJE DEL USUARIO: {message}"

    try:
        # Llamar a la API de Groq
        # Ahora el modelo responde con texto directo, no JSON
        response = await get_ai_completion(full_prompt, system_prompt, use_json=False)

        response_text = str(response) if response else "Disculpa, ¿podrías repetirlo?"

        # Determinar nueva fase
        new_phase = _detect_phase_transition(message, response_text, current_phase, cv_data)

        return {
            "response": response_text,
            "extraction": None,
            "new_phase": new_phase,
        }

    except Exception as e:
        logger.error(f"Error generating conversation response: {e}")
        return {
            "response": "Disculpa, tuve un problema procesando tu mensaje. ¿Podrías repetirlo?",
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

    Yields:
        Eventos SSE con chunks de texto y extracciones
    """
    if not settings.GROQ_API_KEY or settings.GROQ_API_KEY == "placeholder_key":
        yield _format_sse_event({
            "type": "error",
            "error": "AI service not configured",
            "code": "SERVICE_UNAVAILABLE",
        })
        return

    try:
        # Preparar contexto
        chat_history = _format_chat_history(history[-5:])
        cv_data_json = json.dumps(cv_data, indent=2, default=str)
        system_prompt = get_phase_prompt(current_phase.value)

        full_prompt = CONVERSATION_ORCHESTRATOR_PROMPT.format(
            current_phase=current_phase.value,
            cv_data=cv_data_json,
            chat_history=chat_history,
        ) + f"\n\nMENSAJE DEL USUARIO: {message}"

        # Inicializar cliente Groq para streaming
        client = Groq(api_key=settings.GROQ_API_KEY)

        # Hacer llamada en streaming
        stream = client.chat.completions.create(
            model=MODEL_ID,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": full_prompt},
            ],
            temperature=0.7,
            stream=True,
        )

        accumulated_content = ""

        for chunk in stream:
            if chunk.choices[0].delta.content:
                content = chunk.choices[0].delta.content
                accumulated_content += content

                # Enviar delta
                yield _format_sse_event({
                    "type": "delta",
                    "content": content,
                })

        # Extraer datos al finalizar
        extraction = await extract_cv_data_from_message(message, history, cv_data, current_phase)

        if extraction and extraction.extracted:
            yield _format_sse_event({
                "type": "extraction",
                "extraction": extraction.model_dump(by_alias=True),
            })

        # Detectar cambio de fase
        new_phase = _detect_phase_transition(message, accumulated_content, current_phase, cv_data)
        if new_phase and new_phase != current_phase:
            yield _format_sse_event({
                "type": "phase_change",
                "newPhase": new_phase.value,
                "reason": "Conversation progressed naturally",
            })

        # Enviar evento de completado
        message_id = f"msg_{datetime.utcnow().timestamp()}"
        yield _format_sse_event({
            "type": "complete",
            "message": {
                "id": message_id,
                "role": "assistant",
                "content": accumulated_content,
                "timestamp": datetime.utcnow().isoformat(),
                "extraction": extraction.model_dump(by_alias=True) if extraction else None,
            },
            "finalExtraction": extraction.model_dump(by_alias=True) if extraction else None,
        })

    except Exception as e:
        logger.error(f"Error in streaming response: {e}")
        yield _format_sse_event({
            "type": "error",
            "error": str(e),
            "code": "STREAMING_ERROR",
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
    if not settings.GROQ_API_KEY or settings.GROQ_API_KEY == "placeholder_key":
        return None

    try:
        chat_history = _format_chat_history(history[-3:])
        cv_data_json = json.dumps(cv_data, indent=2, default=str)

        prompt = DATA_EXTRACTION_PROMPT.format(
            current_phase=current_phase.value,
            user_message=message,
            chat_history=chat_history,
            current_cv_data=cv_data_json,
        )

        response = await get_ai_completion(prompt, "Eres un extractor de datos preciso y cuidadoso.")

        if not response:
            return None

        # Parsear respuesta
        if isinstance(response, dict):
            extraction_data = response
        else:
            try:
                extraction_data = json.loads(response)
            except json.JSONDecodeError:
                logger.error(f"Failed to parse extraction response: {response}")
                return None

        return DataExtraction(
            extracted=extraction_data.get("extracted", {}),
            confidence=extraction_data.get("confidence", {}),
            needs_clarification=extraction_data.get("needs_clarification", []),
            follow_up_questions=extraction_data.get("follow_up_questions", []),
        )

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

        response = await get_ai_completion(
            prompt,
            "Eres un experto en reclutamiento y optimización de CVs.",
        )

        if not response:
            return None

        if isinstance(response, dict):
            data = response
        else:
            try:
                data = json.loads(response)
            except json.JSONDecodeError:
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
        ]

        return JobAnalysisResponse(
            match_score=data.get("match_score", 50),
            key_requirements=data.get("key_requirements", []),
            matched_skills=data.get("matched_skills", []),
            missing_skills=data.get("missing_skills", []),
            suggestions=suggestions,
            optimized_cv=data.get("optimized_cv"),
        )

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


def _detect_phase_transition(
    user_message: str,
    ai_response: str,
    current_phase: ConversationPhase,
    cv_data: Dict[str, Any],
) -> Optional[ConversationPhase]:
    """Detecta si debe haber una transición de fase."""
    # Lógica simple de transición basada en completitud
    completeness = _calculate_completeness(cv_data, current_phase)

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

    current_idx = phase_order.index(current_phase)

    # Si la fase actual está completa, avanzar
    if completeness.get("overall", 0) >= 0.8 and current_idx < len(phase_order) - 1:
        return phase_order[current_idx + 1]

    return None


def _calculate_completeness(cv_data: Dict[str, Any], current_phase: ConversationPhase) -> Dict[str, Any]:
    """Calcula la completitud de los datos del CV por sección."""
    personal_info = cv_data.get("personalInfo", {})
    experience = cv_data.get("experience", [])
    education = cv_data.get("education", [])
    skills = cv_data.get("skills", [])

    # Completitud de información personal
    personal_required = ["fullName", "email"]
    personal_complete = sum(1 for f in personal_required if personal_info.get(f))
    personal_total = len(personal_required)
    personal_score = personal_complete / personal_total if personal_total > 0 else 0

    # Completitud de experiencia
    exp_score = min(len(experience) / 1, 1.0)  # Al menos 1 experiencia

    # Completitud de educación
    edu_score = min(len(education) / 1, 1.0)  # Al menos 1 educación

    # Completitud de habilidades
    skills_score = min(len(skills) / 3, 1.0)  # Al menos 3 habilidades

    # Score general
    overall = (personal_score + exp_score + edu_score + skills_score) / 4

    return {
        "overall": overall,
        "personal_info": personal_score,
        "experience": exp_score,
        "education": edu_score,
        "skills": skills_score,
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
