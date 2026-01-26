# AGENTS.md - CV-ConVos Development Guide

## Commands

### Frontend (frontend/)
- Run single test: `cd frontend && npm test run src/components/cv-builder/__tests__/FileUploader.test.tsx`
- Run tests: `npm test` | Coverage: `npm run test:coverage`
- Lint: `npm run lint` | Build: `npm run build`

### Backend (backend/)
- Run single test: `cd backend && python -m pytest tests/unit/test_ai_service.py::test_parse_cv`
- Run tests: `python -m pytest` | Coverage: `pytest --cov=app --cov-report=term-missing`
- Lint: `ruff check .` | Format: `ruff format .`

## Style Guidelines
- Imports: grouped stdlib → third-party → local (relative imports preferred)
- Naming: snake_case (Python), camelCase (TypeScript); components PascalCase
- Types: explicit TypeScript types, Pydantic models for API schemas
- Error handling: custom exceptions in `core/exceptions.py`, Result/Error patterns
- Formatting: Prettier (frontend), Black-compatible via ruff (backend)
- Comments/docs in Spanish; code/variables in English
