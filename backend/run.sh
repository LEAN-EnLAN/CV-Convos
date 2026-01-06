#!/bin/bash

# Detectar el entorno virtual
if [ -d ".venv" ]; then
    VENV_PATH=".venv"
elif [ -d "venv" ]; then
    VENV_PATH="venv"
else
    echo "❌ No se encontró un entorno virtual (.venv o venv)."
    echo "Usa 'make install' o crea uno manualmente."
    exit 1
fi

echo "🚀 Activando entorno virtual ($VENV_PATH) y lanzando backend..."
source $VENV_PATH/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
