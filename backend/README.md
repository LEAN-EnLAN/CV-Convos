# Backend - CV-ConVos

API REST construida con FastAPI para procesamiento de CVs con IA.

## 📋 Contenido

- [Arquitectura](#arquitectura)
- [Setup de Desarrollo](#setup-de-desarrollo)
- [Configuración](#configuración)
- [API Endpoints](#api-endpoints)
- [Servicios](#servicios)
- [Integración con Groq](#integración-con-groq)
- [Testing](#testing)
- [Deploy](#deploy)
- [Troubleshooting](#troubleshooting)
- [Recursos Adicionales](#recursos-adicionales)
- [Contribuir al Backend](#contribuir-al-backend)

## 🏗️ Arquitectura

### Stack Tecnológico
- **Framework**: FastAPI
- **Python**: 3.8+
- **LLM Provider**: Groq (Llama 3.3-70b-versatile)
- **Document Parsing**: PyPDF2, python-docx
- **Validation**: Pydantic
- **ASGI Server**: Uvicorn

### Patrones de Diseño
- **Layered Architecture**: API → Services → Core
- **Dependency Injection**: FastAPI's built-in DI
- **Async/Await**: Para I/O operations
- **Type Hints**: Python type hints throughout

## 🚀 Setup de Desarrollo

### Requisitos Previos
```bash
python --version  # >= 3.8
pip --version     # >= 20.0
```

### Instalación

```bash
# Clonar el repo (si no lo has hecho)
git clone https://github.com/tu-usuario/cv-convos.git
cd cv-convos/backend

# Crear virtual environment
python -m venv .venv

# Activar virtual environment
# Linux/Mac:
source .venv/bin/activate
# Windows:
.venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno
cp .env.example .env
# Editar .env y agregar tu GROQ_API_KEY
```

### Scripts Disponibles

```bash
# Iniciar servidor de desarrollo
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Iniciar servidor de producción
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4

# Ejecutar tests
pytest

# Ejecutar tests con coverage
pytest --cov=app --cov-report=html
```

## ⚙️ Configuración

### Variables de Entorno

Crear archivo `.env` en la raíz del backend:

```env
# Groq API
GROQ_API_KEY=tu_api_key_aqui

# Server Configuration
HOST=0.0.0.0
PORT=8000
DEBUG=True

# CORS (en producción, especificar el frontend URL)
ALLOWED_ORIGINS=http://localhost:3000,https://tu-dominio.com
```

### Configuración de Pydantic

`app/core/config.py` maneja la configuración:

```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    groq_api_key: str
    host: str = "0.0.0.0"
    port: int = 8000
    debug: bool = True
    
    class Config:
        env_file = ".env"

settings = Settings()
```

## 📁 Estructura del Proyecto

```
backend/
├── app/
│   ├── main.py                      # Entry point de FastAPI
│   ├── api/
│   │   └── endpoints.py             # API routes
│   ├── core/
│   │   └── config.py                # Configuración
│   └── services/
│       ├── parser_service.py        # Document parsing
│       └── ai_service.py            # LLM integration
├── .env                             # Variables de entorno (no commitear)
├── .env.example                     # Template de variables de entorno
├── requirements.txt                 # Dependencias Python
└── test_groq.py                     # Tests de Groq API
```

## 🔌 API Endpoints

### Base URL
```
http://localhost:8000/api
```

### Documentation Interactiva
FastAPI genera automáticamente docs Swagger UI en:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### Endpoints

#### POST `/api/generate-cv`
Genera un CV estructurado desde documentos subidos.

**Request:**
```http
POST /api/generate-cv
Content-Type: multipart/form-data

files: [File, File, ...]
```

**Response (200 OK):**
```json
{
  "personalInfo": {
    "fullName": "Juan Pérez",
    "email": "juan@example.com",
    "phone": "+54 11 1234-5678",
    "location": "Buenos Aires, Argentina",
    "summary": "Desarrollador Full Stack con 5 años de experiencia..."
  },
  "experience": [
    {
      "id": "1",
      "company": "Tech Company",
      "position": "Senior Developer",
      "startDate": "2020-01",
      "endDate": "2023-12",
      "description": "• Lideré equipo de 5 desarrolladores\n• Implementé CI/CD pipeline..."
    }
  ],
  "education": [...],
  "skills": [...],
  "projects": [...],
  "languages": [...],
  "certifications": [...]
}
```

**Error Responses:**
- `400 Bad Request`: No files uploaded or text extraction failed
- `500 Internal Server Error`: AI processing failed

#### POST `/api/optimize-cv`
Optimiza contenido existente del CV.

**Request:**
```http
POST /api/optimize-cv
Content-Type: application/json

{
  "cv_data": { ... },
  "target": "shrink" | "improve",
  "section": "experience"  // opcional
}
```

**Response (200 OK):**
```json
{
  "optimized_cv": { ... }
}
```

**Targets disponibles:**
- `shrink`: Reduce el contenido en 30-40% manteniendo la información clave
- `improve`: Mejora la redacción y estructura del contenido

#### POST `/api/critique-cv`
Genera feedback y sugerencias de mejora.

**Request:**
```http
POST /api/critique-cv
Content-Type: application/json

{
  "cv_data": { ... }
}
```

**Response (200 OK):**
```json
{
  "overall_score": 8.5,
  "strengths": ["Experiencia sólida", "Skills bien definidos"],
  "improvements": ["Agregar métricas cuantificables", "Mejorar summary"],
  "suggestions": ["Considerar agregar proyectos open source"]
}
```

#### GET `/health`
Health check endpoint.

**Response (200 OK):**
```json
{
  "status": "ok"
}
```

## 🔧 Servicios

### Parser Service (`app/services/parser_service.py`)

Responsable de extraer texto de documentos.

**Funciones:**

```python
async def extract_text_from_file(content: bytes, filename: str) -> str:
    """Extrae texto de PDF, DOCX o TXT."""
    
    if filename.endswith('.pdf'):
        return extract_from_pdf(content)
    elif filename.endswith('.docx'):
        return extract_from_docx(content)
    elif filename.endswith('.txt'):
        return content.decode('utf-8')
    else:
        raise ValueError("Formato no soportado")
```

**Dependencias:**
- `PyPDF2`: Para PDFs
- `python-docx`: Para DOCX

### AI Service (`app/services/ai_service.py`)

Responsable de integración con Groq API.

**Funciones:**

```python
async def extract_cv_data(text: str) -> dict:
    """Extrae y estructura datos del CV usando LLM."""
    
    prompt = f"""
    Extrae la siguiente información del texto del CV:
    - Personal Info (nombre, email, teléfono, ubicación, summary)
    - Experience (empresa, puesto, fechas, descripción)
    - Education (institución, título, fechas)
    - Skills
    - Projects
    - Languages
    - Certifications
    
    Texto del CV:
    {text}
    """
    
    response = await groq_client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"}
    )
    
    return json.loads(response.choices[0].message.content)

async def optimize_cv_data(cv_data: dict, target: str) -> dict:
    """Optimiza el CV según el target (shrink o improve)."""
    
    if target == "shrink":
        prompt = "Reduce el contenido en 30-40% manteniendo la información clave..."
    else:
        prompt = "Mejora la redacción y estructura del contenido..."
    
    # ... llamada a Groq API
    
    return optimized_data

async def critique_cv_data(cv_data: dict) -> dict:
    """Genera feedback y sugerencias de mejora."""
    
    prompt = """
    Analiza el siguiente CV y proporciona:
    - Puntaje general (1-10)
    - Fortalezas
    - Áreas de mejora
    - Sugerencias específicas
    """
    
    # ... llamada a Groq API
    
    return critique_results
```

## 🤖 Integración con Groq

### Configuración del Cliente

```python
from groq import Groq
from app.core.config import settings

groq_client = Groq(api_key=settings.groq_api_key)
```

### Modelos Disponibles

- **llama-3.3-70b-versatile**: Modelo principal para generación y análisis
- **llama-3.1-8b-instant**: Para tareas más rápidas y simples

### Best Practices

1. **Prompt Engineering**: Usar prompts claros y específicos
2. **JSON Mode**: Forzar respuestas en formato JSON para estructuración
3. **Token Limits**: Considerar límites de tokens del modelo
4. **Error Handling**: Implementar retry logic para fallos de API
5. **Cost Management**: Monitorear uso de tokens para controlar costos

### Ejemplo de Prompt

```python
prompt = """
Eres un experto en recursos humanos y optimización de CVs.
Tu tarea es extraer información estructurada del siguiente texto de CV.

INSTRUCCIONES:
1. Extrae toda la información relevante
2. Usa formato JSON válido
3. Aplica metodología STAR para descripciones de experiencia
4. Mantén el idioma original del texto

FORMATO JSON ESPERADO:
{
  "personalInfo": {...},
  "experience": [...],
  ...
}

TEXTO DEL CV:
{text}
"""
```

## 🧪 Testing

### Unit Tests

```bash
# Ejecutar todos los tests
pytest

# Ejecutar tests con coverage
pytest --cov=app --cov-report=html

# Ejecutar tests específicos
pytest tests/test_parser_service.py
```

### Test de Groq API

```bash
python test_groq.py
```

### Ejemplo de Test

```python
# tests/test_parser_service.py
import pytest
from app.services.parser_service import extract_text_from_file

@pytest.mark.asyncio
async def test_extract_from_pdf():
    with open("test_cv.pdf", "rb") as f:
        content = f.read()
    
    text = await extract_text_from_file(content, "test_cv.pdf")
    assert len(text) > 0
    assert "experiencia" in text.lower()
```

## 🚀 Deploy

### Opciones de Deploy

#### Docker (Recomendado para producción)

```dockerfile
# Dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

```bash
# Build y run
docker build -t cv-convos-backend .
docker run -p 8000:8000 --env-file .env cv-convos-backend
```

#### Railway

```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login y deploy
railway login
railway init
railway up
```

#### Render

Subir a GitHub y conectar con Render para deploy automático.

### Variables de Entorno en Producción

Asegúrate de configurar:
- `GROQ_API_KEY` (obligatorio)
- `ALLOWED_ORIGINS` (CORS - especificar dominio del frontend)
- `DEBUG=False` (en producción)

## 🔧 Troubleshooting

### Errores Comunes

**"GROQ_API_KEY not found"**
```bash
# Verificar que .env existe y tiene la API key
cat .env
```

**"Module not found"**
```bash
# Reinstalar dependencias
pip install -r requirements.txt
```

**"CORS error"**
Verifica `ALLOWED_ORIGINS` en `.env` y middleware CORS en `main.py`.

**"Groq API rate limit"**
Implementa retry logic con exponential backoff.

## 📚 Recursos Adicionales

- [FastAPI Documentation](https://fastapi.tiangolo.com)
- [Groq API Documentation](https://console.groq.com/docs)
- [Pydantic Documentation](https://docs.pydantic.dev)
- [Uvicorn Documentation](https://www.uvicorn.org)

## 🤝 Contribuir al Backend

Ver [CONTRIBUTING.md](../CONTRIBUTING.md) para guidelines generales.

### Guidelines Específicas del Backend
1. **Type Hints**: Usar type hints en todas las funciones
2. **Async**: Usar async/await para I/O operations
3. **Error Handling**: Implementa proper exception handling
4. **Validation**: Usa Pydantic para validación de datos
5. **Testing**: Escribir tests para nuevas features
6. **Documentation**: Actualizar docstrings y API docs