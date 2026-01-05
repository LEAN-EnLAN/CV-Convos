# Estrategia de Documentación - CV-ConVos v1.0

**Objetivo:** Crear documentación en español profesional, técnica y con tono "dev-to-dev" para el proyecto Open Source CV-ConVos.

---

## 1. Estructura del README Principal (Raíz)

### Propósito
Visión general del proyecto, quick start, y punto de entrada para contribuidores y usuarios.

### Estructura Sugerida

```markdown
# CV-ConVos

[Badges: Version, License, Status, CI/CD, Contributing]

## 🎯 ¿Qué es CV-ConVos?

Constructor de CVs potenciado por IA que transforma documentos existentes (PDF, DOCX, TXT) en currículums profesionales optimizados para ATS usando LLMs (Groq Llama 3.3-70b).

## ✨ Características Principales

- **Extracción con IA**: Upload múltiple de archivos con extracción de texto y estructuración usando metodología STAR
- **Editor en Tiempo Real**: Edición en vivo con preview instantáneo, CRUD completo para todas las secciones
- **Sistema de Templates**: Dos templates base (Modern y Professional) con gestión de layout A4
- **Optimización Avanzada con IA**: "Magic Shrink" (síntesis 30-40%) y "Mejorar Contenido"
- **Exportación PDF Nativa**: Generación de alta fidelidad directamente en el navegador
- **Privacy-First**: Uso anónimo sin almacenamiento de datos

## 🚀 Quick Start

### Prerrequisitos
- Node.js 18+ 
- Python 3.8+
- API Key de Groq (registrate en [groq.com](https://groq.com))

### Instalación Rápida

```bash
# Clonar el repo
git clone https://github.com/tu-usuario/cv-convos.git
cd cv-convos

# Setup Backend
cd backend
pip install -r requirements.txt
cp .env.example .env  # Agregar tu GROQ_API_KEY

# Setup Frontend (en nueva terminal)
cd frontend
npm install

# Iniciar servicios
# Terminal 1 - Backend
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Abre `http://localhost:3000` en tu navegador.

## 🏗️ Arquitectura del Proyecto

```
cv-convos/
├── frontend/          # Next.js 15+ + React 19 + TypeScript
│   ├── src/
│   │   ├── app/                    # App Router
│   │   ├── components/
│   │   │   ├── cv-builder/         # Core del builder
│   │   │   └── ui/                 # Shadcn UI components
│   │   ├── hooks/                  # Custom hooks
│   │   ├── lib/                    # Utilidades
│   │   └── types/                  # TypeScript definitions
│   └── package.json
├── backend/           # FastAPI + Python
│   ├── app/
│   │   ├── api/                    # Endpoints
│   │   ├── core/                   # Configuración
│   │   └── services/               # Lógica de negocio
│   └── requirements.txt
└── docs/              # Documentación adicional
```

## 📚 Documentación Detallada

- **[Frontend](./frontend/README.md)** - Setup, arquitectura, estilos, componentes
- **[Backend](./backend/README.md)** - API docs, configuración Groq, servicios
- **[Contributing](./CONTRIBUTING.md)** - Guía para contribuidores
- **[Roadmap](./ROADMAP.md)** - Plan de desarrollo futuro

## 🔌 API Endpoints

### POST `/api/generate-cv`
Genera un CV estructurado desde documentos subidos.

**Request:**
```json
{
  "files": ["base64_encoded_file1", "base64_encoded_file2"],
  "file_types": ["pdf", "docx"]
}
```

**Response:**
```json
{
  "cv_data": {
    "personalInfo": {...},
    "experience": [...],
    "education": [...],
    "skills": [...],
    "projects": [...]
  }
}
```

### POST `/api/optimize-cv`
Optimiza contenido existente del CV (Magic Shrink o Improve Content).

### POST `/api/critique-cv`
Genera feedback y sugerencias de mejora para el CV.

## 🛠️ Tech Stack

### Frontend
- Next.js 15+ (App Router)
- React 19
- TypeScript 5.x
- Tailwind CSS 4
- Shadcn UI (Radix UI)
- Lucide React
- Sonner (Toasts)
- React-Dropzone

### Backend
- FastAPI (Python)
- Groq (Llama 3.3-70b-versatile)
- PyPDF2, python-docx (Parsing)
- Pydantic (Validación)

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Revisa la [guía de contribución](./CONTRIBUTING.md) para más detalles.

1. Fork el repositorio
2. Crea tu feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 🙏 Agradecimientos

- Groq por proveer la API de LLMs de alta velocidad
- Shadcn UI por los componentes base
- La comunidad open source

## 📞 Contacto & Soporte

- Issues: [GitHub Issues](https://github.com/tu-usuario/cv-convos/issues)
- Discusiones: [GitHub Discussions](https://github.com/tu-usuario/cv-convos/discussions)

---

## 2. Estructura del Frontend README

### Propósito
Documentación técnica detallada para desarrolladores que trabajan en el frontend.

### Estructura Sugerida

```markdown
# Frontend - CV-ConVos

Interfaz de usuario construida con Next.js 15+, React 19 y TypeScript.

## 📋 Contenido

- [Arquitectura](#arquitectura)
- [Setup de Desarrollo](#setup-de-desarrollo)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Componentes Principales](#componentes-principales)
- [Sistema de Estilos](#sistema-de-estilos)
- [State Management](#state-management)
- [API Integration](#api-integration)
- [Testing](#testing)
- [Deploy](#deploy)

## 🏗️ Arquitectura

### Stack Tecnológico
- **Framework**: Next.js 15+ (App Router)
- **UI Library**: React 19
- **Lenguaje**: TypeScript 5.x
- **Styling**: Tailwind CSS 4 + Shadcn UI
- **Icons**: Lucide React
- **Notifications**: Sonner
- **File Upload**: React-Dropzone

### Patrones de Diseño
- **Component-based**: Componentes reutilizables y modulares
- **Type-safe**: TypeScript strict mode
- **Server Components**: Next.js App Router
- **Client Components**: Para interactividad (editor, uploader)

## 🚀 Setup de Desarrollo

### Requisitos Previos
```bash
node --version  # >= 18.0.0
npm --version   # >= 9.0.0
```

### Instalación

```bash
# Clonar el repo (si no lo has hecho)
git clone https://github.com/tu-usuario/cv-convos.git
cd cv-convos/frontend

# Instalar dependencias
npm install

# Copiar variables de entorno (si es necesario)
cp .env.example .env.local
```

### Scripts Disponibles

```bash
npm run dev        # Inicia servidor de desarrollo (http://localhost:3000)
npm run build      # Build para producción
npm run start      # Inicia servidor de producción
npm run lint       # Ejecuta ESLint
```

## 📁 Estructura del Proyecto

```
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Layout raíz con providers
│   │   ├── page.tsx                # Página principal (entry point)
│   │   └── globals.css             # Estilos globales y Tailwind
│   ├── components/
│   │   ├── cv-builder/
│   │   │   ├── Builder.tsx         # Workspace principal del builder
│   │   │   ├── Editor.tsx          # Componente de edición
│   │   │   ├── FileUploader.tsx    # Upload de archivos
│   │   │   ├── CritiqueModal.tsx   # Modal de feedback IA
│   │   │   └── templates/
│   │   │       ├── ModernTemplate.tsx
│   │   │       └── ProfessionalTemplate.tsx
│   │   └── ui/                     # Componentes Shadcn UI
│   ├── hooks/
│   │   └── use-cv-history.ts       # Hook para historial de cambios
│   ├── lib/
│   │   └── utils.ts                # Utilidades (cn, etc.)
│   └── types/
│       └── cv.ts                   # Tipos TypeScript para CV
├── public/                         # Assets estáticos
├── components.json                  # Configuración Shadcn UI
├── tailwind.config.ts              # Configuración Tailwind
├── tsconfig.json                   # Configuración TypeScript
└── package.json
```

## 🧩 Componentes Principales

### Builder.tsx
Workspace principal que coordina:
- Editor de CV
- Preview en tiempo real
- Cambio de templates
- Exportación a PDF

**Props:**
```typescript
interface BuilderProps {
  initialData: CVData;
  onReset: () => void;
}
```

### Editor.tsx
Componente de edición con:
- Tabs para cada sección (Personal, Experience, Education, etc.)
- Formularios reactivos
- Validación en tiempo real
- CRUD operations

### FileUploader.tsx
Upload de archivos con:
- Drag & drop
- Soporte para PDF, DOCX, TXT
- Preview de archivos
- Integración con API backend

### Templates
- **ModernTemplate.tsx**: Diseño moderno con sidebar
- **ProfessionalTemplate.tsx**: Diseño clásico y profesional

## 🎨 Sistema de Estilos

### Tailwind CSS 4
Configuración en `tailwind.config.ts`:
```typescript
export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Colores personalizados del proyecto
      },
      fontFamily: {
        // Fuentes del proyecto
      }
    }
  }
}
```

### Shadcn UI
Componentes base instalados:
- Button, Input, Label, Card
- Dialog, Sheet, Tabs
- Accordion, Dropdown Menu
- Scroll Area, Progress, Badge
- Avatar, Tooltip, Separator

**Agregar nuevos componentes:**
```bash
npx shadcn@latest add [component-name]
```

### Estilos Globales
`globals.css` contiene:
- Reset de Tailwind
- Variables CSS personalizadas
- Estilos para print media queries (exportación PDF)
- Animaciones personalizadas

## 🔄 State Management

### React Hooks
- **useState**: Estado local de componentes
- **useEffect**: Side effects y API calls
- **useCallback**: Optimización de callbacks
- **useMemo**: Memoización de valores

### Custom Hooks
- **use-cv-history.ts**: Gestión del historial de cambios del CV

### Prop Drilling vs Context
Para este MVP, se usa prop drilling. Para features futuras, considerar:
- React Context para tema global
- Zustand o Jotai para state management complejo

## 🔌 API Integration

### Backend API
Base URL: `http://localhost:8000/api`

### Endpoints

#### Generar CV desde archivos
```typescript
const generateCV = async (files: File[]) => {
  const formData = new FormData();
  files.forEach(file => formData.append('files', file));
  
  const response = await fetch('http://localhost:8000/api/generate-cv', {
    method: 'POST',
    body: formData
  });
  
  return response.json();
};
```

#### Optimizar CV
```typescript
const optimizeCV = async (cvData: CVData, target: 'shrink' | 'improve') => {
  const response = await fetch('http://localhost:8000/api/optimize-cv', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cv_data: cvData, target })
  });
  
  return response.json();
};
```

#### Critique CV
```typescript
const critiqueCV = async (cvData: CVData) => {
  const response = await fetch('http://localhost:8000/api/critique-cv', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cv_data: cvData })
  });
  
  return response.json();
};
```

### Error Handling
```typescript
try {
  const data = await generateCV(files);
  toast.success('CV generado exitosamente');
} catch (error) {
  toast.error('Error al generar CV');
  console.error(error);
}
```

## 🧪 Testing

### Unit Tests (pendiente de implementación)
```bash
npm test
```

### E2E Tests (pendiente de implementar)
```bash
npm run test:e2e
```

## 🚀 Deploy

### Vercel (Recomendado)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel
```

**Variables de entorno en Vercel:**
- `NEXT_PUBLIC_API_URL`: URL del backend en producción

### Otros proveedores
- Netlify
- Railway
- Render

## 🔧 Troubleshooting

### Errores Comunes

**"Module not found"**
```bash
rm -rf node_modules package-lock.json
npm install
```

**"Port 3000 already in use"**
```bash
# En Linux/Mac
lsof -ti:3000 | xargs kill -9

# En Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**CORS errors**
Verifica que el backend tenga configurado el middleware CORS correctamente.

## 📚 Recursos Adicionales

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Shadcn UI Documentation](https://ui.shadcn.com)
- [Radix UI Documentation](https://www.radix-ui.com)

## 🤝 Contribuir al Frontend

Ver [CONTRIBUTING.md](../CONTRIBUTING.md) para guidelines generales.

### Guidelines Específicas del Frontend
1. **TypeScript**: Usar tipos estrictos, evitar `any`
2. **Components**: Mantener componentes pequeños y reutilizables
3. **Styling**: Usar Tailwind, evitar CSS inline
4. **Naming**: Usar PascalCase para componentes, camelCase para funciones
5. **Commits**: Usar conventional commits

---

## 3. Estructura del Backend README

### Propósito
Documentación técnica detallada para desarrolladores que trabajan en el backend.

### Estructura Sugerida

```markdown
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

#### GET `/api/health`
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
3. **Error Handling**: Implementar proper exception handling
4. **Validation**: Usar Pydantic para validación de datos
5. **Testing**: Escribir tests para nuevas features
6. **Documentation**: Actualizar docstrings y API docs

---

## 4. Guía de Tono y Estilo - Español Natural para Devs

### Principios Fundamentales

#### 1. Evitar Traducciones Literales de Frases de IA
❌ **NO USAR:**
- "Hola, soy una IA asistente..."
- "Como modelo de lenguaje, puedo ayudarte..."
- "Estoy aquí para asistirte en..."
- "Permíteme explicarte..."

✅ **USAR:**
- Ir directo al grano
- Lenguaje técnico y directo
- Tono profesional y pragmático

#### 2. Terminología Técnica en Inglés
Mantener términos técnicos en inglés, NO traducir:

❌ **NO USAR:**
- "despliegue" → usar "deploy"
- "rama" → usar "branch"
- "solicitud de extracción" → usar "pull request"
- "configuración" → usar "setup" (en contextos de dev)
- "entorno" → usar "environment"
- "dependencias" → usar "dependencies"
- "pruebas" → usar "tests"
- "implementar" → usar "implement" (a veces)
- "commit" → usar "commit" (no "cometer")
- "merge" → usar "merge" (no "fusionar")
- "push" → usar "push"
- "pull" → usar "pull"
- "fork" → usar "fork"
- "issue" → usar "issue"
- "feature" → usar "feature"
- "bug" → usar "bug"
- "hotfix" → usar "hotfix"
- "release" → usar "release"
- "deploy" → usar "deploy"
- "build" → usar "build"
- "CI/CD" → usar "CI/CD"
- "API" → usar "API"
- "endpoint" → usar "endpoint"
- "middleware" → usar "middleware"
- "hook" → usar "hook"
- "component" → usar "component"
- "state" → usar "state"
- "props" → usar "props"
- "router" → usar "router"
- "service" → usar "service"
- "repository" → usar "repo" o "repository"
- "package" → usar "package"
- "dependency" → usar "dependency"
- "environment variable" → usar "variable de entorno"
- "script" → usar "script"
- "workflow" → usar "workflow"
- "pipeline" → usar "pipeline"
- "container" → usar "container"
- "image" → usar "image"
- "instance" → usar "instance"

#### 3. Verbos Comunes en Contextos de Dev
Usar verbos que devs usan naturalmente:

✅ **USAR:**
- "Instalar dependencias"
- "Ejecutar el servidor"
- "Hacer deploy"
- "Abrir un PR"
- "Crear un branch"
- "Hacer commit"
- "Hacer push"
- "Hacer pull"
- "Fork el repo"
- "Reportar un issue"
- "Fixear un bug"
- "Implementar una feature"
- "Testear el código"
- "Buildar el proyecto"
- "Deployar a producción"
- "Setup del entorno"
- "Configurar variables de entorno"
- "Ejecutar tests"
- "Debuggear el código"
- "Refactorizar"
- "Optimizar"
- "Escalar"

#### 4. Estructura de Comandos
Mantener comandos en inglés, explicaciones en español:

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Crear un nuevo branch
git checkout -b feature/nueva-feature

# Hacer commit de los cambios
git commit -m "Add new feature"

# Hacer push al branch
git push origin feature/nueva-feature
```

#### 5. Frases Comunes en Devs

✅ **USAR:**
- "Para setupear el proyecto..."
- "Para hacer deploy..."
- "Para testear..."
- "Para debuggear..."
- "Para fixear..."
- "Para optimizar..."
- "Para escalar..."
- "Para refactorizar..."
- "Para implementar..."
- "Para integrar..."
- "Para configurar..."
- "Para instalar..."
- "Para ejecutar..."
- "Para buildar..."
- "Para deployar..."

❌ **EVITAR:**
- "Para desplegar" → "Para hacer deploy"
- "Para configurar" → "Para setupear" (en contextos técnicos)
- "Para probar" → "Para testear"
- "Para depurar" → "Para debuggear"
- "Para arreglar" → "Para fixear"
- "Para implementar" → "Para implementar" (OK)
- "Para construir" → "Para buildar"

#### 6. Tono y Voz

**Características del tono:**
- Directo y conciso
- Profesional pero accesible
- Técnico pero claro
- Pragmático y práctico
- Sin relleno ni frases vacías

**Ejemplos:**

❌ **MAL:**
```
Bienvenido a CV-ConVos. Este es un proyecto increíble que te permitirá crear currículums de manera fácil y rápida. Estamos muy emocionados de que estés aquí. A continuación, te explicaremos paso a paso cómo puedes comenzar a usar esta herramienta.
```

✅ **BIEN:**
```
CV-ConVos es un constructor de CVs potenciado por IA. Esta guía te muestra cómo setupear el proyecto y empezar a usarlo.
```

#### 7. Formato de Instrucciones

Usar formato claro y directo:

```
### Instalación

1. Clona el repo
2. Instala dependencias
3. Configura variables de entorno
4. Ejecuta el servidor
```

#### 8. Mensajes de Error y Success

✅ **USAR:**
- "Error al generar CV"
- "CV generado exitosamente"
- "Error al hacer deploy"
- "Deploy completado"
- "Tests pasados"
- "Tests fallidos"
- "Build exitoso"
- "Build fallido"

#### 9. Convenciones de Código

Mantener nombres de variables, funciones, etc. en inglés (como es estándar):

```typescript
// ✅ Bien
const generateCV = async () => { ... }
const optimizeContent = (content: string) => { ... }
const handleFileUpload = (files: File[]) => { ... }

// ❌ Mal
const generarCV = async () => { ... }
const optimizarContenido = (contenido: string) => { ... }
const manejarSubidaArchivo = (archivos: File[]) => { ... }
```

#### 10. Comentarios en Código

Los comentarios pueden estar en español si ayudan a entender la lógica:

```typescript
// Sanitizar datos y agregar IDs únicos
const sanitizedData = {
  ...emptyCV,
  ...data,
  experience: (data.experience || []).map(e => ({ 
    ...e, 
    id: e.id || Math.random().toString(36).substr(2, 9) 
  }))
};
```

#### 11. Títulos y Secciones

Usar títulos claros y directos:

```
## Setup de Desarrollo
## API Endpoints
## Troubleshooting
## Contribuir
## Deploy
```

#### 12. Listas y Bullet Points

Usar verbos en infinitivo o imperativo:

```
- Instalar dependencias
- Configurar variables de entorno
- Ejecutar el servidor
- Hacer deploy
```

#### 13. Ejemplos de Código

Mantener código en inglés, comentarios en español si es necesario:

```python
# Extraer texto de archivos PDF
async def extract_from_pdf(content: bytes) -> str:
    """Extrae texto de un archivo PDF."""
    pdf_reader = PyPDF2.PdfReader(io.BytesIO(content))
    text = ""
    for page in pdf_reader.pages:
        text += page.extract_text()
    return text
```

#### 14. Frases de Transición

Usar transiciones directas:

✅ **USAR:**
- "Para empezar..."
- "A continuación..."
- "Luego..."
- "Finalmente..."
- "Nota:"
- "Importante:"
- "Tip:"

❌ **EVITAR:**
- "Ahora vamos a ver..."
- "A continuación, vamos a explicar..."
- "Es importante mencionar que..."
- "Quiero destacar que..."

#### 15. Referencias y Links

Usar lenguaje directo para referencias:

```
Ver [documentación de FastAPI](https://fastapi.tiangolo.com) para más detalles.
```

---

## 5. Contributing Guidelines - Ubicación y Contenido

### Ubicación
Crear archivo `CONTRIBUTING.md` en la raíz del proyecto.

### Estructura Sugerida

```markdown
# Contribuir a CV-ConVos

¡Gracias por tu interés en contribuir a CV-ConVos! Este documento te guiará sobre cómo contribuir de manera efectiva.

## 📋 Tabla de Contenidos

- [Código de Conducta](#código-de-conducta)
- [Cómo Contribuir](#cómo-contribuir)
- [Proceso de Desarrollo](#proceso-de-desarrollo)
- [Pull Requests](#pull-requests)
- [Estándares de Código](#estándares-de-código)
- [Reportar Bugs](#reportar-bugs)
- [Sugerir Features](#sugerir-features)

## 🤝 Código de Conducta

Al participar en este proyecto, te comprometes a mantener un ambiente respetuoso e inclusivo. No toleramos acoso ni comportamiento discriminatorio.

## 🚀 Cómo Contribuir

### Buscar Issues

1. Revisa los [issues abiertos](https://github.com/tu-usuario/cv-convos/issues)
2. Busca issues etiquetados como `good first issue` o `help wanted`
3. Comenta en el issue que quieres trabajar en él

### Crear un Nuevo Issue

Si encuentras un bug o tienes una idea para una feature:

1. Busca si ya existe un issue similar
2. Si no existe, crea un nuevo issue con:
   - Título descriptivo
   - Descripción detallada
   - Pasos para reproducir (si es un bug)
   - Screenshots (si aplica)
   - Environment info

## 🔄 Proceso de Desarrollo

### Setup del Entorno

1. Fork el repositorio
2. Clona tu fork:
   ```bash
   git clone https://github.com/tu-usuario/cv-convos.git
   cd cv-convos
   ```
3. Agrega el upstream:
   ```bash
   git remote add upstream https://github.com/usuario-original/cv-convos.git
   ```
4. Crea un branch para tu feature:
   ```bash
   git checkout -b feature/tu-feature
   ```

### Hacer Cambios

1. Sigue los [estándares de código](#estándares-de-código)
2. Escribe tests para tu feature
3. Asegúrate de que todos los tests pasen:
   ```bash
   # Frontend
   cd frontend && npm test
   
   # Backend
   cd backend && pytest
   ```
4. Commit tus cambios con mensajes claros:
   ```bash
   git commit -m "feat: add new template system"
   ```

### Sincronizar con Upstream

Antes de abrir un PR, sincroniza tu branch con upstream:

```bash
git fetch upstream
git rebase upstream/main
```

## 📤 Pull Requests

### Antes de Abrir un PR

1. Actualiza tu branch con upstream
2. Asegúrate de que los tests pasen
3. Actualiza la documentación si es necesario
4. Agrega screenshots para cambios visuales

### Estructura del PR

Usa el template de PR:

```markdown
## Descripción
Breve descripción de los cambios.

## Tipo de Cambio
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
Describe cómo testeaste tus cambios.

## Screenshots
Si aplica, agrega screenshots.

## Checklist
- [ ] Mi código sigue los estándares del proyecto
- [ ] He realizado self-review de mi código
- [ ] He comentado código complejo
- [ ] He actualizado la documentación
- [ ] Mis cambios no generan warnings
- [ ] He agregado tests que prueban mis cambios
- [ ] Todos los tests pasan
```

### Revisión del PR

- Sé paciente con el proceso de revisión
- Responde a los comentarios del revisor
- Haz los cambios solicitados
- Mantén el PR actualizado

## 📝 Estándares de Código

### Frontend (Next.js/React)

- **TypeScript**: Usa tipos estrictos, evita `any`
- **Components**: Mantén componentes pequeños y reutilizables
- **Styling**: Usa Tailwind, evita CSS inline
- **Naming**: 
  - Components: PascalCase (`MyComponent.tsx`)
  - Functions: camelCase (`myFunction`)
  - Constants: UPPER_SNAKE_CASE (`API_URL`)
- **Imports**: Agrupa imports en orden: React, third-party, local
- **Comments**: Comenta lógica compleja, no código obvio

### Backend (FastAPI/Python)

- **Type Hints**: Usa type hints en todas las funciones
- **Async**: Usa async/await para I/O operations
- **Error Handling**: Implementa proper exception handling
- **Validation**: Usa Pydantic para validación de datos
- **Naming**:
  - Functions: snake_case (`my_function`)
  - Classes: PascalCase (`MyClass`)
  - Constants: UPPER_SNAKE_CASE (`API_KEY`)
- **Docstrings**: Usa Google-style docstrings

### Commits

Usa [Conventional Commits](https://www.conventionalcommits.org):

```
feat: add new template system
fix: resolve PDF parsing issue
docs: update API documentation
style: format code with prettier
refactor: simplify CV data structure
test: add unit tests for parser service
chore: update dependencies
```

## 🐛 Reportar Bugs

### Plantilla de Bug Report

```markdown
**Descripción**
Breve descripción del bug.

**Pasos para Reproducir**
1. Ir a '...'
2. Click en '....'
3. Scroll a '....'
4. Ver error

**Comportamiento Esperado**
Descripción de lo que debería pasar.

**Screenshots**
Si aplica, agrega screenshots.

**Environment**
- OS: [e.g. Ubuntu 22.04]
- Browser: [e.g. Chrome 120]
- Node version: [e.g. 18.19.0]
- Python version: [e.g. 3.11.0]

**Logs Adicionales**
Agrega logs relevantes.
```

## 💡 Sugerir Features

### Plantilla de Feature Request

```markdown
**Descripción**
Descripción clara y concisa de la feature.

**Problema**
¿Qué problema resuelve esta feature?

**Solución Propuesta**
Descripción detallada de la solución.

**Alternativas Consideradas**
¿Qué otras soluciones consideraste?

**Contexto Adicional**
Información adicional relevante.
```

## 📚 Recursos para Contribuidores

- [Documentación del Proyecto](README.md)
- [Frontend Docs](frontend/README.md)
- [Backend Docs](backend/README.md)
- [Next.js Documentation](https://nextjs.org/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com)

## 🎖️ Reconocimiento

Los contribuidores serán reconocidos en:
- Lista de contribuidores en el README
- Changelog de releases
- Sección de agradecimientos

## 💬 Comunicación

- **Issues**: Para bugs y features
- **Discussions**: Para preguntas y debates generales
- **Discord/Slack**: [Si existe un canal]

---

Gracias por contribuir a CV-ConVos! 🚀
```

---

## 6. Documentación Adicional Sugerida

### ROADMAP.md

```markdown
# Roadmap - CV-ConVos

## v1.1 (Próximo Release)

### Features Planeadas
- [ ] Sistema de autenticación de usuarios
- [ ] Guardar CVs en la nube
- [ ] Historial de versiones
- [ ] Templates adicionales (Creative, Minimalist)
- [ ] Exportación a DOCX

### Mejoras
- [ ] Mejorar prompt engineering para mejor extracción
- [ ] Optimizar rendimiento de parsing de archivos grandes
- [ ] Agregar más idiomas soportados

## v1.2

### Features Planeadas
- [ ] Integración con LinkedIn
- [ ] ATS score checker
- [ ] Keyword optimization
- [ ] Cover letter generator

## v2.0 (Largo Plazo)

### Features Planeadas
- [ ] Sistema de suscripción premium
- [ ] Templates personalizados
- [ ] Integración con más LLM providers
- [ ] Colaboración en tiempo real
- [ ] API pública para integraciones

---

## Contribuir al Roadmap

Las sugerencias son bienvenidas. Abre un issue o discussion para proponer features.
```

### CHANGELOG.md

```markdown
# Changelog

Todos los cambios notables de este proyecto se documentarán en este archivo.

El formato se basa en [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-01-XX

### Added
- MVP completo de CV-ConVos
- Extracción de CV con IA usando Groq Llama 3.3-70b
- Editor en tiempo real con preview
- Dos templates (Modern y Professional)
- Optimización "Magic Shrink"
- Optimización "Improve Content"
- Critique de CV con IA
- Exportación a PDF
- Soporte para PDF, DOCX, TXT

### Tech Stack
- Frontend: Next.js 15+, React 19, TypeScript, Tailwind CSS 4, Shadcn UI
- Backend: FastAPI, Python 3.8+, Groq API, PyPDF2, python-docx

---

## [Unreleased]

### Planned
- Sistema de autenticación
- Guardado de CVs en la nube
- Más templates
```

### LICENSE.md

```markdown
MIT License

Copyright (c) 2024 CV-ConVos Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

### .env.example (Backend)

```env
# Groq API Configuration
GROQ_API_KEY=your_groq_api_key_here

# Server Configuration
HOST=0.0.0.0
PORT=8000
DEBUG=True

# CORS Configuration
# En producción, especificar el dominio del frontend
ALLOWED_ORIGINS=http://localhost:3000,https://tu-dominio.com

# Optional: Database (para features futuras)
# DATABASE_URL=postgresql://user:password@localhost:5432/cvconvos
```

### .env.example (Frontend)

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000/api

# Optional: Analytics
# NEXT_PUBLIC_GA_ID=your_google_analytics_id

# Optional: Feature Flags
# NEXT_PUBLIC_ENABLE_AUTH=false
# NEXT_PUBLIC_ENABLE_CLOUD_SAVE=false
```

---

## 7. Checklist para Implementación

### Para el Orchestrator

Al delegar las tareas de escritura de documentación:

#### README Principal (Raíz)
- [ ] Badges actualizados
- [ ] Sección "¿Qué es CV-ConVos?" clara y concisa
- [ ] Características principales con bullets
- [ ] Quick Start funcional
- [ ] Diagrama de arquitectura (opcional)
- [ ] Links a documentación detallada
- [ ] API endpoints documentados
- [ ] Tech stack completo
- [ ] Contributing section con link a CONTRIBUTING.md
- [ ] License section
- [ ] Contacto y soporte

#### Frontend README
- [ ] Arquitectura del frontend
- [ ] Setup de desarrollo detallado
- [ ] Estructura del proyecto con diagrama
- [ ] Componentes principales documentados
- [ ] Sistema de estilos (Tailwind + Shadcn)
- [ ] State management explicado
- [ ] API integration con ejemplos de código
- [ ] Testing section
- [ ] Deploy instructions
- [ ] Troubleshooting común
- [ ] Recursos adicionales

#### Backend README
- [ ] Arquitectura del backend
- [ ] Setup de desarrollo detallado
- [ ] Configuración de variables de entorno
- [ ] Estructura del proyecto con diagrama
- [ ] API endpoints completos con ejemplos
- [ ] Servicios documentados (parser, AI)
- [ ] Integración con Groq detallada
- [ ] Testing section
- [ ] Deploy instructions (Docker, Railway, etc.)
- [ ] Troubleshooting común
- [ ] Recursos adicionales

#### Tone & Style Guide
- [ ] Principios fundamentales claros
- [ ] Ejemplos de "NO USAR" vs "USAR"
- [ ] Lista de términos técnicos en inglés
- [ ] Verbos comunes en contextos de dev
- [ ] Ejemplos de frases comunes
- [ ] Convenciones de código
- [ ] Formato de instrucciones
- [ ] Mensajes de error y success

#### Contributing Guidelines
- [ ] Código de conducta
- [ ] Cómo contribuir (buscar issues, crear issues)
- [ ] Proceso de desarrollo
- [ ] Pull request process
- [ ] Estándares de código (frontend y backend)
- [ ] Reportar bugs (con template)
- [ ] Sugerir features (con template)
- [ ] Recursos para contribuidores

#### Documentación Adicional
- [ ] ROADMAP.md
- [ ] CHANGELOG.md
- [ ] LICENSE.md
- [ ] .env.example (backend)
- [ ] .env.example (frontend)

---

## 8. Consideraciones Finales

### Prioridad de Documentación

1. **Alta Prioridad** (Implementar primero):
   - README principal (raíz)
   - Frontend README
   - Backend README
   - CONTRIBUTING.md
   - Tone & Style Guide

2. **Media Prioridad**:
   - ROADMAP.md
   - CHANGELOG.md
   - .env.example files

3. **Baja Prioridad** (puede esperar):
   - LICENSE.md (si ya existe)
   - Documentación adicional (guías avanzadas, etc.)

### Consistencia

Asegurar consistencia en:
- Tono y estilo en todos los documentos
- Formato de código y comandos
- Terminología técnica
- Estructura de secciones

### Mantenimiento

La documentación debe:
- Actualizarse con cada release
- Reflejar cambios en la arquitectura
- Incluir nuevas features
- Mantenerse relevante y útil

### Feedback

Solicitar feedback de la comunidad sobre:
- Claridad de la documentación
- Facilidad de setup
- Completitud de la información
- Utilidad de los ejemplos

---

## Resumen Ejecutivo para el Orchestrator

Esta estrategia proporciona:

1. **Estructuras claras** para READMEs principal, frontend y backend
2. **Guía de tono y estilo** para español natural "dev-to-dev"
3. **Guidelines de contribución** completas
4. **Documentación adicional** sugerida (roadmap, changelog, etc.)
5. **Checklist** para implementación

**Próximos pasos recomendados:**
1. Revisar esta estrategia
2. Ajustar según necesidades específicas del proyecto
3. Delegar tareas de escritura al modo "Code"
4. Revisar y aprobar cada documento antes de merge

**Tiempo estimado de implementación:**
- README principal: 2-3 tareas
- Frontend README: 2-3 tareas
- Backend README: 2-3 tareas
- Contributing guidelines: 1-2 tareas
- Documentación adicional: 1-2 tareas

**Total aproximado:** 8-13 tareas para el Orchestrator
