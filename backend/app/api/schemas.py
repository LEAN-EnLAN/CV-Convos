from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional, Any, Dict

class PersonalInfo(BaseModel):
    fullName: str = Field(..., min_length=1, max_length=100)
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    website: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    summary: Optional[str] = None

class Experience(BaseModel):
    company: Optional[str] = None
    position: Optional[str] = None
    startDate: Optional[str] = None
    endDate: Optional[str] = None
    current: Optional[bool] = None
    location: Optional[str] = None
    description: Optional[str] = None
    highlights: Optional[List[str]] = []

class Education(BaseModel):
    institution: Optional[str] = None
    degree: Optional[str] = None
    fieldOfStudy: Optional[str] = None
    startDate: Optional[str] = None
    endDate: Optional[str] = None
    location: Optional[str] = None
    description: Optional[str] = None

class Skill(BaseModel):
    name: str
    level: Optional[str] = None
    category: Optional[str] = None

class CVData(BaseModel):
    personalInfo: PersonalInfo
    experience: List[Experience] = []
    education: List[Education] = []
    skills: List[Skill] = []
    projects: List[Dict[str, Any]] = []
    languages: List[Dict[str, Any]] = []
    certifications: List[Dict[str, Any]] = []
    interests: List[Any] = []
    
    model_config = ConfigDict(extra='ignore')

class CVDataInput(CVData):
    pass

class OptimizeRequest(BaseModel):
    target: str = Field("shrink", pattern="^(shrink|improve)$")

class OptimizationRequest(BaseModel):
    cv_data: CVDataInput
    target: str = Field("shrink", pattern="^(shrink|improve)$")

class CritiqueRequest(BaseModel):
    cv_data: CVDataInput
