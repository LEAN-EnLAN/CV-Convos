# System Audit 2026-03-14

## Objetivo

Recuperar estabilidad de producción, dejar Groq como proveedor usable en Render y ordenar el flujo de chat/skills sin seguir sumando deuda.

## Hallazgos críticos

1. `backend/app/core/config.py`
   `ENVIRONMENT` se eliminaba del entorno por una limpieza incorrecta y `.env` podía pisar variables reales de producción.

2. `backend/app/main.py`
   El CORS de producción ignoraba `CORS_ORIGINS` y quedaba hardcodeado a `https://cv-convos.vercel.app`.

3. `frontend/next.config.ts`
   El proxy de `/api` apuntaba siempre a `127.0.0.1:8000`, incluso si el frontend estaba desplegado.

4. `frontend/src/lib/api/export.ts`
   Export usaba otra convención de URL distinta al resto del frontend.

5. `backend/app/services/ai_service.py`
   Hay dos comportamientos peligrosos para producción:
   uso de Gemini como primario aunque el objetivo operativo sea Groq, y fallback mock/offline que puede fabricar contenido o degradar silenciosamente.

6. `frontend/src/contexts/ChatContext.tsx`
   El cliente de chat implementa su propio SSE, logs de debug en runtime y un comando `/demo` mezclado con la lógica productiva.

7. `frontend/src/hooks/use-chat-stream.ts` y `frontend/src/lib/api/chat.ts`
   Existe duplicación del cliente SSE. Hay tres niveles distintos de integración para el mismo flujo.

8. `backend/app/services/session_store.py`
   El default es SQLite local dentro del contenedor. En Render eso es efímero y no garantiza continuidad de sesión.

9. Artefactos muertos o sospechosos:
   `backend/app/services/export_service.py.rej`
   `template_registry.patch`
   archivos de `plans/` que son código suelto, no documentación operativa.

10. Validación actual incompleta
    No pude correr build/tests todavía porque el workspace no tiene dependencias instaladas:
    frontend sin `node_modules`
    backend sin `pytest`

## Cambios aplicados en esta pasada

1. Se corrigió la carga de entorno en backend para no pisar variables reales de producción.
2. Se dejó de borrar `ENVIRONMENT` por error.
3. Se normalizó CORS para respetar `CORS_ORIGINS`.
4. Se limitó el rewrite de Next.js a desarrollo local.
5. Se agregó `frontend/.env.example`.
6. Se unificó el cliente de export con `buildApiUrl`.

## Prioridad operativa

1. Render + Groq + variables reales + smoke test HTTP.
2. Contrato del chat streaming y persistencia de sesión.
3. Comportamiento de IA y skills sin fallbacks engañosos.
4. Sincronización de extracción con wizard/editor.
5. Poda de bloat y artefactos muertos.

## Subagentes sugeridos

Ver carpeta `plans/subagents/`.
