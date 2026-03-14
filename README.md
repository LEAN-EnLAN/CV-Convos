# CV-ConVos 🚀
### El constructor de CVs inteligente con IA

Este proyecto es una aplicación web full-stack que permite generar, optimizar y analizar currículums de forma inteligente mediante el uso de inteligencia artificial (Groq/Llama 3).

## 🛠️ Estructura del Proyecto

El repositorio se divide en dos partes principales:
- `/frontend`: Aplicación Next.js (React) enfocada en la construcción y exportación de CVs.
- `/backend`: API de Python (FastAPI) para el procesamiento de documentos e IA.

## 🚀 Inicio Rápido (Local)

### 1. Clonar el repositorio
```bash
git clone https://github.com/LEAN-EnLAN/CV-Convos.git
cd cv-convos
```

### 2. Configurar el Backend (Python)
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # En Windows: .venv\Scripts\activate
pip install -r requirements.txt
```
- Crea un archivo `.env` en `/backend` con:
  ```env
  GROQ_API_KEY=tu_api_key_de_groq
  CORS_ORIGINS=http://localhost:3000
  ```
- Ejecuta: `make dev` o `uvicorn app.main:app --reload`

### 3. Configurar el Frontend (Next.js)
```bash
cd ../frontend
npm install
```
- Ejecuta: `npm run dev`

---

## ☁️ Guía de Despliegue (Production)

### Backend (Render / Railway)
- **Root Directory:** `backend`
- **Plan:** Docker (Dockerfile incluido)
- **Variables:** `ENVIRONMENT=production`, `GROQ_API_KEY`, `CORS_ORIGINS` (URL exacta del frontend)
- **Health Check:** `/health`
- **Blueprint opcional:** `render.yaml` en la raíz del repo

### Frontend (Vercel)
- **Root Directory:** `frontend`
- **Framework:** Next.js
- **Variables:** `NEXT_PUBLIC_API_URL` (URL del Backend desplegado)

### Checklist mínimo de producción

1. Backend en Render con `ENVIRONMENT=production`.
2. `CORS_ORIGINS` debe apuntar al dominio real del frontend, por ejemplo `https://tu-frontend.vercel.app`.
3. Frontend con `NEXT_PUBLIC_API_URL=https://tu-backend.onrender.com`.
4. Verificar `GET /health` y luego un POST real a `/api/chat` o `/api/generate-cv`.

## 🧪 Tests y Calidad
- **Backend:** `cd backend && make test`
- **Frontend:** `cd frontend && npm run test`
