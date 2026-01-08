import json
import logging
import os
import copy
from typing import Optional, Dict, Any
from groq import Groq
from app.core.config import settings

logger = logging.getLogger(__name__)

# --- SYSTEM PROMPTS (THE BIBLE OF TRUTH) ---

SYSTEM_RULES = """
You are a TECHNICAL RESUME COMPILER. You operate under 100% factual integrity.
- IDENTITY LOCK: Never change the candidate's Name, Email, Phone, Location, Company Names, or Job Titles.
- NO HALLUCINATIONS: Do not invent metrics, percentages, or achievements not explicitly stated.
- LANGUAGE LOYALTY: You must respond in the EXACT same language as the input. 
- FORMAT: You only output valid JSON. No conversational text.
"""

EXTRACT_CV_PROMPT = """
Task: Convert the provided text into a structured CV JSON.
Rules:
- If a value is missing, use "".
- If the text is in Spanish, keep it in Spanish.
- EDUCATION: Always try to separate the 'degree' (e.g., "Técnico", "Licenciatura") from the 'fieldOfStudy' (e.g., "Radiología", "Informática"). If the text says "Técnico en Informática", degree is "Técnico" and fieldOfStudy is "Informática".
- Do NOT normalize job titles. 
- Strictly follow this schema:
{{
  "personalInfo": {{ "fullName": "", "email": "", "phone": "", "location": "", "summary": "", "website": "", "linkedin": "", "github": "" }},
  "experience": [ {{ "company": "", "position": "", "location": "", "startDate": "", "endDate": "", "current": false, "description": "" }} ],
  "education": [ {{ "institution": "", "degree": "", "fieldOfStudy": "", "location": "", "startDate": "", "endDate": "" }} ],
  "skills": [ {{ "name": "", "level": "Beginner/Intermediate/Advanced/Expert" }} ],
  "languages": [ {{ "language": "", "fluency": "" }} ],
  "projects": [ {{ "name": "", "description": "", "technologies": [] }} ],
  "certifications": [ {{ "name": "", "issuer": "", "date": "" }} ]
}}

Input: {text}
"""

OPTIMIZE_PROMPT = """
Task: {target}
Target Section: {section}

Constraints:
1. DO NOT change Job Titles, Company Names, or Locations.
2. Focus ONLY on improving the writing style of 'description' or 'summary' fields.
3. Use high-impact action verbs (e.g., 'Optimized', 'Resolved', 'Maintained').
4. If target is 'suggest skills', ONLY extract technical tools mentioned in the experience. DO NOT suggest roles like 'Data Analyst' if not present.
5. LANGUAGE LOCK: Preserve the ORIGINAL LANGUAGE of every field (including experience descriptions, summary, etc.). Do NOT translate to English under any circumstance.

Original JSON:
{cv_json}

Return ONLY the JSON for the '{section}' part.
"""

CRITIQUE_PROMPT = """
Task: Critique this CV HARSHLY for a recruiter. Be a demanding gatekeeper, not a cheerleader.

MANDATORY CHECKS (if ANY fails, score MUST be < 70):
1. SUMMARY: Does it clearly state WHO they are and WHAT value they bring? If generic ("profesional con experiencia"), FAIL.
2. EXPERIENCE: Does EACH role have specific achievements or responsibilities? Vague descriptions like "tareas varias" = FAIL.
3. SKILLS: Are they relevant and specific? Generic skills without context = FAIL.
4. COMPLETENESS: Are there empty fields that should be filled? Missing dates, locations = FAIL.
5. ONE-PAGE CHECK: Estimate if content fits one page (~800 words). If too long, FLAG it.

SCORING GUIDE:
- 90-100: Perfect, recruiter-ready CV
- 70-89: Good but needs minor fixes
- 50-69: Significant issues, needs work
- 0-49: Major problems, almost unusable

LANGUAGE: Respond in the SAME language as the CV content.

Return JSON: 
{{ 
  "score": 0-100, 
  "one_page_viable": true/false,
  "word_count_estimate": number,
  "overall_verdict": "string describing main issue in 1 sentence",
  "improvements": [ 
    {{ "section": "string", "message": "string", "severity": "low/medium/high", "target_field": "string", "suggested_text": "string" }} 
  ] 
}}

CV Data: {cv_json}
"""

# --- SERVICE FUNCTIONS ---

async def get_ai_completion(prompt: str, system_msg: str = SYSTEM_RULES):
    if not settings.GROQ_API_KEY or settings.GROQ_API_KEY == "placeholder_key":
        return None
    try:
        client = Groq(api_key=settings.GROQ_API_KEY)
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_msg},
                {"role": "user", "content": prompt}
            ],
            temperature=0.1,
            response_format={"type": "json_object"}
        )
        return json.loads(completion.choices[0].message.content)
    except Exception as e:
        logger.error(f"AI Error: {str(e)}", exc_info=True)
        return None

async def extract_cv_data(text: str):
    return await get_ai_completion(EXTRACT_CV_PROMPT.format(text=text))

async def optimize_cv_data(cv_data: dict, target: str, section: str):
    # PRE-HACK: Back up critical fields to prevent AI corruption
    original_copy = copy.deepcopy(cv_data)
    
    cv_json = json.dumps(cv_data, indent=2)
    ai_response = await get_ai_completion(OPTIMIZE_PROMPT.format(target=target, section=section, cv_json=cv_json))
    
    if not ai_response: return original_copy

    result_cv = copy.deepcopy(original_copy)

    # SECURE MERGE LOGIC
    if section == "summary":
        new_summary = ai_response.get("personalInfo", {}).get("summary") or ai_response.get("summary")
        if new_summary:
            result_cv["personalInfo"]["summary"] = new_summary
            
    elif section == "experience" and "experience" in ai_response:
        # Prevent AI from changing positions/companies during experience optimization
        for i, item in enumerate(ai_response["experience"]):
            if i < len(result_cv["experience"]):
                # Keep original anchors
                item["company"] = result_cv["experience"][i]["company"]
                item["position"] = result_cv["experience"][i]["position"]
                item["location"] = result_cv["experience"][i]["location"]
                result_cv["experience"][i] = item
                
    elif section in ai_response:
        result_cv[section] = ai_response[section]

    return result_cv

async def critique_cv_data(cv_data: dict):
    cv_json = json.dumps(cv_data, indent=2)
    return await get_ai_completion(CRITIQUE_PROMPT.format(cv_json=cv_json))

# --- INTERVIEW/ROLE-TARGETED OPTIMIZATION ---

INTERVIEW_OPTIMIZE_PROMPT = """
Task: Optimize this CV specifically for the target role: "{target_role}"

STRATEGY:
1. SUMMARY: Rewrite to clearly position the candidate for "{target_role}".
2. EXPERIENCE: 
   - KEEP & EXPAND roles directly relevant to "{target_role}".
   - SHRINK irrelevant roles to 1-2 lines maximum.
   - Reorder with most relevant experience FIRST.
3. SKILLS: Prioritize skills matching "{target_role}" requirements.
4. TARGET: ONE PAGE (~800 words max). Cut ruthlessly if needed.

CONSTRAINTS:
- Keep the ORIGINAL LANGUAGE of the CV.
- Do NOT invent new achievements or experiences.
- Do NOT change company names, job titles, or dates.
- Preserve all IDs in arrays.

Original CV:
{cv_json}

Return the COMPLETE optimized CV JSON with ALL sections.
"""

async def optimize_for_role(cv_data: dict, target_role: str):
    """Optimize CV for a specific target job role."""
    original_copy = copy.deepcopy(cv_data)
    cv_json = json.dumps(cv_data, indent=2)
    
    ai_response = await get_ai_completion(
        INTERVIEW_OPTIMIZE_PROMPT.format(target_role=target_role, cv_json=cv_json)
    )
    
    if not ai_response:
        return original_copy
    
    # Restore critical identity fields that AI might have changed
    if "personalInfo" in ai_response and "personalInfo" in original_copy:
        ai_response["personalInfo"]["fullName"] = original_copy["personalInfo"].get("fullName", "")
        ai_response["personalInfo"]["email"] = original_copy["personalInfo"].get("email", "")
        ai_response["personalInfo"]["phone"] = original_copy["personalInfo"].get("phone", "")
        ai_response["personalInfo"]["location"] = original_copy["personalInfo"].get("location", "")
    
    # Preserve config (template settings)
    if "config" in original_copy:
        ai_response["config"] = original_copy["config"]
    
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
