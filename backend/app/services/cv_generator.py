"""
CV Generator Service

Provides complete CV generation functionality with AI enhancement,
template-specific formatting, and structured output for frontend templates.
"""

import json
import logging
from typing import Dict, Any, Optional, List, Literal
from datetime import datetime
from app.core.config import settings
from app.core.exceptions import CVProcessingError, AIServiceError
from app.services.ai_service import get_ai_completion, get_system_rules
from app.core.templates import registry

logger = logging.getLogger(__name__)

# =============================================================================
# CV GENERATION PROMPTS
# =============================================================================

CV_GENERATION_PROMPT = """
Task: Generate a complete, professional CV based on the provided CV data.
Goal: Create a polished, well-structured CV optimized for job applications.

Instructions:
1. Review and enhance the CV data while maintaining factual accuracy
2. Ensure all sections are properly formatted
3. Add any missing but inferrable information where appropriate
4. Optimize for clarity and impact
5. Maintain consistent formatting throughout
6. Language: {language} (match the input language)

Input CV Data:
{cv_json}

Return a complete CV structure with the following enhanced sections:
{{
    "personalInfo": {{
        "fullName": "...",
        "email": "...",
        "phone": "...",
        "location": "...",
        "summary": "...",
        "website": "...",
        "linkedin": "...",
        "github": "...",
        "role": "..."
    }},
    "experience": [
        {{
            "id": "...",
            "company": "...",
            "position": "...",
            "startDate": "...",
            "endDate": "...",
            "current": true/false,
            "location": "...",
            "description": "...",
            "highlights": ["...", "..."]
        }}
    ],
    "education": [
        {{
            "id": "...",
            "institution": "...",
            "degree": "...",
            "fieldOfStudy": "...",
            "startDate": "...",
            "endDate": "...",
            "location": "...",
            "description": "..."
        }}
    ],
    "skills": [
        {{
            "id": "...",
            "name": "...",
            "level": "Beginner|Intermediate|Advanced|Expert",
            "proficiency": 0-100,
            "category": "..."
        }}
    ],
    "projects": [
        {{
            "id": "...",
            "name": "...",
            "description": "...",
            "url": "...",
            "technologies": [...]
        }}
    ],
    "languages": [
        {{
            "id": "...",
            "language": "...",
            "fluency": "Native|Fluent|Conversational|Basic"
        }}
    ],
    "certifications": [
        {{
            "id": "...",
            "name": "...",
            "issuer": "...",
            "date": "...",
            "url": "..."
        }}
    ]
}}
"""

# =============================================================================
# GENERATOR FUNCTIONS
# =============================================================================


async def generate_complete_cv(cv_data: Dict[str, Any], template_type: str) -> Dict[str, Any]:
    """
    Generate a complete CV with AI enhancement and template-specific formatting.

    Args:
        cv_data: Dictionary containing CV data with sections:
            - personalInfo: Personal information
            - experience: List of work experiences
            - education: List of education entries
            - skills: List of skills
            - projects: List of projects
            - languages: List of languages
            - certifications: List of certifications
        template_type: Type of template to format for

    Returns:
        Complete generated CV with metadata

    Raises:
        CVProcessingError: If CV generation fails
        AIServiceError: If AI service is unavailable
    """
    try:
        # Validate input data
        if not cv_data or not isinstance(cv_data, dict):
            raise CVProcessingError("Invalid CV data provided")

        template_config = registry.get_template(template_type)
        if not template_config:
            raise CVProcessingError(f"Invalid template type: {template_type}")

        # Detect language from CV data
        language = _detect_language(cv_data)

        # Prepare the CV JSON
        cv_json = json.dumps(cv_data, indent=2, ensure_ascii=False)

        # Generate enhanced CV with AI
        generation_prompt = CV_GENERATION_PROMPT.format(
            language=language, cv_json=cv_json
        )
        formatting_prompt = template_config.prompt

        combined_prompt = f"{generation_prompt}\n\n{formatting_prompt}"

        ai_response = await get_ai_completion(
            prompt=combined_prompt,
            system_msg=get_system_rules(),
            use_json=True,
        )

        if not ai_response or not isinstance(ai_response, dict):
            raise CVProcessingError("AI generation failed to produce valid CV data")

        # Process and validate the response
        enhanced_cv = _process_generated_cv(ai_response, cv_data)

        # Generate metadata for the frontend
        metadata = _generate_cv_metadata(enhanced_cv, template_type)

        # Build the complete response
        result = {
            "data": enhanced_cv,
            "metadata": metadata,
            "template_type": template_type,
            "generated_at": datetime.utcnow().isoformat(),
        }

        logger.info(f"Successfully generated CV for template: {template_type}")
        return result

    except CVProcessingError:
        raise
    except AIServiceError:
        raise
    except Exception as e:
        logger.exception(f"Unexpected error in generate_complete_cv: {e}")
        raise CVProcessingError(f"CV generation failed: {str(e)}")


def _detect_language(cv_data: Dict[str, Any]) -> str:
    """
    Detect the language of the CV data.

    Args:
        cv_data: CV data dictionary

    Returns:
        Detected language code ('es' or 'en')
    """
    # Check summary and descriptions for language indicators
    text_samples = []

    personal_info = cv_data.get("personalInfo", {})
    if personal_info.get("summary"):
        text_samples.append(personal_info["summary"])

    # Check experience descriptions
    for exp in cv_data.get("experience", []):
        if exp.get("description"):
            text_samples.append(exp["description"])

    # Check education descriptions
    for edu in cv_data.get("education", []):
        if edu.get("description"):
            text_samples.append(edu["description"])

    # Simple language detection
    spanish_indicators = [
        "usted",
        "ustedes",
        "años",
        "experiencia",
        "educación",
        "habilidades",
        "proyectos",
        "certificaciones",
        "realicé",
        "lideré",
        "desarrollé",
        "gestioné",
        "creé",
        "presente",
        "licenciatura",
        "ingeniería",
    ]

    text_content = " ".join(text_samples).lower()

    spanish_count = sum(1 for word in spanish_indicators if word in text_content)

    return "es" if spanish_count > 0 else "en"


def _process_generated_cv(
    ai_response: Dict[str, Any], original_data: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Process and validate the AI-generated CV response.

    Args:
        ai_response: Raw AI response
        original_data: Original input data for preservation

    Returns:
        Processed CV data
    """
    # Ensure required sections exist
    processed = {
        "personalInfo": {},
        "experience": [],
        "education": [],
        "skills": [],
        "projects": [],
        "languages": [],
        "certifications": [],
    }

    # Process personal info - preserve original identity fields
    personal_info = ai_response.get("personalInfo", original_data.get("personalInfo", {}))
    identity_fields = ["fullName", "email", "phone", "location"]
    for field in identity_fields:
        if field in personal_info and personal_info[field]:
            processed["personalInfo"][field] = personal_info[field]
        elif field in original_data.get("personalInfo", {}):
            processed["personalInfo"][field] = original_data["personalInfo"][field]

    # Allow AI to improve summary
    if personal_info.get("summary"):
        processed["personalInfo"]["summary"] = personal_info["summary"]
    elif original_data.get("personalInfo", {}).get("summary"):
        processed["personalInfo"]["summary"] = original_data["personalInfo"]["summary"]

    # Preserve URLs
    for field in ["website", "linkedin", "github"]:
        if field in original_data.get("personalInfo", {}):
            processed["personalInfo"][field] = original_data["personalInfo"][field]
        elif personal_info.get(field):
            processed["personalInfo"][field] = personal_info[field]

    # Process experience
    experience = ai_response.get("experience", original_data.get("experience", []))
    processed["experience"] = _process_experience_list(experience)

    # Process education
    education = ai_response.get("education", original_data.get("education", []))
    processed["education"] = _process_education_list(education)

    # Process skills
    skills = ai_response.get("skills", original_data.get("skills", []))
    processed["skills"] = _process_skills_list(skills)

    # Process projects
    projects = ai_response.get("projects", original_data.get("projects", []))
    processed["projects"] = _process_projects_list(projects)

    # Process languages
    languages = ai_response.get("languages", original_data.get("languages", []))
    processed["languages"] = _process_languages_list(languages)

    # Process certifications
    certifications = ai_response.get(
        "certifications", original_data.get("certifications", [])
    )
    processed["certifications"] = _process_certifications_list(certifications)

    return processed


def _sort_by_order(items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Ordena por campo order si existe, manteniendo el orden original cuando falta."""
    indexed_items = []
    has_order = False
    for index, item in enumerate(items):
        if not isinstance(item, dict):
            indexed_items.append((None, index, item))
            continue
        order_value = item.get("order")
        if isinstance(order_value, int):
            has_order = True
        indexed_items.append((order_value if isinstance(order_value, int) else None, index, item))

    if not has_order:
        return items

    indexed_items.sort(
        key=lambda entry: (entry[0] is None, entry[0] if entry[0] is not None else entry[1], entry[1])
    )
    return [item for _, _, item in indexed_items]


def _process_experience_list(experience: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Process and validate experience entries."""
    processed = []
    for i, exp in enumerate(_sort_by_order(experience)):
        if not isinstance(exp, dict):
            continue
        order_value = exp.get("order")
        processed.append({
            "id": exp.get("id", f"exp_{i}"),
            "order": order_value if isinstance(order_value, int) else i + 1,
            "company": exp.get("company", ""),
            "position": exp.get("position", ""),
            "startDate": exp.get("startDate", ""),
            "endDate": exp.get("endDate", "Present"),
            "current": exp.get("current", False),
            "location": exp.get("location", ""),
            "description": exp.get("description", ""),
            "highlights": exp.get("highlights", []) if isinstance(exp.get("highlights"), list) else [],
        })
    return processed


def _process_education_list(education: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Process and validate education entries."""
    processed = []
    for i, edu in enumerate(_sort_by_order(education)):
        if not isinstance(edu, dict):
            continue
        order_value = edu.get("order")
        processed.append({
            "id": edu.get("id", f"edu_{i}"),
            "order": order_value if isinstance(order_value, int) else i + 1,
            "institution": edu.get("institution", ""),
            "degree": edu.get("degree", ""),
            "fieldOfStudy": edu.get("fieldOfStudy", ""),
            "startDate": edu.get("startDate", ""),
            "endDate": edu.get("endDate", ""),
            "location": edu.get("location", ""),
            "description": edu.get("description", ""),
        })
    return processed


def _process_skills_list(skills: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Process and validate skills entries."""
    processed = []
    for i, skill in enumerate(skills):
        if not isinstance(skill, dict):
            continue
        level = skill.get("level", "Intermediate")
        # Normalize level
        level_normalized = _normalize_skill_level(level)
        proficiency = skill.get("proficiency", _level_to_proficiency(level_normalized))
        processed.append({
            "id": skill.get("id", f"skill_{i}"),
            "name": skill.get("name", ""),
            "level": level_normalized,
            "proficiency": proficiency,
            "category": skill.get("category", ""),
        })
    return processed


def _process_projects_list(projects: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Process and validate project entries."""
    processed = []
    for i, proj in enumerate(_sort_by_order(projects)):
        if not isinstance(proj, dict):
            continue
        order_value = proj.get("order")
        processed.append({
            "id": proj.get("id", f"proj_{i}"),
            "order": order_value if isinstance(order_value, int) else i + 1,
            "name": proj.get("name", ""),
            "description": proj.get("description", ""),
            "url": proj.get("url", ""),
            "technologies": proj.get("technologies", []) if isinstance(proj.get("technologies"), list) else [],
        })
    return processed


def _process_languages_list(languages: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Process and validate language entries."""
    processed = []
    for i, lang in enumerate(languages):
        if not isinstance(lang, dict):
            continue
        processed.append({
            "id": lang.get("id", f"lang_{i}"),
            "language": lang.get("language", ""),
            "fluency": lang.get("fluency", "Conversational"),
        })
    return processed


def _process_certifications_list(
    certifications: List[Dict[str, Any]]
) -> List[Dict[str, Any]]:
    """Process and validate certification entries."""
    processed = []
    for i, cert in enumerate(certifications):
        if not isinstance(cert, dict):
            continue
        processed.append({
            "id": cert.get("id", f"cert_{i}"),
            "name": cert.get("name", ""),
            "issuer": cert.get("issuer", ""),
            "date": cert.get("date", ""),
            "url": cert.get("url", ""),
        })
    return processed


def _normalize_skill_level(level: str) -> str:
    """Normalize skill level to standard values."""
    level_lower = level.lower() if level else ""
    mapping = {
        "principiante": "Beginner",
        "beginner": "Beginner",
        "novice": "Beginner",
        "intermedio": "Intermediate",
        "intermediate": "Intermediate",
        "avanzado": "Advanced",
        "advanced": "Advanced",
        "experto": "Expert",
        "expert": "Expert",
        "master": "Expert",
    }
    return mapping.get(level_lower, "Intermediate")


def _level_to_proficiency(level: str) -> int:
    """Convert skill level to proficiency percentage."""
    mapping = {
        "Beginner": 25,
        "Intermediate": 50,
        "Advanced": 75,
        "Expert": 100,
    }
    return mapping.get(level, 50)


def _generate_cv_metadata(cv_data: Dict[str, Any], template_type: str) -> Dict[str, Any]:
    """
    Generate metadata for the CV.

    Args:
        cv_data: Processed CV data
        template_type: Template type used

    Returns:
        Metadata dictionary
    """
    # Count sections
    experience_count = len(cv_data.get("experience", []))
    education_count = len(cv_data.get("education", []))
    skills_count = len(cv_data.get("skills", []))
    projects_count = len(cv_data.get("projects", []))
    certifications_count = len(cv_data.get("certifications", []))

    # Calculate completeness score
    required_sections = ["personalInfo", "experience", "education", "skills"]
    filled_sections = sum(
        1
        for section in required_sections
        if cv_data.get(section) and (
            section != "personalInfo" or bool(cv_data["personalInfo"])
        )
    )
    completeness_score = int((filled_sections / len(required_sections)) * 100)

    # Detect sections with data
    sections = []
    if experience_count > 0:
        sections.append("experience")
    if education_count > 0:
        sections.append("education")
    if skills_count > 0:
        sections.append("skills")
    if projects_count > 0:
        sections.append("projects")
    if cv_data.get("languages"):
        sections.append("languages")
    if certifications_count > 0:
        sections.append("certifications")

    return {
        "completeness_score": completeness_score,
        "section_counts": {
            "experience": experience_count,
            "education": education_count,
            "skills": skills_count,
            "projects": projects_count,
            "certifications": certifications_count,
        },
        "sections": sections,
        "template_type": template_type,
        "version": "1.0",
    }
