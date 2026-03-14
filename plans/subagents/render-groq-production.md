# Subagente: Render Groq Production

## Misión

Dejar backend y frontend funcionando en producción con Groq como proveedor operativo real.

## Alcance

- Verificar variables en Render y frontend desplegado.
- Confirmar `NEXT_PUBLIC_API_URL`, `GROQ_API_KEY`, `ENVIRONMENT`, `CORS_ORIGINS`.
- Validar healthcheck y un request real a `/api/chat` o `/api/generate-cv`.
- Eliminar dependencia accidental de localhost.

## Archivos críticos

- `backend/app/core/config.py`
- `backend/app/main.py`
- `backend/Dockerfile`
- `frontend/next.config.ts`
- `frontend/src/lib/api/base.ts`
- `frontend/.env.example`
- `backend/.env.example`

## Riesgos a cerrar

- CORS incorrecto en prod.
- `NEXT_PUBLIC_API_URL` ausente o mal apuntado.
- despliegue con SQLite efítil si se espera continuidad de sesión.
- Groq rate limit sin mensaje usable.

## Criterio de aceptación

- `GET /health` responde desde el dominio desplegado.
- el frontend no intenta hablar con `127.0.0.1`.
- el backend responde usando Groq con una key válida.
- los errores de IA son explícitos y no se camuflan como éxito.
