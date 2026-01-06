# Plan de Mejora: Tests y Mantenibilidad

## CV-ConVos v1.1

**Fecha:** 6 Enero 2026  
**Autor:** Equipo de Desarrollo  
**Versión:** 1.0

---

## 1. Resumen Ejecutivo

Este documento presenta un plan detallado para mejorar la calidad del código, la cobertura de tests y la mantenibilidad del proyecto CV-ConVos. El plan se divide en tres fases principales distribuidas en tres semanas.

### Objetivos Principales

- Aumentar cobertura de tests unitarios al 70% (backend) y 60% (frontend)
- Implementar logging estructurado para debugging en producción
- Añadir validación de tipos en endpoints API
- Configurar CI/CD automatizado con GitHub Actions
- Establecer pre-commit hooks para calidad de código

---

## 2. Estado Actual

### 2.1 Análisis del Código Existente

#### Frontend

El frontend está construido con Next.js 16 y TypeScript 5, siguiendo buenas prácticas de organización:

- **Fortalezas:**
  - Tipado estricto en `src/types/cv.ts` con interfaces completas
  - Custom hooks como `useCVHistory` que implementan undo/redo
  - Componentes Shadcn UI bien separados
  - ESLint configurado

- **Áreas de mejora:**
  - Sin tests unitarios visibles
  - Acceso directo a propiedades sin null-checks
  - Estilo JSX global deprecado en Builder.tsx

#### Backend

El backend usa FastAPI con arquitectura en capas:

- **Fortalezas:**
  - Separación clara API → Services → Core
  - Pydantic settings para configuración
  - Tests de integración existentes en `scripts/tests/test_api.py`

- **Áreas de mejora:**
  - Solo tests de integración, sin unit tests
  - Print statements en lugar de logging estructurado
  - Sin validación Pydantic en endpoints
  - CORS demasiado permisivo

### 2.2 Métricas Actuales

| Categoría | Puntuación Actual |
|-----------|-------------------|
| Organización | 9/10 |
| Tipado | 9/10 |
| Tests | 5/10 |
| Documentación | 8/10 |
| Seguridad | 6/10 |
| Mantenibilidad | 8/10 |
| **Total** | **7.5/10** |

---

## 3. Fase 1: Mejora de Tests

**Duración:** Semana 1  
**Objetivo:** Coverage mínimo 70% backend, 60% frontend

### 3.1 Backend - Unit Tests con pytest

#### Estructura de Directorios

```
backend/tests/
├── unit/
│   ├── __init__.py
│   ├── test_config.py
│   ├── test_parser_service.py
│   ├── test_ai_service.py
│   └── test_helpers.py
├── integration/
│   └── test_api.py
└── conftest.py
```

#### Test Config (test_config.py)

Validar el sistema de configuración:

- Carga correcta de variables de entorno
- Valores por defecto de Settings
- Validación de API keys
- Manejo de archivos .env

#### Test Parser Service (test_parser_service.py)

Probar el parsing de documentos:

- Extracción de texto de PDFs
- Extracción de texto de documentos Word
- Manejo de archivos corruptos
- Límites de tamaño de archivo
- Codificaciones de caracteres

#### Test AI Service (test_ai_service.py)

Probar servicios de IA con mocking:

- Extracción de datos CV (mock Groq client)
- Optimización de CV shrink/improve
- Generación de críticas
- Preservación de idioma
- Manejo de respuestas vacías
- Errores de API

#### Test Helpers (test_helpers.py)

Funciones utilitarias del proyecto.

### 3.2 Frontend - Unit Tests con Vitest

#### Estructura de Directorios

```
frontend/src/
├── __tests__/
│   ├── page.test.tsx
│   └── cv-builder/
│       ├── Builder.test.tsx
│       └── Editor.test.tsx
├── components/
│   └── cv-builder/
│       └── __tests__/
│           ├── Editor.test.tsx
│           ├── FileUploader.test.tsx
│           └── TemplateConfigurator.test.tsx
├── hooks/
│   └── __tests__/
│       └── use-cv-history.test.ts
└── lib/
    └── __tests__/
        └── utils.test.ts
```

#### Test useCVHistory Hook

El hook de historial necesita tests exhaustivos:

- Deshacer una acción
- Rehacer una acción
- Límite de 30 versiones
- Detección de cambios duplicates
- Estado inicial correcto

#### Test Componentes Principales

- Editor con datos de CV
- FileUploader con drag & drop
- TemplateConfigurator
- Templates (Professional, Modern, Harvard, Swiss)

### 3.3 Mejora de Tests de Integración

#### Mejoras a test_api.py

- Convertir a estructura pytest con fixtures
- Parametrizar tests con @pytest.mark.parametrize
- Mock de Groq API para tests offline
- Tests de validación de inputs
- Snapshot testing para respuestas AI
- Tests de preservación de idioma

#### Nuevos Tests de Integración

- test_parser.py: Tests de parsing con archivos mock
- test_ai_prompts.py: Calidad de prompts AI
- test_language.py: Preservación de idioma español/inglés

---

## 4. Fase 2: Mejora de Mantenibilidad

**Duración:** Semana 2  
**Objetivo:** Código más robusto y mantenible

### 4.1 Logging Estructurado en Backend

#### Problema Actual

El código usa print statements para debug:
```python
print(f"DEBUG: AI Raw Content: {content[:100]}...")
print(f"ERROR in Groq API Service: {str(e)}")
```

#### Solución Propuesta

Implementar logging estructurado JSON:

- Formato: `%(asctime)s %(levelname)s %(name)s %(message)s`
- Niveles: DEBUG, INFO, WARNING, ERROR
- Salida: JSON para consumo en sistemas de logging
- Contexto: Request IDs, timestamps, user info

#### Niveles de Logging

| Nivel | Cuándo Usar | Ejemplo |
|-------|-------------|---------|
| DEBUG | Requests/responses de API | Contenido truncado de respuestas |
| INFO | Eventos de negocio | Upload, optimize, critique completados |
| WARNING | Condiciones anómalas | API keys faltantes, retries |
| ERROR | Fallos del sistema | Procesamiento fallido |

### 4.2 Validación Pydantic en Endpoints

#### Problema Actual

Los endpoints aceptan `dict` sin validación:
```python
async def optimize_cv(cv_data: dict, target: str = "shrink"):
```

#### Solución Propuesta

Crear schemas Pydantic:

```python
# app/api/schemas.py
class PersonalInfo(BaseModel):
    fullName: str = Field(..., min_length=1, max_length=100)
    email: str = Field(..., max_length=100)
    # ... más campos

class CVDataInput(BaseModel):
    personalInfo: PersonalInfo
    experience: List[Experience] = []
    # ... más campos

class OptimizeRequest(BaseModel):
    cv_data: CVDataInput
    target: OptimizationTarget = OptimizationTarget.shrink
```

#### Beneficios

- Validación automática de inputs
- Documentación automática en /docs
- Mensajes de error claros para el cliente
- Prevención de errores en tiempo de ejecución

### 4.3 Seguridad

#### CORS

**Problema:**
```python
allow_origins=["*"]  # Muy permisivo
```

**Solución:**
```python
ALLOWED_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
```

#### API Keys

**Problema:**
```python
GROQ_API_KEY: str = "placeholder_key"  # Valor por defecto inseguro
```

**Solución:**
```python
GROQ_API_KEY: str = Field(..., description="Groq API Key")

@model_validator(mode='after')
def validate_api_key(self):
    if not self.GROQ_API_KEY:
        raise ValueError("GROQ_API_KEY must be set")
    return self
```

### 4.4 Manejo de Errores Centralizado

#### Excepciones Personalizadas

```python
class AppException(HTTPException):
    """Base exception con logging automático."""

class AIProcessingError(AppException):
    """Error en procesamiento de AI."""

class CVValidationError(AppException):
    """Error de validación de CV."""
```

#### Handler Global

Async exception handler que:
- Loggea el error automáticamente
- Devuelve respuesta consistente
- Incluye traceback en desarrollo

### 4.5 Frontend - Null Safety

#### Problema Actual

```typescript
// Acceso directo sin null-check
config={data.config!}
```

#### Solución Propuesta

```typescript
// Safe access con default
config={data.config || DEFAULT_CONFIG}
```

### 4.6 Tipos con Validación Runtime

#### Zod para Validación

Añadir validación runtime con Zod:

```typescript
// src/types/cv.ts
import { z } from 'zod';

export const PersonalInfoSchema = z.object({
    fullName: z.string().min(1).max(100),
    email: z.string().email(),
    // ... rest
});

export type PersonalInfo = z.infer<typeof PersonalInfoSchema>;
```

---

## 5. Fase 3: CI/CD y Automatización

**Duración:** Semana 3  
**Objetivo:** Pipeline automatizado de calidad

### 5.1 GitHub Actions

#### CI Pipeline (ci.yml)

```yaml
jobs:
  backend:
    - Checkout código
    - Setup Python 3.11
    - Instalar dependencias
    - Ejecutar tests con coverage
    - Subir coverage a Codecov

  frontend:
    - Checkout código
    - Setup Node 20
    - Instalar dependencias
    - Ejecutar linter
    - Ejecutar tests con coverage
    - Build de producción
```

#### Quality Pipeline (quality.yml)

```yaml
jobs:
  lint:
    - Python: ruff check backend/
    - TypeScript: npm run lint
```

### 5.2 Pre-commit Hooks

#### Hooks Configurados

| Hook | Qué Hace | Lenguaje |
|------|----------|----------|
| backend-lint | ruff check | Python |
| frontend-lint | ESLint | TypeScript |
| test-backend | pytest -x | Python |

#### Instalación

```bash
pip install pre-commit
pre-commit install
```

### 5.3 Herramientas de Calidad

| Herrامية | Propósito |
|-----------|-----------|
| ruff | Linter Python ultra-rápido |
| eslint | Linter TypeScript |
| pytest | Test runner Python |
| vitest | Test runner JavaScript |
| codecov | Reporte de coverage |

---

## 6. Dependencias Nuevas

### 6.1 Backend

```txt
pytest==8.3.4
pytest-asyncio==0.25.3
pytest-cov==6.0.0
pytest-mock==3.14.0
python-json-logger==3.2.1
ruff==0.8.0
```

### 6.2 Frontend

```json
{
  "devDependencies": {
    "vitest": "^3.0.0",
    "@vitest/ui": "^3.0.0",
    "@vitest/coverage-v8": "^3.0.0",
    "@testing-library/react": "^16.0.0",
    "@testing-library/jest-dom": "^6.6.0",
    "jsdom": "^26.0.0"
  }
}
```

---

## 7. Timeline

### Semana 1: Tests

| Día | Tarea |
|-----|-------|
| Lunes | Configurar pytest, crear conftest.py |
| Martes | Unit tests para config y parser_service |
| Miércoles | Unit tests para ai_service (mocking) |
| Jueves | Configurar Vitest, tests para hooks |
| Viernes | Tests para componentes frontend |

### Semana 2: Mantenibilidad

| Día | Tarea |
|-----|-------|
| Lunes | Logging estructurado |
| Martes | Schemas Pydantic para API |
| Miércoles | Manejo de errores centralizado |
| Jueves | Null safety en frontend |
| Viernes | Mejoras de seguridad (CORS, API keys) |

### Semana 3: CI/CD

| Día | Tarea |
|-----|-------|
| Lunes | GitHub Actions CI pipeline |
| Martes | GitHub Actions quality pipeline |
| Miércoles | Pre-commit hooks |
| Jueves | Documentación de arquitectura |
| Viernes | Revisión final y merge |

---

## 8. Métricas Objetivo

### Cobertura de Tests

| Componente | Actual | Objetivo |
|------------|--------|----------|
| Backend (total) | 0% | 70% |
| ai_service | 0% | 80% |
| parser_service | 0% | 75% |
| Frontend (total) | 0% | 60% |
| useCVHistory | 0% | 90% |
| Editor | 0% | 70% |

### Calidad de Código

| Métrica | Objetivo |
|---------|----------|
| ESLint errors | 0 |
| ruff errors | 0 |
| TypeScript errors | 0 |
| Security warnings | 0 |

---

## 9. Archivos del Plan

### Archivos Nuevos

| Fase | Archivos |
|------|----------|
| 1 | `backend/tests/conftest.py`, `test_*.py` |
| 1 | `frontend/vite.config.ts`, `*.test.ts`, `*.test.tsx` |
| 2 | `backend/app/core/logging.py`, `api/schemas.py`, `core/exceptions.py` |
| 3 | `.github/workflows/ci.yml`, `.github/workflows/quality.yml`, `.pre-commit-config.yaml` |

### Archivos Modificados

| Fase | Archivos |
|------|----------|
| 1 | `backend/Makefile`, `backend/requirements.txt`, `frontend/package.json` |
| 1 | `scripts/tests/test_api.py` |
| 2 | `backend/app/services/ai_service.py`, `api/endpoints.py`, `main.py`, `core/config.py` |
| 2 | `frontend/src/components/cv-builder/Builder.tsx`, `types/cv.ts` |

---

## 10. Costo y Esfuerzo

### Matriz Esfuerzo/Impacto

| Mejora | Esfuerzo | Impacto |
|--------|----------|---------|
| Logging estructurado | Bajo | Alto |
| Validación Pydantic | Medio | Alto |
| Unit tests backend | Alto | Alto |
| Unit tests frontend | Alto | Alto |
| GitHub Actions | Bajo | Medio |
| Null safety | Bajo | Medio |
| Pre-commit hooks | Bajo | Medio |

---

## 11. Riesgos

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Retraso en tests | Media | Alto | Priorizar tests críticos |
| Complejidad de mocking | Alta | Medio | Usar pytest-mock y fixtures |
| Breaking changes | Baja | Alto | Tests de regresión |
| Tiempo insuficiente | Media | Alto | Scope inicial conservador |

---

## 12. Definición de Done

El plan se considera completo cuando:

- [ ] Coverage backend >= 70%
- [ ] Coverage frontend >= 60%
- [ ] 0 ESLint errors
- [ ] 0 ruff errors
- [ ] Logging estructurado implementado
- [ ] Validación Pydantic en todos los endpoints
- [ ] CI pipeline funcionando
- [ ] Pre-commit hooks configurados
- [ ] Documentación actualizada

---

## 13. Referencias

- [pytest documentation](https://docs.pytest.org/)
- [Vitest documentation](https://vitest.dev/)
- [Pydantic validation](https://docs.pydantic.dev/)
- [GitHub Actions](https://docs.github.com/en/actions)
- [Pre-commit hooks](https://pre-commit.com/)

---

## 14. Aprobaciones

| Rol | Nombre | Fecha |
|-----|--------|-------|
| Tech Lead | | |
| QA Lead | | |
| Product Owner | | |

---

*Documento generado el 6 de Enero de 2026*
