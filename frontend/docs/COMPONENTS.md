# Components & Patterns - CV-ConVos

## Component Architecture

### Component Hierarchy

```
App
├── Layout
│   └── Providers (Theme, Tooltip, etc.)
├── Pages
│   ├── Home Page
│   └── ATS Checker Page
└── Features
    └── CV Builder
        ├── Builder (Main Container)
        ├── Editor (Form Editor)
        ├── Header (Navigation)
        ├── Templates (CV Templates)
        └── Modals (Onboarding, LinkedIn, etc.)
```

## Core Components

### Builder.tsx

**Purpose**: Main container for CV Builder feature

**Responsibilities**:
- Coordinate between Editor and Preview
- Manage CV state and history
- Handle template switching
- Export functionality (PDF, DOCX)
- Progress tracking

**Props**:
```typescript
interface BuilderProps {
  initialData: CVData;
  onReset: () => void;
  initialTemplate?: CVTemplate;
}
```

**Key Features**:
- Undo/Redo with `useCVHistory`
- Auto-save with `useAutoSave`
- Template switching
- Print/Export with `useReactToPrint`
- Progress calculation by section

**State Management**:
```typescript
const [cvData, setCvData] = useCVHistory(initialData);
const [template, setTemplate] = useState<CVTemplate>('professional');
```

**Usage**:
```tsx
<Builder
  initialData={initialData}
  onReset={handleReset}
  initialTemplate="professional"
/>
```

### Editor.tsx

**Purpose**: Form editor for CV sections

**Sections**:
- Personal Info (fullName, email, phone, location, links)
- Summary (professional summary)
- Experience (work history with CRUD)
- Education (academic background with CRUD)
- Skills (skills with proficiency levels)
- Projects (portfolio projects)
- Languages (language fluency)
- Certifications (certificates)
- Interests (personal interests)
- Tools (technical tools)

**Features**:
- Accordion-based sections
- Inline CRUD operations
- Validation feedback
- AI-powered improvements
- Copy from LinkedIn modal

**Key Patterns**:
```typescript
// Section pattern
{data[section].map((item, index) => (
  <SectionItem key={item.id} item={item} onChange={handleChange} />
))}

// Add item pattern
<Button onClick={() => addItem(section)}>
  <Plus /> Add Item
</Button>

// Delete item pattern
<DropdownMenuItem onClick={() => deleteItem(section, index)}>
  <Trash2 /> Delete
</DropdownMenuItem>
```

### Templates

All templates accept:
```typescript
interface TemplateProps {
  cvData: CVData;
  config?: TemplateConfig;
}
```

**Available Templates**:

| Template | Style | Use Case |
|----------|-------|----------|
| ProfessionalTemplate | Classic sidebar | General purpose |
| HarvardTemplate | Academic | Academic/Research |
| MinimalTemplate | Clean, minimalist | Modern roles |
| CreativeTemplate | Bold, colorful | Design/Creative |
| TechTemplate | Code-focused, mono fonts | Tech/Engineering |
| BianTemplate | Modern sidebar | Professional/Corporate |
| FinanceTemplate | Conservative | Finance/Business |
| HealthTemplate | Clean, medical | Healthcare |
| EducationTemplate | Academic-focused | Teaching/Education |

**Template Implementation Pattern**:
```tsx
export function ProfessionalTemplate({ cvData, config }: TemplateProps) {
  return (
    <div className={`cv-density-${config?.layout?.density || 'standard'}`}>
      {/* Header */}
      <header className="...">
        <h1 className="text-3xl font-bold">{cvData.personalInfo.fullName}</h1>
      </header>

      {/* Sidebar */}
      <aside className="...">
        <ContactInfo info={cvData.personalInfo} />
        <Skills skills={cvData.skills} />
      </aside>

      {/* Main Content */}
      <main className="...">
        <Experience items={cvData.experience} />
        <Education items={cvData.education} />
      </main>
    </div>
  );
}
```

## Feature Components

### FileUploader.tsx

**Purpose**: Upload and parse CV files (PDF, DOCX, TXT)

**Features**:
- Drag & drop support
- File type validation
- Upload progress
- Backend integration

**Usage**:
```tsx
<FileUploader
  onUpload={(parsedData) => setCvData(parsedData)}
  maxFiles={3}
  acceptedFormats={['pdf', 'docx', 'txt']}
/>
```

### ATSChecker.tsx

**Purpose**: Check CV compatibility with ATS (Applicant Tracking Systems)

**Features**:
- Keyword analysis
- Format validation
- Score calculation
- Improvement suggestions

### TemplateSelector.tsx

**Purpose**: Select CV template from gallery

**Features**:
- Template preview
- Category filtering
- Selection state

### TemplateConfigurator.tsx

**Purpose**: Configure template colors, fonts, and layout

**Features**:
- Color picker (primary, secondary, accent)
- Font selection
- Layout options (compact, standard, relaxed)
- Section visibility toggles

### FinalizeExport.tsx

**Purpose**: Export CV to various formats

**Features**:
- PDF export (html-to-image)
- DOCX export (docx library)
- Print preview
- Quality settings

### LinkedInModal.tsx

**Purpose**: Import data from LinkedIn profile

**Features**:
- LinkedIn profile URL input
- Parse profile data
- Auto-fill CV sections

### CritiqueModal.tsx

**Purpose**: Get AI-powered feedback on CV

**Features**:
- CV analysis
- Score calculation
- Improvement suggestions
- Before/after comparison

## Onboarding Flow

### OnboardingSelection.tsx

**Purpose**: Initial onboarding for new users

**Options**:
- Create from scratch
- Upload existing CV
- Import from LinkedIn

### Wizard Steps

**StepInfoPersonal.tsx**: Personal information form
**StepExperiencia.tsx**: Work experience wizard
**StepSkills.tsx**: Skills wizard

**Pattern**:
```tsx
export function StepInfoPersonal({ onNext, onBack }) {
  const [formData, setFormData] = useState(initialState);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Personal Information</h2>
      <form>
        {/* Form fields */}
      </form>
      <div className="flex justify-between">
        <Button onClick={onBack}>Back</Button>
        <Button onClick={() => onNext(formData)}>Next</Button>
      </div>
    </div>
  );
}
```

## Custom Hooks

### useCVHistory<T>

**Purpose**: Manage undo/redo state for CV

**Usage**:
```typescript
const {
  state,      // Current state
  set,        // Set new state
  undo,       // Undo last change
  redo,       // Redo undone change
  canUndo,    // Can undo?
  canRedo     // Can redo?
} = useCVHistory(initialState);
```

**Implementation**:
- Stores up to 30 history states
- Deep equality check (JSON.stringify)
- Separate past/present/future arrays

### useAutoSave

**Purpose**: Auto-save CV to backend with debounce

**Usage**:
```typescript
useAutoSave({
  data: cvData,
  onSave: async (data) => {
    await api.saveCV(data);
    toast.success('Auto-saved');
  },
  debounceTime: 3000, // Save after 3s of inactivity
});
```

## UI Patterns

### Modal Pattern

Using Shadcn Dialog:
```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Modal Title</DialogTitle>
    </DialogHeader>
    <ModalContent />
  </DialogContent>
</Dialog>
```

### Form Pattern

```tsx
<form onSubmit={handleSubmit}>
  <div className="space-y-4">
    <div>
      <Label htmlFor="field">Field Name</Label>
      <Input
        id="field"
        value={formData.field}
        onChange={(e) => setField(e.target.value)}
        placeholder="Placeholder..."
      />
    </div>

    <div>
      <Label htmlFor="textarea">Description</Label>
      <Textarea
        id="textarea"
        value={formData.description}
        onChange={(e) => setDescription(e.target.value)}
        rows={4}
      />
    </div>
  </div>

  <Button type="submit">Submit</Button>
</form>
```

### Loading State Pattern

```tsx
{isLoading ? (
  <Button disabled>
    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
    Loading...
  </Button>
) : (
  <Button>Submit</Button>
)}
```

### Toast Notifications Pattern

```tsx
import { toast } from 'sonner';

// Success
toast.success('CV saved successfully');

// Error
toast.error('Failed to save CV');

// Loading with promise
toast.promise(savePromise, {
  loading: 'Saving...',
  success: 'Saved!',
  error: 'Error saving'
});
```

### Dropdown Menu Pattern

```tsx
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost" size="sm">
      <MoreHorizontal />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem onClick={handleEdit}>
      <Pencil className="mr-2 h-4 w-4" />
      Edit
    </DropdownMenuItem>
    <DropdownMenuItem onClick={handleDelete}>
      <Trash2 className="mr-2 h-4 w-4" />
      Delete
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

### Tabs Pattern

```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

<Tabs defaultValue="personal">
  <TabsList>
    <TabsTrigger value="personal">Personal</TabsTrigger>
    <TabsTrigger value="experience">Experience</TabsTrigger>
  </TabsList>
  <TabsContent value="personal">
    <PersonalForm />
  </TabsContent>
  <TabsContent value="experience">
    <ExperienceForm />
  </TabsContent>
</Tabs>
```

### Accordion Pattern

```tsx
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';

<Accordion type="multiple" defaultValue={['personal']}>
  <AccordionItem value="personal">
    <AccordionTrigger>Personal Info</AccordionTrigger>
    <AccordionContent>
      <PersonalForm />
    </AccordionContent>
  </AccordionItem>
  <AccordionItem value="experience">
    <AccordionTrigger>Experience</AccordionTrigger>
    <AccordionContent>
      <ExperienceForm />
    </AccordionContent>
  </AccordionItem>
</Accordion>
```

### Progress Tracking Pattern

```tsx
import { Progress } from '@/components/ui/progress';

<Progress value={progress} className="h-2" />
<span className="text-sm text-muted-foreground">{progress}% complete</span>
```

## Component Best Practices

### 1. Component Size

- Keep components small (< 300 lines)
- Split large components into sub-components
- Each component should have single responsibility

### 2. Props Interface

```typescript
// Good - explicit types
interface MyComponentProps {
  title: string;
  items: Item[];
  onSelect: (item: Item) => void;
  variant?: 'default' | 'compact';
}

// Bad - using any
interface MyComponentProps {
  data: any;
  onChange: any;
}
```

### 3. State vs Props

```typescript
// Use props for data from parent
function Child({ data }: Props) {
  // Display data from parent
  return <div>{data}</div>;
}

// Use state for local mutations
function Parent() {
  const [data, setData] = useState(initialData);
  return <Child data={data} />;
}
```

### 4. Event Handlers

```typescript
// Good - descriptive names
const handleSave = () => { /* ... */ };
const handleDelete = (id: string) => { /* ... */ };
const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => { /* ... */ };

// Bad - generic names
const onClick = () => { /* ... */ };
const onChange = () => { /* ... */ };
```

### 5. Conditional Rendering

```tsx
// Good - early return
if (isLoading) return <Loading />;
if (error) return <Error />;

// Render main content
return <Content />;

// Good - ternary for simple cases
<div className={isActive ? 'active' : ''} />

// Avoid nested ternaries
// Bad
<div className={a ? 'x' : b ? 'y' : 'z'} />
```

### 6. List Rendering

```tsx
// Good - with key
{items.map(item => (
  <Item key={item.id} item={item} />
))}

// Bad - without key or using index
{items.map((item, index) => (
  <Item key={index} item={item} />
))}
```

### 7. Styling

```tsx
// Good - use Tailwind classes
<div className="p-4 bg-white rounded-lg shadow-md">

// Bad - inline styles
<div style={{ padding: '16px', background: 'white' }}>

// Good - use cn utility for conditional classes
<div className={cn('base-class', isActive && 'active-class', className)}>

// Bad - string concatenation
<div className={`base-class ${isActive ? 'active-class' : ''}`}>
```

## Template System

### Creating a New Template

1. Create file in `src/components/cv-builder/templates/`
2. Implement Template interface:
```typescript
export function MyTemplate({ cvData, config }: TemplateProps) {
  return (
    <div className={`cv-density-${config?.layout?.density || 'standard'}`}>
      {/* Template content */}
    </div>
  );
}
```

3. Add to Builder.tsx imports:
```typescript
import { MyTemplate } from './templates/MyTemplate';
```

4. Add to template options in header/Header.tsx:
```typescript
export const templateOptions = [
  // ... existing
  { id: 'my-template', name: 'My Template', icon: Star }
];
```

### Template Configuration

```typescript
interface TemplateConfig {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  layout: {
    sidebarWidth?: number;
    contentGap: number;
    sectionGap: number;
    density: 'compact' | 'standard' | 'relaxed';
    showExpertiseBar?: boolean;
    expertiseBarStyle?: 'dots' | 'bars' | 'gradient';
  };
  sections: {
    summary: SectionConfig;
    experience: SectionConfig;
    // ... etc
  };
}
```

## Testing Components

```tsx
import { render, screen } from '@testing-library/react';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('renders title', () => {
    render(<MyComponent title="Test" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('calls onAdd when Add button clicked', () => {
    const onAdd = vi.fn();
    render(<MyComponent onAdd={onAdd} />);
    screen.getByRole('button', { name: /add/i }).click();
    expect(onAdd).toHaveBeenCalled();
  });
});
```
