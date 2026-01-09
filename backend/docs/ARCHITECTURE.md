# Architecture - CV-ConVos Backend

## Overview

El backend está construido con **FastAPI**, Python 3.11+, y está diseñado como una API RESTful moderna con integración de IA (LLM) para procesamiento de CVs.

## Architecture Patterns

### 1. Layered Architecture

```
┌─────────────────────────────────────┐
│         API Layer                 │  (endpoints.py)
├─────────────────────────────────────┤
│         Service Layer             │  (ai_service.py, parser_service.py)
├─────────────────────────────────────┤
│         Core Layer               │  (config.py, logging.py)
└─────────────────────────────────────┘
```

**Responsabilidades**:
- **API Layer**: Request handling, validation, routing
- **Service Layer**: Business logic, AI integration, file parsing
- **Core Layer**: Configuration, logging, shared utilities

### 2. Project Structure

```
backend/
├── app/
│   ├── main.py                      # FastAPI application entry point
│   ├── api/
│   │   ├── endpoints.py             # API routes and handlers
│   │   └── schemas.py             # Pydantic models (DTOs)
│   ├── core/
│   │   ├── config.py                # Configuration management
│   │   └── logging.py              # Logging setup
│   └── services/
│       ├── ai_service.py            # LLM integration (Groq)
│       └── parser_service.py        # File parsing (PDF, DOCX)
├── tests/
│   ├── conftest.py                 # Pytest fixtures
│   ├── integration/                # Integration tests
│   │   └── test_api.py
│   └── unit/                      # Unit tests
│       ├── test_ai_service.py
│       ├── test_parser_service.py
│       └── test_config.py
├── requirements.txt                 # Python dependencies
├── .env.example                   # Environment template
├── Dockerfile                     # Docker configuration
└── run.sh                        # Development script
```

### 3. Request Flow

```
Client Request
    ↓
FastAPI Router (endpoints.py)
    ↓
Pydantic Validation (schemas.py)
    ↓
Service Layer (ai_service.py, parser_service.py)
    ↓
External Services (Groq API)
    ↓
Response Processing
    ↓
Client Response
```

## Technology Stack

### Core Framework
- **FastAPI**: Modern, fast, async web framework
- **Python**: 3.11+ (async/await support)
- **Uvicorn**: ASGI server
- **Pydantic**: Data validation and settings

### AI Integration
- **Groq**: LLM provider (Llama 3.3-70b-versatile)
- **JSON Mode**: Structured responses from LLM

### File Processing
- **PyPDF2**: PDF parsing
- **python-docx**: DOCX parsing

### Testing & Quality
- **Pytest**: Testing framework
- **pytest-asyncio**: Async test support
- **pytest-cov**: Coverage reporting
- **Ruff**: Fast Python linter

## Design Patterns

### 1. Dependency Injection

FastAPI's built-in dependency injection:

```python
from app.core.config import settings

def my_endpoint(config: Settings = Depends(get_settings)):
    return {"config": config}
```

### 2. Async/Await

All I/O operations are asynchronous:

```python
async def generate_cv(files: List[UploadFile]):
    # Async file reading
    content = await file.read()
    # Async AI processing
    result = await extract_cv_data(text)
    return result
```

### 3. Pydantic Models

Data validation using Pydantic:

```python
class CVData(BaseModel):
    personalInfo: PersonalInfo
    experience: List[Experience] = []
    education: List[Education] = []
    skills: List[Skill] = []
```

### 4. Service Separation

Business logic separated from API layer:

```python
# API Layer
@router.post("/generate-cv")
async def generate_cv(files: List[UploadFile]):
    text = await extract_text_from_file(...)
    cv_data = await extract_cv_data(text)
    return cv_data

# Service Layer
async def extract_cv_data(text: str) -> dict:
    # AI processing logic
    return result
```

## Configuration Management

### Environment Variables

Configuration via `app/core/config.py`:

```python
class Settings(BaseSettings):
    GROQ_API_KEY: str
    PROJECT_NAME: str = "CV Builder IA"
    DEBUG: bool = True
    CORS_ORIGINS: str = "http://localhost:3000"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding='utf-8',
        extra='ignore'
    )
```

### Environment Files

```bash
# .env (development)
GROQ_API_KEY=gsk_...
DEBUG=True
CORS_ORIGINS=http://localhost:3000

# .env (production)
GROQ_API_KEY=gsk_...
DEBUG=False
CORS_ORIGINS=https://your-domain.com
```

## Middleware

### CORS Configuration

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure properly in production
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Custom Middleware

```python
@app.middleware("http")
async def add_cors_header(request, call_next):
    response = await call_next(request)
    response.headers["Access-Control-Allow-Origin"] = "*"
    return response
```

## Error Handling

### HTTP Exceptions

```python
from fastapi import HTTPException

@router.post("/generate-cv")
async def generate_cv(files: List[UploadFile]):
    if not files:
        raise HTTPException(status_code=400, detail="No files uploaded")

    try:
        result = await process_files(files)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail="Processing failed")
```

### Service Layer Error Handling

```python
async def get_ai_completion(prompt: str):
    try:
        client = Groq(api_key=settings.GROQ_API_KEY)
        completion = client.chat.completions.create(...)
        return json.loads(completion.choices[0].message.content)
    except Exception as e:
        logger.error(f"AI Error: {str(e)}", exc_info=True)
        return None
```

## Logging

### Configuration

```python
# app/core/logging.py
import logging

def setup_logging():
    logging.basicConfig(
        level=logging.INFO if settings.DEBUG else logging.WARNING,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
```

### Usage

```python
import logging

logger = logging.getLogger(__name__)

@router.post("/generate-cv")
async def generate_cv(files: List[UploadFile]):
    logger.info(f"Processing {len(files)} files")
    try:
        result = await process_files(files)
        logger.info("Processing completed successfully")
        return result
    except Exception as e:
        logger.error(f"Processing failed: {str(e)}", exc_info=True)
        raise
```

## API Design Principles

### RESTful Endpoints

```python
# Resource: CV
POST   /api/generate-cv      # Create CV from files
POST   /api/optimize-cv      # Update/optimize CV
POST   /api/critique-cv      # Critique CV
GET    /health               # Health check
```

### Request/Response Models

```python
# Request Model
class CVDataInput(BaseModel):
    cv_data: CVData

# Response Model
class CVData(BaseModel):
    personalInfo: PersonalInfo
    experience: List[Experience] = []
    # ...

@router.post("/generate-cv", response_model=CVData)
async def generate_cv(files: List[UploadFile]):
    return cv_data
```

### File Uploads

```python
@router.post("/generate-cv")
async def generate_cv(files: List[UploadFile] = File(...)):
    combined_text = ""

    for file in files:
        content = await file.read()
        filename = file.filename or "unknown"
        text = await extract_text_from_file(content, filename)
        combined_text += text

    return process_text(combined_text)
```

## AI Integration Architecture

### System Prompts

Structured prompts for consistent AI behavior:

```python
SYSTEM_RULES = """
You are a TECHNICAL RESUME COMPILER.
- IDENTITY LOCK: Never change candidate's Name, Email, Phone
- NO HALLUCINATIONS: Do not invent metrics
- LANGUAGE LOYALTY: Match input language exactly
- FORMAT: Output valid JSON only
"""

EXTRACT_CV_PROMPT = """
Task: Convert text to structured CV JSON.
Input: {text}
"""
```

### Prompt Routing

```python
async def optimize_cv_data(cv_data: dict, target: str, section: str):
    if section == "summary":
        prompt = SUMMARIZE_PROMPT
    elif section == "skills":
        prompt = SUGGEST_SKILLS_PROMPT
    elif target == "one_page":
        prompt = ONE_PAGE_OPTIMIZER_PROMPT
    else:
        prompt = GENERAL_OPTIMIZE_PROMPT

    return await get_ai_completion(prompt)
```

## Security Considerations

### API Key Management

```python
# Never log API keys
logger.info("AI request initiated")  # OK
logger.info(f"Using key: {api_key}")  # ❌ BAD

# Use environment variables
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
```

### Input Validation

```python
# Pydantic validation
class PersonalInfo(BaseModel):
    fullName: str = Field(..., max_length=100)
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
```

### CORS Configuration

```python
# Development: Allow all origins
allow_origins=["*"]

# Production: Specific origins
allow_origins=["https://your-domain.com"]
```

## Performance Optimizations

### Async Processing

All I/O operations are async:

```python
async def extract_text_from_file(content: bytes, filename: str) -> str:
    # Async file operations
    if filename.endswith('.pdf'):
        return await parse_pdf(content)
```

### Connection Pooling

HTTPX for async HTTP requests:

```python
import httpx

async with httpx.AsyncClient() as client:
    response = await client.post(url, data=data)
```

### Caching (Future)

Consider Redis for caching:
- AI responses
- Parsed documents
- Common queries

## Scalability

### Horizontal Scaling

Docker and Kubernetes ready:

```dockerfile
FROM python:3.11-slim
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
```

### Load Balancing

Multiple Uvicorn workers:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Rate Limiting (Future)

Implement rate limiting:
- Per user
- Per endpoint
- For AI API calls

## Monitoring

### Health Checks

```python
@app.get("/health")
async def health():
    return {"status": "ok", "timestamp": datetime.now()}
```

### Logging

Structured logging for observability:

```python
logger.info("Processing CV", extra={
    "file_count": len(files),
    "user_id": user_id,
    "duration": elapsed_time
})
```

## Testing Strategy

### Unit Tests

Test individual functions:

```python
@pytest.mark.asyncio
async def test_extract_text_from_pdf():
    content = read_test_pdf()
    text = await extract_text_from_file(content, "test.pdf")
    assert len(text) > 0
```

### Integration Tests

Test API endpoints:

```python
async def test_generate_cv_endpoint(client):
    with open("test_cv.pdf", "rb") as f:
        response = await client.post("/api/generate-cv", files={"files": f})
    assert response.status_code == 200
```

## Future Improvements

1. **Database**: Add PostgreSQL/MongoDB for data persistence
2. **Authentication**: JWT tokens for user authentication
3. **Rate Limiting**: Protect against abuse
4. **Caching**: Redis for AI responses
5. **Queues**: Celery/Redis for background tasks
6. **Monitoring**: Prometheus + Grafana
7. **Logging**: ELK stack for log aggregation
8. **CI/CD**: GitHub Actions for automated testing/deployment
9. **API Versioning**: /api/v1/ endpoints
10. **Webhooks**: Notify frontend on completion
