# Subagente: Schema Sync And Editor

## Misión

Garantizar que la extracción, el wizard y el editor manual compartan el mismo schema operativo.

## Alcance

- Revisar IDs, `order`, defaults y arrays mutables.
- Eliminar merges ambiguos entre chat, wizard y editor.
- Confirmar que `applyExtraction` no duplique ni sobrescriba secciones incorrectamente.
- Alinear tipos frontend/backend para `CVData`, `DataExtraction` y mejoras.

## Archivos críticos

- `backend/app/api/schemas.py`
- `frontend/src/types/cv.ts`
- `frontend/src/types/chat.ts`
- `frontend/src/contexts/ChatContext.tsx`
- `frontend/src/components/cv-builder/wizard/ConversationalWizard.tsx`
- `frontend/src/components/cv-builder/Editor.tsx`
- `frontend/src/components/cv-builder/Builder.tsx`

## Riesgos a cerrar

- IDs aleatorios inestables.
- merges profundos que mezclan datos viejos con nuevos.
- `canFinalize` sin validación real.
- estructura distinta entre preview, editor y export.

## Criterio de aceptación

- el mismo `CVData` sirve para chat, preview, editor y export.
- las extracciones no duplican entradas.
- la finalización depende de completitud real, no de `true`.
