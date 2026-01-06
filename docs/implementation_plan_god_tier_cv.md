# Plan Maestro: CV-ConVos "God-Tier" Edition

Este documento detalla la estrategia para transformar el editor de CV en una suite profesional de alto nivel, cubriendo tanto la deuda técnica (campos faltantes) como la expansión de características (nuevos templates ATS-Friendly).

## FASE 1: La Fundación de Datos (Fixing the Core)
**Objetivo:** Permitir que el usuario ingrese TODOS los datos necesarios para un CV de alto nivel. Sin esto, los templates estarán vacíos.

### 1.1 Expansion de Tipos (`types/cv.ts`)
Actualizar la interfaz `CVData` y sub-interfaces para incluir:
- [ ] **Socials:** LinkedIn, GitHub, Website (Portfolio).
- [ ] **Availability:** Campo de texto libre o Enum (Full-time, Part-time, etc).
- [ ] **Languages:** Nuevo array `{ language: string, proficiency: string }`.
- [ ] **Certifications:** Nuevo array `{ name: string, issuer: string, date: string, url?: string }`.
- [ ] **Interests:** (Opcional pero recomendado para "culture fit") Array de strings.

### 1.2 Actualización del Editor (`Editor.tsx`)
Rediseñar el panel de acordeón para acomodar los nuevos campos sin saturar la UI.
- [ ] **Sección Info Personal:** Agregar inputs para Socials y Disponibilidad.
- [ ] **Nueva Sección:** "Idiomas" (Lista dinámica con botón "Agregar").
- [ ] **Nueva Sección:** "Certificaciones & Cursos" (Lista dinámica).
- [ ] **UX Check:** Asegurar que el botón de "Optimizar con IA" funcione con estos nuevos campos en el futuro.

---

## FASE 2: La Suite de Templates (The Templates)
**Objetivo:** Crear templates visualmente distintos pero técnicamente robustos para ATS.

### 2.1 🏛️ Template "Ivy League" (Harvard Style)
El estándar de oro para corporaciones tradicionales.
- **Tipografía:** Merriweather (Google Fonts) o Times New Roman nativa.
- **Layout:** Una sola columna. Flujo vertical estricto.
- **Estilo:**
    - Nombres de sección en MAYÚSCULAS y con borde inferior.
    - Fechas absolutamente alineadas a la derecha.
    - Bullet points compactos.
    - Sin foto, sin íconos, sin colores (solo B&W).
- **Tech:** Uso intensivo de `flex-row justify-between` para líneas de título/fecha.

### 2.2 🎨 Template "Swiss Studio" (Design Focus)
Para roles creativos que necesitan demostrar gusto visual.
- **Tipografía:** Inter (Tight tracking) o Space Grotesk para títulos.
- **Layout:** Asimétrico (Grid 30% / 70%).
    - Izquierda: Contacto, Skills, Idiomas, Premios.
    - Derecha: Experiencia, Proyectos, Perfil.
- **Estilo:**
    - Minimalismo extremo. Espacio en blanco activo.
    - Uso de colores de acento sutiles (no gradientes locos, bloques sólidos).
- **Seguridad ATS:** Asegurar que en el DOM, la columna principal (Experiencia) aparezca primero o sea fácilmente legible secuencialmente.

### 2.3 Refactorización de Templates Existentes
- Actualizar `ModernTemplate` y `ProfessionalTemplate` para renderizar los nuevos campos (Idiomas, Certificaciones) si existen.

---

## FASE 3: El "Selector de Identidad"
**Objetivo:** Una UI para elegir templates que venda el valor de cada uno.

- [ ] Reemplazar el `Select` simple del Builder por una **Galería de Thumbnails**.
- [ ] Cada tarjeta de template debe decir:
    - Nombre (ej: "Ivy League")
    - "Best for..." (ej: "Finanzas y Derecho")
    - Tags (ej: "ATS-Optimized", "Serif", "Compact").

---

## FASE 4: Futuro "AI JSON Builder" (Nota Estratégica)
Para la siguiente etapa, prepararemos el backend para que simplemente reciba un JSON de estructura y una "prompt de estilo" y la IA pueda no solo llenar el contenido, sino sugerir el template ideal basándose en el contenido (ej: "Detecto que eres Abogado, aplicando el tema Harvard por defecto").
