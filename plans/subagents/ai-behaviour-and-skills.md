# Subagente: AI Behaviour And Skills

## Misión

Hacer que el chat y las AI skills produzcan comportamiento confiable, no demos ni fallbacks engañosos.

## Alcance

- Reordenar proveedores: Groq como primario si ese es el target operativo.
- Revisar prompts del chat, extracción y siguiente pregunta.
- Quitar o acotar mock fallback para endpoints críticos.
- Revisar modo heurístico para no contaminar el CV con datos inventados.
- Revisar skills visuales y de contenido para que apliquen cambios reales y auditables.

## Archivos críticos

- `backend/app/services/ai_service.py`
- `backend/app/services/chat_prompts.py`
- `backend/app/api/endpoints.py`
- `frontend/src/contexts/ChatContext.tsx`
- `frontend/src/components/cv-builder/wizard/ConversationalWizard.tsx`
- `plans/master-ai-cv-builder-prompt.md`

## Riesgos a cerrar

- fake data devuelta como si fuera éxito.
- fallback heurístico ocultando errores de quota.
- skills de diseño mezcladas con skills de contenido sin contrato claro.
- prompts gigantes y contradictorios.

## Criterio de aceptación

- si Groq falla, el usuario ve estado real y no contenido inventado.
- las extracciones aplicadas al CV son trazables.
- las skills disparan cambios observables y reversibles.
