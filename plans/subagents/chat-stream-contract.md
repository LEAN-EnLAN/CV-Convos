# Subagente: Chat Stream Contract

## Misión

Reducir el flujo de chat a un solo contrato SSE estable entre backend y frontend.

## Alcance

- Definir un único cliente SSE.
- Eliminar duplicación entre `ChatContext`, `use-chat-stream` y `lib/api/chat`.
- Tipar correctamente `provider`, `fallback_active`, `offline_mode`, `visual_update`.
- Asegurar sincronización de `phase`, `extraction` y cierre de stream.

## Archivos críticos

- `backend/app/api/schemas.py`
- `backend/app/api/endpoints.py`
- `backend/app/services/ai_service.py`
- `frontend/src/types/chat.ts`
- `frontend/src/contexts/ChatContext.tsx`
- `frontend/src/hooks/use-chat-stream.ts`
- `frontend/src/lib/api/chat.ts`

## Riesgos a cerrar

- mensajes parciales que no terminan de persistirse.
- eventos SSE no tipados.
- múltiples implementaciones con comportamientos distintos.
- errores de red tratados como éxito parcial.

## Criterio de aceptación

- existe una sola ruta recomendada para streaming.
- el frontend renderiza `delta`, `extraction`, `phase_change`, `complete`, `error` de forma consistente.
- la sesión queda persistida con el mismo resultado que vio el usuario.
