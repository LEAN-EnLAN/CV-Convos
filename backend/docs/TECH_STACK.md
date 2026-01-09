# Tech Stack - CV-ConVos Backend

## Core Framework

### FastAPI

**Version**: Latest (via pip)

**Features utilizados**:
- Async/await support
- Automatic API documentation (Swagger UI, ReDoc)
- Pydantic validation
- Dependency injection
- CORS middleware
- File upload handling
- Background tasks

**Configuration**:
```python
from fastapi import FastAPI
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    setup_logging()
    yield
    # Shutdown

app = FastAPI(title="CV Builder IA API", lifespan=lifespan)
```

### Python

**Version**: 3.11+

**Features clave**:
- Async/await syntax
- Type hints
- F-strings
- Context managers
- Dataclasses

## Web Server

### Uvicorn

**Version**: Latest (via pip)

**Features**:
- ASGI server
- Hot reload (development)
- Multi-worker support (production)

**Development**:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Production**:
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

## AI Integration

### Groq

**Versión**: Latest (via pip)

**Modelo principal**: `llama-3.3-70b-versatile`

**Features**:
- Fast inference
- JSON mode for structured outputs
- Low latency
- High quality responses

**Configuración**:
```python
from groq import Groq

client = Groq(api_key=settings.GROQ_API_KEY)

response = client.chat.completions.create(
    model="llama-3.3-70b-versatile",
    messages=[
        {"role": "system", "content": SYSTEM_RULES},
        {"role": "user", "content": prompt},
    ],
    temperature=0.1,
    response_format={"type": "json_object"},
)
```

**Modelos disponibles**:
- `llama-3.3-70b-versatile`: Modelo principal (calidad)
- `llama-3.1-8b-instant`: Para tareas rápidas

**Best practices**:
1. **JSON Mode**: Forzar respuestas estructuradas
2. **Temperature**: Usar `0.1` para consistencia
3. **System Prompts**: Definir comportamiento del modelo
4. **Prompt Engineering**: Prompts claros y específicos
5. **Error Handling**: Implementar retry logic

## Data Validation

### Pydantic

**Versión**: Latest (via pip)

**Features**:
- Type validation
- Schema generation
- Serialization/deserialization
- Settings management

**Modelos de datos**:
```python
from pydantic import BaseModel, Field, EmailStr

class PersonalInfo(BaseModel):
    fullName: str = Field(..., max_length=100)
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    location: Optional[str] = None
```

**Settings**:
```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    GROQ_API_KEY: str
    PROJECT_NAME: str = "CV Builder IA"
    DEBUG: bool = True

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding='utf-8',
        extra='ignore'
    )
```

## File Processing

### PyPDF2

**Versión**: Latest (via pip)

**Uso**: Extraer texto de archivos PDF

```python
from pypdf import PdfReader
import io

async def parse_pdf(content: bytes) -> str:
    reader = PdfReader(io.BytesIO(content))
    text = ""
    for page in reader.pages:
        text += page.extract_text() + "\n"
    return text
```

**Features**:
- Multi-page PDF support
- Text extraction
- Metadata access

### python-docx

**Versión**: Latest (via pip)

**Uso**: Extraer texto de archivos DOCX

```python
from docx import Document
import io

async def parse_docx(content: bytes) -> str:
    doc = Document(io.BytesIO(content))
    text = ""
    for para in doc.paragraphs:
        text += para.text + "\n"
    return text
```

**Features**:
- Paragraph extraction
- Table support (future)
- Style preservation (future)

## HTTP & Async

### httpx

**Versión**: Latest (via pip)

**Uso**: Cliente HTTP asíncrono

```python
import httpx

async def make_request(url: str, data: dict):
    async with httpx.AsyncClient() as client:
        response = await client.post(url, json=data)
        return response.json()
```

**Features**:
- Async support
- HTTP/2
- Connection pooling
- Timeout handling

### python-multipart

**Versión**: Latest (via pip)

**Uso**: Manejar file uploads

```python
from fastapi import UploadFile, File

@router.post("/generate-cv")
async def generate_cv(files: List[UploadFile] = File(...)):
    for file in files:
        content = await file.read()
        # Process content
```

## Configuration

### python-dotenv

**Versión**: Latest (via pip)

**Uso**: Cargar variables de entorno

```python
from dotenv import load_dotenv

load_dotenv(override=True)
```

**Features**:
- .env file support
- Override behavior
- Environment variable loading

### pydantic-settings

**Versión**: Latest (via pip)

**Uso**: Configuración tipada con Pydantic

```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    GROQ_API_KEY: str
    DEBUG: bool = True

    model_config = SettingsConfigDict(env_file=".env")
```

## File Handling

### aiofiles

**Versión**: Latest (via pip)

**Uso**: Operaciones de archivo asíncronas

```python
import aiofiles

async def read_file(path: str) -> str:
    async with aiofiles.open(path, 'r') as f:
        return await f.read()
```

## Testing

### pytest

**Versión**: 8.3.4

**Features**:
- Async test support
- Fixtures
- Parametrized tests
- Coverage integration

**Uso**:
```python
import pytest

@pytest.mark.asyncio
async def test_endpoint():
    result = await my_function()
    assert result is not None
```

### pytest-asyncio

**Versión**: 0.25.3

**Uso**: Tests asíncronos

```python
import pytest

@pytest.mark.asyncio
async def test_async_function():
    result = await async_function()
    assert result
```

### pytest-cov

**Versión**: 6.0.0

**Uso**: Coverage reporting

```bash
pytest --cov=app --cov-report=html
```

### pytest-mock

**Versión**: 3.14.0

**Uso**: Mocking en tests

```python
from unittest.mock import patch

@pytest.mark.asyncio
async def test_with_mock():
    with patch('app.services.ai_service.get_ai_completion') as mock:
        mock.return_value = {"result": "test"}
        result = await my_function()
        assert result == {"result": "test"}
```

## Code Quality

### Ruff

**Versión**: 0.8.0

**Features**:
- Fast linter
- Formatter
- Replaces flake8, black, isort

**Uso**:
```bash
ruff check app/
ruff format app/
```

### python-json-logger

**Versión**: 3.2.1

**Uso**: Structured JSON logging

```python
from pythonjsonlogger import jsonlogger

logger = jsonlogger.JsonLogger()
```

## Database (Future)

### Motor

**Versión**: Latest (via pip)

**Uso**: Async MongoDB driver

```python
from motor.motor_asyncio import AsyncIOMotorClient

client = AsyncIOMotorClient("mongodb://localhost:27017")
db = client["cv_builder"]
```

**Features**:
- Async MongoDB support
- Connection pooling
- Automatic reconnection

## Dependencies Summary

### Production

| Package | Versión | Uso |
|----------|---------|-----|
| fastapi | Latest | Framework web |
| uvicorn | Latest | ASGI server |
| python-multipart | Latest | File uploads |
| pypdf | Latest | PDF parsing |
| python-docx | Latest | DOCX parsing |
| python-dotenv | Latest | Environment vars |
| groq | Latest | AI API client |
| pydantic | Latest | Validation |
| pydantic-settings | Latest | Config management |
| httpx | Latest | Async HTTP client |
| aiofiles | Latest | Async file I/O |
| motor | Latest | MongoDB (future) |

### Development

| Package | Versión | Uso |
|----------|---------|-----|
| pytest | 8.3.4 | Testing framework |
| pytest-asyncio | 0.25.3 | Async tests |
| pytest-cov | 6.0.0 | Coverage |
| pytest-mock | 3.14.0 | Mocking |
| ruff | 0.8.0 | Linting/formatting |
| python-json-logger | 3.2.1 | Structured logging |

## Adding Dependencies

### Production dependency
```bash
pip install package-name
pip freeze > requirements.txt
```

### Development dependency
```bash
pip install package-name
pip freeze > requirements.txt
```

## Environment Variables

### Required

```env
GROQ_API_KEY=gsk_...
```

### Optional

```env
DEBUG=True
CORS_ORIGINS=http://localhost:3000,https://your-domain.com
```

## Best Practices

1. **Version pinning**: Mantener versiones específicas en requirements.txt
2. **Security audits**: Ejecutar regularmente
3. **Type hints**: Usar type hints en todo el código
4. **Async/await**: Para todas las operaciones I/O
5. **Validation**: Usar Pydantic para validación de datos
6. **Error handling**: Implementar proper exception handling
7. **Logging**: Structured logging para debugging
8. **Testing**: Tests para nuevas features

## Performance Considerations

1. **Async processing**: Async para I/O operations
2. **Connection pooling**: Reusar conexiones HTTP
3. **Lazy loading**: Cargar dependencias solo cuando sea necesario
4. **Memory management**: Procesar archivos en chunks si son grandes
5. **Caching**: Considerar Redis para respuestas de IA (futuro)
