from pydantic import BaseModel, Field, EmailStr, ConfigDict, field_validator
from typing import List, Optional, Any, Dict


class PersonalInfo(BaseModel):
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


class Experience(BaseModel):
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


class Education(BaseModel):
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


class Skill(BaseModel):
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


class CVData(BaseModel):
    personalInfo: PersonalInfo
    experience: List[Experience] = []
    education: List[Education] = []
    skills: List[Skill] = []
    projects: List[Dict[str, Any]] = []
    languages: List[Dict[str, Any]] = []
    certifications: List[Dict[str, Any]] = []
    interests: List[Any] = []

    model_config = ConfigDict(extra="allow")


class CVInput(BaseModel):
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


class OptimizeRequest(BaseModel):
    target: str = Field("shrink", pattern="^(shrink|improve)$")


class OptimizationRequest(BaseModel):
    cv_data: CVDataInput
    target: str = Field("shrink", pattern="^(shrink|improve)$")


class CritiqueRequest(BaseModel):
    cv_data: CVDataInput
