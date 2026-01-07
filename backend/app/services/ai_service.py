import json
import logging
from groq import Groq
from app.core.config import settings

logger = logging.getLogger(__name__)

EXTRACT_CV_PROMPT = """
You are a precision-focused HR Data Extractor. 
Your task is to convert unstructured text into a structured CV JSON.

CRITICAL TRUTH RULES:
1. NEVER invent facts, dates, or skills.
2. If a value is missing, use an empty string or empty list.
3. DO NOT generate fake proficiency percentages or ratings.
4. MAINTAIN the ORIGINAL LANGUAGE of the source text.

RECRUITER HIERARCHY (Follow this order in summaries):
1. Who you are (Identity/Name)
2. What you do (Core professional expertise)
3. Where you are (Location & Availability)
4. What you've done (Experience)
5. Tools you master (Skills)

JSON SCHEMA:
{{
  "_analysis": "Think step-by-step: Identify the candidate's core role and current location first.",
  "personalInfo": {{
    "fullName": "Name",
    "email": "Email",
    "phone": "Phone",
    "location": "City, Country",
    "website": "URL",
    "linkedin": "URL",
    "github": "URL",
    "availability": "Remote/On-site/Hybrid",
    "summary": "Professional overview: [Identity] + [Core Value] + [Current Status]"
  }},
  "experience": [
    {{
      "company": "Company",
      "position": "Title",
      "startDate": "MM/YYYY",
      "endDate": "MM/YYYY or 'Present'",
      "current": boolean,
      "location": "City, Country",
      "description": "Clear role description focused on REAL responsibilities.",
      "highlights": ["Specific achievement from text"]
    }}
  ],
  "education": [
    {{
      "institution": "University/School",
      "degree": "Degree",
      "fieldOfStudy": "Field",
      "startDate": "YYYY",
      "endDate": "YYYY",
      "location": "City, Country",
      "description": "Details"
    }}
  ],
  "skills": [
    {{
      "name": "Skill",
      "level": "Beginner|Intermediate|Advanced|Expert",
      "category": "Soft Skills|Hard Skills|Languages"
    }}
  ],
  "projects": [
    {{
      "name": "Project Name",
      "description": "Short description",
      "highlights": ["Detail 1"],
      "url": "Link",
      "technologies": ["Tech 1"]
    }}
  ],
  "languages": [
    {{
      "language": "Language",
      "fluency": "Native|Fluent|Conversational|Basic"
    }}
  ],
  "certifications": [
    {{
      "name": "Certification",
      "issuer": "Issuer",
      "date": "MM/YYYY"
    }}
  ]
}}

- If multiple files are provided, consolidate.
- IMPORTANT: You MUST maintain the ORIGINAL LANGUAGE.
- Output ONLY the JSON object.

TEXT TO PROCESS:
{text}
"""

import traceback

async def extract_cv_data(text: str):
    if not settings.GROQ_API_KEY or settings.GROQ_API_KEY == "placeholder_key" or settings.GROQ_API_KEY == "your_groq_api_key_here":
        logger.critical(f"GROQ_API_KEY is invalid: {settings.GROQ_API_KEY}")
        return None
        
    try:
        # Debugging bit: print masked key
        masked_key = f"{settings.GROQ_API_KEY[:6]}...{settings.GROQ_API_KEY[-4:]}"
        logger.debug(f"Using Groq API Key: {masked_key}")

        client = Groq(api_key=settings.GROQ_API_KEY)
        
        # Modelo de alto razonamiento para mejor extracción de habilidades
        model_name = "llama-3.3-70b-versatile"
        
        completion = client.chat.completions.create(
            model=model_name,
            messages=[
                {"role": "system", "content": "You are a professional CV parser. You MUST return ONLY JSON documentation. Use the '_analysis' field to think deeply about the candidate's skills and experience. IMPORTANT: Maintain the ORIGINAL LANGUAGE of the input text. DO NOT TRANSLATE."},
                {"role": "user", "content": EXTRACT_CV_PROMPT.format(text=text)}
            ],
            temperature=0.2, # Un poco más de temperatura para permitir deducciones más ricas
            response_format={"type": "json_object"}
        )
        
        content = completion.choices[0].message.content
        logger.debug(f"AI Raw Content: {content[:100]}...") # Logueamos el inicio para debug
        
        if not content:
            logger.error("AI returned empty content")
            return None
            
        # Limpieza por si el modelo devuelve markdown ```json ... ```
        clean_content = content.replace("```json", "").replace("```", "").strip()
        
        try:
            return json.loads(clean_content)
        except json.JSONDecodeError as jde:
            logger.error(f"JSON Parse Error: {jde}", extra={"content": clean_content})
            return None
        
    except Exception as e:
        logger.error(f"ERROR in Groq API Service: {str(e)}", exc_info=True)
        return None

OPTIMIZE_CV_PROMPT = """
You are a Senior Career Coach. Your goal is to refine CV data for maximum clarity and recruiter impact.

ANTI-HALLUCINATION & SCHEMA RULES:
1. NEVER invent metrics, percentages, or numbers.
2. DO NOT add skills that the candidate does not possess.
3. Focus on "Destilling" truth rather than "Decorating" with lies.
4. Maintain ORIGINAL LANGUAGE.
5. STRICT KEY ADHERENCE: You must use the EXACT JSON keys provided in the input. 
   - For 'experience': Use 'company', 'position', 'startDate', 'endDate', 'highlights', 'description', 'location'. DO NOT use 'role', 'achievements', 'workPreference'.
   - For 'skills': Use 'name', 'level', 'category'.

TARGET ACTION: {target}
TARGET SECTION: {section}

RECRUITER-FIRST INSTRUCTIONS:
- Identify & Role: Ensure the summary starts with who they are and their primary job title.
- Location: Make sure the location and work preference (remote/onsite) are clear.
- Action Verbs: Use strong, professional verbs instead of passive ones.
- Brevity: Keep bullet points punchy and factual.

OUTPUT REQUIREMENT:
Return ONLY the JSON for the optimized section '{section}'. 
- If '{section}' is 'summary', return: {{"personalInfo": {{"summary": "your optimized summary"}}}}
- If '{section}' is an array (like 'experience' or 'skills'), return: {{"{section}": [{{...}}, {{...}}]}}
"""

import copy

async def optimize_cv_data(cv_data: dict, target: str = "shrink", section: str = "all"):
    if not settings.GROQ_API_KEY or settings.GROQ_API_KEY == "placeholder_key":
        return None
        
    try:
        client = Groq(api_key=settings.GROQ_API_KEY)
        cv_json = json.dumps(cv_data, indent=2)
        
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are a professional HR assistant. You MUST maintain the ORIGINAL LANGUAGE of the input data. DO NOT TRANSLATE. Return ONLY JSON for the specific section requested."},
                {"role": "user", "content": OPTIMIZE_CV_PROMPT.format(cv_json=cv_json, target=target, section=section)}
            ],
            temperature=0.1,
            response_format={"type": "json_object"}
        )
        
        ai_response = json.loads(completion.choices[0].message.content)
        
        # Surgical Merge in Python: Always return a FULL CVData object
        result_cv = copy.deepcopy(cv_data)
        
        if section == "all":
            # If everything was requested, try to merge what AI returned
            for key in ai_response:
                if key in result_cv:
                    result_cv[key] = ai_response[key]
        elif section == "summary":
            if "personalInfo" in ai_response and "summary" in ai_response["personalInfo"]:
                result_cv["personalInfo"]["summary"] = ai_response["personalInfo"]["summary"]
        elif section in ai_response:
            # For array sections like 'experience', 'skills', etc.
            result_cv[section] = ai_response[section]
            
        return result_cv
        
    except Exception as e:
        logger.error(f"ERROR in optimize_cv_data: {str(e)}", exc_info=True)
        return None

CRITIQUE_CV_PROMPT = """
You are a Ruthless Senior Technical Recruiter and ATS Expert. 
Your goal is to perform a deep-scan of the provided CV and identify exactly 3-5 high-impact improvements.

The output MUST be a valid JSON object with the following structure:
{{
  "critique": [
    {{
      "id": "unique-id-1",
      "target_field": "personalInfo.summary", 
      "category": "Impact|Brevity|Grammar|Formatting",
      "severity": "Critical|Suggested|Nitpick",
      "title": "Short punchy title",
      "description": "Clear explanation of the problem in the recruiter's voice.",
      "impact_reason": "Why this change will help the candidate get more interviews.",
      "original_text": "The exact text to be replaced",
      "suggested_text": "The improved version ready to be used"
    }}
  ]
}}

CRITICAL RULES:
1. Target fields must use dot notation (e.g., 'experience.0.description', 'personalInfo.summary', 'education.1.degree').
2. Be specific. Don't say "improve experience", say "Quantify results in your role at Google".
3. Maintain the ORIGINAL LANGUAGE of the CV. If the CV is in Spanish, the feedback and suggestions MUST be in Spanish.
4. If a field is already excellent, do not suggest changes for it.
5. Focus on Metrics (STAR method), Action Verbs, and Clarity.
6. The 'target_field' must exactly match the key path in the input JSON.

CV DATA:
{cv_json}
"""

async def critique_cv_data(cv_data: dict):
    if not settings.GROQ_API_KEY or settings.GROQ_API_KEY == "placeholder_key":
        return None
        
    try:
        client = Groq(api_key=settings.GROQ_API_KEY)
        cv_json = json.dumps(cv_data, indent=2)
        
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are a professional CV Auditor. You provide high-impact, specific improvements. You MUST maintain the ORIGINAL LANGUAGE of the input data. RETURN ONLY JSON."},
                {"role": "user", "content": CRITIQUE_CV_PROMPT.format(cv_json=cv_json)}
            ],
            temperature=0.3,
            response_format={"type": "json_object"}
        )
        
        content = completion.choices[0].message.content
        return json.loads(content)
    except Exception as e:
        logger.error(f"ERROR in critique_cv_data: {str(e)}", exc_info=True)
        return None
