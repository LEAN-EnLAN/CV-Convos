# Guía para Contribuir a CV-ConVos

¡Bienvenido! Estamos encantados de que quieras contribuir a CV-ConVos. Este proyecto es de código abierto y valoramos cada contribución, ya sea grande o pequeña. Esta guía te ayudará a empezar y a asegurarte de que tu contribución sea efectiva y bien recibida.

## Reportar Errores (Bugs)

Si encuentras un error en el proyecto, por favor, repórtalo de manera clara y detallada. Esto nos ayuda a mejorar el software rápidamente.

1. **Verifica si ya existe**: Busca en los [issues](https://github.com/tu-usuario/cv-convos/issues) si alguien ya ha reportado el mismo problema.
2. **Crea un nuevo issue**: Si no existe, abre un nuevo issue con el título descriptivo, como "Error al subir archivo PDF en el editor".
3. **Proporciona detalles**:
   - Pasos para reproducir el error.
   - Comportamiento esperado vs. actual.
   - Información del entorno (navegador, versión de Node.js, etc.).
   - Capturas de pantalla o logs si es posible.

¡Gracias por ayudar a mantener CV-ConVos robusto!

## Sugerir Nuevas Funcionalidades

Tus ideas son valiosas. Si tienes una sugerencia para una nueva funcionalidad, compártela con nosotros.

1. **Revisa las ideas existentes**: Mira los issues etiquetados como "enhancement" o "feature request".
2. **Abre un nuevo issue**: Describe tu idea con claridad:
   - ¿Qué problema resuelve?
   - ¿Cómo funcionaría?
   - ¿Por qué sería útil para los usuarios?
3. **Discute y refina**: Estaremos encantados de discutir tu propuesta y ayudarte a desarrollarla.

¡Tu creatividad impulsa el proyecto adelante!

## Proceso de Pull Requests (PR)

Las contribuciones se hacen a través de pull requests. Sigue estos pasos para un proceso fluido:

1. **Haz un fork del repositorio**: Crea tu propia copia del proyecto.
2. **Crea una rama**: Usa una rama separada para tu contribución. Nombra la rama de manera descriptiva:
   - `feature/nueva-funcionalidad` para nuevas características.
   - `bugfix/correccion-error` para correcciones de errores.
   - `docs/mejora-documentacion` para actualizaciones de documentación.
   - `refactor/optimizacion-codigo` para refactorizaciones.
3. **Haz tus cambios**: Asegúrate de seguir las guías de estilo de código.
4. **Prueba tus cambios**: Ejecuta las pruebas y verifica que todo funcione.
5. **Envía un PR**: Describe claramente qué has hecho, por qué y cómo probarlo. Incluye referencias a issues si aplica.
6. **Revisa y discute**: Responderemos pronto con feedback. Haz los ajustes necesarios.

¡Cada PR es un paso hacia un mejor CV-ConVos!

## Estilo de Código

Mantener un código consistente facilita la colaboración. Sigue estas guías:

### Frontend (Next.js, React)
- Usa **Prettier** para formatear el código automáticamente.
- Sigue las reglas de **ESLint** para mantener la calidad del código.
- Ejecuta `npm run lint` y `npm run format` antes de enviar tu PR.

### Backend (Python, FastAPI)
- Usa **Black** para formatear el código Python.
- Sigue las guías de **Flake8** para linting.
- Ejecuta `black .` y `flake8` en el directorio backend antes de enviar tu PR.

Si tienes dudas sobre el estilo, ¡pregunta en el PR!

## Código de Conducta

Por favor, mantén un ambiente respetuoso y colaborativo. Todas las contribuciones deben adherirse al [Código de Conducta](CODE_OF_CONDUCT.md) (si existe).

¡Gracias por contribuir a CV-ConVos! Tu esfuerzo hace la diferencia.