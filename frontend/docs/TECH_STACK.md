# Tech Stack - CV-ConVos Frontend

## Core Framework

### Next.js 16.1.1

**Versión**: 16.1.1
**Configuración**: App Router (React Server Components)

**Features utilizados**:
- **App Router**: Sistema de rutas moderno basado en filesystem
- **Server Components**: Renderizado en servidor por defecto
- **Client Components**: Para interactividad con `'use client'`
- **Server Actions**: Mutaciones de datos
- **Optimized Images**: Componente `<Image />`
- **Streaming**: Progressive rendering para UX

**Ejemplo de estructura**:
```
src/app/
├── layout.tsx          # Root layout
├── page.tsx            # Home page (/)
└── ats-checker/
    └── page.tsx        # ATS Checker page (/ats-checker)
```

### React 19.2.3

**Features clave**:
- **Server Components**: Renderizado en servidor
- **Suspense**: Async components + streaming
- **Hooks**: useState, useEffect, useCallback, useMemo, useContext
- **Strict Mode**: Detección de side-effects

### TypeScript 5.x

**Configuración**: Strict mode habilitado

**tsconfig.json**:
```json
{
  "compilerOptions": {
    "target": "ES2017",
    "strict": true,
    "jsx": "react-jsx",
    "moduleResolution": "bundler",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

## UI & Styling

### Tailwind CSS 4

**Versión**: 4.x

**Features**:
- Utility-first CSS framework
- Design tokens con CSS custom properties
- Responsive design con breakpoints
- Dark mode support con `dark:` prefix
- Arbitrary values con `[...]`

**Configuración**:
- `@import "tailwindcss"` en `globals.css`
- Custom properties para theming
- CSS variables en `:root` y `.dark`

**Ejemplos**:
```tsx
// Clases básicas
<div className="p-4 bg-primary text-primary-foreground">

// Responsivo
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">

// Dark mode
<div className="bg-white dark:bg-card">

// Arbitrary values
<div className="w-[350px] h-[500px]">
```

### Shadcn UI

**Configuración**: New York style, Neutral base color, CSS variables enabled

**Componentes instalados**:

| Componente | Descripción | Import |
|------------|-------------|---------|
| Button | Botones con variantes | `@/components/ui/button` |
| Input | Inputs de texto | `@/components/ui/input` |
| Label | Labels para formularios | `@/components/ui/label` |
| Textarea | Textarea multilinea | `@/components/ui/textarea` |
| Card | Cards contenedoras | `@/components/ui/card` |
| Dialog | Modals | `@/components/ui/dialog` |
| Sheet | Sliders/drawers | `@/components/ui/sheet` |
| Tabs | Tab navigation | `@/components/ui/tabs` |
| Accordion | Accordion expandable | `@/components/ui/accordion` |
| Dropdown Menu | Menús desplegables | `@/components/ui/dropdown-menu` |
| Select | Select dropdown | `@/components/ui/select` |
| Switch | Toggle switch | `@/components/ui/switch` |
| Slider | Range slider | `@/components/ui/slider` |
| Progress | Progress bar | `@/components/ui/progress` |
| Badge | Badges/tags | `@/components/ui/badge` |
| Avatar | Avatar circles | `@/components/ui/avatar` |
| Tooltip | Tooltips | `@/components/ui/tooltip` |
| Scroll Area | Custom scroll | `@/components/ui/scroll-area` |
| Separator | Dividers | `@/components/ui/separator` |
| Alert | Alert boxes | `@/components/ui/alert` |
| Sonner | Toast notifications | `sonner` |

**Agregar nuevos componentes**:
```bash
npx shadcn@latest add [component-name]
```

### Radix UI

**Versión**: Latest

**Componentes como primitivas**:
- Accesibilidad out-of-the-box
- Keyboard navigation
- ARIA attributes automáticos
- Customizable con Tailwind

**Componentes utilizados**:
- `@radix-ui/react-accordion`
- `@radix-ui/react-avatar`
- `@radix-ui/react-dialog`
- `@radix-ui/react-dropdown-menu`
- `@radix-ui/react-label`
- `@radix-ui/react-progress`
- `@radix-ui/react-scroll-area`
- `@radix-ui/react-select`
- `@radix-ui/react-separator`
- `@radix-ui/react-slider`
- `@radix-ui/react-slot`
- `@radix-ui/react-switch`
- `@radix-ui/react-tabs`
- `@radix-ui/react-tooltip`

### Lucide React

**Versión**: 0.562.0

**Uso**:
```tsx
import { Eye, CheckCircle2, Download, Trash2 } from 'lucide-react';

<Eye />
<CheckCircle2 className="w-5 h-5 text-green-500" />
```

### Framer Motion

**Versión**: 12.23.26

**Ejemplos**:
```tsx
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  Content
</motion.div>
```

### next-themes

**Versión**: 0.4.6

**Uso**:
```tsx
import { useTheme } from 'next-themes';

const { theme, setTheme } = useTheme();

<button onClick={() => setTheme('dark')}>
  Toggle Theme
</button>
```

## Backend Integration

### Convex 1.31.2

**Backend-as-a-Service**:
- Database (real-time)
- Server functions (API endpoints)
- Authentication
- File storage

**Convex files**:
```
convex/
├── schema.ts          # Database schema
├── auth.ts            # Auth configuration
├── users.ts           # User operations
├── cvOperations.ts    # CV operations
└── http.ts            # HTTP endpoints
```

**Ejemplo de uso**:
```tsx
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

// Query
const cv = useQuery(api.cvOperations.getCV, { id });

// Mutation
const updateCV = useMutation(api.cvOperations.updateCV);

await updateCV({ id, data: newData });
```

### @convex-dev/auth 0.0.90

**Authentication**:
- Email/password
- OAuth providers (configurables)
- Session management

## File Handling

### react-dropzone 14.3.8

**File upload con drag & drop**:
```tsx
import { useDropzone } from 'react-dropzone';

const { getRootProps, getInputProps } = useDropzone({
  accept: { 'application/pdf': ['.pdf'], 'text/plain': ['.txt'] },
  onDrop: handleDrop
});

<div {...getRootProps()}>
  <input {...getInputProps()} />
  Drop files here
</div>
```

### docx 9.5.1

**Export to DOCX**:
```ts
import { Document, Packer, Paragraph } from 'docx';

const doc = new Document({
  sections: [{ properties: {}, children: [new Paragraph("Hello")] }]
});

const blob = await Packer.toBlob(doc);
```

### html-to-image 1.11.13

**Screenshot/PDF export**:
```tsx
import { toPng } from 'html-to-image';

const dataUrl = await toPng(ref.current, {
  quality: 1,
  pixelRatio: 2
});
```

### file-saver 2.0.5

**File downloads**:
```tsx
import { saveAs } from 'file-saver';

saveAs(blob, 'cv.docx');
```

## Notifications

### sonner 2.0.7

**Toast notifications**:
```tsx
import { toast } from 'sonner';

// Success
toast.success('CV guardado exitosamente');

// Error
toast.error('Error al guardar CV');

// Loading
toast.promise(savePromise, {
  loading: 'Guardando...',
  success: 'Guardado!',
  error: 'Error al guardar'
});
```

## Utilities

### class-variance-authority (cva) 0.7.1

**Variant classes**:
```tsx
import { cva } from 'class-variance-authority';

const buttonVariants = cva(
  'base-classes',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground',
        secondary: 'bg-secondary text-secondary-foreground'
      }
    }
  }
);
```

### clsx 2.1.1

**Conditional classes**:
```tsx
import { clsx } from 'clsx';

const className = clsx(
  'base-class',
  isActive && 'active-class',
  condition && 'conditional-class'
);
```

### tailwind-merge 3.4.0

**Merge Tailwind classes**:
```tsx
import { twMerge } from 'tailwind-merge';
import { clsx } from 'clsx';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Uso
<div className={cn('p-4', isActive && 'bg-blue-500', className)}>
```

## Testing

### Vitest 4.0.16

**Test framework**:
```tsx
import { describe, it, expect } from 'vitest';

describe('useCVHistory', () => {
  it('should save history', () => {
    expect(result).toBe(expected);
  });
});
```

### @testing-library/react 16.3.1

**Component testing**:
```tsx
import { render, screen } from '@testing-library/react';

render(<Component />);
expect(screen.getByText('Hello')).toBeInTheDocument();
```

### @testing-library/jest-dom 6.9.1

**Custom matchers**:
```tsx
import '@testing-library/jest-dom';

expect(element).toHaveClass('active');
expect(button).toBeDisabled();
```

### jsdom 27.4.0

**DOM simulation**:
```ts
// vitest.config.ts
import jsdom from 'jsdom';
```

### @vitest/coverage-v8 4.0.16

**Coverage reporting**:
```bash
npm run test:coverage
```

## Linting

### ESLint 9

**Configuración**: ESLint Next.js preset

**Ejecutar**:
```bash
npm run lint
```

## Dependencies Summary

### Production
| Package | Versión | Uso |
|---------|---------|-----|
| next | 16.1.1 | Framework |
| react | 19.2.3 | UI library |
| react-dom | 19.2.3 | React DOM |
| typescript | 5.x | Type safety |
| tailwindcss | 4.x | Styling |
| convex | 1.31.2 | Backend |
| lucide-react | 0.562.0 | Icons |
| framer-motion | 12.23.26 | Animations |
| sonner | 2.0.7 | Toasts |
| react-dropzone | 14.3.8 | File upload |
| docx | 9.5.1 | DOCX export |
| html-to-image | 1.11.13 | Screenshots |
| file-saver | 2.0.5 | File downloads |

### Development
| Package | Versión | Uso |
|---------|---------|-----|
| eslint | 9 | Linting |
| vitest | 4.0.16 | Testing |
| @testing-library/react | 16.3.1 | Component tests |
| @types/* | various | TypeScript types |

## Adding Dependencies

### Production dependency
```bash
npm install package-name
```

### Development dependency
```bash
npm install --save-dev package-name
```

### TypeScript types
```bash
npm install --save-dev @types/package-name
```

## Best Practices

1. **Version pinning**: Mantener versiones específicas en package.json
2. **Security audits**: `npm audit` regularmente
3. **Dependencies**: Minimizar bundle size con dependencias tree-shakeable
4. **Types**: Preferir librerías con TypeScript types nativos
5. **Peer dependencies**: Verificar compatibilidad con React 19
