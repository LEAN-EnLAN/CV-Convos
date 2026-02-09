from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

class TemplateConfig(BaseModel):
    id: str
    name: str
    description: str
    category: str
    tags: List[str]
    preview_color: str = Field(alias="previewColor")
    skeleton: str
    icon: str
    prompt: str
    section_order: List[str] = Field(alias="sectionOrder")
    styles: Dict[str, Any]

    class Config:
        populate_by_name = True

class TemplateRegistry:
    def __init__(self):
        self._templates: Dict[str, TemplateConfig] = {}
        self._setup_templates()

    def _setup_templates(self):
        templates_data = [
            {
                "id": "professional",
                "name": "Executive",
                "description": "Diseño clásico y elegante para corporativos",
                "category": "Corporativo",
                "tags": ["ATS-friendly", "Clásico"],
                "previewColor": "bg-zinc-800",
                "skeleton": "classic",
                "icon": "FileText",
                "prompt": """
Format this CV for a classic professional template:
- Use formal, traditional structure
- Clear section headers
- Emphasis on experience and education
- Conservative layout with good use of white space
- Standard chronological format for experience
""",
                "sectionOrder": [
                    "summary", "experience", "education", "skills", "projects", 
                    "certifications", "languages", "interests", "tools"
                ],
                "styles": {
                    "heading_font": "Helvetica-Bold",
                    "body_font": "Helvetica",
                    "accent": "#111827",
                }
            },
            {
                "id": "harvard",
                "name": "Ivy",
                "description": "Estilo Ivy League, ATS-Optimized",
                "category": "Académico",
                "tags": ["ATS-friendly", "Research-ready"],
                "previewColor": "bg-slate-800",
                "skeleton": "classic",
                "icon": "GraduationCap",
                "prompt": """
Format this CV for an academic/Harvard-style template:
- Academic focus with detailed education section
- Publications and research highlighted
- Professional summary with career objectives
- Detailed description of academic achievements
- Clear chronological structure
""",
                "sectionOrder": [
                    "summary", "education", "experience", "projects", "skills", 
                    "certifications", "languages", "interests", "tools"
                ],
                "styles": {
                    "heading_font": "Times-Bold",
                    "body_font": "Times-Roman",
                    "accent": "#0f172a",
                }
            },
            {
                "id": "creative",
                "name": "Studio",
                "description": "Estilo editorial y audaz para creativos",
                "category": "Diseño",
                "tags": ["Modern", "Editorial"],
                "previewColor": "bg-stone-800",
                "skeleton": "modern",
                "icon": "Sparkles",
                "prompt": """
Format this CV for a creative template:
- Emphasize unique skills and achievements
- Highlight projects and creative work
- Dynamic layout suggestions
- Showcase innovation and creativity
- Modern, engaging presentation
""",
                "sectionOrder": [
                    "summary", "skills", "experience", "projects", "education", 
                    "certifications", "languages", "interests", "tools"
                ],
                "styles": {
                    "heading_font": "Helvetica-Bold",
                    "body_font": "Helvetica-Oblique",
                    "accent": "#7c3aed",
                }
            },
            {
                "id": "pure",
                "name": "Swiss",
                "description": "Minimalismo suizo con precisión extrema",
                "category": "Moderno",
                "tags": ["Minimal", "Structured"],
                "previewColor": "bg-stone-100",
                "skeleton": "split",
                "icon": "Grid3X3",
                "prompt": """
Format this CV for a minimal template:
- Stripped-down, clean design
- Focus on content over decoration
- Simple formatting with essential information only
- Good use of spacing for readability
- Subtle use of bold for headers
""",
                "sectionOrder": [
                    "summary", "experience", "projects", "education", "skills", 
                    "certifications", "languages", "interests", "tools"
                ],
                "styles": {
                    "heading_font": "Helvetica-Bold",
                    "body_font": "Helvetica",
                    "accent": "#0f172a",
                }
            },
            {
                "id": "terminal",
                "name": "Code",
                "description": "Elegancia técnica estilo editor de código",
                "category": "Tecnología",
                "tags": ["Monospace", "Developer"],
                "previewColor": "bg-slate-950",
                "skeleton": "modern",
                "icon": "Code",
                "prompt": """
Format this CV for a tech/developer template:
- Emphasize technical skills and projects
- GitHub and technical contributions highlighted
- List technologies and frameworks used
- Focus on technical achievements
- Modern, clean layout
""",
                "sectionOrder": [
                    "summary", "skills", "experience", "projects", "education", 
                    "languages", "certifications", "interests", "tools"
                ],
                "styles": {
                    "heading_font": "Courier-Bold",
                    "body_font": "Courier",
                    "accent": "#0f172a",
                }
            },
            {
                "id": "care",
                "name": "Care",
                "description": "Diseño cálido centrado en las personas",
                "category": "Salud",
                "tags": ["Warm", "People-first"],
                "previewColor": "bg-orange-100",
                "skeleton": "split",
                "icon": "Users",
                "prompt": """
Format this CV for a healthcare template:
- Focus on healthcare skills and certifications
- Emphasize patient care and medical achievements
- Professional healthcare presentation
- Highlight clinical experience
- Medical professional appearance
""",
                "sectionOrder": [
                    "summary", "experience", "education", "skills", "certifications", 
                    "projects", "languages", "interests", "tools"
                ],
                "styles": {
                    "heading_font": "Times-Bold",
                    "body_font": "Times-Roman",
                    "accent": "#0f766e",
                }
            },
            {
                "id": "capital",
                "name": "Capital",
                "description": "Precisión financiera y elegancia institucional",
                "category": "Corporativo",
                "tags": ["ATS-friendly", "Finance"],
                "previewColor": "bg-blue-950",
                "skeleton": "classic",
                "icon": "Landmark",
                "prompt": """
Format this CV for a finance template:
- Focus on financial skills and certifications
- Emphasize analytical and quantitative skills
- Highlight financial achievements with metrics
- Professional financial presentation
- Attention to detail
""",
                "sectionOrder": [
                    "summary", "experience", "projects", "education", "skills", 
                    "certifications", "languages", "interests", "tools"
                ],
                "styles": {
                    "heading_font": "Helvetica-Bold",
                    "body_font": "Helvetica",
                    "accent": "#1d4ed8",
                }
            },
            {
                "id": "scholar",
                "name": "Scholar",
                "description": "Plantilla académica con rigor investigativo",
                "category": "Académico",
                "tags": ["Research", "Publication-ready"],
                "previewColor": "bg-red-900",
                "skeleton": "classic",
                "icon": "GraduationCap",
                "prompt": """
Format this CV for an education/academic template:
- Emphasize teaching experience and achievements
- Highlight educational contributions
- Focus on academic qualifications
- Student outcomes and achievements
- Academic professional appearance
""",
                "sectionOrder": [
                    "summary", "education", "experience", "projects", "skills", 
                    "certifications", "languages", "interests", "tools"
                ],
                "styles": {
                    "heading_font": "Times-Bold",
                    "body_font": "Times-Roman",
                    "accent": "#1e293b",
                }
            },
            {
                "id": "bian",
                "name": "Bian",
                "description": "Diseño ejecutivo para consultoría y negocios",
                "category": "Corporativo",
                "tags": ["Consulting", "Business"],
                "previewColor": "bg-emerald-900",
                "skeleton": "classic",
                "icon": "Briefcase",
                "prompt": """
Format this CV for a business/consulting template:
- Professional business presentation
- Emphasize business skills and achievements
- Quantifiable results and metrics
- Leadership and strategic thinking
- Corporate, polished look
""",
                "sectionOrder": [
                    "summary", "experience", "education", "skills", "projects", 
                    "certifications", "languages", "interests", "tools"
                ],
                "styles": {
                    "heading_font": "Helvetica-Bold",
                    "body_font": "Helvetica",
                    "accent": "#064e3b",
                }
            }
        ]
        for data in templates_data:
            template = TemplateConfig(**data)
            self._templates[template.id] = template

        # Add aliases
        self._add_alias("minimal", "pure")
        self._add_alias("tech", "terminal")
        self._add_alias("health", "care")
        self._add_alias("finance", "capital")
        self._add_alias("education", "scholar")

    def _add_alias(self, alias_id: str, target_id: str):
        if target_id in self._templates:
            self._templates[alias_id] = self._templates[target_id]

    def get_template(self, template_id: str) -> Optional[TemplateConfig]:
        return self._templates.get(template_id)

    def get_all_templates(self) -> List[TemplateConfig]:
        # Return only unique templates (avoiding aliases in the list)
        seen = set()
        unique_templates = []
        for t in self._templates.values():
            if t.id not in seen:
                unique_templates.append(t)
                seen.add(t.id)
        return unique_templates

    def get_template_ids(self) -> List[str]:
        return list(self._templates.keys())

registry = TemplateRegistry()
