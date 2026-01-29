Perfecto! He creado un AGENTS.md master file que funciona como contexto único y permanente para todos tus futuros agents. Aquí está el archivo completo:

🤖 CV-ConVos AI Agents Workspace
Project: CV-ConVos LEAN-EnLAN Recovery
Version: 2.0
Last Updated: 2026-01-28
Repository: https://github.com/[username]/cv-convos

📋 Project Overview
CV-ConVos es un Full-Stack AI CV Builder que permite a usuarios crear, optimizar y exportar CVs profesionales usando IA generativa (Groq LLM).

Stack Tecnológico
json
{
  "frontend": {
    "framework": "Next.js 16 (App Router)",
    "language": "TypeScript 5.x",
    "ui": "React 19 + Tailwind CSS 4 + Shadcn UI",
    "state": "Context API (en migración)",
    "animations": "Framer Motion",
    "testing": "Vitest + Testing Library + Playwright"
  },
  "backend": {
    "framework": "FastAPI (Python 3.11)",
    "ai_provider": "Groq API (llama-3.1-8b-instant)",
    "validation": "Pydantic v2",
    "caching": "Redis (pendiente implementación)",
    "testing": "Pytest + Coverage",
    "parsing": "PyMuPDF + python-docx"
  },
  "devops": {
    "ci_cd": "GitHub Actions",
    "deploy_frontend": "Vercel",
    "deploy_backend": "Custom (Docker ready)",
    "monitoring": "Structured logging (JSON)"
  }
}
Estructura del Repositorio
text
cv-convos/
├── frontend/
│   ├── src/
│   │   ├── app/                    # Next.js App Router pages
│   │   ├── components/
│   │   │   ├── cv-builder/         # Builder, Editor, Templates
│   │   │   └── ui/                 # Shadcn UI components (22 items)
│   │   ├── contexts/               # ⚠️ EN DESARROLLO (CVContext)
│   │   ├── hooks/                  # Custom hooks (auto-save, history)
│   │   ├── lib/                    # Utilities + template defaults
│   │   └── types/                  # TypeScript types
│   ├── __tests__/                  # Tests (coverage ~30%)
│   └── docs/                       # 7 archivos .md de documentación
│
├── backend/
│   ├── app/
│   │   ├── api/                    # FastAPI endpoints + schemas
│   │   ├── core/                   # Config, exceptions, logging, limiter
│   │   └── services/               # AI service + parser service
│   ├── tests/                      # Unit + integration tests (coverage ~60%)
│   └── docs/                       # Backend architecture docs
│
├── .github/workflows/              # CI/CD pipelines
├── AGENTS.md                       # 👈 ESTE ARCHIVO
└── README.md
🎯 Situación Actual del Proyecto
✅ Lo que Funciona Bien (No Tocar)
Backend Architecture:

✅ Pydantic schemas con validación runtime

✅ Custom exceptions (CVProcessingError, AIServiceError)

✅ Rate limiting (10 req/min con slowapi)

✅ Structured logging (JSON format)

✅ Retry logic con tenacity (3 attempts)

Frontend UI:

✅ Shadcn UI components (22 componentes profesionales)

✅ Tailwind CSS styling consistente

✅ 9 templates de CV funcionales

✅ Responsive design

CI/CD:

✅ GitHub Actions workflows funcionales

✅ Linting automático (ruff + eslint)

✅ Tests en CI

⚠️ Problemas Críticos Identificados
1. Frontend State Management Caótico
Síntoma: useState scattered en 15+ componentes con prop drilling masivo
Impacto: Re-renders innecesarios, imposible hacer undo/redo, testing nightmare
Solución: Migrar a Context API con reducer pattern
Status: 🟡 EN PROGRESO

2. Templates con 70% Código Duplicado
Síntoma: 9 templates × 250 líneas = 2,000+ líneas duplicadas
Impacto: Bug fix = editar 9 archivos, bundle size innecesario
Solución: Componentes compartidos + composición
Status: 🔴 PENDIENTE

3. Backend Sin Caching
Síntoma: Cada request llama a Groq API (latency 3s, costos altos)
Impacto: UX pobre, rate limits, costos 5x más altos
Solución: Redis caching layer con TTL
Status: 🔴 PENDIENTE

4. Testing Insuficiente
Backend: 60% coverage (falta integration tests)
Frontend: 30% coverage (sin E2E tests)
Solución: Aumentar a 85% backend, 70% frontend, agregar Playwright
Status: 🟡 EN PROGRESO

📊 Roadmap de Refactoring (4 Semanas)
Week 1: State Management + Testing Foundation
W1-T1: ✅ Crear CVContext con reducer + undo/redo

W1-T2: 🟡 Refactorizar Builder.tsx para usar CVContext

W1-T3: Agregar tests comprehensivos a ai_service.py

Target: 70% backend coverage, estado centralizado

Week 2: Template Refactor + Shared Components
W2-T1: Crear 6 componentes compartidos (Header, Experience, etc.)

W2-T2: Refactorizar 9 templates a composición

W2-T3: Tests de templates + visual regression

Target: Eliminar 1,500 líneas duplicadas

Week 3: Caching + Performance
W3-T1: Implementar Redis caching decorator

W3-T2: Aplicar caching a funciones AI

W3-T3: Monitoring + métricas

Target: Latency 3s → 50ms, costos -80%

Week 4: E2E Testing + Documentation + Deploy
W4-T1: Setup Playwright + 5 E2E test suites

W4-T2: Actualizar documentación

W4-T3: CI/CD enhancements

W4-T4: Production deployment

Target: 100% confidence en deployments

🤖 Instrucciones para AI Agents
Reglas Críticas (NUNCA Violar)
Testing Obligatorio

❌ NO hacer refactors sin tests

✅ Cada función nueva = mínimo 3 test cases

✅ Tests deben pasar antes de commit

TypeScript Strict Mode

❌ NO usar any type

✅ Todos los tipos explícitos

✅ Verificar con npx tsc --noEmit

Backward Compatibility

❌ NO romper APIs existentes

✅ Agregar deprecation warnings si es necesario

✅ Mantener interfaces compatibles

Incremental Changes

❌ NO hacer cambios masivos en un PR

✅ Cambios atómicos (1-3 archivos por task)

✅ Commits pequeños y frecuentes

Verification Before Completion

❌ NO marcar task como completada sin verificar

✅ Correr tests + linter + build

✅ Incluir comandos de verificación en output

Output Format Obligatorio
SIEMPRE devolver respuestas en este formato JSON:

json
{
  "task_id": "W1-T1",
  "task_name": "Crear CVContext con reducer",
  "status": "completed|in_progress|blocked",
  "files_created": [
    "frontend/src/contexts/CVContext.tsx",
    "frontend/src/contexts/types.ts"
  ],
  "files_modified": [
    "frontend/src/app/layout.tsx"
  ],
  "files_deleted": [],
  "tests_added": {
    "count": 18,
    "passing": 18,
    "failing": 0,
    "coverage_delta": "+12%"
  },
  "code_metrics": {
    "lines_added": 350,
    "lines_removed": 120,
    "net_change": 230,
    "complexity_change": "neutral"
  },
  "verification_commands": [
    "cd frontend && npm test CVContext.test.tsx",
    "npx tsc --noEmit",
    "npm run lint"
  ],
  "verification_results": {
    "tests_passing": true,
    "typescript_valid": true,
    "linter_passing": true,
    "build_success": true
  },
  "next_steps": [
    "Refactorizar Builder.tsx para usar useCVData()",
    "Agregar keyboard shortcuts para undo/redo"
  ],
  "blockers": [],
  "estimated_time_spent": "45 minutes",
  "next_task_id": "W1-T2"
}
Comandos de Verificación Estándar
Frontend
bash
cd frontend

# 1. TypeScript validation
npx tsc --noEmit
# Esperado: "No errors"

# 2. Linting
npm run lint
# Esperado: "0 errors, 0 warnings"

# 3. Tests
npm test [archivo específico]
# Esperado: "X tests passed"

# 4. Coverage
npm test -- --coverage
# Target: >70%

# 5. Build
npm run build
# Esperado: "Build successful"
Backend
bash
cd backend

# 1. Linting
python -m ruff check .
# Esperado: "All checks passed"

# 2. Type checking
python -m mypy app/
# Esperado: "Success: no issues found"

# 3. Tests
python -m pytest tests/unit/test_[modulo].py -v
# Esperado: "X passed"

# 4. Coverage
python -m pytest --cov=app --cov-report=term-missing
# Target: >85%

# 5. Integration tests
python -m pytest tests/integration/ -v
# Esperado: "X passed"
📝 Plantillas de Código
Template: Component with Context
typescript
// frontend/src/components/cv-builder/MiComponente.tsx
import { useCVData, useCVActions } from '@/contexts/CVContext';

interface MiComponenteProps {
  // Props específicas del componente (NO cvData)
  mode?: 'edit' | 'preview';
}

export function MiComponente({ mode = 'edit' }: MiComponenteProps) {
  // ✅ Obtener datos del context
  const { state } = useCVData();
  const { updatePersonalInfo } = useCVActions();

  // ✅ Usar state.present en lugar de props
  const handleChange = (value: string) => {
    updatePersonalInfo({ fullName: value });
  };

  return (
    <div>
      <input
        value={state.present.personalInfo.fullName}
        onChange={(e) => handleChange(e.target.value)}
      />
    </div>
  );
}
Template: Backend Endpoint with Caching
python
# backend/app/api/endpoints.py
from app.core.cache import cache_ai_response  # ⚠️ Pendiente crear

@router.post("/mi-endpoint")
@limiter.limit("10/minute")
@cache_ai_response(ttl=3600)  # ✅ 1 hora de cache
async def mi_endpoint(request: Request, data: MiSchema):
    """
    Descripción del endpoint.
    
    Args:
        data: Datos de entrada
        
    Returns:
        Resultado procesado
        
    Raises:
        400: Validation error
        503: AI service error
    """
    try:
        result = await procesar_con_ai(data)
        return result
    except AIServiceError as e:
        raise HTTPException(status_code=503, detail="AI unavailable")
Template: Test Case
typescript
// frontend/src/components/__tests__/MiComponente.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { CVProvider } from '@/contexts/CVContext';
import { MiComponente } from '../MiComponente';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <CVProvider>{children}</CVProvider>
);

describe('MiComponente', () => {
  it('should render correctly', () => {
    render(<MiComponente />, { wrapper });
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('should update context on change', () => {
    render(<MiComponente />, { wrapper });
    const input = screen.getByRole('textbox');
    
    fireEvent.change(input, { target: { value: 'Nuevo valor' } });
    
    expect(input).toHaveValue('Nuevo valor');
  });
});
🚨 Casos de Error Comunes
Error 1: "useCVData must be used within CVProvider"
Causa: Componente usa useCVData() fuera del <CVProvider>
Solución:

typescript
// ❌ MAL
export default function App() {
  return <MiComponente />; // No hay provider
}

// ✅ BIEN
export default function App() {
  return (
    <CVProvider>
      <MiComponente />
    </CVProvider>
  );
}
Error 2: Type 'any' is not assignable
Causa: TypeScript strict mode activado
Solución:

typescript
// ❌ MAL
const data: any = fetchData();

// ✅ BIEN
import { CVData } from '@/types/cv';
const data: CVData = fetchData();
Error 3: Tests failing en CI pero pasan local
Causa: Diferencias en timezone o mocks no limpios
Solución:

typescript
// ✅ Limpiar después de cada test
afterEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
});
📚 Recursos de Referencia
Documentación Interna
/frontend/docs/ARCHITECTURE.md - Arquitectura frontend

/frontend/docs/COMPONENTS.md - Guía de componentes

/backend/docs/API_REFERENCE.md - Referencia de API

/backend/docs/DEVELOPER_GUIDE.md - Guía de desarrollo

APIs Externas
Groq API: https://console.groq.com/docs

Next.js 16: https://nextjs.org/docs

Shadcn UI: https://ui.shadcn.com/docs

Pydantic v2: https://docs.pydantic.dev/latest/

Testing
Vitest: https://vitest.dev/guide/

Playwright: https://playwright.dev/docs/intro

Pytest: https://docs.pytest.org/

🔄 Workflow para Agents
1. Recibir Task Assignment
Ejemplo: "W1-T1: Crear CVContext con reducer"

2. Leer Contexto
text
1. Leer este AGENTS.md completo
2. Verificar "Situación Actual del Proyecto"
3. Identificar archivos afectados
4. Revisar "Casos de Error Comunes"
3. Implementar Solución
text
1. Crear archivos nuevos primero
2. Modificar archivos existentes
3. Agregar tests (mínimo 3 casos)
4. Actualizar tipos si es necesario
4. Verificar Localmente
bash
# Correr TODOS estos comandos
npm test [archivo]
npx tsc --noEmit
npm run lint
npm run build
5. Generar Output JSON
Usar el formato obligatorio especificado arriba.

6. Reportar Blockers
Si encuentras problemas que impiden completar la task:

json
{
  "status": "blocked",
  "blockers": [
    {
      "type": "missing_dependency",
      "description": "Redis no está instalado",
      "suggested_solution": "Agregar redis a requirements.txt"
    }
  ]
}
💡 Tips para Agents LLM
DO's ✅
Leer código existente antes de modificar

Buscar patrones establecidos

Mantener consistencia de estilo

Hacer cambios incrementales

Un archivo a la vez cuando sea posible

Commits pequeños y descriptivos

Priorizar tests

Tests primero (o al menos junto con código)

Aim for 100% de los tests pasando

Documentar decisiones

Comentarios en código complejo

Actualizar docs si cambias interfaces

Usar tipos existentes

Importar de /types/cv.ts

No duplicar definiciones

DON'Ts ❌
NO asumir que algo funciona

Siempre verificar con tests

No confiar en "debería funcionar"

NO hacer refactors masivos

Evitar cambiar 10+ archivos a la vez

Priorizar estabilidad sobre "perfección"

NO ignorar warnings

Linter warnings = deuda técnica

TypeScript warnings = bugs futuros

NO usar bibliotecas nuevas sin aprobación

Stick to stack existente

Si necesitas algo nuevo, reportar como blocker

NO romper backward compatibility

APIs existentes deben seguir funcionando

Agregar deprecation warnings si es necesario

🎯 Métricas de Éxito
Coverage Targets
Backend: 85%+ (actualmente 60%)

Frontend: 70%+ (actualmente 30%)

Integration tests: 5+ workflows E2E

Performance Targets
API Latency (P95): <500ms (actualmente ~3s)

Cache Hit Rate: >80% (actualmente 0%)

Build Time: <2min (actualmente ~1.5min)

Code Quality Targets
Duplicated Code: <300 líneas (actualmente 1,800)

Component Size: <100 líneas (templates actualmente 250)

TypeScript Errors: 0 (siempre)

Linter Warnings: 0 (siempre)

📞 Contacto y Escalación
Para Blockers Críticos
Si encuentras un blocker que impide progresar:

Marcar task como "blocked"

Incluir en output JSON:

json
{
  "status": "blocked",
  "blockers": [
    {
      "severity": "critical|high|medium",
      "description": "Descripción detallada",
      "suggested_solution": "Solución propuesta",
      "requires_human_input": true
    }
  ]
}
Para Decisiones de Arquitectura
Si necesitas tomar una decisión que afecta arquitectura:

Reportar como "requires_approval"

Proponer 2-3 opciones con pros/cons

Esperar feedback antes de proceder

🔐 Seguridad y Privacidad
Datos Sensibles
❌ NUNCA hardcodear API keys

✅ Usar variables de entorno (.env)

✅ Agregar .env a .gitignore

User Data
✅ Todos los CVs se guardan en localStorage (client-side)

✅ Backend NO persiste datos de usuarios

✅ Groq API calls son stateless

Dependencies
✅ Mantener dependencies actualizadas

✅ Revisar npm audit / pip check

✅ No agregar packages con vulnerabilidades

📋 Quick Reference
Estructura de IDs de Tasks
W1-T1 = Week 1, Task 1

W2-T3 = Week 2, Task 3

etc.

Status Values
completed - Task finalizada y verificada

in_progress - Task en desarrollo

blocked - Task bloqueada esperando resolución

pending - Task no iniciada

Priority Levels
P0 - Crítico (rompe producción)

P1 - Alto (afecta UX significativamente)

P2 - Medio (mejora importante)

P3 - Bajo (nice to have)

🚀 Getting Started (Para Nuevos Agents)
First Time Setup
Leer este documento completo (AGENTS.md)

Clonar el repositorio:

bash
git clone https://github.com/[username]/cv-convos
cd cv-convos
Setup frontend:

bash
cd frontend
npm install
cp .env.example .env  # Configurar variables
npm run dev           # Debería correr en :3000
Setup backend:

bash
cd backend
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env  # Agregar GROQ_API_KEY
python -m app.main    # Debería correr en :8000
Correr tests:

bash
# Frontend
cd frontend && npm test

# Backend
cd backend && python -m pytest
Verificar que todo funciona:

Frontend: http://localhost:3000

Backend: http://localhost:8000/docs

Tests pasan: ✅

Tu Primera Task
Recomendación: Empezar con W1-T1 (Crear CVContext)

Leer el prompt específico para W1-T1

Crear archivos siguiendo templates

Correr tests

Generar output JSON

Reportar resultados

📝 Changelog
2026-01-28 - v2.0
✅ Documento inicial creado

✅ Definidos 4 problemas críticos

✅ Roadmap de 4 semanas establecido

✅ Templates de código agregados

✅ Workflow para agents definido

Próximas Actualizaciones
 Agregar sección de troubleshooting expandida

 Incluir ejemplos de outputs JSON reales

 Documentar casos edge encontrados durante desarrollo

🎉 Conclusión
Este documento es la única fuente de verdad para AI agents trabajando en CV-ConVos.

Regla de Oro: Si hay conflicto entre este documento y el código, este documento tiene prioridad (el código está en proceso de refactoring).

Antes de empezar cualquier task:

Leer AGENTS.md (este archivo)

Leer el prompt específico de la task

Verificar "Situación Actual"

Implementar siguiendo templates

Verificar con comandos estándar

Generar output JSON

¡Buena suerte y happy coding!