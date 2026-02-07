import io
import json
import textwrap
from datetime import datetime
from typing import Any, Dict, List, Tuple

from docx import Document
from docx.shared import Pt
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

from app.core.exceptions import ValidationError
from app.core.templates import registry

SUPPORTED_EXPORT_FORMATS = {"pdf", "docx", "txt", "json"}

EXPORT_MIME_TYPES = {
    "pdf": "application/pdf",
    "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "txt": "text/plain",
    "json": "application/json",
}

SECTION_LABELS = {
    "summary": "Perfil Profesional",
    "experience": "Experiencia",
    "education": "Educación",
    "skills": "Habilidades",
    "projects": "Proyectos",
    "certifications": "Certificaciones",
    "languages": "Idiomas",
    "interests": "Intereses",
    "tools": "Herramientas",
}


def build_export_payload(
    cv_data: Dict[str, Any],
    template_id: str,
    export_format: str,
) -> Tuple[bytes, str, str]:
    """Genera un archivo descargable con formato y plantilla específicos."""
    template_config = registry.get_template(template_id)
    if not template_config:
        raise ValidationError(f"Plantilla no soportada: {template_id}")

    if export_format not in SUPPORTED_EXPORT_FORMATS:
        raise ValidationError(f"Formato no soportado: {export_format}")

    file_name = _build_filename(cv_data, template_id, export_format)
    if export_format == "json":
        content = _build_json_export(cv_data, template_id)
    elif export_format == "txt":
        content = _build_txt_export(cv_data, template_id)
    elif export_format == "docx":
        content = _build_docx_export(cv_data, template_id)
    elif export_format == "pdf":
        content = _build_pdf_export(cv_data, template_id)
    else:
        raise ValidationError(f"Formato no soportado: {export_format}")

    return content, file_name, EXPORT_MIME_TYPES[export_format]


def _build_filename(cv_data: Dict[str, Any], template_id: str, export_format: str) -> str:
    personal_info = cv_data.get("personalInfo", {})
    full_name = personal_info.get("fullName") or "cv"
    safe_name = "_".join(full_name.strip().split())

    template_config = registry.get_template(template_id)
    template_label = template_config.name if template_config else template_id

    timestamp = datetime.utcnow().strftime("%Y%m%d")
    return f"cv_{safe_name}_{template_label}_{timestamp}.{export_format}"


def _is_section_visible(cv_data: Dict[str, Any], section: str) -> bool:
    config = cv_data.get("config") or {}
    sections_config = config.get("sections") or {}
    section_config = sections_config.get(section) or {}
    return section_config.get("visible", True)


def _build_json_export(cv_data: Dict[str, Any], template_id: str) -> bytes:
    payload = {
        "template": template_id,
        "generatedAt": datetime.utcnow().isoformat(),
        "data": cv_data,
    }
    return json.dumps(payload, ensure_ascii=False, indent=2).encode("utf-8")


def _build_txt_export(cv_data: Dict[str, Any], template_id: str) -> bytes:
    lines: List[str] = []
    personal_info = cv_data.get("personalInfo", {})
    full_name = personal_info.get("fullName") or "Sin nombre"
    role = personal_info.get("role")

    lines.append(full_name)
    if role:
        lines.append(role)
    lines.append("=" * 60)

    contact_parts = [
        personal_info.get("email"),
        personal_info.get("phone"),
        personal_info.get("location"),
    ]
    contact = " | ".join([item for item in contact_parts if item])
    if contact:
        lines.append(contact)

    link_parts = []
    if personal_info.get("linkedin"):
        link_parts.append(f"LinkedIn: {personal_info.get('linkedin')}")
    if personal_info.get("github"):
        link_parts.append(f"GitHub: {personal_info.get('github')}")
    if personal_info.get("website"):
        link_parts.append(f"Web: {personal_info.get('website')}")
    if link_parts:
        lines.append(" | ".join(link_parts))

    lines.append("")

    template_config = registry.get_template(template_id)
    section_order = template_config.section_order if template_config else []

    for section in section_order:
        if not _is_section_visible(cv_data, section):
            continue
        section_lines = _render_section_txt(cv_data, section)
        if section_lines:
            lines.extend(section_lines)
            lines.append("")

    return "\n".join(lines).strip().encode("utf-8")


def _render_section_txt(cv_data: Dict[str, Any], section: str) -> List[str]:
    lines: List[str] = []
    label = SECTION_LABELS.get(section, section.title())

    if section == "summary":
        summary = cv_data.get("personalInfo", {}).get("summary")
        if summary:
            lines.append(label.upper())
            lines.append("-" * len(label))
            lines.append(summary)
    elif section == "experience":
        experiences = cv_data.get("experience", [])
        if experiences:
            lines.append(label.upper())
            lines.append("-" * len(label))
            for exp in experiences:
                title = exp.get("position") or "Sin título"
                company = exp.get("company")
                location = exp.get("location")
                dates = _format_date_range(exp.get("startDate"), exp.get("endDate"), exp.get("current"))
                lines.append(f"{title}{f' · {company}' if company else ''}")
                if location or dates:
                    meta = " | ".join([item for item in [location, dates] if item])
                    lines.append(f"  {meta}")
                if exp.get("description"):
                    lines.append(f"  {exp.get('description')}")
                lines.append("")
    elif section == "education":
        education = cv_data.get("education", [])
        if education:
            lines.append(label.upper())
            lines.append("-" * len(label))
            for edu in education:
                degree = edu.get("degree") or "Sin título"
                institution = edu.get("institution")
                location = edu.get("location")
                dates = _format_date_range(edu.get("startDate"), edu.get("endDate"), False)
                lines.append(f"{degree}{f' · {institution}' if institution else ''}")
                if location or dates:
                    meta = " | ".join([item for item in [location, dates] if item])
                    lines.append(f"  {meta}")
                if edu.get("description"):
                    lines.append(f"  {edu.get('description')}")
                lines.append("")
    elif section == "skills":
        skills = [skill.get("name") for skill in cv_data.get("skills", []) if skill.get("name")]
        if skills:
            lines.append(label.upper())
            lines.append("-" * len(label))
            lines.append(" • ".join(skills))
    elif section == "projects":
        projects = cv_data.get("projects", [])
        if projects:
            lines.append(label.upper())
            lines.append("-" * len(label))
            for proj in projects:
                name = proj.get("name") or "Proyecto"
                description = proj.get("description")
                lines.append(name)
                if description:
                    lines.append(f"  {description}")
                if proj.get("url"):
                    lines.append(f"  {proj.get('url')}")
                if proj.get("technologies"):
                    lines.append(f"  Tecnologías: {', '.join(proj.get('technologies'))}")
                lines.append("")
    elif section == "certifications":
        certifications = cv_data.get("certifications", [])
        if certifications:
            lines.append(label.upper())
            lines.append("-" * len(label))
            for cert in certifications:
                title = cert.get("name") or "Certificación"
                issuer = cert.get("issuer")
                date = cert.get("date")
                lines.append(f"{title}{f' · {issuer}' if issuer else ''}{f' ({date})' if date else ''}")
                if cert.get("url"):
                    lines.append(f"  {cert.get('url')}")
            lines.append("")
    elif section == "languages":
        languages = cv_data.get("languages", [])
        if languages:
            lines.append(label.upper())
            lines.append("-" * len(label))
            lines.append(
                " • ".join(
                    [
                        _format_language_entry(lang)
                        for lang in languages
                        if lang.get("language")
                    ]
                )
            )
    elif section == "interests":
        interests = cv_data.get("interests", [])
        if interests:
            lines.append(label.upper())
            lines.append("-" * len(label))
            lines.append(" • ".join([interest.get("name") for interest in interests if interest.get("name")]))
    elif section == "tools":
        tools = cv_data.get("tools", [])
        if tools:
            lines.append(label.upper())
            lines.append("-" * len(label))
            lines.append(" • ".join([tool for tool in tools if tool]))

    return [line for line in lines if line is not None]


def _build_docx_export(cv_data: Dict[str, Any], template_id: str) -> bytes:
    document = Document()
    personal_info = cv_data.get("personalInfo", {})
    template_config = registry.get_template(template_id)
    style = template_config.styles if template_config else {}
    section_order = template_config.section_order if template_config else []

    name_heading = document.add_heading(personal_info.get("fullName") or "Sin nombre", level=0)
    name_run = name_heading.runs[0]
    name_run.font.name = style["heading_font"]
    name_run.font.size = Pt(20)

    if personal_info.get("role"):
        role_paragraph = document.add_paragraph(personal_info.get("role"))
        role_run = role_paragraph.runs[0]
        role_run.font.name = style["body_font"]
        role_run.font.size = Pt(11)

    contact_parts = [
        personal_info.get("email"),
        personal_info.get("phone"),
        personal_info.get("location"),
    ]
    contact = " | ".join([item for item in contact_parts if item])
    if contact:
        contact_paragraph = document.add_paragraph(contact)
        contact_paragraph.runs[0].font.name = style["body_font"]

    link_parts = []
    if personal_info.get("linkedin"):
        link_parts.append(f"LinkedIn: {personal_info.get('linkedin')}")
    if personal_info.get("github"):
        link_parts.append(f"GitHub: {personal_info.get('github')}")
    if personal_info.get("website"):
        link_parts.append(f"Web: {personal_info.get('website')}")
    if link_parts:
        link_paragraph = document.add_paragraph(" | ".join(link_parts))
        link_paragraph.runs[0].font.name = style.get("body_font")

    for section in section_order:
        if not _is_section_visible(cv_data, section):
            continue
        _render_section_docx(document, cv_data, section, style)

    buffer = io.BytesIO()
    document.save(buffer)
    buffer.seek(0)
    return buffer.read()


def _render_section_docx(
    document: Document,
    cv_data: Dict[str, Any],
    section: str,
    style: Dict[str, Any],
) -> None:
    label = SECTION_LABELS.get(section, section.title())

    if section == "summary":
        summary = cv_data.get("personalInfo", {}).get("summary")
        if summary:
            document.add_heading(label, level=1)
            paragraph = document.add_paragraph(summary)
            paragraph.runs[0].font.name = style["body_font"]
    elif section == "experience":
        experiences = cv_data.get("experience", [])
        if experiences:
            document.add_heading(label, level=1)
            for exp in experiences:
                title = exp.get("position") or "Sin título"
                company = exp.get("company")
                dates = _format_date_range(exp.get("startDate"), exp.get("endDate"), exp.get("current"))
                header = f"{title}{f' · {company}' if company else ''}"
                paragraph = document.add_paragraph()
                run = paragraph.add_run(header)
                run.bold = True
                run.font.name = style["heading_font"]
                if dates:
                    meta = document.add_paragraph(dates)
                    meta.runs[0].font.name = style["body_font"]
                if exp.get("location"):
                    location = document.add_paragraph(exp.get("location"))
                    location.runs[0].font.name = style["body_font"]
                if exp.get("description"):
                    description = document.add_paragraph(exp.get("description"))
                    description.runs[0].font.name = style["body_font"]
    elif section == "education":
        education = cv_data.get("education", [])
        if education:
            document.add_heading(label, level=1)
            for edu in education:
                degree = edu.get("degree") or "Sin título"
                institution = edu.get("institution")
                dates = _format_date_range(edu.get("startDate"), edu.get("endDate"), False)
                header = f"{degree}{f' · {institution}' if institution else ''}"
                paragraph = document.add_paragraph()
                run = paragraph.add_run(header)
                run.bold = True
                run.font.name = style["heading_font"]
                if dates:
                    meta = document.add_paragraph(dates)
                    meta.runs[0].font.name = style["body_font"]
                if edu.get("location"):
                    location = document.add_paragraph(edu.get("location"))
                    location.runs[0].font.name = style["body_font"]
                if edu.get("description"):
                    description = document.add_paragraph(edu.get("description"))
                    description.runs[0].font.name = style["body_font"]
    elif section == "skills":
        skills = [skill.get("name") for skill in cv_data.get("skills", []) if skill.get("name")]
        if skills:
            document.add_heading(label, level=1)
            paragraph = document.add_paragraph(" • ".join(skills))
            paragraph.runs[0].font.name = style["body_font"]
    elif section == "projects":
        projects = cv_data.get("projects", [])
        if projects:
            document.add_heading(label, level=1)
            for proj in projects:
                name = proj.get("name") or "Proyecto"
                paragraph = document.add_paragraph()
                run = paragraph.add_run(name)
                run.bold = True
                run.font.name = style["heading_font"]
                if proj.get("description"):
                    description = document.add_paragraph(proj.get("description"))
                    description.runs[0].font.name = style["body_font"]
                if proj.get("url"):
                    url = document.add_paragraph(proj.get("url"))
                    url.runs[0].font.name = style["body_font"]
                if proj.get("technologies"):
                    tech = document.add_paragraph(f"Tecnologías: {', '.join(proj.get('technologies'))}")
                    tech.runs[0].font.name = style["body_font"]
    elif section == "certifications":
        certifications = cv_data.get("certifications", [])
        if certifications:
            document.add_heading(label, level=1)
            for cert in certifications:
                title = cert.get("name") or "Certificación"
                issuer = cert.get("issuer")
                date = cert.get("date")
                header = f"{title}{f' · {issuer}' if issuer else ''}{f' ({date})' if date else ''}"
                paragraph = document.add_paragraph(header)
                paragraph.runs[0].font.name = style["body_font"]
                if cert.get("url"):
                    url = document.add_paragraph(cert.get("url"))
                    url.runs[0].font.name = style["body_font"]
    elif section == "languages":
        languages = cv_data.get("languages", [])
        if languages:
            document.add_heading(label, level=1)
            content = " • ".join(
                [
                    _format_language_entry(lang)
                    for lang in languages
                    if lang.get("language")
                ]
            )
            paragraph = document.add_paragraph(content)
            paragraph.runs[0].font.name = style["body_font"]
    elif section == "interests":
        interests = cv_data.get("interests", [])
        if interests:
            document.add_heading(label, level=1)
            content = " • ".join([interest.get("name") for interest in interests if interest.get("name")])
            paragraph = document.add_paragraph(content)
            paragraph.runs[0].font.name = style["body_font"]
    elif section == "tools":
        tools = cv_data.get("tools", [])
        if tools:
            document.add_heading(label, level=1)
            content = " • ".join([tool for tool in tools if tool])
            paragraph = document.add_paragraph(content)
            paragraph.runs[0].font.name = style["body_font"]


def _build_pdf_export(cv_data: Dict[str, Any], template_id: str) -> bytes:
    buffer = io.BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter
    template_config = registry.get_template(template_id)

    # Adapt styles for ReportLab
    raw_style = template_config.styles if template_config else {}
    style = raw_style.copy()
    if "accent" in style and isinstance(style["accent"], str):
        style["accent"] = colors.HexColor(style["accent"])

    section_order = template_config.section_order if template_config else []

    pdf.setTitle("CV Export")
    cursor_y = height - 72

    personal_info = cv_data.get("personalInfo", {})
    full_name = personal_info.get("fullName") or "Sin nombre"
    role = personal_info.get("role")

    cursor_y = _draw_wrapped_text(
        pdf,
        full_name,
        cursor_y,
        style["heading_font"],
        18,
        style["accent"],
    )

    if role:
        cursor_y = _draw_wrapped_text(pdf, role, cursor_y, style["body_font"], 12, colors.black)

    contact_parts = [
        personal_info.get("email"),
        personal_info.get("phone"),
        personal_info.get("location"),
    ]
    contact = " | ".join([item for item in contact_parts if item])
    if contact:
        cursor_y = _draw_wrapped_text(pdf, contact, cursor_y, style["body_font"], 10, colors.black)

    link_parts = []
    if personal_info.get("linkedin"):
        link_parts.append(f"LinkedIn: {personal_info.get('linkedin')}")
    if personal_info.get("github"):
        link_parts.append(f"GitHub: {personal_info.get('github')}")
    if personal_info.get("website"):
        link_parts.append(f"Web: {personal_info.get('website')}")
    if link_parts:
        cursor_y = _draw_wrapped_text(pdf, " | ".join(link_parts), cursor_y, style["body_font"], 10, colors.black)

    cursor_y -= 12

    for section in section_order:
        if not _is_section_visible(cv_data, section):
            continue
        cursor_y = _render_section_pdf(pdf, cv_data, section, style, cursor_y)

    pdf.showPage()
    pdf.save()
    buffer.seek(0)
    return buffer.read()


def _render_section_pdf(
    pdf: canvas.Canvas,
    cv_data: Dict[str, Any],
    section: str,
    style: Dict[str, Any],
    cursor_y: float,
) -> float:
    label = SECTION_LABELS.get(section, section.title())
    cursor_y = _draw_wrapped_text(pdf, label, cursor_y, style["heading_font"], 12, style["accent"])

    if section == "summary":
        summary = cv_data.get("personalInfo", {}).get("summary")
        if summary:
            cursor_y = _draw_wrapped_text(pdf, summary, cursor_y, style["body_font"], 10, colors.black)
    elif section == "experience":
        experiences = cv_data.get("experience", [])
        for exp in experiences:
            title = exp.get("position") or "Sin título"
            company = exp.get("company")
            header = f"{title}{f' · {company}' if company else ''}"
            cursor_y = _draw_wrapped_text(pdf, header, cursor_y, style["heading_font"], 10, colors.black)
            dates = _format_date_range(exp.get("startDate"), exp.get("endDate"), exp.get("current"))
            meta = " | ".join([item for item in [exp.get("location"), dates] if item])
            if meta:
                cursor_y = _draw_wrapped_text(pdf, meta, cursor_y, style["body_font"], 9, colors.black)
            if exp.get("description"):
                cursor_y = _draw_wrapped_text(pdf, exp.get("description"), cursor_y, style["body_font"], 9, colors.black)
            cursor_y -= 6
    elif section == "education":
        education = cv_data.get("education", [])
        for edu in education:
            degree = edu.get("degree") or "Sin título"
            institution = edu.get("institution")
            header = f"{degree}{f' · {institution}' if institution else ''}"
            cursor_y = _draw_wrapped_text(pdf, header, cursor_y, style["heading_font"], 10, colors.black)
            dates = _format_date_range(edu.get("startDate"), edu.get("endDate"), False)
            meta = " | ".join([item for item in [edu.get("location"), dates] if item])
            if meta:
                cursor_y = _draw_wrapped_text(pdf, meta, cursor_y, style["body_font"], 9, colors.black)
            if edu.get("description"):
                cursor_y = _draw_wrapped_text(pdf, edu.get("description"), cursor_y, style["body_font"], 9, colors.black)
            cursor_y -= 6
    elif section == "skills":
        skills = [skill.get("name") for skill in cv_data.get("skills", []) if skill.get("name")]
        if skills:
            cursor_y = _draw_wrapped_text(pdf, " • ".join(skills), cursor_y, style["body_font"], 9, colors.black)
    elif section == "projects":
        projects = cv_data.get("projects", [])
        for proj in projects:
            name = proj.get("name") or "Proyecto"
            cursor_y = _draw_wrapped_text(pdf, name, cursor_y, style["heading_font"], 10, colors.black)
            if proj.get("description"):
                cursor_y = _draw_wrapped_text(pdf, proj.get("description"), cursor_y, style["body_font"], 9, colors.black)
            if proj.get("url"):
                cursor_y = _draw_wrapped_text(pdf, proj.get("url"), cursor_y, style["body_font"], 9, colors.black)
            if proj.get("technologies"):
                tech = f"Tecnologías: {', '.join(proj.get('technologies'))}"
                cursor_y = _draw_wrapped_text(pdf, tech, cursor_y, style["body_font"], 9, colors.black)
            cursor_y -= 6
    elif section == "certifications":
        certifications = cv_data.get("certifications", [])
        for cert in certifications:
            title = cert.get("name") or "Certificación"
            issuer = cert.get("issuer")
            date = cert.get("date")
            header = f"{title}{f' · {issuer}' if issuer else ''}{f' ({date})' if date else ''}"
            cursor_y = _draw_wrapped_text(pdf, header, cursor_y, style["body_font"], 9, colors.black)
            if cert.get("url"):
                cursor_y = _draw_wrapped_text(pdf, cert.get("url"), cursor_y, style["body_font"], 9, colors.black)
            cursor_y -= 4
    elif section == "languages":
        languages = cv_data.get("languages", [])
        if languages:
            content = " • ".join([_format_language_entry(lang) for lang in languages if lang.get("language")])
            cursor_y = _draw_wrapped_text(pdf, content, cursor_y, style["body_font"], 9, colors.black)
    elif section == "interests":
        interests = cv_data.get("interests", [])
        if interests:
            content = " • ".join([interest.get("name") for interest in interests if interest.get("name")])
            cursor_y = _draw_wrapped_text(pdf, content, cursor_y, style["body_font"], 9, colors.black)
    elif section == "tools":
        tools = cv_data.get("tools", [])
        if tools:
            content = " • ".join([tool for tool in tools if tool])
            cursor_y = _draw_wrapped_text(pdf, content, cursor_y, style["body_font"], 9, colors.black)

    return cursor_y - 12


def _draw_wrapped_text(
    pdf: canvas.Canvas,
    text: str,
    cursor_y: float,
    font_name: str,
    font_size: int,
    color: colors.Color,
) -> float:
    if cursor_y < 72:
        pdf.showPage()
        cursor_y = letter[1] - 72

    pdf.setFont(font_name, font_size)
    pdf.setFillColor(color)

    max_width = letter[0] - 144
    wrapped = _wrap_text(text, font_name, font_size, max_width)
    for line in wrapped:
        if cursor_y < 72:
            pdf.showPage()
            cursor_y = letter[1] - 72
            pdf.setFont(font_name, font_size)
            pdf.setFillColor(color)
        pdf.drawString(72, cursor_y, line)
        cursor_y -= font_size + 2
    return cursor_y


def _wrap_text(text: str, font_name: str, font_size: int, max_width: float) -> List[str]:
    if not text:
        return []
    approx_char_width = font_size * 0.5
    max_chars = max(int(max_width / approx_char_width), 10)
    return textwrap.wrap(text, width=max_chars)


def _format_language_entry(language: Dict[str, Any]) -> str:
    fluency = language.get("fluency")
    if fluency:
        return f"{language.get('language')} ({fluency})"
    return str(language.get("language"))


def _format_date_range(start: str, end: str, current: bool) -> str:
    if not start and not end and not current:
        return ""
    if current:
        return f"{start or ''} - Presente".strip(" -")
    if start and end:
        return f"{start} - {end}"
    return start or end or ""
