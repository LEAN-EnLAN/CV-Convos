# Developer Guide - CV-ConVos Frontend

## Getting Started

### Prerequisites

```bash
node --version   # >= 18.0.0
npm --version    # >= 9.0.0
```

### Installation

1. **Clone the repository**:
```bash
git clone https://github.com/your-org/cv-convos.git
cd cv-convos/frontend
```

2. **Install dependencies**:
```bash
npm install
```

3. **Start development server**:
```bash
npm run dev
```

4. **Open browser**:
```
http://localhost:3000
```

## Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Homepage
│   │   ├── globals.css        # Global styles
│   │   └── ats-checker/       # ATS Checker feature
│   ├── components/
│   │   ├── cv-builder/        # CV Builder feature
│   │   │   ├── Builder.tsx    # Main container
│   │   │   ├── Editor.tsx     # Form editor
│   │   │   ├── templates/     # CV templates
│   │   │   ├── wizard/        # Onboarding
│   │   │   └── header/        # Builder header
│   │   └── ui/                # Shadcn UI components
│   ├── hooks/                 # Custom React hooks
│   │   └── use-cv-history.ts
│   ├── lib/                   # Utilities
│   │   ├── utils.ts           # Helper functions
│   │   └── cv-templates/      # Template defaults
│   └── types/                 # TypeScript types
│       └── cv.ts
├── docs/                      # Documentation
│   ├── ARCHITECTURE.md
│   ├── TECH_STACK.md
│   ├── DESIGN_SYSTEM.md
│   ├── COMPONENTS.md
│   ├── CODE_CONVENTIONS.md
│   └── DEVELOPER_GUIDE.md
├── convex/                    # Convex backend
├── public/                    # Static assets
├── components.json            # Shadcn config
├── tsconfig.json              # TypeScript config
├── package.json               # Dependencies
└── next.config.ts             # Next.js config
```

## Common Tasks

### Adding a New Page

1. Create file in `src/app/[feature]/page.tsx`:
```typescript
export default function Page() {
  return (
    <div>
      <h1>My Page</h1>
    </div>
  );
}
```

2. Access at `http://localhost:3000/[feature]`

### Creating a New Component

1. Create component file:
```typescript
// src/components/my-feature/MyComponent.tsx
'use client';

import { Button } from '@/components/ui/button';

interface MyComponentProps {
  title: string;
  onAction: () => void;
}

export function MyComponent({ title, onAction }: MyComponentProps) {
  return (
    <div>
      <h1>{title}</h1>
      <Button onClick={onAction}>Action</Button>
    </div>
  );
}
```

2. Export for reusability:
```typescript
// src/components/my-feature/index.ts
export { MyComponent } from './MyComponent';
```

### Adding a New CV Template

1. Create template file in `src/components/cv-builder/templates/`:
```typescript
// MyTemplate.tsx
import { CVData, TemplateProps } from '@/types/cv';

export function MyTemplate({ cvData, config }: TemplateProps) {
  return (
    <div className={`cv-density-${config?.layout?.density || 'standard'}`}>
      {/* Template content */}
    </div>
  );
}
```

2. Add to `Builder.tsx`:
```typescript
import { MyTemplate } from './templates/MyTemplate';
```

3. Add to template options in `header/Header.tsx`:
```typescript
export const templateOptions = [
  // ... existing
  { id: 'my-template', name: 'My Template', icon: Star }
];
```

### Creating a Custom Hook

1. Create hook file:
```typescript
// src/hooks/useMyHook.ts
import { useState, useCallback } from 'react';

export function useMyHook(initialValue: string) {
  const [value, setValue] = useState(initialValue);
  const update = useCallback((newValue: string) => {
    setValue(newValue);
  }, []);

  return { value, update };
}
```

2. Use in component:
```typescript
import { useMyHook } from '@/hooks/useMyHook';

export function MyComponent() {
  const { value, update } = useMyHook('initial');

  return <input value={value} onChange={(e) => update(e.target.value)} />;
}
```

### Adding a Shadcn UI Component

1. Add component:
```bash
npx shadcn@latest add [component-name]
```

2. Import in your component:
```typescript
import { Button } from '@/components/ui/button';
```

## Working with Convex

### Reading Data

```typescript
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

function MyComponent() {
  const cv = useQuery(api.cvOperations.getCV, { id: '123' });

  if (!cv) return <div>Loading...</div>;

  return <div>{cv.personalInfo.fullName}</div>;
}
```

### Writing Data

```typescript
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

function MyComponent() {
  const updateCV = useMutation(api.cvOperations.updateCV);

  const handleSave = async (data: CVData) => {
    await updateCV({ id: '123', data });
  };

  return <button onClick={() => handleSave(data)}>Save</button>;
}
```

### Convex Schema

Edit `convex/schema.ts` to add/change database schema:

```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  cvs: defineTable({
    userId: v.string(),
    data: v.any(), // CVData
    createdAt: v.number(),
  }).index("by_user", ["userId"]),
});
```

## Styling Guidelines

### Using Tailwind Classes

```tsx
// Basic styling
<div className="p-4 bg-white rounded-lg shadow-md">

// Responsive
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">

// Dark mode
<div className="bg-white dark:bg-card">

// Conditional
<div className={cn('base-class', isActive && 'active-class')}>
```

### Using Design Tokens

```tsx
// Colors from design system
<div className="bg-primary text-primary-foreground">
<div className="bg-secondary text-secondary-foreground">

// Typography
<h1 className="text-3xl font-bold">
<p className="text-base text-muted-foreground">

// Spacing
<div className="p-4">       // 1rem padding
<div className="space-y-4"> // 1rem gap between children
```

### Creating Consistent Components

```tsx
// Use consistent patterns
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

## Working with CV Data

### CV Data Structure

```typescript
interface CVData {
  personalInfo: PersonalInfo;
  experience: Experience[];
  education: Education[];
  skills: Skill[];
  projects: Project[];
  languages: Language[];
  certifications: Certification[];
  interests: Interest[];
  tools?: string[];
  config?: TemplateConfig;
}
```

### Updating CV Data

```typescript
const updateField = (field: string, value: any) => {
  setCvData(prev => ({
    ...prev,
    [field]: value
  }));
};

const updateArray = (field: keyof CVData, items: any[]) => {
  setCvData(prev => ({
    ...prev,
    [field]: items
  }));
};

const updateNested = (section: string, id: string, updates: any) => {
  setCvData(prev => ({
    ...prev,
    [section]: prev[section].map(item =>
      item.id === id ? { ...item, ...updates } : item
    )
  }));
};
```

### CRUD Operations

```typescript
// Add item
const addItem = (section: keyof CVData, newItem: any) => {
  setCvData(prev => ({
    ...prev,
    [section]: [...prev[section], { ...newItem, id: generateId() }]
  }));
};

// Update item
const updateItem = (section: keyof CVData, id: string, updates: any) => {
  setCvData(prev => ({
    ...prev,
    [section]: prev[section].map(item =>
      item.id === id ? { ...item, ...updates } : item
    )
  }));
};

// Delete item
const deleteItem = (section: keyof CVData, id: string) => {
  setCvData(prev => ({
    ...prev,
    [section]: prev[section].filter(item => item.id !== id)
  }));
};
```

## Testing

### Writing Component Tests

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { MyComponent } from './MyComponent';
import userEvent from '@testing-library/user-event';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent title="Test" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('calls callback on click', async () => {
    const onAction = vi.fn();
    const user = userEvent.setup();

    render(<MyComponent title="Test" onAction={onAction} />);

    await user.click(screen.getByRole('button'));
    expect(onAction).toHaveBeenCalled();
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run in watch mode
npm test -- --watch

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- MyComponent.test.ts
```

## Debugging

### Common Issues

**TypeScript errors**:
```bash
# Check types
npx tsc --noEmit
```

**Linting errors**:
```bash
# Run linter
npm run lint

# Auto-fix
npm run lint -- --fix
```

**Import errors**:
- Ensure path aliases use `@/` prefix
- Check `tsconfig.json` paths configuration

**Styling issues**:
- Use DevTools to inspect Tailwind classes
- Check `globals.css` for custom CSS variables

### Debugging Tips

1. **Use React DevTools**:
   - Inspect component hierarchy
   - View props and state
   - Trace re-renders

2. **Console logging**:
```typescript
console.log('CV Data:', cvData);
console.table(data.items);
```

3. **Breakpoints**:
```typescript
debugger; // Stops execution in browser
```

4. **Network requests**:
   - Check Network tab in DevTools
   - Verify API calls and responses

## Performance Optimization

### React Performance

```typescript
// Memoize expensive components
const ExpensiveComponent = React.memo(function ExpensiveComponent({ data }) {
  // ...
});

// Memoize callbacks
const handleClick = useCallback(() => {
  doSomething();
}, [dependency]);

// Memoize values
const sortedItems = useMemo(
  () => items.sort(compareFn),
  [items]
);
```

### Code Splitting

```typescript
// Lazy load routes
import dynamic from 'next/dynamic';

const ATSChecker = dynamic(() => import('./ats-checker/page'), {
  loading: () => <Spinner />
});
```

### Image Optimization

```tsx
import Image from 'next/image';

<Image
  src="/logo.png"
  alt="Logo"
  width={200}
  height={200}
  priority // For above-the-fold images
/>
```

## Deploying

### Vercel (Recommended)

1. Connect repository to Vercel
2. Configure settings:
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`

3. Add environment variables:
   ```
   NEXT_PUBLIC_CONVEX_URL=your-convex-url
   NEXT_PUBLIC_API_URL=your-api-url
   ```

4. Deploy!

### Build Locally

```bash
# Build for production
npm run build

# Test production build
npm run start
```

### Environment Variables

Create `.env.local`:
```env
NEXT_PUBLIC_CONVEX_URL=
NEXT_PUBLIC_API_URL=
```

## Best Practices

### Before Committing

1. Run tests:
```bash
npm test
```

2. Run linter:
```bash
npm run lint
```

3. Check for console errors
4. Test in both light and dark modes
5. Test on different screen sizes

### Code Review Checklist

- [ ] Code follows conventions
- [ ] TypeScript types are correct
- [ ] No `any` types (or justified)
- [ ] Components are accessible
- [ ] Tests added (if needed)
- [ ] Documentation updated
- [ ] Linting passes
- [ ] Works in both themes

### Getting Help

1. **Read documentation**: Check `docs/` folder
2. **Check existing code**: Look for similar implementations
3. **Ask questions**: Reach out to team
4. **Consult official docs**:
   - [Next.js](https://nextjs.org/docs)
   - [React](https://react.dev)
   - [TypeScript](https://www.typescriptlang.org/docs)
   - [Tailwind](https://tailwindcss.com/docs)

## Keyboard Shortcuts

### VS Code

- `Cmd/Ctrl + P`: Quick open file
- `Cmd/Ctrl + Shift + F`: Search in files
- `Cmd/Ctrl + /`: Toggle comment
- `F2`: Rename symbol
- `Cmd/Ctrl + Click`: Go to definition

### Terminal

- `npm run dev`: Start dev server
- `npm run build`: Build for production
- `npm run lint`: Run linter
- `npm test`: Run tests
- `npm run test:coverage`: Test with coverage

## Useful Resources

- **Project Docs**: `frontend/docs/`
- **Shadcn UI**: https://ui.shadcn.com
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Next.js**: https://nextjs.org/docs
- **Convex**: https://docs.convex.dev
- **Radix UI**: https://www.radix-ui.com

## Next Steps

1. Read through the documentation in `docs/`
2. Explore the codebase, especially `components/cv-builder/`
3. Try adding a small feature
4. Ask questions in team chat
5. Start contributing!

---

Happy coding! 🚀
