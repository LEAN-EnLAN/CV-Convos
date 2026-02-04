# API Reference - CV-ConVos Backend

## Base URL

```
http://localhost:8000/api
```

## Interactive Documentation

FastAPI generates automatic API documentation:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Health Check

### GET `/health`

Health check endpoint for monitoring.

**Response (200 OK)**:
```json
{
  "status": "ok"
}
```

## CV Endpoints

### POST `/api/generate-cv`

Generate a structured CV from uploaded documents (PDF, DOCX, TXT).

**Request**:
```http
POST /api/generate-cv
Content-Type: multipart/form-data

files: [File, File, ...]
```

**Parameters**:
- `files` (required): Array of files (PDF, DOCX, TXT)

**Response (200 OK)**:
```json
{
  "personalInfo": {
    "fullName": "Juan Pérez",
    "email": "juan@example.com",
    "phone": "+54 11 1234-5678",
    "location": "Buenos Aires, Argentina",
    "website": "https://juanperez.com",
    "linkedin": "https://linkedin.com/in/juanperez",
    "github": "https://github.com/juanperez",
    "summary": "Desarrollador Full Stack con 5 años de experiencia..."
  },
  "experience": [
    {
      "company": "Tech Company",
      "position": "Senior Developer",
      "startDate": "2020-01",
      "endDate": "2023-12",
      "current": false,
      "location": "Buenos Aires",
      "description": "• Lideré equipo de 5 desarrolladores\n• Implementé CI/CD pipeline...",
      "highlights": []
    }
  ],
  "education": [
    {
      "institution": "Universidad de Buenos Aires",
      "degree": "Licenciatura",
      "fieldOfStudy": "Ciencias de la Computación",
      "location": "Buenos Aires",
      "startDate": "2015-01",
      "endDate": "2020-12",
      "description": ""
    }
  ],
  "skills": [
    {
      "name": "Python",
      "level": "Advanced",
      "category": "Backend"
    },
    {
      "name": "React",
      "level": "Intermediate",
      "category": "Frontend"
    }
  ],
  "projects": [
    {
      "name": "Project Name",
      "description": "Description of the project...",
      "technologies": ["Python", "React", "PostgreSQL"]
    }
  ],
  "languages": [
    {
      "language": "Español",
      "fluency": "Native"
    },
    {
      "language": "Inglés",
      "fluency": "Fluent"
    }
  ],
  "certifications": [
    {
      "name": "AWS Certified Developer",
      "issuer": "Amazon",
      "date": "2023-01"
    }
  ],
  "interests": []
}
```

**Error Responses**:
- `400 Bad Request`: No files uploaded
- `400 Bad Request`: Could not extract text from files
- `500 Internal Server Error`: AI processing failed

### POST `/api/optimize-cv`

Optimize existing CV content.

**Request**:
```http
POST /api/optimize-cv
Content-Type: application/json

{
  "cv_data": {
    "personalInfo": {...},
    "experience": [...],
    ...
  },
  "target": "shrink",
  "section": "all"
}
```

**Parameters**:
- `cv_data` (required): CV data object
- `target` (optional): Optimization target
  - `shrink`: Reduce content by 30-40%
  - `improve`: Improve writing and structure
- `section` (optional): Specific section to optimize
  - `all`: All sections
  - `summary`: Summary only
  - `experience`: Experience only
  - `skills`: Skills only

**Response (200 OK)**:
```json
{
  "personalInfo": {
    "fullName": "Juan Pérez",
    "email": "juan@example.com",
    "phone": "+54 11 1234-5678",
    "location": "Buenos Aires, Argentina",
    "summary": "Senior Full Stack Developer con 5+ años de experiencia..."
  },
  "experience": [
    {
      "company": "Tech Company",
      "position": "Senior Developer",
      "startDate": "2020-01",
      "endDate": "2023-12",
      "current": false,
      "location": "Buenos Aires",
      "description": "• Lideré equipo de 5 desarrolladores implementando CI/CD",
      "highlights": []
    }
  ],
  ...
}
```

**Error Responses**:
- `500 Internal Server Error`: AI optimization failed

### POST `/api/critique-cv`

Generate professional feedback and suggestions for a CV.

**Request**:
```http
POST /api/critique-cv
Content-Type: application/json

{
  "cv_data": {
    "personalInfo": {...},
    "experience": [...],
    ...
  }
}
```

**Response (200 OK)**:
```json
{
  "strengths": [
    "Experiencia sólida y diversificada",
    "Skills bien definidos y variados",
    "Formación académica relevante"
  ],
  "weaknesses": [
    "Faltan métricas cuantificables en experiencia",
    "Summary podría ser más impactante",
    "Falta descripción de proyectos"
  ],
  "suggestions": [
    "Agregar métricas específicas (ej: 'Aumenté productividad 30%')",
    "Reescribir summary usando metodología STAR",
    "Incluir al menos 2-3 proyectos relevantes",
    "Mejorar estructura de descripciones de experiencia"
  ],
  "overall_score": 7,
  "summary": "CV sólido con buena experiencia, pero necesita más impacto cuantificable"
}
```

**Error Responses**:
- `500 Internal Server Error`: AI critique failed

### POST `/api/interview-cv`

Optimize CV for a specific target role.

**Request**:
```http
POST /api/interview-cv?target_role=Senior+React+Developer
Content-Type: application/json

{
  "cv_data": {
    "personalInfo": {...},
    "experience": [...],
    ...
  }
}
```

**Query Parameters**:
- `target_role` (required): Target job position

**Response (200 OK)**:
```json
{
  "personalInfo": {
    "fullName": "Juan Pérez",
    "summary": "Senior React Developer con 5+ años de experiencia..."
  },
  "experience": [
    {
      "company": "Tech Company",
      "position": "Senior React Developer",
      "description": "• Lideré desarrollo de componentes React complejos...",
      ...
    }
  ],
  "skills": [
    {
      "name": "React",
      "level": "Expert"
    },
    {
      "name": "TypeScript",
      "level": "Advanced"
    }
  ],
  ...
}
```

**Error Responses**:
- `500 Internal Server Error`: AI role optimization failed

## Content Generation Endpoints

### POST `/api/generate-linkedin-post`

Generate a LinkedIn post content based on CV data.

**Request**:
```http
POST /api/generate-linkedin-post
Content-Type: application/json

{
  "cv_data": {
    "personalInfo": {...},
    "experience": [...],
    ...
  }
}
```

**Response (200 OK)**:
```json
{
  "post": "🚀 Excited to share that I've just completed a major project at [Company] where we improved system performance by 40% using React and Node.js..."
}
```

**Error Responses**:
- `500 Internal Server Error`: AI post generation failed

### POST `/api/generate-cover-letter`

Generate a personalized cover letter based on CV and job info.

**Request**:
```http
POST /api/generate-cover-letter
Content-Type: application/json

{
  "cv_data": {
    "personalInfo": {...},
    "experience": [...],
    ...
  },
  "job_description": "We are looking for a Senior React Developer...",
  "company_name": "Tech Company",
  "recipient_name": "John Smith",
  "tone": "formal"
}
```

**Parameters**:
- `cv_data` (required): CV data object
- `job_description` (optional): Job posting description
- `company_name` (required): Target company
- `recipient_name` (required): Recruiter's name
- `tone` (optional): Tone of the letter
  - `formal`: Professional and formal
  - `casual`: More conversational
  - Default: `formal`

**Response (200 OK)**:
```json
{
  "opening": "Estimado John Smith,\n\nMe complace postularme para la posición de Senior React Developer en Tech Company...",
  "body": "Con más de 5 años de experiencia en desarrollo web, he liderado equipos y proyectos complejos...",
  "closing": "Agradezco su tiempo y consideración. Quedo a su disposición para una entrevista.",
  "signature": "Atentamente,\nJuan Pérez"
}
```

**Error Responses**:
- `500 Internal Server Error`: AI cover letter generation failed

## ATS Analysis Endpoints

### POST `/api/ats-check`

Analyze CV for ATS (Applicant Tracking System) compatibility.

**Request**:
```http
POST /api/ats-check?target_industry=tech
Content-Type: multipart/form-data

files: [File, File, ...]
```

**Parameters**:
- `files` (required): CV files (PDF, DOCX, TXT)
- `target_industry` (optional): Industry for keyword analysis
  - `tech`: Technology sector
  - `finance`: Finance sector
  - `healthcare`: Healthcare sector
  - `creative`: Creative industry
  - `education`: Education sector
  - `general`: General purpose (default)
- `improvement_context` (optional): Contexto de mejoras previas (JSON en string) para mantener consistencia en el score

**Response (200 OK)**:
```json
{
  "ats_score": 85,
  "grade": "A",
  "summary": "Su CV tiene buena compatibilidad con sistemas ATS. Algunas mejoras leves podrían aumentar su puntuación.",
  "format_score": 90,
  "keyword_score": 80,
  "completeness_score": 85,
  "found_keywords": [
    "JavaScript",
    "React",
    "Node.js",
    "Python",
    "Git"
  ],
  "missing_keywords": [
    "CI/CD",
    "Docker",
    "AWS",
    "Agile"
  ],
  "industry_recommendation": "tech",
  "issues": [
    {
      "type": "format",
      "severity": "medium",
      "description": "Algunas secciones podrían estar mejor estructuradas para lectura por ATS"
    }
  ],
  "quick_wins": [
    "Agregar palabras clave específicas de la industria",
    "Asegurar formato de fechas consistente",
    "Incluir más skills técnicos"
  ],
  "detailed_tips": "Para mejorar su puntuación ATS: 1) Use palabras clave específicas de la industria tecnológica, 2) Asegure que las fechas sigan un formato consistente, 3) Incluya todas las tecnologías y herramientas relevantes en la sección de skills, 4) Evite gráficos o tablas complejas que no son legibles por ATS."
}
```

**Error Responses**:
- `400 Bad Request`: No files uploaded
- `400 Bad Request`: Could not extract text from files
- `500 Internal Server Error`: ATS analysis failed

## Root Endpoint

### GET `/`

Root endpoint with API information.

**Response (200 OK)**:
```json
{
  "message": "CV Builder IA Backend is running"
}
```

## Data Models

### CVData

Complete CV data structure.

```python
class CVData(BaseModel):
    personalInfo: PersonalInfo
    experience: List[Experience] = []
    education: List[Education] = []
    skills: List[Skill] = []
    projects: List[Dict[str, Any]] = []
    languages: List[Dict[str, Any]] = []
    certifications: List[Dict[str, Any]] = []
    interests: List[Any] = []
```

### PersonalInfo

Personal information section.

```python
class PersonalInfo(BaseModel):
    fullName: str
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    website: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    summary: Optional[str] = None
```

### Experience

Work experience section.

```python
class Experience(BaseModel):
    company: Optional[str] = None
    position: Optional[str] = None
    startDate: Optional[str] = None
    endDate: Optional[str] = None
    current: Optional[bool] = None
    location: Optional[str] = None
    description: Optional[str] = None
    highlights: Optional[List[str]] = []
```

### Education

Education section.

```python
class Education(BaseModel):
    institution: Optional[str] = None
    degree: Optional[str] = None
    fieldOfStudy: Optional[str] = None
    startDate: Optional[str] = None
    endDate: Optional[str] = None
    location: Optional[str] = None
    description: Optional[str] = None
```

### Skill

Skills section.

```python
class Skill(BaseModel):
    name: str
    level: Optional[str] = None
    category: Optional[str] = None
```

## Error Responses

All endpoints return JSON error responses:

```json
{
  "detail": "Error description"
}
```

### Common HTTP Status Codes

- `200 OK`: Successful request
- `400 Bad Request`: Invalid request parameters
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

## Authentication

Currently, the API does not require authentication. This may change in future versions.

## Rate Limiting

Currently, there are no rate limits. This may be added in future versions.

## CORS

The API supports CORS for cross-origin requests. Configure in `.env`:

```env
CORS_ORIGINS=http://localhost:3000,https://your-domain.com
```

## File Upload Constraints

- **Supported formats**: PDF, DOCX, TXT
- **Max file size**: No current limit (future)
- **Max files per request**: No current limit (future)

## AI Model Configuration

**Model**: `llama-3.3-70b-versatile`

**Temperature**: `0.1` (consistent outputs)

**Response Format**: `json_object`

## Best Practices

1. **Validate data**: Always validate CV data before sending
2. **Handle errors**: Implement proper error handling
3. **Use async**: Use async/await for API calls
4. **File formats**: Only upload supported file types
5. **Language**: The AI will match the input language

## Example Usage

### Python

```python
import httpx

async def generate_cv(file_path: str):
    async with httpx.AsyncClient() as client:
        with open(file_path, 'rb') as f:
            response = await client.post(
                'http://localhost:8000/api/generate-cv',
                files={'files': f}
            )
            return response.json()
```

### JavaScript/TypeScript

```typescript
async function generateCV(file: File) {
  const formData = new FormData();
  formData.append('files', file);

  const response = await fetch('http://localhost:8000/api/generate-cv', {
    method: 'POST',
    body: formData,
  });

  return response.json();
}
```

### cURL

```bash
# Generate CV
curl -X POST \
  http://localhost:8000/api/generate-cv \
  -F "files=@cv.pdf"

# Optimize CV
curl -X POST \
  http://localhost:8000/api/optimize-cv \
  -H "Content-Type: application/json" \
  -d '{"cv_data": {...}, "target": "shrink"}'

# ATS Check
curl -X POST \
  "http://localhost:8000/api/ats-check?target_industry=tech" \
  -F "files=@cv.pdf"
```
