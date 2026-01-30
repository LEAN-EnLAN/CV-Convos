# Sentinel AI Critique Redesign Plan

## Problem Analysis

### Current Issues
1. **Prompt is too permissive** - The AI gives "half-ass responses" saying resumes are perfect when they're garbage
2. **No job description comparison** - The critique doesn't compare against what recruiters actually want
3. **Vague scoring** - Single 0-100 score without section breakdowns
4. **No concrete rewrites** - Suggestions lack specific before/after examples
5. **Empty praise** - AI defaults to compliments instead of criticism

### Root Cause
The [`SENTINEL_CRITIQUE_PROMPT`](backend/app/services/ai_service.py:151) in [`ai_service.py`](backend/app/services/ai_service.py) lacks:
- Explicit evaluation rubrics
- Job description context
- Mandatory criticism requirements
- Section-by-section scoring
- Concrete rewrite examples

---

## New Architecture: "Ruthless Recruiter" Mode

### Core Philosophy
Transform the Sentinel from a "helpful assistant" into a "ruthless technical recruiter" who:
- Has seen 10,000+ resumes
- Spends 6 seconds per resume
- Rejects 95% of candidates
- Only forwards the top 5%

### Key Changes

#### 1. Job Description Input (Required)
The critique endpoint must accept a job description to compare against.

```typescript
interface CritiqueRequest {
  cv_data: CVData;
  job_description: string;  // NEW - Required
  target_role?: string;     // Optional context
}
```

#### 2. Section-by-Section Scoring (1-10 Scale)
Each CV section gets an objective score:

| Section | Weight | Criteria |
|---------|--------|----------|
| Summary | 15% | Hook quality, value proposition, length |
| Experience | 40% | Metrics, impact, relevance to job |
| Skills | 15% | Keyword match, proficiency claims |
| Education | 10% | Relevance, completeness |
| Projects | 10% | Technical depth, outcomes |
| Formatting | 10% | ATS compatibility, scannability |

#### 3. Gap Analysis Matrix
Compare CV content vs Job Requirements:

```typescript
interface GapAnalysis {
  requirement: string;           // From job description
  importance: 'must-have' | 'nice-to-have';
  found_in_cv: boolean;
  evidence?: string;             // Where it was found
  missing_evidence?: string;     // Why it's considered missing
  suggested_addition?: string;   // Concrete text to add
}
```

#### 4. Concrete Rewrite Suggestions
Every critique must include:
- **Original**: Exact text from CV
- **Problem**: Why it fails (recruiter psychology)
- **Rewrite**: Specific replacement text
- **Impact**: Expected improvement

#### 5. Anti-Praise Safeguards
The prompt must explicitly forbid:
- Generic compliments ("Good job!")
- Empty encouragement ("You're on the right track")
- Score inflation (no 80+ scores without justification)
- "No changes needed" responses

---

## New Prompt Architecture

### System Role
```
You are SENTINEL, a ruthless technical recruiter at a FAANG company.
You review 200+ resumes daily. You reject 95% of them within 6 seconds.
Your job is to find EVERY reason to reject this candidate.

RULES:
1. NEVER give compliments. Your job is criticism.
2. If you can't find 5+ critical issues, you're not looking hard enough.
3. Score 7+ only for truly exceptional content (top 5%).
4. Always suggest concrete rewrites, not vague advice.
5. Compare everything against the job description requirements.
```

### Evaluation Framework

#### Step 1: Job Requirements Extraction
Extract from job description:
- Must-have technical skills
- Years of experience required
- Key responsibilities
- Industry keywords
- Education requirements

#### Step 2: CV Section Scoring (1-10)
For each section, evaluate:
- **1-3**: Missing, irrelevant, or damaging content
- **4-5**: Present but weak, vague, or unfocused
- **6-7**: Adequate but not memorable
- **8-9**: Strong, specific, impactful
- **10**: Exceptional, top 1% quality

#### Step 3: Gap Analysis
Map each job requirement to CV evidence:
- Green: Explicitly demonstrated
- Yellow: Implied but not clear
- Red: Missing or insufficient

#### Step 4: Rewrite Generation
For each red/yellow gap, generate:
- Specific text to add/modify
- Where to place it
- Why it matters to recruiters

---

## API Changes

### Backend

#### Updated Endpoint
```python
@router.post("/critique-cv", response_model=CritiqueResponse)
async def critique_cv(
    request: Request,
    cv_data: CVDataInput,
    job_description: str = Body(..., description="Job description to compare against"),
    target_role: Optional[str] = Body(None)
):
    """
    Ruthless CV critique against job requirements.
    
    Returns:
    - Section scores (1-10)
    - Gap analysis vs job requirements
    - Concrete rewrite suggestions
    - Overall hire/no-hire verdict
    """
```

#### New Response Schema
```python
class SectionScore(BaseModel):
    section: str  # "summary", "experience", etc.
    score: int  # 1-10
    weight: float  # For weighted average
    issues: List[str]  # Specific problems found
    rewrite_suggestions: List[RewriteSuggestion]

class GapAnalysisItem(BaseModel):
    requirement: str
    importance: Literal["must-have", "nice-to-have"]
    status: Literal["met", "partial", "missing"]
    evidence: Optional[str]
    suggestion: Optional[str]

class CritiqueResponse(BaseModel):
    overall_score: int  # 0-100 (weighted average)
    hire_verdict: Literal["strong-yes", "yes", "maybe", "no", "strong-no"]
    recruiter_scan_time: str  # e.g., "6 seconds - rejected"
    section_scores: List[SectionScore]
    gap_analysis: List[GapAnalysisItem]
    top_3_fixes: List[str]  # Highest impact changes
    full_critique: List[ImprovementCard]
```

### Frontend

#### Updated CritiqueModal
- Display section scores as radar chart or progress bars
- Show gap analysis as traffic light indicators
- Highlight top 3 fixes prominently
- Display rewrites in diff view (before/after)

---

## Implementation Plan

### Phase 1: Backend Core (Priority: High)
1. Update [`CritiqueResponse`](backend/app/api/schemas.py) schema
2. Rewrite [`SENTINEL_CRITIQUE_PROMPT`](backend/app/services/ai_service.py:151)
3. Add job description parameter to endpoint
4. Implement section scoring logic
5. Add response validation (ensure criticism exists)

### Phase 2: Frontend Updates (Priority: High)
1. Update [`CritiqueModal.tsx`](frontend/src/components/cv-builder/CritiqueModal.tsx) UI
2. Add job description input to critique flow
3. Display new scoring visualization
4. Show gap analysis matrix
5. Implement diff view for rewrites

### Phase 3: Testing & Refinement (Priority: Medium)
1. Test with intentionally bad resumes
2. Verify AI returns critical feedback
3. Tune scoring weights
4. Validate rewrite quality

---

## Success Metrics

- **AI returns 5+ critical issues** for any non-perfect resume
- **No empty praise** in responses
- **Concrete rewrites** for every major issue
- **Section scores** align with recruiter judgment
- **Gap analysis** correctly identifies missing requirements

---

## Example Output

### Input: Garbage Resume + Senior Dev Job

### Output:
```json
{
  "overall_score": 34,
  "hire_verdict": "strong-no",
  "recruiter_scan_time": "4 seconds - rejected",
  "section_scores": [
    {
      "section": "summary",
      "score": 2,
      "weight": 0.15,
      "issues": [
        "Generic 'hardworking professional' fluff",
        "No years of experience mentioned",
        "No specific technologies listed"
      ],
      "rewrite_suggestions": [...]
    },
    {
      "section": "experience",
      "score": 3,
      "weight": 0.40,
      "issues": [
        "Zero metrics or quantified achievements",
        "Responsibilities listed, not impact",
        "No mention of team size or scope"
      ],
      "rewrite_suggestions": [...]
    }
  ],
  "gap_analysis": [
    {
      "requirement": "5+ years React experience",
      "importance": "must-have",
      "status": "missing",
      "suggestion": "Add React projects with specific outcomes"
    }
  ],
  "top_3_fixes": [
    "Add quantified metrics to every bullet point",
    "Rewrite summary with specific tech stack and years",
    "Add missing React experience evidence"
  ]
}
```
