# Code Conventions - CV-ConVos Backend

## General Principles

1. **Consistency**: Follow established patterns in the codebase
2. **Clarity**: Write self-documenting code
3. **Type Safety**: Use Python type hints and Pydantic
4. **Performance**: Use async/await for I/O operations
5. **Testing**: Write tests for new features

## Python Best Practices

### Type Hints

**Always use type hints**:

```python
# Good
def process_cv(data: dict) -> dict:
    return data

async def generate_cv(text: str) -> CVData:
    return CVData(**result)

# Bad
def process_cv(data):
    return data

async def generate_cv(text):
    return result
```

**Use Pydantic models for validation**:

```python
# Good
from pydantic import BaseModel, Field

class PersonalInfo(BaseModel):
    fullName: str = Field(..., max_length=100)
    email: Optional[EmailStr] = None

# Bad
class PersonalInfo:
    def __init__(self, fullName, email=None):
        self.fullName = fullName
        self.email = email
```

### Async/Await

**Use async for I/O operations**:

```python
# Good
async def process_files(files: List[UploadFile]):
    for file in files:
        content = await file.read()
        text = await extract_text(content)

# Bad - synchronous
def process_files(files: List[UploadFile]):
    for file in files:
        content = file.read()
        text = extract_text(content)
```

**Await all async calls**:

```python
# Good
result = await async_function()

# Bad - forgot await
result = async_function()
```

## Function Naming

### Snake Case

```python
# Good
def extract_text_from_file(content: bytes, filename: str) -> str:
    pass

async def generate_cv_data(text: str) -> dict:
    pass

# Bad
def extractTextFromFile(content: bytes, filename: str) -> str:
    pass

async def generateCVData(text: str) -> dict:
    pass
```

### Descriptive Names

```python
# Good
async def parse_pdf_document(content: bytes) -> str:
    pass

def calculate_ats_score(cv_data: dict) -> int:
    pass

# Bad
async def parse(content: bytes) -> str:
    pass

def calculate(data: dict) -> int:
    pass
```

## Imports

### Order

1. Standard library
2. Third-party libraries
3. Local modules

```python
# Good
import json
import logging
from typing import List, Optional

import httpx
from fastapi import APIRouter, UploadFile
from groq import Groq

from app.core.config import settings
from app.services.parser_service import extract_text_from_file

# Bad - mixed order
from app.core.config import settings
import json
from fastapi import APIRouter
```

### Group Imports

```python
# Good
import json
import logging
from typing import List, Optional, Dict, Any

from fastapi import APIRouter, UploadFile, HTTPException
from pydantic import BaseModel, Field, EmailStr

from app.core.config import settings
from app.services.parser_service import extract_text_from_file

# Bad - no grouping
import json
from fastapi import APIRouter
import logging
from pydantic import BaseModel
```

## Docstrings

### Google Style Docstrings

```python
# Good
def extract_cv_data(text: str) -> dict:
    """
    Extract and structure CV data from raw text.

    Args:
        text: Raw CV text from uploaded file.

    Returns:
        dict: Structured CV data with personal info, experience, etc.

    Raises:
        ValueError: If text is empty or invalid format.

    Examples:
        >>> extract_cv_data("John Doe\\nDeveloper")
        {"personalInfo": {"fullName": "John Doe"}, ...}
    """
    if not text:
        raise ValueError("Text cannot be empty")
    # Process text
    return result

# Bad - no docstring
def extract_cv_data(text: str) -> dict:
    if not text:
        raise ValueError("Text cannot be empty")
    return result
```

### Module Docstrings

```python
"""
CV Data Extraction Service.

This module provides functions for parsing and extracting
structured data from CV documents (PDF, DOCX, TXT).
"""

from pypdf import PdfReader
from docx import Document
```

## Error Handling

### Specific Exceptions

```python
# Good
async def parse_file(content: bytes, filename: str) -> str:
    try:
        return await parse_pdf(content)
    except ValueError as e:
        logger.error(f"Invalid PDF format: {str(e)}")
        raise HTTPException(status_code=400, detail="Invalid file format")
    except Exception as e:
        logger.error(f"Parse error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to parse file")

# Bad - generic exception
async def parse_file(content: bytes, filename: str) -> str:
    try:
        return await parse_pdf(content)
    except:
        raise HTTPException(status_code=500, detail="Error")
```

### Logging Errors

```python
# Good
try:
    result = await process_data(data)
except Exception as e:
    logger.error(f"Processing failed: {str(e)}", exc_info=True)
    raise HTTPException(status_code=500, detail="Processing failed")

# Bad - no logging or error details
try:
    result = await process_data(data)
except:
    raise
```

## Pydantic Models

### Model Definition

```python
# Good
from pydantic import BaseModel, Field, EmailStr, field_validator

class PersonalInfo(BaseModel):
    fullName: str = Field(..., max_length=100, description="Full name")
    email: Optional[EmailStr] = Field(None, description="Email address")
    phone: Optional[str] = Field(None, max_length=20, description="Phone number")
    summary: Optional[str] = Field(None, max_length=500, description="Professional summary")

    @field_validator('fullName')
    @classmethod
    def name_must_not_be_empty(cls, v):
        if not v or not v.strip():
            raise ValueError('fullName cannot be empty')
        return v

# Bad - no validation or fields
class PersonalInfo(BaseModel):
    fullName: str
    email: Optional[str] = None
```

### Nested Models

```python
# Good
class Experience(BaseModel):
    company: Optional[str] = None
    position: Optional[str] = None
    startDate: Optional[str] = None
    endDate: Optional[str] = None

class CVData(BaseModel):
    personalInfo: PersonalInfo
    experience: List[Experience] = []
    education: List[Education] = []
```

## FastAPI Patterns

### Route Definition

```python
# Good
from fastapi import APIRouter, UploadFile, File, HTTPException, Query

router = APIRouter()

@router.post("/generate-cv", response_model=CVData)
async def generate_cv(
    files: List[UploadFile] = File(..., description="CV files to process")
):
    """
    Generate structured CV from uploaded files.
    """
    if not files:
        raise HTTPException(status_code=400, detail="No files uploaded")

    result = await process_files(files)
    return result

# Bad
@router.post("/generate-cv")
async def generate_cv(files):
    result = await process_files(files)
    return result
```

### Response Models

```python
# Good
from pydantic import BaseModel

class GenerateCVResponse(BaseModel):
    cv_data: CVData
    processing_time: float
    file_count: int

@router.post("/generate-cv", response_model=GenerateCVResponse)
async def generate_cv(files: List[UploadFile]):
    # Process files
    return GenerateCVResponse(
        cv_data=result,
        processing_time=elapsed,
        file_count=len(files)
    )
```

## Service Layer

### Separation of Concerns

```python
# Good - Service layer with business logic
# app/services/ai_service.py
async def extract_cv_data(text: str) -> dict:
    """Extract CV data using AI."""
    prompt = EXTRACT_CV_PROMPT.format(text=text)
    result = await get_ai_completion(prompt)
    return result

# app/api/endpoints.py
@router.post("/generate-cv")
async def generate_cv(files: List[UploadFile]):
    text = await extract_text_from_files(files)
    cv_data = await extract_cv_data(text)
    return cv_data

# Bad - business logic in API layer
@router.post("/generate-cv")
async def generate_cv(files: List[UploadFile]):
    text = await extract_text_from_files(files)
    # Business logic here (should be in service)
    prompt = f"Extract CV data from: {text}"
    result = await ai_call(prompt)
    return result
```

## Logging

### Structured Logging

```python
# Good
import logging

logger = logging.getLogger(__name__)

@router.post("/generate-cv")
async def generate_cv(files: List[UploadFile]):
    logger.info(f"Processing {len(files)} files")
    start_time = time.time()

    try:
        result = await process_files(files)
        elapsed = time.time() - start_time
        logger.info(f"Processed {len(files)} files in {elapsed:.2f}s")
        return result
    except Exception as e:
        logger.error(f"Failed to process files: {str(e)}", exc_info=True)
        raise

# Bad - no logging or poor logging
@router.post("/generate-cv")
async def generate_cv(files: List[UploadFile]):
    result = await process_files(files)
    return result
```

### Log Levels

```python
# Good
logger.debug("Detailed debugging info")
logger.info("Normal operation info")
logger.warning("Warning message")
logger.error("Error occurred", exc_info=True)

# Don't log sensitive data
logger.info(f"API Key: {api_key}")  # ❌ BAD
logger.info("API call initiated")       # ✅ GOOD
```

## Configuration

### Settings

```python
# Good - use settings
from app.core.config import settings

async def ai_call():
    client = Groq(api_key=settings.GROQ_API_KEY)
    return client.chat.completions.create(...)

# Bad - hardcoded values
async def ai_call():
    api_key = "gsk_..."  # ❌
    client = Groq(api_key=api_key)
    return client.chat.completions.create(...)
```

## Testing

### Test Structure

```python
# Good
import pytest
from app.services.parser_service import extract_text_from_file

@pytest.mark.asyncio
async def test_extract_from_pdf():
    """Test PDF text extraction."""
    with open("test_cv.pdf", "rb") as f:
        content = f.read()

    text = await extract_text_from_file(content, "test_cv.pdf")

    assert text is not None
    assert len(text) > 0
    assert "experience" in text.lower()

# Bad - no test structure
async def test_pdf():
    text = await extract_text_from_file(b"test", "test.pdf")
    assert text
```

### Fixtures

```python
# Good - use fixtures
@pytest.fixture
def sample_cv_data():
    return {
        "personalInfo": {
            "fullName": "Test User",
            "email": "test@example.com"
        },
        "experience": []
    }

@pytest.mark.asyncio
async def test_with_fixture(sample_cv_data):
    result = await process_cv(sample_cv_data)
    assert result is not None
```

## Code Style

### Line Length

```python
# Good - within reasonable length
result = await extract_cv_data(text)

# Bad - too long
result = await extract_cv_data(text_with_very_long_name_that_exceeds_reasonable_length)
```

### Blank Lines

```python
# Good - 2 blank lines between functions
def function_one():
    pass


def function_two():
    pass

# Bad - no separation
def function_one():
    pass
def function_two():
    pass
```

### Comments

```python
# Good - explain "why", not "what"
# Retry with exponential backoff to handle rate limits
for attempt in range(max_retries):
    try:
        return await api_call()
    except RateLimitError:
        await asyncio.sleep(2 ** attempt)

# Bad - obvious comments
# Call API
result = await api_call()

# Return result
return result
```

## Git Commits

**Conventional commits**:
```bash
# Format
<type>(<scope>): <subject>

# Examples
feat(ai): add new prompt for skill extraction
fix(parser): handle corrupt PDF files
docs(api): update endpoint documentation
test(ai): add tests for CV generation
refactor(service): extract common AI logic
```

## Code Review Checklist

- [ ] Follows Python best practices
- [ ] Uses type hints
- [ ] Has docstrings
- [ ] Handles errors properly
- [ ] Logs appropriately
- [ ] Has tests
- [ ] Tests pass
- [ ] Linting passes
- [ ] No sensitive data in logs
- [ ] Follows async/await patterns
