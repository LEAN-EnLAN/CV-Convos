# Frontend - CV-ConVos

Interfaz de usuario construida con Next.js 15+, React 19 y TypeScript.

## 📋 Contenido

- [Arquitectura](#arquitectura)
- [Setup de Desarrollo](#setup-de-desarrollo)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Componentes Principales](#componentes-principales)
- [Sistema de Estilos](#sistema-de-estilos)
- [State Management](#state-management)
- [API Integration](#api-integration)
- [Testing](#testing)
- [Deploy](#deploy)

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

### Requisitos Previos
```bash
node --version  # >= 18.0.0
npm --version   # >= 9.0.0
```

### Instalación

```bash
# Clonar el repo (si no lo has hecho)
git clone https://github.com/tu-usuario/cv-convos.git
cd cv-convos/frontend

# Instalar dependencias
npm install

# Copiar variables de entorno (si es necesario)
cp .env.example .env.local
```

### Scripts Disponibles

```bash
npm run dev        # Inicia servidor de desarrollo (http://localhost:3000)
npm run build      # Build para producción
npm run start      # Inicia servidor de producción
npm run lint       # Ejecuta ESLint
```

## 📁 Estructura del Proyecto

```
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Layout raíz con providers
│   │   ├── page.tsx                # Página principal (entry point)
│   │   └── globals.css             # Estilos globales y Tailwind
│   ├── components/
│   │   ├── cv-builder/
│   │   │   ├── Builder.tsx         # Workspace principal del builder
│   │   │   ├── Editor.tsx          # Componente de edición
│   │   │   ├── FileUploader.tsx    # Upload de archivos
│   │   │   ├── CritiqueModal.tsx   # Modal de feedback IA
│   │   │   └── templates/
│   │   │       ├── ModernTemplate.tsx
│   │   │       └── ProfessionalTemplate.tsx
│   │   └── ui/                     # Componentes Shadcn UI
│   ├── hooks/
│   │   └── use-cv-history.ts       # Hook para historial de cambios
│   ├── lib/
│   │   └── utils.ts                # Utilidades (cn, etc.)
│   └── types/
│       └── cv.ts                   # Tipos TypeScript para CV
├── public/                         # Assets estáticos
├── components.json                  # Configuración Shadcn UI
├── tailwind.config.ts              # Configuración Tailwind
├── tsconfig.json                   # Configuración TypeScript
└── package.json
```

## 🧩 Componentes Principales

### Builder.tsx
Workspace principal que coordina:
- Editor de CV
- Preview en tiempo real
- Cambio de templates
- Exportación a PDF

**Props:**
```typescript
interface BuilderProps {
  initialData: CVData;
  onReset: () => void;
}
```

### Editor.tsx
Componente de edición con:
- Tabs para cada sección (Personal, Experience, Education, etc.)
- Formularios reactivos
- Validación en tiempo real
- CRUD operations

### FileUploader.tsx
Upload de archivos con:
- Drag & drop
- Soporte para PDF, DOCX, TXT
- Preview de archivos
- Integración con API backend

### Templates
- **ModernTemplate.tsx**: Diseño moderno con sidebar
- **ProfessionalTemplate.tsx**: Diseño clásico y profesional

## 🎨 Sistema de Estilos

### Tailwind CSS 4
Configuración en `tailwind.config.ts`:
```typescript
export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Colores personalizados del proyecto
      },
      fontFamily: {
        // Fuentes del proyecto
      }
    }
  }
}
```

### Shadcn UI
Componentes base instalados:
- Button, Input, Label, Card
- Dialog, Sheet, Tabs
- Accordion, Dropdown Menu
- Scroll Area, Progress, Badge
- Avatar, Tooltip, Separator

**Agregar nuevos componentes:**
```bash
npx shadcn@latest add [component-name]
```

### Estilos Globales
`globals.css` contiene:
- Reset de Tailwind
- Variables CSS personalizadas
- Estilos para print media queries (exportación PDF)
- Animaciones personalizadas

## 🔄 State Management

### React Hooks
- **useState**: Estado local de componentes
- **useEffect**: Side effects y API calls
- **useCallback**: Optimización de callbacks
- **useMemo**: Memoización de valores

### Custom Hooks
- **use-cv-history.ts**: Gestión del historial de cambios del CV

### Prop Drilling vs Context
Para este MVP, se usa prop drilling. Para features futuras, considerar:
- React Context para tema global
- Zustand o Jotai para state management complejo

## 🔌 API Integration

### Backend API
Base URL: `http://localhost:8000/api`

### Endpoints

#### Generar CV desde archivos
```typescript
const generateCV = async (files: File[]) => {
  const formData = new FormData();
  files.forEach(file => formData.append('files', file));
  
  const response = await fetch('http://localhost:8000/api/generate-cv', {
    method: 'POST',
    body: formData
  });
  
  return response.json();
};
```

#### Optimizar CV
```typescript
const optimizeCV = async (cvData: CVData, target: 'shrink' | 'improve') => {
  const response = await fetch('http://localhost:8000/api/optimize-cv', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cv_data: cvData, target })
  });
  
  return response.json();
};
```

#### Critique CV
```typescript
const critiqueCV = async (cvData: CVData) => {
  const response = await fetch('http://localhost:8000/api/critique-cv', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cv_data: cvData })
  });
  
  return response.json();
};
```

### Error Handling
```typescript
try {
  const data = await generateCV(files);
  toast.success('CV generado exitosamente');
} catch (error) {
  toast.error('Error al generar CV');
  console.error(error);
}
```

## 🧪 Testing

### Unit Tests (pendiente de implementación)
```bash
npm test
```

### E2E Tests (pendiente de implementar)
```bash
npm run test:e2e
```

## 🚀 Deploy

### Vercel (Recomendado)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel
```

**Variables de entorno en Vercel:**
- `NEXT_PUBLIC_API_URL`: URL del backend en producción

### Otros proveedores
- Netlify
- Railway
- Render

## 🔧 Troubleshooting

### Errores Comunes

**"Module not found"**
```bash
rm -rf node_modules package-lock.json
npm install
```

**"Port 3000 already in use"**
```bash
# En Linux/Mac
lsof -ti:3000 | xargs kill -9

# En Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**CORS errors**
Verifica que el backend tenga configurado el middleware CORS correctamente.

## 📚 Recursos Adicionales

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Shadcn UI Documentation](https://ui.shadcn.com)
- [Radix UI Documentation](https://www.radix-ui.com)

## 🤝 Contribuir al Frontend

Ver [CONTRIBUTING.md](../CONTRIBUTING.md) para guidelines generales.

### Guidelines Específicas del Frontend
1. **TypeScript**: Usar tipos estrictos, evitar `any`
2. **Components**: Mantener componentes pequeños y reutilizables
3. **Styling**: Usar Tailwind, evitar CSS inline
4. **Naming**: Usar PascalCase para componentes, camelCase para funciones
5. **Commits**: Usar conventional commits