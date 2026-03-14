# Subagente: Bloat And Prune

## Misión

Reducir ruido técnico para que mantener el proyecto deje de costar más de lo que aporta.

## Alcance

- Inventariar archivos muertos, parches rechazados y planes obsoletos.
- Separar documentación viva de experimentos.
- Detectar utilidades duplicadas, flags de debug y comandos ocultos.
- Proponer una estructura mínima de carpetas para código activo.

## Archivos críticos

- `plans/`
- `template_registry.patch`
- `backend/app/services/export_service.py.rej`
- `frontend/src/hooks/use-chat-stream.ts`
- `frontend/src/lib/api/chat.ts`
- `frontend/src/contexts/ChatContext.tsx`

## Riesgos a cerrar

- deuda invisible que revive bugs viejos.
- más de una fuente de verdad por feature.
- archivos que confunden al siguiente cambio.

## Criterio de aceptación

- se puede distinguir claramente código activo, experiments y docs.
- no quedan artefactos `.rej` o parches sueltos sin decisión.
- el flujo principal del producto se entiende sin leer cinco implementaciones.
