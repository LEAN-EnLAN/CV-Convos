# Frontend Architecture - CV-ConVos

## Overview

El frontend está construido sobre **Next.js 16** con **App Router**, **React 19**, y **TypeScript 5**. Implementa un sistema de diseño unificado llamado **Sentinel Design System** con soporte para temas claro/oscuro.

## Architecture Patterns

### 1. Component-Based Architecture

- **Atomic Design**: Componentes reutilizables organizados por nivel de abstracción
- **Composition Pattern**: Componentes compuestos para elementos complejos
- **Client-Server Split**: Separación clara entre Server y Client Components

### 2. State Management Strategy

**Estado Local**
- `useState`: Estado simple de componente
- `useReducer`: Estado complejo con múltiples valores relacionados

**Custom Hooks**
- `use-cv-history.ts`: Historial de cambios del CV (undo/redo)
- `use-auto-save.tsx`: Auto-save periódico con debounce

**Estado Global (Futuro)**
- Considerar Zustand o Jotai para estado complejo multi-componente

### 3. Data Flow

```
User Input → Component State → Local Updates → Debounce → Auto-save → Backend (Convex)
                ↓
            Preview Update
```

### 4. File Organization

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Layout raíz con providers
│   ├── page.tsx           # Homepage
│   ├── globals.css        # Estilos globales + Design Tokens
│   └── ats-checker/       # Feature: ATS Checker
├── components/
│   ├── cv-builder/        # Feature: CV Builder
│   │   ├── Builder.tsx    # Workspace principal
│   │   ├── Editor.tsx     # Editor de CV
│   │   ├── templates/     # Templates de CV
│   │   ├── wizard/        # Onboarding wizard
│   │   ├── header/        # Header del builder
│   │   └── onboarding/    # Onboarding flow
│   └── ui/                # Shadcn UI components
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities y helpers
├── types/                 # TypeScript types
└── __tests__/             # Test setup
```

## Technology Stack

### Core Framework
- **Next.js 16.1.1**: App Router, Server Components, Optimizations
- **React 19.2.3**: Latest React features, Server Components
- **TypeScript 5.x**: Type-safe development

### UI & Styling
- **Tailwind CSS 4**: Utility-first CSS, Design Tokens
- **Shadcn UI**: Componentes de UI accesibles y customizables
- **Radix UI**: Headless UI primitives
- **Lucide React**: Icon system
- **Framer Motion**: Animaciones
- **next-themes**: Theme switching (dark/light)

### Backend Integration
- **Convex 1.31.2**: Backend-as-a-Service (Database, Functions, Auth)
- **@convex-dev/auth**: Authentication

### Libraries
- **docx**: Export to DOCX
- **html-to-image**: Screenshot/PDF export
- **react-dropzone**: File upload con drag & drop
- **sonner**: Toast notifications
- **file-saver**: File downloads

## Design System - Sentinel

### Color System

**Light Theme Variables**
```css
--primary: oklch(0.55 0.18 155);      /* Emerald */
--secondary: oklch(0.96 0.01 280);    /* Slate */
--accent: oklch(0.70 0.12 175);       /* Teal */
--background: oklch(0.98 0.005 90);
--foreground: oklch(0.15 0.02 280);
```

**Dark Theme Variables**
```css
--primary: oklch(0.70 0.18 155);      /* Emerald (brighter) */
--secondary: oklch(0.20 0.01 280);    /* Dark Slate */
--accent: oklch(0.75 0.12 175);       /* Teal (vibrant) */
--background: oklch(0.11 0.01 280);
--foreground: oklch(0.92 0.01 90);
```

### Typography

**Font Families**
- **Sans**: Inter (Google Fonts)
- **Display**: Playfair Display (Creative templates)
- **Mono**: Fira Code / Space Mono (Tech templates)

### Spacing System

```css
--cv-gap: 1.5rem;
--cv-section-gap: 2rem;
--cv-font-size-base: 0.875rem;
--cv-font-size-name: 1.875rem;
```

### Density Levels

- `cv-density-compact`: Spacing reducido (más contenido)
- `cv-density-standard`: Balanceado (default)
- `cv-density-relaxed`: Spacing amplio (más whitespace)

### Glassmorphism

```css
.glass {
  background: oklch(1 0 0 / 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid oklch(0.88 0.01 280 / 0.3);
}
```

## Component Architecture

### Server Components (Default)

- **page.tsx**: Páginas que no necesitan interactividad
- **layout.tsx**: Layouts compartidos
- Beneficios: SEO, Performance, Smaller bundle

### Client Components

- Marcados con `'use client'` en la primera línea
- Para interactividad: forms, drag & drop, estados

### Component Patterns

**Compound Components**
```typescript
// Builder.tsx - Main container
<Builder>
  <Header />
  <Editor />
  <Preview />
</Builder>
```

**Render Props**
```typescript
// TemplateSelector.tsx
<TemplateSelector
  templates={templates}
  render={(template) => (
    <TemplateCard template={template} />
  )}
/>
```

**Higher-Order Components**
```typescript
// withProgress tracking
export function withProgress(Component) {
  return (props) => {
    const { progress } = useCVProgress();
    return <Component {...props} progress={progress} />;
  };
}
```

## Performance Optimizations

### Code Splitting
- **Route-based**: Automático con Next.js App Router
- **Component-based**: React.lazy() para componentes pesados

### Memoization
- `useMemo`: Valores computados costosos
- `useCallback`: Funciones pasadas a child components
- `React.memo`: Componentes que no cambian frecuentemente

### Image Optimization
- Next.js Image component
- WebP format con fallback

### Bundle Size
- Tree-shaking automático
- Dynamic imports para features no esenciales

## Security Considerations

### XSS Prevention
- React automatically escapes content
- Sanitizar HTML de APIs externas

### Data Validation
- TypeScript en runtime con Zod (futuro)
- Validación de inputs del usuario

### Authentication
- Convex Auth integration
- Protected routes (middleware)

## Accessibility (a11y)

### Keyboard Navigation
- Todos los elementos interactivos tienen focus states
- Soporte para Tab, Enter, Escape

### Screen Readers
- ARIA labels en elementos sin texto
- Descriptive alt text en imágenes

### Color Contrast
- Mínimo 4.5:1 para texto normal
- 3:1 para texto grande y UI components

## Testing Strategy

### Unit Tests (Vitest)
```bash
npm test              # Ejecutar tests
npm run test:coverage # Coverage report
```

### Component Tests
- Test de UI components
- Test de user interactions

### Integration Tests (Futuro)
- Playwright o Cypress
- E2E tests para workflows críticos

## Browser Support

- **Chrome**: Últimas 2 versiones
- **Firefox**: Últimas 2 versiones
- **Safari**: Últimas 2 versiones
- **Edge**: Últimas 2 versiones

## Build & Deployment

### Development
```bash
npm run dev    # http://localhost:3000
```

### Production Build
```bash
npm run build  # Optimized build
npm run start  # Production server
```

### Environment Variables
```env
NEXT_PUBLIC_CONVEX_URL=
NEXT_PUBLIC_API_URL=
```

## Future Improvements

1. **State Management**: Migrar a Zustand o Jotai
2. **Form Validation**: Implementar Zod + React Hook Form
3. **Analytics**: Integrate Mixpanel o Amplitude
4. **Error Boundary**: Add global error handling
5. **Internationalization**: i18n con next-intl
6. **PWA**: Progressive Web App capabilities
7. **Offline Support**: Service Workers
