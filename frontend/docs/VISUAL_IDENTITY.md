# CV-ConVos Visual Identity System

## Design Philosophy: Quiet Workspace

CV-ConVos is a professional document tool for creating CVs. The interface should feel like a calm, trustworthy workspace where the user can focus entirely on their content. The UI should disappear—becoming invisible infrastructure that supports without demanding attention.

### Core Principles

1. **One Dominant Surface Per Screen**: Each view has a single primary content area. No competing panels, floating elements, or overlapping modals that fragment attention.

2. **Conservative Hierarchy**: Strong typographic hierarchy with minimal visual decoration. Structure is communicated through type, not borders, shadows, or colors.

3. **Sparse, Intentional Accents**: Color is used sparingly and purposefully. The interface is predominantly neutral with carefully placed accents for critical actions only.

4. **No Gimmicks**: No excessive animations, gradients, glassmorphism, or decorative elements. Every visual choice serves a functional purpose.

5. **Mobile-First, Single-Mode**: The interface works as a focused, single-column experience. Editor and preview are fully decoupled—never shown simultaneously on mobile.

---

## Typography System

### Font Families

| Role | Font | Rationale |
|------|------|-----------|
| **Display/Headings** | **Source Serif 4** | A modern serif with excellent readability. Conveys professionalism and trust without being stuffy. Distinctive but not distracting. |
| **Body/UI** | **Source Sans 3** | Clean, highly legible sans-serif. Pairs beautifully with Source Serif 4. Optimized for screen reading at all sizes. |
| **Monospace** | **JetBrains Mono** | Technical, precise. Used for code snippets, data fields, and any technical content. |

**Why these fonts?**
- Source Serif 4 and Source Sans 3 are Adobe's open-source superfamily, designed to work together
- Both are highly optimized for screen readability
- They convey professionalism without being generic (unlike Inter, Roboto)
- The serif/sans pairing creates natural hierarchy without needing extra styling

### Type Scale

| Token | Size | Line Height | Weight | Usage |
|-------|------|-------------|--------|-------|
| `text-display` | 2.5rem (40px) | 1.1 | 600 | Page titles, hero headlines |
| `text-h1` | 2rem (32px) | 1.2 | 600 | Section headers |
| `text-h2` | 1.5rem (24px) | 1.3 | 600 | Subsection headers |
| `text-h3` | 1.25rem (20px) | 1.4 | 600 | Card titles, form sections |
| `text-h4` | 1.125rem (18px) | 1.4 | 600 | Subheadings |
| `text-body` | 1rem (16px) | 1.6 | 400 | Body text, paragraphs |
| `text-body-sm` | 0.875rem (14px) | 1.5 | 400 | Secondary text, descriptions |
| `text-caption` | 0.75rem (12px) | 1.4 | 500 | Labels, metadata, timestamps |
| `text-ui` | 0.875rem (14px) | 1 | 500 | Buttons, navigation, tabs |

### Typography Patterns

```css
/* Display headings - use sparingly */
.text-display {
  font-family: 'Source Serif 4', serif;
  font-size: 2.5rem;
  line-height: 1.1;
  font-weight: 600;
  letter-spacing: -0.02em;
}

/* Section headings */
.text-h1 {
  font-family: 'Source Serif 4', serif;
  font-size: 2rem;
  line-height: 1.2;
  font-weight: 600;
}

/* Body text */
.text-body {
  font-family: 'Source Sans 3', sans-serif;
  font-size: 1rem;
  line-height: 1.6;
  font-weight: 400;
}

/* UI elements */
.text-ui {
  font-family: 'Source Sans 3', sans-serif;
  font-size: 0.875rem;
  line-height: 1;
  font-weight: 500;
}
```

### Hierarchy Guidelines

- **Page Title**: Source Serif 4, display size, semibold
- **Section Headers**: Source Serif 4, h2 size, semibold
- **Form Labels**: Source Sans 3, caption size, medium weight, uppercase, letter-spacing 0.05em
- **Body Text**: Source Sans 3, body size, regular weight
- **Button Text**: Source Sans 3, ui size, medium weight

---

## Color System

### Philosophy

The color palette is intentionally minimal and neutral. The interface should feel like paper—clean, professional, unobtrusive. Color is used only for:
1. Interactive states (hover, focus, active)
2. Critical actions (primary buttons)
3. Status indicators (success, error)

### Base Palette

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `--bg-primary` | `#FAFAFA` | `#0A0A0A` | Main background |
| `--bg-secondary` | `#FFFFFF` | `#141414` | Cards, panels, inputs |
| `--bg-tertiary` | `#F0F0F0` | `#1A1A1A` | Hover states, subtle backgrounds |
| `--text-primary` | `#1A1A1A` | `#FAFAFA` | Primary text, headings |
| `--text-secondary` | `#525252` | `#A3A3A3` | Secondary text, descriptions |
| `--text-tertiary` | `#737373` | `#737373` | Placeholder text, disabled |
| `--border` | `#E5E5E5` | `#262626` | Borders, dividers |
| `--border-strong` | `#D4D4D4` | `#404040` | Focus rings, active borders |

### Accent Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--accent-primary` | `#1A1A1A` | Primary buttons, key actions |
| `--accent-primary-text` | `#FFFFFF` | Text on primary accent |
| `--accent-hover` | `#404040` | Hover state for primary |
| `--success` | `#16A34A` | Success states, completion |
| `--error` | `#DC2626` | Errors, destructive actions |
| `--warning` | `#D97706` | Warnings, attention needed |

### Color Usage Rules

1. **Backgrounds**: Use only `--bg-primary`, `--bg-secondary`, `--bg-tertiary`
2. **Text**: Use `--text-primary` for content, `--text-secondary` for metadata
3. **Borders**: Use `--border` for all dividers and input borders
4. **Accents**: Use `--accent-primary` sparingly—only for primary CTAs
5. **No Gradients**: Solid colors only
6. **No Transparency**: Avoid alpha channels except for focus rings

---

## Spacing System

### Base Unit

The base unit is `4px`. All spacing values are multiples of 4.

| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | 4px | Tight spacing, icon gaps |
| `--space-2` | 8px | Inline element gaps |
| `--space-3` | 12px | Small component padding |
| `--space-4` | 16px | Standard component padding |
| `--space-5` | 20px | Medium gaps |
| `--space-6` | 24px | Section gaps |
| `--space-8` | 32px | Large section gaps |
| `--space-10` | 40px | Page padding |
| `--space-12` | 48px | Major section breaks |
| `--space-16` | 64px | Page section spacing |

### Spacing Patterns

```css
/* Component internal padding */
.component-sm { padding: var(--space-3) var(--space-4); }
.component-md { padding: var(--space-4) var(--space-5); }
.component-lg { padding: var(--space-5) var(--space-6); }

/* Section spacing */
.section-gap { margin-bottom: var(--space-8); }
.page-gap { margin-bottom: var(--space-12); }

/* Page padding */
.page-padding { padding: var(--space-6) var(--space-8); }
@media (min-width: 768px) {
  .page-padding { padding: var(--space-8) var(--space-10); }
}
```

### Layout Principles

1. **Consistent Rhythm**: Maintain consistent vertical rhythm with 24px or 32px gaps between sections
2. **Generous Whitespace**: Prefer more space over less. A calm interface needs room to breathe
3. **No Arbitrary Values**: Always use the spacing scale, never one-off pixel values

---

## Layout Principles

### Single Dominant Surface

Each screen has one primary content area:

- **Onboarding**: Centered card with clear choice
- **Editor**: Full-width form with clear section breaks
- **Preview**: Centered document with minimal chrome
- **Chat**: Single column conversation

### Grid System

Use a simple 12-column grid for layouts:

```css
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-6);
}

@media (min-width: 768px) {
  .container {
    padding: 0 var(--space-10);
  }
}
```

### Breakpoints

| Breakpoint | Width | Usage |
|------------|-------|-------|
| `sm` | 640px | Large phones |
| `md` | 768px | Tablets |
| `lg` | 1024px | Small laptops |
| `xl` | 1280px | Desktops |

### Layout Patterns

1. **Mobile (< 768px)**: Single column, stacked layout
2. **Tablet (768px - 1024px)**: Two columns where appropriate
3. **Desktop (> 1024px)**: Editor on left, preview on right (side-by-side)

### Z-Index Scale

| Layer | Z-Index | Usage |
|-------|---------|-------|
| Base | 0 | Default content |
| Sticky | 10 | Sticky headers |
| Dropdown | 20 | Dropdown menus |
| Modal | 30 | Modal overlays |
| Toast | 40 | Toast notifications |
| Tooltip | 50 | Tooltips |

---

## Component Guidelines

### Buttons

**Primary Button**
- Background: `--accent-primary` (#1A1A1A)
- Text: `--accent-primary-text` (#FFFFFF)
- Padding: 12px 24px (space-3 space-6)
- Border-radius: 6px
- Font: Source Sans 3, 14px, medium weight
- Hover: `--accent-hover` (#404040)
- Active: Scale to 0.98
- No shadows

**Secondary Button**
- Background: transparent
- Border: 1px solid `--border`
- Text: `--text-primary`
- Padding: 12px 24px
- Border-radius: 6px
- Hover: `--bg-tertiary` background

**Ghost Button**
- Background: transparent
- Text: `--text-secondary`
- Padding: 8px 12px
- Hover: `--bg-tertiary` background

### Inputs

**Text Input**
- Background: `--bg-secondary`
- Border: 1px solid `--border`
- Border-radius: 6px
- Padding: 12px 16px
- Font: Source Sans 3, 16px (prevent zoom on mobile)
- Focus: Border changes to `--border-strong`, no ring
- Placeholder: `--text-tertiary`

**Textarea**
- Same as text input
- Min-height: 120px
- Resize: vertical only

### Cards

**Standard Card**
- Background: `--bg-secondary`
- Border: 1px solid `--border`
- Border-radius: 8px
- Padding: 24px
- No shadow
- No hover elevation

**Interactive Card**
- Same as standard
- Hover: Border changes to `--border-strong`
- Cursor: pointer

### Navigation

**Header**
- Background: `--bg-primary`
- Border-bottom: 1px solid `--border`
- Height: 64px
- Padding: 0 24px
- Position: sticky, top: 0
- Z-index: 10

**Logo**
- Font: Source Serif 4, 20px, semibold
- Text: "CV-ConVos"
- No icon necessary

### Form Sections

**Section Header**
- Font: Source Sans 3, 12px, medium weight, uppercase
- Letter-spacing: 0.05em
- Color: `--text-secondary`
- Margin-bottom: 16px
- Border-bottom: 1px solid `--border` (optional)

**Form Group**
- Margin-bottom: 24px
- Label + Input spacing: 8px

---

## Motion Guidelines

### Philosophy

Motion should be minimal and purposeful. The goal is to provide feedback, not delight. Animations should be nearly imperceptible—felt more than seen.

### Allowed Animations

1. **Fade In**: For content appearing (200ms, ease-out)
2. **Slide Up**: For modals/drawers (300ms, ease-out)
3. **Scale**: For button presses (100ms, ease-in-out)
4. **Opacity**: For hover states (150ms, ease)

### Timing

| Duration | Usage |
|----------|-------|
| 100ms | Button presses, micro-interactions |
| 150ms | Hover states, color transitions |
| 200ms | Content reveals, fades |
| 300ms | Modals, drawers, page transitions |

### Easing

```css
--ease-default: cubic-bezier(0.4, 0, 0.2, 1);
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1); /* Use sparingly */
```

### Motion Patterns

```css
/* Button press */
.button:active {
  transform: scale(0.98);
  transition: transform 100ms ease-in-out;
}

/* Hover state */
.interactive:hover {
  background-color: var(--bg-tertiary);
  transition: background-color 150ms ease;
}

/* Content fade in */
.fade-in {
  animation: fadeIn 200ms ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Slide up (for modals) */
.slide-up {
  animation: slideUp 300ms ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### What to Avoid

- No parallax effects
- No continuous animations (spinners excepted)
- No bounce effects on page load
- No staggered animations for lists
- No gradient animations
- No blur transitions

---

## Implementation Notes

### CSS Variables

```css
:root {
  /* Typography */
  --font-serif: 'Source Serif 4', Georgia, serif;
  --font-sans: 'Source Sans 3', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  /* Colors - Light Mode */
  --bg-primary: #FAFAFA;
  --bg-secondary: #FFFFFF;
  --bg-tertiary: #F0F0F0;
  --text-primary: #1A1A1A;
  --text-secondary: #525252;
  --text-tertiary: #737373;
  --border: #E5E5E5;
  --border-strong: #D4D4D4;
  --accent-primary: #1A1A1A;
  --accent-primary-text: #FFFFFF;
  --accent-hover: #404040;
  --success: #16A34A;
  --error: #DC2626;
  --warning: #D97706;

  /* Spacing */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;

  /* Animation */
  --duration-fast: 100ms;
  --duration-normal: 150ms;
  --duration-slow: 200ms;
  --duration-slower: 300ms;
  --ease-default: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
}

/* Dark Mode */
@media (prefers-color-scheme: dark) {
  :root {
    --bg-primary: #0A0A0A;
    --bg-secondary: #141414;
    --bg-tertiary: #1A1A1A;
    --text-primary: #FAFAFA;
    --text-secondary: #A3A3A3;
    --text-tertiary: #737373;
    --border: #262626;
    --border-strong: #404040;
    --accent-primary: #FAFAFA;
    --accent-primary-text: #0A0A0A;
    --accent-hover: #E5E5E5;
  }
}
```

### Font Loading

```html
<!-- In layout.tsx or _document.tsx -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Source+Sans+3:wght@400;500;600&family=Source+Serif+4:wght@400;600&display=swap" rel="stylesheet">
```

### Tailwind Configuration

```javascript
// tailwind.config.js additions
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        serif: ['Source Serif 4', 'Georgia', 'serif'],
        sans: ['Source Sans 3', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        bg: {
          primary: 'var(--bg-primary)',
          secondary: 'var(--bg-secondary)',
          tertiary: 'var(--bg-tertiary)',
        },
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          tertiary: 'var(--text-tertiary)',
        },
        accent: {
          DEFAULT: 'var(--accent-primary)',
          hover: 'var(--accent-hover)',
        },
      },
      spacing: {
        '18': '4.5rem',  // 72px
        '22': '5.5rem',  // 88px
      },
      transitionDuration: {
        '100': '100ms',
        '150': '150ms',
        '200': '200ms',
        '300': '300ms',
      },
    },
  },
}
```

---

## Migration Guide

### From Current System

1. **Remove all gradient backgrounds** - Replace with solid `--bg-primary`
2. **Remove all glassmorphism** - Replace with solid `--bg-secondary`
3. **Remove decorative blur effects** - Clean, flat surfaces only
4. **Replace Outfit font** with Source Sans 3 / Source Serif 4
5. **Simplify color palette** - Remove emerald/teal accents, use neutral grays
6. **Remove continuous animations** - Pulse, float, glow effects
7. **Standardize spacing** - Replace arbitrary values with spacing scale
8. **Simplify buttons** - Remove shadows, scale effects, gradient backgrounds

### Component Migration Priority

1. **globals.css** - Update CSS variables, remove animations
2. **layout.tsx** - Update font imports
3. **Button component** - Simplify styling
4. **Card component** - Remove shadows, flatten
5. **Input component** - Simplify borders, remove focus rings
6. **Header component** - Clean up, remove glass effect
7. **Builder layout** - Implement single-surface pattern
8. **Editor component** - Clean up form styling
9. **Template components** - Update typography

---

## Examples

### Before (Current)
```tsx
// Cluttered with gradients, shadows, animations
<div className="bg-gradient-to-br from-primary/5 via-transparent to-accent/5">
  <div className="absolute w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px]">
  <Card className="shadow-lg hover:shadow-xl transition-shadow rounded-2xl">
    <Button className="shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02]">
```

### After (New System)
```tsx
// Clean, minimal, focused
<div className="bg-bg-primary">
  <Card className="border border-border rounded-lg">
    <Button className="bg-accent text-accent-text hover:bg-accent-hover active:scale-[0.98]">
```

---

## Summary

This visual identity system creates a calm, professional workspace that lets users focus on creating their CV. By removing visual noise and establishing clear hierarchy through typography, we create an interface that feels trustworthy and disappears into the background.

**Key decisions:**
- Source Serif 4 + Source Sans 3 for distinctive, professional typography
- Neutral gray palette with minimal accents
- Single dominant surface per screen
- No gradients, glassmorphism, or decorative effects
- Minimal, purposeful motion only
- Mobile-first, single-mode experience
