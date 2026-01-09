# Code Conventions - CV-ConVos Frontend

## General Principles

1. **Consistency**: Follow patterns established in the codebase
2. **Clarity**: Write self-documenting code
3. **Type Safety**: Use TypeScript effectively
4. **Performance**: Optimize for render performance
5. **Accessibility**: Build inclusive components

## TypeScript

### Type Definitions

**Use interfaces for object shapes**:
```typescript
// Good
interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
}

// Acceptable for simple types
type CVTemplate = 'professional' | 'harvard' | 'minimal';
```

**Avoid `any`**:
```typescript
// Bad
function processData(data: any) { /* ... */ }

// Good
function processData(data: CVData) { /* ... */ }

// Acceptable if truly unknown
function processData(data: unknown) {
  // Validate at runtime
  if (typeof data === 'object' && data !== null) {
    // ...
  }
}
```

**Explicit return types**:
```typescript
// Good
function calculateProgress(data: CVData): number {
  return (completed / total) * 100;
}

// Acceptable for simple inline returns
const isActive = (status: string) => status === 'active';
```

**Use generics wisely**:
```typescript
// Good - useful generic
function useCVHistory<T>(initialState: T) {
  // ...
}

// Bad - unnecessary generic
function getValue<T>(value: T): T {
  return value;
}
```

### Type Safety Patterns

**Discriminated unions**:
```typescript
type Result<T> =
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error };

function handleResult(result: Result<string>) {
  if (result.status === 'success') {
    console.log(result.data); // TypeScript knows data exists
  }
}
```

**Readonly for immutable data**:
```typescript
// Good
interface Config {
  readonly primaryColor: string;
  readonly secondaryColor: string;
}

const config: Config = {
  primaryColor: '#000',
  secondaryColor: '#fff'
};

// config.primaryColor = 'red'; // TypeScript error
```

## React

### Component Structure

**Client components**:
```typescript
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface Props {
  title: string;
  onAction: () => void;
}

export function MyComponent({ title, onAction }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <h1>{title}</h1>
      <Button onClick={onAction}>Action</Button>
    </div>
  );
}
```

**Server components** (default):
```typescript
import { CVData } from '@/types/cv';

export default function Page({ params }: { params: { id: string } }) {
  // Can fetch data directly
  const cvData = await getCVData(params.id);

  return <Template cvData={cvData} />;
}
```

### Hooks

**Custom hook naming**:
```typescript
// Good - use prefix
export function useCVHistory<T>(initialState: T) { /* ... */ }
export function useAutoSave(options: Options) { /* ... */ }

// Bad - no prefix
export function getCVHistory<T>(initialState: T) { /* ... */ }
```

**Custom hook rules**:
- Always start with `use`
- Can call other hooks
- Return consistent shape
- Don't use inside loops or conditions

```typescript
// Good
export function useCVHistory<T>(initialState: T) {
  const [state, setState] = useState(initialState);
  const set = useCallback((newState: T) => { /* ... */ }, []);
  return { state, set };
}

// Bad - hook in condition
export function useData(shouldFetch: boolean) {
  if (shouldFetch) {  // ❌
    const [data] = useState(null);
    return data;
  }
}
```

### State Management

**Use useState for local state**:
```typescript
const [isOpen, setIsOpen] = useState(false);
const [formData, setFormData] = useState<FormData>(initialData);
```

**Use useMemo for expensive computations**:
```typescript
const filteredItems = useMemo(
  () => items.filter(item => item.active),
  [items]
);
```

**Use useCallback for callbacks**:
```typescript
const handleClick = useCallback(() => {
  console.log('Clicked');
}, []);

// Good for dependencies
const handleSave = useCallback(() => {
  save(formData);
}, [formData]);
```

**Avoid premature optimization**:
```typescript
// Bad - unnecessary memo
const value = useMemo(() => 1 + 1, []);

// Good
const value = 1 + 1;
```

## Naming Conventions

### Files and Folders

**Components**:
- `PascalCase.tsx`: Components
- `use-camelCase.ts`: Custom hooks

```typescript
// Good
// MyComponent.tsx
export function MyComponent() { /* ... */ }

// Good
// useCVHistory.ts
export function useCVHistory() { /* ... */ }

// Bad
// myComponent.tsx
// My-Hook.ts
```

**Types**:
- `camelCase.ts`: Type definitions
- Organize by domain

```typescript
// Good
// types/cv.ts
export interface CVData { /* ... */ }
export type CVTemplate = /* ... */;
```

**Utilities**:
- `camelCase.ts`: Helper functions

```typescript
// Good
// lib/utils.ts
export function cn(...inputs: ClassValue[]) { /* ... */ }

// Bad
// Utilities/Utils.ts
```

### Variables and Functions

**camelCase**:
```typescript
// Good
const fullName = 'John Doe';
const isLoading = false;
const handleSave = () => { /* ... */ };
const getUserData = () => { /* ... */ };

// Bad
const FullName = 'John Doe';
const Is_Loading = false;
const Handle_Save = () => { /* ... */ };
```

**Constants**:
```typescript
// Good
const MAX_HISTORY_SIZE = 30;
const DEFAULT_TEMPLATE = 'professional';

// Bad
const max_history_size = 30;
const MaxHistorySize = 30;
```

**Enums**:
```typescript
// Good
enum Density {
  COMPACT = 'compact',
  STANDARD = 'standard',
  RELAXED = 'relaxed'
}

// Alternative with type (preferred)
type Density = 'compact' | 'standard' | 'relaxed';

const DENSITY = {
  COMPACT: 'compact' as const,
  STANDARD: 'standard' as const,
  RELAXED: 'relaxed' as const
};
```

### Components

**PascalCase**:
```typescript
// Good
export function MyComponent() { /* ... */ }
export function Button({ children }: Props) { /* ... */ }

// Bad
export function myComponent() { /* ... */ }
export function button({ children }: Props) { /* ... */ }
```

**Props interfaces**:
```typescript
// Good
interface MyComponentProps {
  title: string;
  items: Item[];
  onAction: () => void;
}

export function MyComponent({ title, items, onAction }: MyComponentProps) {
  // ...
}

// Alternative - inline
export function MyComponent({ title, items, onAction }: {
  title: string;
  items: Item[];
  onAction: () => void;
}) {
  // ...
}
```

## Imports

### Order

1. React imports
2. Third-party libraries
3. Internal imports (components, hooks, utils, types)
4. Type imports
5. Styles

```typescript
// Good
'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useCVHistory } from '@/hooks/use-cv-history';
import type { CVData } from '@/types/cv';

// Bad - mixed order
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import type { CVData } from '@/types/cv';
import { useCVHistory } from '@/hooks/use-cv-history';
```

### Path Aliases

**Use `@` alias for src**:
```typescript
// Good
import { Button } from '@/components/ui/button';
import { useCVHistory } from '@/hooks/use-cv-history';
import type { CVData } from '@/types/cv';

// Bad - relative paths
import { Button } from '../../../components/ui/button';
import { useCVHistory } from '../hooks/use-cv-history';
import type { CVData } from '../types/cv';
```

### Type Imports

**Use `type` keyword for type-only imports**:
```typescript
// Good
import type { CVData, CVTemplate } from '@/types/cv';
import { Button } from '@/components/ui/button';

// Acceptable
import { CVData, CVTemplate } from '@/types/cv';
import { Button } from '@/components/ui/button';

// Bad - mixed
import { Button } from '@/components/ui/button';
import { CVData } from '@/types/cv';
```

## Styling

### Class Names

**Use `cn()` utility**:
```typescript
import { cn } from '@/lib/utils';

// Good
<div className={cn(
  'base-class',
  isActive && 'active-class',
  isLoading && 'opacity-50',
  className
)} />

// Bad - string concatenation
<div className={`base-class ${isActive ? 'active-class' : ''}`} />
```

**Avoid inline styles**:
```typescript
// Good
<div className="p-4 bg-white rounded-lg shadow-md">

// Bad - use Tailwind instead
<div style={{ padding: '16px', background: 'white', borderRadius: '8px' }}>
```

### Tailwind Order

**Responsive-first**:
```tsx
// Good
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

// Bad - responsive last
<div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
```

**Use utilities over arbitrary values**:
```tsx
// Good
<div className="p-4 rounded-lg">

// Acceptable if no utility exists
<div className="w-[350px] h-[500px]">

// Bad - could use utility
<div className="p-[1rem]">
```

## Comments

### JSDoc for exports

```typescript
/**
 * Manages undo/redo state for CV data
 * @template T - Type of state being managed
 * @param initialState - Initial state value
 * @returns Object with state management methods
 */
export function useCVHistory<T>(initialState: T) {
  // ...
}
```

### Inline Comments

**Explain "why", not "what"**:
```typescript
// Bad - obvious
// Increment count
setCount(count + 1);

// Good - explains reasoning
// Limit history to prevent memory issues
setHistory(prev => prev.slice(-30));
```

**Complex logic**:
```typescript
// Calculate progress based on completed sections
// Weighted by section importance (summary: 20%, experience: 30%, etc.)
const progress = useMemo(() => {
  const weights = {
    summary: 0.2,
    experience: 0.3,
    education: 0.2,
    skills: 0.2,
    projects: 0.1
  };
  return calculateWeightedProgress(sections, weights);
}, [sections]);
```

## Error Handling

### Try/Catch

```typescript
// Good - specific error handling
async function saveCV(data: CVData) {
  try {
    const result = await api.saveCV(data);
    toast.success('CV saved');
    return result;
  } catch (error) {
    if (error instanceof NetworkError) {
      toast.error('Network error - check connection');
    } else {
      toast.error('Failed to save CV');
      console.error('Save error:', error);
    }
    throw error;
  }
}

// Acceptable - general error handling
async function saveCV(data: CVData) {
  try {
    return await api.saveCV(data);
  } catch (error) {
    console.error('Save error:', error);
    toast.error('Failed to save CV');
    throw error;
  }
}
```

### Error Boundaries

```typescript
'use client';

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong</div>;
    }

    return this.props.children;
  }
}
```

## Performance

### React Performance

**Avoid unnecessary re-renders**:
```typescript
// Good - memo for expensive components
const ExpensiveComponent = React.memo(function ExpensiveComponent({ data }) {
  // ...
});

// Good - useCallback for callbacks passed to children
const handleClick = useCallback(() => {
  doSomething();
}, [dependency]);

// Good - useMemo for expensive computations
const sortedItems = useMemo(
  () => items.sort(compareFn),
  [items]
);
```

**Key prop for lists**:
```typescript
// Good - unique key
{items.map(item => (
  <Item key={item.id} item={item} />
))}

// Bad - index as key (if list can change)
{items.map((item, index) => (
  <Item key={index} item={item} />
))}
```

### Code Splitting

**Dynamic imports**:
```typescript
// Good - lazy load heavy components
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Spinner />
});

// Good - lazy load routes
const ATSChecker = dynamic(() => import('./ats-checker/page'));
```

## Testing

### Test Naming

**Describe tests clearly**:
```typescript
// Good
describe('useCVHistory', () => {
  it('should save history when state changes', () => {
    // ...
  });

  it('should undo last state', () => {
    // ...
  });

  it('should not save duplicate states', () => {
    // ...
  });
});

// Bad
describe('useCVHistory', () => {
  it('works', () => {
    // ...
  });

  it('undo', () => {
    // ...
  });
});
```

### AAA Pattern

**Arrange, Act, Assert**:
```typescript
// Good
it('should add item to list', () => {
  // Arrange
  const initialItems = [{ id: '1', name: 'Item 1' }];
  const newItem = { id: '2', name: 'Item 2' };

  // Act
  const result = addItem(initialItems, newItem);

  // Assert
  expect(result).toHaveLength(2);
  expect(result).toContain(newItem);
});
```

## Linting

**Run before committing**:
```bash
npm run lint
```

**Fix automatically**:
```bash
npm run lint -- --fix
```

**Common issues**:
- Unused imports
- Missing dependencies in useEffect/useCallback
- Explicit any types
- Missing return types

## Git Commits

**Conventional commits**:
```bash
# Format
<type>(<scope>): <subject>

# Examples
feat(builder): add template selector
fix(editor): prevent duplicate items
docs(readme): update installation instructions
style(builder): improve card spacing
refactor(components): extract common button logic
test(hooks): add useCVHistory tests
chore(deps): update react version
```

## Code Review Checklist

- [ ] Follows TypeScript best practices
- [ ] No `any` types (or justified)
- [ ] Proper error handling
- [ ] Accessibility considerations
- [ ] Performance optimizations (memoization, lazy loading)
- [ ] Tests added (if applicable)
- [ ] Documentation updated
- [ ] Linting passes
- [ ] Works in both light and dark modes
