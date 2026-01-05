import json
from groq import Groq
from app.core.config import settings

EXTRACT_CV_PROMPT = """
You are an expert HR and ATS (Applicant Tracking System) optimizer. 
Your task is to extract structured information from the following text (which can be a single CV or a collection of documents like cover letters, certifications, and LinkedIn profiles).

The output MUST be a valid JSON object following this schema:
{{
  "_analysis": "A detailed reasoning step where you analyze the candidate's profile, tone, and deduce implicit soft skills and technical depth before populating the fields.",
  "personalInfo": {{
    "fullName": "Full name",
    "email": "Email address",
    "phone": "Phone number",
    "location": "City, Country",
    "website": "URL (optional)",
    "linkedin": "LinkedIn URL (optional)",
    "github": "GitHub URL (optional)",
    "summary": "A professional summary (3-4 sentences)"
  }},
  "experience": [
    {{
      "company": "Company Name",
      "position": "Job Title",
      "startDate": "MM/YYYY",
      "endDate": "MM/YYYY or 'Present'",
      "current": boolean,
      "location": "City, Country",
      "description": "2-3 sentences summary",
      "highlights": ["Key achievement 1", "Key achievement 2"]
    }}
  ],
  "education": [
    {{
      "institution": "University/School",
      "degree": "Degree name",
      "fieldOfStudy": "Field of study",
      "startDate": "YYYY",
      "endDate": "YYYY or 'Present'",
      "location": "City, Country",
      "description": "Optional details"
    }}
  ],
  "skills": [
    {{
      "name": "Skill name",
      "level": "Beginner|Intermediate|Advanced|Expert",
      "category": "Soft Skills|Hard Skills|Languages"
    }}
  ],
  "projects": [
    {{
      "name": "Project Name",
      "description": "Short description",
      "highlights": ["Detail 1", "Detail 2"],
      "url": "Link (optional)",
      "technologies": ["Tech 1", "Tech 2"]
    }}
  ],
  "languages": [
    {{
      "language": "Language name",
      "fluency": "Native|Fluent|Conversational|Basic"
    }}
  ],
  "certifications": [
    {{
      "name": "Certification name",
      "issuer": "Issuing institution",
      "date": "MM/YYYY"
    }}
  ]
}}

- If multiple files are provided, consolidate the information.
- Use the methodology STAR for achievements.
- DEDUCE soft skills (like leadership, communication, problem-solving) based on the experience descriptions and highlights.
- IMPORTANT: You MUST maintain the ORIGINAL LANGUAGE of the source text for all fields. If the CV is in Spanish, the output values must be in Spanish. DO NOT TRANSLATE.
- If information is missing, leave it as an empty string or empty list, but DO NOT invent facts.
- Output ONLY the JSON object.

TEXT TO PROCESS:
{text}
"""

import traceback

async def extract_cv_data(text: str):
    if not settings.GROQ_API_KEY or settings.GROQ_API_KEY == "placeholder_key" or settings.GROQ_API_KEY == "your_groq_api_key_here":
        print(f"CRITICAL: GROQ_API_KEY is invalid: {settings.GROQ_API_KEY}")
        return None
        
    try:
        # Debugging bit: print masked key
        masked_key = f"{settings.GROQ_API_KEY[:6]}...{settings.GROQ_API_KEY[-4:]}"
        print(f"DEBUG: Using Groq API Key: {masked_key}")

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
        print(f"DEBUG: AI Raw Content: {content[:100]}...") # Logueamos el inicio para debug
        
        if not content:
            print("ERROR: AI returned empty content")
            return None
            
        # Limpieza por si el modelo devuelve markdown ```json ... ```
        clean_content = content.replace("```json", "").replace("```", "").strip()
        
        try:
            return json.loads(clean_content)
        except json.JSONDecodeError as jde:
            print(f"JSON Parse Error: {jde}")
            print(f"Content that failed: {clean_content}")
            return None
        
    except Exception as e:
        print(f"ERROR in Groq API Service: {str(e)}")
        traceback.print_exc()
        return None

OPTIMIZE_CV_PROMPT = """
You are an expert HR editor. Your goal is to optimize the following CV data for {target}.
The output MUST be a valid JSON object matching the input schema exactly.

Current CV Data:
{cv_json}

INSTRUCTIONS:
- If target is 'shrink': Concise everything. Reduce word count by 30-40%. Use punchy action verbs. Keep only the most impressive highlights.
- If target is 'improve': Better vocabulary, clearer impact, STAR method.
- DO NOT change facts (dates, company names, titles).
- CRITICAL: You MUST maintain the ORIGINAL LANGUAGE of the CV data. If the input is in Spanish, the output MUST be in Spanish. DO NOT translate to English or any other language.
- Return ONLY the JSON object.
"""

async def optimize_cv_data(cv_data: dict, target: str = "shrink"):
    if not settings.GROQ_API_KEY or settings.GROQ_API_KEY == "placeholder_key":
        return None
        
    try:
        client = Groq(api_key=settings.GROQ_API_KEY)
        cv_json = json.dumps(cv_data, indent=2)
        
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are a professional HR assistant. You MUST maintain the ORIGINAL LANGUAGE of the input data. DO NOT TRANSLATE. Return ONLY JSON."},
                {"role": "user", "content": OPTIMIZE_CV_PROMPT.format(cv_json=cv_json, target=target)}
            ],
            temperature=0.1,
            response_format={"type": "json_object"}
        )
        
        content = completion.choices[0].message.content
        return json.loads(content)
    except Exception as e:
        print(f"ERROR in optimize_cv_data: {str(e)}")
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
        print(f"ERROR in critique_cv_data: {str(e)}")
        return None
