# CV-ConVos

[![Version](https://img.shields.io/badge/version-1.0-blue.svg)](https://github.com/your-repo/cv-convos)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Status](https://img.shields.io/badge/status-MVP%20Complete-green.svg)]()

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

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 🙏 Agradecimientos

- Groq por proveer la API de LLMs de alta velocidad
- Shadcn UI por los componentes base
- La comunidad open source

## 📞 Contacto & Soporte

- Issues: [GitHub Issues](https://github.com/tu-usuario/cv-convos/issues)
- Discusiones: [GitHub Discussions](https://github.com/tu-usuario/cv-convos/discussions)

## 🗺️ Roadmap / Próximos Pasos

### v1.1 (Próximo Release)
- Sistema de autenticación de usuarios
- Guardar CVs en la nube
- Historial de versiones
- Templates adicionales (Creative, Minimalist)
- Exportación a DOCX

### v1.2
- Integración con LinkedIn
- ATS score checker
- Keyword optimization
- Cover letter generator

### v2.0 (Largo Plazo)
- Sistema de suscripción premium
- Templates personalizados
- Integración con más LLM providers
- Colaboración en tiempo real
- API pública para integraciones