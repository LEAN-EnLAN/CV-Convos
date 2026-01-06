.PHONY: dev install test clean help

VENV = .venv
PYTHON = $(VENV)/bin/python3
PIP = $(VENV)/bin/pip

help:
	@echo "Comandos disponibles:"
	@echo "  make dev      - Inicia el servidor de desarrollo con auto-reload"
	@echo "  make install  - Crea el entorno virtual e instala dependencias"
	@echo "  make test     - Ejecuta los tests con pytest"
	@echo "  make clean    - Elimina archivos temporales y el entorno virtual"

dev:
	@if [ -d "$(VENV)" ]; then \
		echo "🚀 Iniciando backend en http://localhost:8000 ..."; \
		$(PYTHON) -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000; \
	else \
		echo "❌ Error: No se encontró el entorno virtual en $(VENV)."; \
		echo "Ejecuta 'make install' para configurarlo."; \
		exit 1; \
	fi

install:
	@echo "📦 Creando entorno virtual e instalando dependencias..."
	python3 -m venv $(VENV)
	$(PIP) install --upgrade pip
	$(PIP) install -r requirements.txt
	@echo "✅ Setup completado. Usa 'make dev' para iniciar."

test:
	@if [ -d "$(VENV)" ]; then \
		$(PYTHON) -m pytest --cov=app --cov-report=term-missing; \
	else \
		echo "❌ Error: No se encontró el entorno virtual."; \
		exit 1; \
	fi

lint:
	@if [ -d "$(VENV)" ]; then \
		$(PYTHON) -m ruff check .; \
	else \
		echo "❌ Error: No se encontró el entorno virtual."; \
		exit 1; \
	fi

clean:
	rm -rf $(VENV)
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete
