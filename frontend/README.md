# Frontend - CV-ConVos

Interfaz de usuario construida con Next.js 16+, React 19 y TypeScript.

> **📚 Documentación completa**: Ver `docs/` para documentación detallada sobre arquitectura, stack tecnológico, sistema de diseño y más.

## 📋 Documentación

- **[Documentación completa](./docs/README.md)** - Índice de toda la documentación
- **[Guía de Desarrollador](./docs/DEVELOPER_GUIDE.md)** - Guía completa para nuevos desarrolladores
- **[Arquitectura](./docs/ARCHITECTURE.md)** - Patrones de arquitectura y estructura
- **[Stack Tecnológico](./docs/TECH_STACK.md)** - Tecnologías y dependencias
- **[Sistema de Diseño](./docs/DESIGN_SYSTEM.md)** - Sentinel Design System
- **[Componentes](./docs/COMPONENTS.md)** - Patrones de componentes
- **[Convenciones de Código](./docs/CODE_CONVENTIONS.md)** - Estándares y mejores prácticas

## 🚀 Contenido Rápido

## 🏗️ Arquitectura

### Stack Tecnológico
- **Framework**: Next.js 15+ (App Router)
- **UI Library**: React 19
- **Lenguaje**: TypeScript 5.x
- **Styling**: Tailwind CSS 4 + Shadcn UI
- **Icons**: Lucide React
- **Notifications**: Sonner
- **File Upload**: React-Dropzone

### Patrones de Diseño
- **Component-based**: Componentes reutilizables y modulares
- **Type-safe**: TypeScript strict mode
- **Server Components**: Next.js App Router
- **Client Components**: Para interactividad (editor, uploader)

## 🚀 Setup de Desarrollo

Para instrucciones detalladas, ver [Guía de Desarrollador](./docs/DEVELOPER_GUIDE.md).

### Requisitos Previos
```bash
node --version  # >= 18.0.0
npm --version   # >= 9.0.0
```

### Instalación

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev        # http://localhost:3000
npm run build      # Build para producción
npm run start      # Servidor de producción
npm run lint       # Ejecutar ESLint
npm test           # Ejecutar tests
```

## 📁 Estructura del Proyecto

Para detalles completos, ver [Arquitectura](./docs/ARCHITECTURE.md).

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx         # Layout raíz
│   │   ├── page.tsx           # Homepage
│   │   ├── globals.css        # Estilos globales
│   │   └── ats-checker/       # Feature: ATS Checker
│   ├── components/
│   │   ├── cv-builder/        # Feature: CV Builder
│   │   │   ├── Builder.tsx    # Workspace principal
│   │   │   ├── Editor.tsx     # Editor de CV
│   │   │   ├── templates/     # Templates de CV
│   │   │   ├── wizard/        # Onboarding
│   │   │   └── header/        # Header del builder
│   │   └── ui/                # Shadcn UI components
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utilities y helpers
│   └── types/                 # TypeScript types
├── docs/                      # Documentación completa
├── convex/                    # Convex backend
└── public/                    # Assets estáticos
```

## 🧩 Características Principales

### CV Builder
- Editor en tiempo real con preview
- 9+ templates profesionales
- Importación desde archivos (PDF, DOCX, TXT)
- Importación desde LinkedIn
- Exportación a PDF y DOCX
- Historial de cambios (undo/redo)
- Auto-save

### Templates Disponibles
- Professional
- Harvard
- Minimal
- Creative
- Tech
- Bian
- Finance
- Health
- Education

### Features Adicionales
- ATS Checker (Applicant Tracking System)
- AI-powered CV critique
- Template configurator (colores, fuentes, layout)
- LinkedIn integration

## 🎨 Sistema de Diseño

Ver [Sentinel Design System](./docs/DESIGN_SYSTEM.md) para detalles completos.

- **Colors**: OKLCH color space con light/dark themes
- **Typography**: Google Fonts (Inter, Playfair Display, etc.)
- **Components**: Shadcn UI + Radix UI primitives
- **Patterns**: Glassmorphism, animations, density system

## 🧪 Testing

```bash
npm test                  # Ejecutar tests
npm run test:coverage     # Coverage report
```

## 📚 Documentación Completa

Para documentación detallada, visitar `docs/`:

- **[Guía de Desarrollador](./docs/DEVELOPER_GUIDE.md)** - Guía completa para empezar
- **[Arquitectura](./docs/ARCHITECTURE.md)** - Patrones y estructura del proyecto
- **[Stack Tecnológico](./docs/TECH_STACK.md)** - Tecnologías y dependencias
- **[Sistema de Diseño](./docs/DESIGN_SYSTEM.md)** - Sentinel Design System
- **[Componentes](./docs/COMPONENTS.md)** - Patrones de componentes
- **[Convenciones de Código](./docs/CODE_CONVENTIONS.md)** - Estándares y mejores prácticas

## 🤝 Contribuir

Ver [CONTRIBUTING.md](../CONTRIBUTING.md) para guidelines generales.

## 📞 Recursos

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Shadcn UI](https://ui.shadcn.com)
- [Convex Documentation](https://docs.convex.dev)