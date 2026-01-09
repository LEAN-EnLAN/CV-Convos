# Design System - Sentinel

## Overview

**Sentinel Design System** es el sistema de diseño unificado de CV-ConVos, construido sobre Tailwind CSS 4 y diseñado para proporcionar consistencia visual y accesibilidad.

## Design Principles

1. **Consistencia**: Tokens reutilizables para colores, tipografía, espaciado
2. **Accesibilidad**: Contraste WCAG 2.1 AA, keyboard navigation
3. **Responsividad**: Mobile-first, breakpoints flexibles
4. **Performance**: Zero runtime overhead, CSS-only theming
5. **Scalability**: Fácil de extender con nuevos componentes

## Color System

### Color Format: OKLCH

Usamos **OKLCH** para colores perceptualmente uniformes y mejor control de contraste.

### Light Theme

```css
:root {
  /* Primary Colors */
  --primary: oklch(0.55 0.18 155);        /* Sentinel Emerald */
  --primary-foreground: oklch(0.99 0 0);  /* White */

  /* Secondary Colors */
  --secondary: oklch(0.96 0.01 280);      /* Slate */
  --secondary-foreground: oklch(0.15 0.02 280);

  /* Accent Colors */
  --accent: oklch(0.70 0.12 175);         /* Teal */
  --accent-foreground: oklch(0.15 0.02 280);

  /* Background & Foreground */
  --background: oklch(0.98 0.005 90);     /* Off-white */
  --foreground: oklch(0.15 0.02 280);     /* Dark gray */

  /* Card & Popover */
  --card: oklch(1 0 0);                   /* Pure white */
  --card-foreground: oklch(0.15 0.02 280);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.15 0.02 280);

  /* Muted & Input */
  --muted: oklch(0.94 0.01 280);
  --muted-foreground: oklch(0.45 0.02 280);
  --input: oklch(0.92 0.01 280);
  --border: oklch(0.88 0.01 280);

  /* Destructive */
  --destructive: oklch(0.60 0.22 25);
  --destructive-foreground: oklch(0.99 0 0);

  /* Focus Ring */
  --ring: oklch(0.55 0.18 155);

  /* Chart Colors */
  --chart-1: oklch(0.55 0.18 155);
  --chart-2: oklch(0.70 0.12 175);
  --chart-3: oklch(0.94 0.01 280);
  --chart-4: oklch(0.60 0.16 45);
  --chart-5: oklch(0.45 0.14 280);

  /* Sidebar */
  --sidebar: oklch(0.98 0.005 90);
  --sidebar-foreground: oklch(0.15 0.02 280);
  --sidebar-primary: oklch(0.55 0.18 155);
  --sidebar-primary-foreground: oklch(0.99 0 0);
  --sidebar-accent: oklch(0.96 0.01 280);
  --sidebar-accent-foreground: oklch(0.15 0.02 280);
  --sidebar-border: oklch(0.88 0.01 280);
  --sidebar-ring: oklch(0.55 0.18 155);
}
```

### Dark Theme

```css
.dark {
  /* Primary Colors (Brighter in dark) */
  --primary: oklch(0.70 0.18 155);        /* Sentinel Emerald - Bright */
  --primary-foreground: oklch(0.11 0.01 280);

  /* Secondary Colors */
  --secondary: oklch(0.20 0.01 280);      /* Dark Slate */
  --secondary-foreground: oklch(0.92 0.01 90);

  /* Accent Colors (Vibrant in dark) */
  --accent: oklch(0.75 0.12 175);         /* Teal - Vibrant */
  --accent-foreground: oklch(0.11 0.01 280);

  /* Background & Foreground */
  --background: oklch(0.11 0.01 280);     /* Dark gray */
  --foreground: oklch(0.92 0.01 90);      /* Light gray */

  /* Card & Popover */
  --card: oklch(0.15 0.01 280);           /* Dark gray */
  --card-foreground: oklch(0.92 0.01 90);
  --popover: oklch(0.15 0.01 280);
  --popover-foreground: oklch(0.92 0.01 90);

  /* Muted & Input */
  --muted: oklch(0.18 0.01 280);
  --muted-foreground: oklch(0.55 0.01 90);
  --input: oklch(0.22 0.01 280);
  --border: oklch(0.25 0.01 280);

  /* Destructive */
  --destructive: oklch(0.65 0.22 25);
  --destructive-foreground: oklch(0.99 0 0);

  /* Focus Ring */
  --ring: oklch(0.70 0.18 155);

  /* Chart Colors */
  --chart-1: oklch(0.70 0.18 155);
  --chart-2: oklch(0.75 0.12 175);
  --chart-3: oklch(0.94 0.01 280);
  --chart-4: oklch(0.72 0.16 45);
  --chart-5: oklch(0.55 0.14 280);

  /* Sidebar */
  --sidebar: oklch(0.13 0.01 280);
  --sidebar-foreground: oklch(0.92 0.01 90);
  --sidebar-primary: oklch(0.70 0.18 155);
  --sidebar-primary-foreground: oklch(0.11 0.01 280);
  --sidebar-accent: oklch(0.20 0.01 280);
  --sidebar-accent-foreground: oklch(0.92 0.01 90);
  --sidebar-border: oklch(0.25 0.01 280);
  --sidebar-ring: oklch(0.70 0.18 155);
}
```

## Typography

### Font Families

Importadas en `globals.css`:

```css
/* Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=...');
```

| Fuente | Uso | Peso |
|--------|-----|------|
| Inter | Default UI | 400, 500, 600, 700, 800 |
| Roboto | Professional templates | 400, 500, 700 |
| Open Sans | Clean/modern templates | 400, 600, 700 |
| Lato | Minimal templates | 400, 700 |
| Montserrat | Bold headers | 400, 600, 700, 800 |
| Playfair Display | Creative/elegant | 400, 700, 900 |
| Raleway | Elegant headers | 400, 500, 700, 900 |
| Source Sans Pro | Technical/professional | 400, 600, 700 |
| Fira Code | Tech templates (mono) | 400, 500, 700 |
| Space Mono | Tech templates (mono) | 400, 700 |

### Type Scale

```css
--cv-font-size-base: 0.875rem;
--cv-font-size-name: 1.875rem;
```

**Tailwind scale**:
- `text-xs`: 0.75rem (12px)
- `text-sm`: 0.875rem (14px)
- `text-base`: 1rem (16px)
- `text-lg`: 1.125rem (18px)
- `text-xl`: 1.25rem (20px)
- `text-2xl`: 1.5rem (24px)
- `text-3xl`: 1.875rem (30px)
- `text-4xl`: 2.25rem (36px)

### Usage Examples

```tsx
// Headings
<h1 className="text-3xl font-bold tracking-tight">CV Builder</h1>

// Body text
<p className="text-base text-muted-foreground">Description</p>

// Small labels
<span className="text-xs text-muted-foreground">Label</span>
```

## Spacing System

### CV Spacing Variables

```css
:root {
  --cv-gap: 1.5rem;
  --cv-section-gap: 2rem;
}
```

### Density Levels

**Compact** (más contenido):
```css
.cv-density-compact {
  --cv-gap: 0.75rem;
  --cv-section-gap: 1.125rem;
  --cv-font-size-base: 0.75rem;
  --cv-font-size-name: 1.5rem;
}
```

**Standard** (balanceado - default):
```css
.cv-density-standard {
  --cv-gap: 1.5rem;
  --cv-section-gap: 2rem;
  --cv-font-size-base: 0.875rem;
  --cv-font-size-name: 1.875rem;
}
```

**Relaxed** (más whitespace):
```css
.cv-density-relaxed {
  --cv-gap: 2rem;
  --cv-section-gap: 3rem;
  --cv-font-size-base: 1rem;
  --cv-font-size-name: 2.25rem;
}
```

### Tailwind Spacing Scale

| Clase | Valor | Uso |
|-------|-------|-----|
| `p-0` | 0 | Sin padding |
| `p-1` | 0.25rem (4px) | Tight spacing |
| `p-2` | 0.5rem (8px) | Small spacing |
| `p-3` | 0.75rem (12px) | Compact spacing |
| `p-4` | 1rem (16px) | Default spacing |
| `p-6` | 1.5rem (24px) | Comfortable spacing |
| `p-8` | 2rem (32px) | Spacious spacing |
| `p-12` | 3rem (48px) | Section spacing |

## Border Radius

```css
:root {
  --radius: 0.75rem;
}
```

**Tailwind scale**:
```css
--radius-sm: calc(var(--radius) - 4px);   /* 0.5rem */
--radius-md: calc(var(--radius) - 2px);   /* 0.625rem */
--radius-lg: var(--radius);                /* 0.75rem */
--radius-xl: calc(var(--radius) + 4px);   /* 1rem */
--radius-2xl: calc(var(--radius) + 8px);  /* 1.25rem */
--radius-3xl: calc(var(--radius) + 12px);  /* 1.5rem */
--radius-4xl: calc(var(--radius) + 16px);  /* 1.75rem */
```

## Shadows

**Tailwind scale**:
- `shadow-sm`: Sutil
- `shadow`: Default
- `shadow-md`: Medio
- `shadow-lg`: Pronunciado
- `shadow-xl`: Muy pronunciado

## Animations

### Built-in Animations

```css
/* Float animation */
.animate-sentinel-float {
  animation: sentinel-float 4s ease-in-out infinite;
}

@keyframes sentinel-float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
}

/* Pulse animation */
.animate-sentinel-pulse {
  animation: sentinel-pulse 2s ease-in-out infinite;
}

@keyframes sentinel-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

/* Glow animation */
.animate-sentinel-glow {
  animation: sentinel-glow 3s ease-in-out infinite;
}

@keyframes sentinel-glow {
  0%, 100% {
    box-shadow: 0 0 20px oklch(0.55 0.18 155 / 0.2);
  }
  50% {
    box-shadow: 0 0 30px oklch(0.55 0.18 155 / 0.4);
  }
}
```

### Usage

```tsx
<div className="animate-sentinel-float">
  Floating element
</div>

<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.3 }}
>
  Fade in
</motion.div>
```

## Glassmorphism

```css
.glass {
  background: oklch(1 0 0 / 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid oklch(0.88 0.01 280 / 0.3);
}

.dark .glass {
  background: oklch(0.15 0.01 280 / 0.8);
  border: 1px solid oklch(0.25 0.01 280 / 0.4);
}
```

### Usage

```tsx
<div className="glass p-4 rounded-lg">
  Glass card
</div>
```

## Layout Patterns

### Container

```tsx
<div className="container mx-auto px-4">
  Centered content
</div>
```

### Grid System

```tsx
// Responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  Cards...
</div>

// Auto-fit grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
  Content...
</div>
```

### Flexbox

```tsx
// Horizontal alignment
<div className="flex items-center justify-between">
  <span>Left</span>
  <span>Right</span>
</div>

// Vertical centering
<div className="flex items-center justify-center h-screen">
  Centered content
</div>

// Space between
<div className="flex items-center justify-between gap-4">
  Items...
</div>
```

## Components Styling Guide

### Buttons

```tsx
// Primary button
<Button className="bg-primary text-primary-foreground hover:bg-primary/90">
  Action
</Button>

// Secondary button
<Button variant="secondary">
  Secondary
</Button>

// Destructive button
<Button variant="destructive">
  Delete
</Button>

// Outline button
<Button variant="outline">
  Cancel
</Button>

// Ghost button
<Button variant="ghost">
  Ghost
</Button>
```

### Cards

```tsx
<Card className="p-6">
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    Content...
  </CardContent>
</Card>
```

### Inputs

```tsx
<Input
  type="text"
  placeholder="Enter text..."
  className="border-input bg-background"
/>

<Label htmlFor="email">Email</Label>
<Input id="email" type="email" />
```

### Alerts

```tsx
<Alert variant="default">
  Info alert
</Alert>

<Alert variant="destructive">
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>Description</AlertDescription>
</Alert>
```

## Responsive Breakpoints

```css
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet */
lg: 1024px  /* Laptop */
xl: 1280px  /* Desktop */
2xl: 1536px /* Large desktop */
```

### Usage

```tsx
<div className="text-sm md:text-base lg:text-lg">
  Responsive text
</div>

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  Responsive grid
</div>
```

## Print Styles

### CV Print Layout

```css
@page {
  size: A4;
  margin: 0;
}

@media print {
  /* Hide non-print elements */
  .no-print {
    display: none !important;
  }

  /* Prevent page breaks inside sections */
  .break-inside-avoid {
    break-inside: avoid;
  }

  /* Single page CV */
  .cv-single-page {
    width: 210mm;
    height: 297mm;
    max-height: 297mm;
    overflow: hidden;
    page-break-after: avoid;
  }
}
```

### Usage

```tsx
<div className="no-print">
  Elements to hide in print
</div>

<div className="break-inside-avoid">
  Section that shouldn't break
</div>
```

## Accessibility Guidelines

### Color Contrast

- **Normal text**: 4.5:1 ratio (WCAG AA)
- **Large text**: 3:1 ratio (WCAG AA)
- **UI components**: 3:1 ratio (WCAG AA)

### Focus States

```tsx
// All interactive elements must have focus visible
<button className="focus:outline-none focus:ring-2 focus:ring-ring">
  Button
</button>
```

### Semantic HTML

```tsx
// Use semantic elements
<header>Header</header>
<nav>Navigation</nav>
<main>Main content</main>
<section>Section</section>
<aside>Sidebar</aside>
<footer>Footer</footer>
```

### ARIA Labels

```tsx
// For elements without text
<button aria-label="Close">
  <X />
</button>

// For landmarks
<nav aria-label="Main navigation">
  Navigation links...
</nav>
```

## Best Practices

1. **Use utility classes**: Prefiere `className` sobre estilos inline
2. **Responsive design**: Mobile-first approach
3. **Theme support**: Always test in both light and dark modes
4. **Accessibility**: Ensure keyboard navigation works
5. **Performance**: Minimize repaints and reflows
6. **Consistency**: Use design tokens instead of hardcoding values
7. **Testing**: Test on real devices

## Adding New Styles

1. **Check existing tokens**: Look for similar patterns
2. **Add to globals.css**: Use CSS variables for reusability
3. **Document in this file**: Keep design system updated
4. **Test both themes**: Verify light and dark mode
5. **Accessibility check**: Ensure contrast ratios meet standards
