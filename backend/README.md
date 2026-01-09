# Backend - CV-ConVos

API REST construida con FastAPI para procesamiento de CVs con IA.

> **📚 Documentación completa**: Ver `docs/` para documentación detallada sobre arquitectura, API reference y más.

## 📋 Documentación

- **[Documentación completa](./docs/README.md)** - Índice de toda la documentación
- **[Guía de Desarrollador](./docs/DEVELOPER_GUIDE.md)** - Guía completa para nuevos desarrolladores
- **[Arquitectura](./docs/ARCHITECTURE.md)** - Patrones de arquitectura y estructura
- **[Stack Tecnológico](./docs/TECH_STACK.md)** - Tecnologías y dependencias
- **[API Reference](./docs/API_REFERENCE.md)** - Documentación completa de la API

## 🚀 Contenido Rápido

Para instrucciones detalladas, ver [Guía de Desarrollador](./docs/DEVELOPER_GUIDE.md).

### Requisitos Previos
```bash
python --version  # >= 3.11
pip --version     # >= 20.0
```

### Instalación

```bash
# Crear virtual environment
python -m venv .venv

# Activar (Linux/Mac)
source .venv/bin/activate

# Activar (Windows)
.venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tu GROQ_API_KEY
```

### Scripts Disponibles

```bash
# Servidor de desarrollo
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Servidor de producción
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4

# Tests
pytest

# Tests con coverage
pytest --cov=app --cov-report=html
```

## ⚙️ Configuración

### Variables de Entorno

Crear archivo `.env`:

```env
GROQ_API_KEY=your_groq_api_key_here
CORS_ORIGINS=http://localhost:3000
```

Para más detalles, ver [TECH_STACK.md](./docs/TECH_STACK.md).

## 📁 Estructura del Proyecto

Para detalles completos, ver [Arquitectura](./docs/ARCHITECTURE.md).

```
backend/
├── app/
│   ├── main.py                      # FastAPI entry point
│   ├── api/
│   │   ├── endpoints.py             # API routes
│   │   └── schemas.py             # Pydantic models
│   ├── core/
│   │   ├── config.py                # Configuration
│   │   └── logging.py              # Logging setup
│   └── services/
│       ├── ai_service.py            # LLM integration
│       └── parser_service.py        # File parsing
├── tests/
│   ├── conftest.py                 # Pytest fixtures
│   ├── integration/                # Integration tests
│   └── unit/                      # Unit tests
├── docs/                          # Complete documentation
├── .env                           # Environment variables
├── .env.example                   # Environment template
├── requirements.txt                # Dependencies
└── Dockerfile                     # Docker config
```

## 🔌 API Endpoints

### Base URL
```
http://localhost:8000/api
```

### Documentation Interactiva
FastAPI genera automáticamente docs en:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

### Endpoints Principales

Para documentación completa, ver [API Reference](./docs/API_REFERENCE.md).

| Endpoint | Método | Descripción |
|----------|---------|-------------|
| `/api/generate-cv` | POST | Generar CV desde archivos |
| `/api/optimize-cv` | POST | Optimizar CV existente |
| `/api/critique-cv` | POST | Obtener feedback de CV |
| `/api/interview-cv` | POST | Optimizar CV para rol específico |
| `/api/generate-linkedin-post` | POST | Generar post de LinkedIn |
| `/api/generate-cover-letter` | POST | Generar carta de presentación |
| `/api/ats-check` | POST | Analizar compatibilidad ATS |
| `/health` | GET | Health check |

## 🧪 Testing

```bash
# Ejecutar todos los tests
pytest

# Ejecutar con coverage
pytest --cov=app --cov-report=html

# Tests específicos
pytest tests/unit/test_ai_service.py
```

Para más información, ver [DEVELOPER_GUIDE.md](./docs/DEVELOPER_GUIDE.md).

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

## 🚀 Deploy

### Docker

```bash
# Build
docker build -t cv-convos-backend .

# Run
docker run -p 8000:8000 --env-file .env cv-convos-backend
```

### Railway

```bash
npm install -g @railway/cli
railway login
railway up
```

### Variables de Entorno en Producción

Asegúrate de configurar:
- `GROQ_API_KEY` (obligatorio)
- `CORS_ORIGINS` (CORS - especificar dominio del frontend)
- `DEBUG=False` (en producción)

Para más detalles, ver [DEVELOPER_GUIDE.md](./docs/DEVELOPER_GUIDE.md).

## 🔧 Troubleshooting

### Errores Comunes

**"GROQ_API_KEY not found"**
```bash
# Verificar .env
cat .env
```

**"Module not found"**
```bash
pip install -r requirements.txt
```

**"CORS error"**
Verifica `CORS_ORIGINS` en `.env` y middleware CORS en `main.py`.

Para más detalles, ver [DEVELOPER_GUIDE.md](./docs/DEVELOPER_GUIDE.md).

## 📚 Recursos Adicionales

- [FastAPI Docs](https://fastapi.tiangolo.com)
- [Groq API Docs](https://console.groq.com/docs)
- [Pydantic Docs](https://docs.pydantic.dev)
- [Uvicorn Docs](https://www.uvicorn.org)
- [Pytest Docs](https://docs.pytest.org)

## 🤝 Contribuir

Ver [CONTRIBUTING.md](../CONTRIBUTING.md) para guidelines generales.

### Guidelines del Backend
1. **Type Hints**: Usar type hints en todas las funciones
2. **Async**: Usar async/await para I/O operations
3. **Error Handling**: Implementar proper exception handling
4. **Validation**: Usar Pydantic para validación
5. **Testing**: Escribir tests para nuevas features