# Template Validation Specification

> **Purpose**: Define mandatory requirements for all CV templates  
> **Audience**: Developers, AI assistants, QA testers  
> **Version**: 1.0

---

## Overview

This specification defines the **minimum requirements** that every CV template MUST satisfy to be considered production-ready. Templates failing any CRITICAL check should be blocked from deployment.

---

## Critical Requirements

### ✅ REQ-001: Summary Section Rendering

**Description**: If `data.personalInfo.summary` contains text AND `config.sections.summary.visible` is true, the template MUST display the summary text.

**Rationale**: Users expect their professional summary to appear on their CV.

**Test Method**:
```typescript
// Given
data.personalInfo.summary = "Senior developer with 10 years experience"
config.sections.summary.visible = true

// Then
// Summary text must be visible in rendered template
```

**Acceptance Criteria**:
- Summary appears in a dedicated section
- Section has a title (e.g., "PROFESSIONAL SUMMARY" or custom title from `config.sections.summary.title`)
- Text is readable and properly formatted

**Severity**: CRITICAL

---

### ✅ REQ-002: Dynamic Section Spacing

**Description**: Templates MUST use `config.layout.sectionGap` for spacing between major sections (Education, Experience, Skills, etc.).

**Rationale**: Users expect spacing controls in settings to work.

**Test Method**:
```typescript
// Given
config.layout.sectionGap = 64 // max

// Then
// Visual gap between sections should be large

// Given
config.layout.sectionGap = 8 // min

// Then
// Visual gap between sections should be minimal
```

**Implementation**:
```tsx
// ❌ WRONG: Hardcoded spacing
<section className="mb-6">

// ✅ CORRECT: Dynamic spacing
<section style={{ marginBottom: `${config.layout.sectionGap}px` }}>
```

**Acceptance Criteria**:
- Changing `sectionGap` from 8 to 64 produces visible difference
- Spacing applies to ALL major sections consistently

**Severity**: CRITICAL

---

### ✅ REQ-003: Dynamic Content Spacing

**Description**: Templates MUST use `config.layout.contentGap` for spacing within sections (e.g., between education items, experience entries).

**Rationale**: Granular spacing control is essential for user customization.

**Test Method**:
```typescript
// Given
config.layout.contentGap = 48 // max

// Then
// Spacing between items within a section should increase

// Given
config.layout.contentGap = 8 // min

// Then
// Items within sections should be tightly packed
```

**Implementation**:
```tsx
// ❌ WRONG: Hardcoded
<div className="space-y-4">

// ✅ CORRECT: Dynamic
<div style={{ gap: `${config.layout.contentGap}px` }} className="flex flex-col">
```

**Acceptance Criteria**:
- Changing `contentGap` produces visible difference in item spacing
- Applies to all repeated content (education, experience, skills, etc.)

**Severity**: CRITICAL

---

### ✅ REQ-004: Density Configuration

**Description**: Templates MUST respect `config.layout.density` to adjust overall padding/margins.

**Values**:
- `compact`: Minimal padding (e.g., 1.5cm for Harvard)
- `standard`: Standard padding (e.g., 2.54cm for Harvard)
- `relaxed`: Generous padding (e.g., 3cm for Harvard)

**Test Method**:
```typescript
// Given
config.layout.density = 'compact'
// Then: Template should have tight margins

// Given
config.layout.density = 'relaxed'
// Then: Template should have generous margins
```

**Acceptance Criteria**:
- Switching between compact/standard/relaxed produces visible margin changes
- Overall content density adjusts appropriately

**Severity**: HIGH

---

### ✅ REQ-005: Section Visibility Toggle

**Description**: Templates MUST hide sections when `config.sections.<sectionName>.visible = false`.

**Test Method**:
```typescript
// Given
config.sections.experience.visible = false

// Then
// Experience section should NOT appear in rendered template

// Given
config.sections.experience.visible = true

// Then
// Experience section should appear
```

**Implementation Pattern**:
```tsx
{data.experience.length > 0 && config.sections.experience.visible && (
    <section>
        {/* Experience content */}
    </section>
)}
```

**Acceptance Criteria**:
- ALL sections respect their visibility flag
- Toggling visibility in settings immediately hides/shows section

**Severity**: CRITICAL

---

## Standard Requirements

### ⚙️ REQ-006: Font Configuration

**Description**: Templates SHOULD apply `config.fonts.heading` and `config.fonts.body` when provided.

**Exception**: Templates with fixed fonts (e.g., Harvard uses Times New Roman) may ignore this.

**Severity**: MEDIUM

---

### ⚙️ REQ-007: Color Configuration

**Description**: Templates SHOULD apply `config.colors.primary`, `config.colors.secondary`, etc.

**Exception**: Monochrome templates (e.g., Harvard) may have limited color support.

**Severity**: MEDIUM

---

## Testing Matrix

| Requirement | Professional | Creative | Harvard | Minimal | Tech | Bian | Finance | Health | Education |
|------------|-------------|----------|---------|---------|------|------|---------|--------|-----------|
| REQ-001    | ⬜          | ⬜       | ⬜      | ⬜      | ⬜   | ⬜   | ⬜      | ⬜     | ⬜         |
| REQ-002    | ⬜          | ⬜       | ⬜      | ⬜      | ⬜   | ⬜   | ⬜      | ⬜     | ⬜         |
| REQ-003    | ⬜          | ⬜       | ⬜      | ⬜      | ⬜   | ⬜   | ⬜      | ⬜     | ⬜         |
| REQ-004    | ⬜          | ⬜       | ⬜      | ⬜      | ⬜   | ⬜   | ⬜      | ⬜     | ⬜         |
| REQ-005    | ⬜          | ⬜       | ⬜      | ⬜      | ⬜   | ⬜   | ⬜      | ⬜     | ⬜         |

**Legend**:
- ⬜ Not tested
- ✅ Passes
- ❌ Fails
- ⚠️ Partial

---

## Enforcement

### Pre-Deployment Checklist

Before merging any template changes:

1. ✅ All CRITICAL requirements pass manual testing
2. ✅ Template tested with sample data (see `cv-builder-test.md`)
3. ✅ No TypeScript errors
4. ✅ No console errors during rendering
5. ✅ Tested on both min/max spacing configurations
6. ✅ Tested with sections toggled on/off

### Automated Checks (Future)

Potential automated validation:
- [ ] Unit tests for config prop usage
- [ ] Visual regression tests for spacing changes
- [ ] Integration tests for section visibility

---

## References

- Manual Testing Protocol: `/cv-builder-test.md`
- Validator Utilities: `/frontend/src/lib/template-validator.ts`
- Implementation Guide: `.agent/workflows/cv-builder.md`
