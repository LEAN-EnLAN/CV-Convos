# 🚀 Kickstart & Testing Guide

Este documento detalla cómo iniciar el proyecto completo y cómo probar todas sus funciones de manera automatizada para agentes y desarrolladores.

## 🛠️ Estructura del Proyecto

- `frontend/`: Aplicación Next.js + Shadcn UI.
- `backend/`: API FastAPI + Groq AI.
- `scripts/tests/`: Scripts de prueba independientes para validar la lógica.

---

## 🏃 Kickstart (Run Everything)

El comando definitivo para iniciar **todo** con un solo comando:

```bash
./start.sh
```

*(Nota: Asegúrate de haber hecho `make install` en backend y `npm install` en frontend antes)*

---

### Iniciar por separado (si prefieres logs divididos)

---

## 🧪 Testing Automático (Builder & Funciones)

Hemos diseñado un sistema simple para que cualquier agente pueda testear si lo que acaba de escribir funciona.

### 🔌 Testear la API (Independiente del Front)
Valida que la inteligencia artificial esté respondiendo correctamente y que los endpoints estén vivos.

**Requiere:** Estar en la raíz del proyecto y tener el backend corriendo.

```bash
# Instalar requests si no lo tienes
pip install requests

# Ejecutar el test
python3 scripts/tests/test_api.py
```

### 🖥️ Testear el Frontend
Verifica que la aplicación de Next.js esté arriba y sirviendo los archivos correctamente.

```bash
python3 scripts/tests/test_frontend.py
```

### 🧠 Qué probar en cada sección:

1.  **AI Optimization:** Si agregas una nueva regla de optimización, actualiza `test_api.py` y ejecútalo.
2.  **CV Critique:** Valida que el JSON devuelto por `/critique-cv` tenga los campos `suggested_text` y `target_field`.
3.  **PDF Export:** Abre el navegador en `http://localhost:3000` y sube un CV de prueba.

---

## 🤖 Protocolo para Agentes

Cuando pidas una nueva funcionalidad (ej: "Agrega soporte para exportar a LinkedIn"), el flujo debería ser:

1.  **Backend:** Crear o modificar el endpoint en `backend/app/api/endpoints.py`.
2.  **Test:** Agregar el caso de prueba en `scripts/tests/test_api.py`.
3.  **Verificación:** Ejecutar `python3 scripts/tests/test_api.py` y confirmar el paso.
4.  **Frontend:** Integrar la nueva función en el componente correspondiente.

---

## 📋 Lista de Comandos Rápidos

| Acción | Comando |
| :--- | :--- |
| Levantar Backend | `cd backend && make dev` |
| Levantar Frontend | `cd frontend && npm run dev` |
| Correr Tests API | `python3 scripts/tests/test_api.py` |
| Correr Tests Builder | `python3 scripts/tests/test_builder.py` |
| Correr Tests Frontend | `python3 scripts/tests/test_frontend.py` |
| Resetear Venv | `cd backend && make clean && make install` |
