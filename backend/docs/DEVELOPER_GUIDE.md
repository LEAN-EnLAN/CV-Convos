# Developer Guide - CV-ConVos Backend

## Getting Started

### Prerequisites

```bash
python --version   # >= 3.11
pip --version     # >= 20.0
```

### Installation

1. **Clone repository**:
```bash
git clone https://github.com/your-org/cv-convos.git
cd cv-convos/backend
```

2. **Create virtual environment**:
```bash
python -m venv .venv

# Activate (Linux/Mac)
source .venv/bin/activate

# Activate (Windows)
.venv\Scripts\activate
```

3. **Install dependencies**:
```bash
pip install -r requirements.txt
```

4. **Configure environment**:
```bash
cp .env.example .env
# Edit .env and add your GROQ_API_KEY
```

5. **Start development server**:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

6. **Access API**:
```
http://localhost:8000/docs    # Swagger UI
http://localhost:8000/redoc   # ReDoc
```

## Project Structure

```
backend/
├── app/
│   ├── main.py                      # FastAPI entry point
│   ├── api/
│   │   ├── endpoints.py             # API routes
│   │   └── schemas.py             # Pydantic models
│   ├── core/
│   │   ├── config.py                # Configuration
│   │   └── logging.py              # Logging setup
│   └── services/
│       ├── ai_service.py            # AI integration
│       └── parser_service.py        # File parsing
├── tests/
│   ├── conftest.py                 # Pytest fixtures
│   ├── integration/                # Integration tests
│   └── unit/                      # Unit tests
├── docs/                          # Documentation
├── .env                           # Environment variables
├── .env.example                   # Environment template
├── requirements.txt                # Dependencies
├── Dockerfile                     # Docker config
└── run.sh                        # Development script
```

## Common Tasks

### Adding a New Endpoint

1. **Define Pydantic models** (in `app/api/schemas.py`):
```python
from pydantic import BaseModel

class MyRequest(BaseModel):
    param1: str
    param2: int

class MyResponse(BaseModel):
    result: str
```

2. **Create service function** (in `app/services/my_service.py`):
```python
import logging

logger = logging.getLogger(__name__)

async def my_service_function(param1: str, param2: int) -> dict:
    logger.info(f"Processing with {param1}, {param2}")
    # Business logic here
    return {"result": "success"}
```

3. **Add endpoint** (in `app/api/endpoints.py`):
```python
from fastapi import APIRouter
from app.services.my_service import my_service_function
from app.api.schemas import MyRequest, MyResponse

router = APIRouter()

@router.post("/my-endpoint", response_model=MyResponse)
async def my_endpoint(request: MyRequest):
    result = await my_service_function(request.param1, request.param2)
    return MyResponse(**result)
```

### Creating a New Service

1. **Create service file**:
```python
# app/services/my_service.py
import logging

logger = logging.getLogger(__name__)

async def my_function(param: str) -> str:
    """Process data and return result."""
    logger.info(f"Processing: {param}")
    try:
        # Your logic here
        result = param.upper()
        return result
    except Exception as e:
        logger.error(f"Error processing: {str(e)}", exc_info=True)
        raise
```

2. **Import and use**:
```python
from app.services.my_service import my_function

@router.post("/endpoint")
async def endpoint():
    result = await my_function("test")
    return {"result": result}
```

### Modifying AI Prompts

System prompts are in `app/services/ai_service.py`:

```python
SYSTEM_RULES = """
You are a TECHNICAL RESUME COMPILER.
- IDENTITY LOCK: Never change candidate's Name, Email
- NO HALLUCINATIONS: Do not invent metrics
- LANGUAGE LOYALTY: Match input language
"""

MY_PROMPT = """
Task: Your task description here.
Input: {text}
"""
```

**Best practices**:
- Keep prompts clear and specific
- Use placeholders for dynamic content: `{variable}`
- Test prompts with various inputs
- Document what each prompt does

### Working with Configuration

Configuration is in `app/core/config.py`:

```python
from app.core.config import settings

# Access configuration
api_key = settings.GROQ_API_KEY
debug_mode = settings.DEBUG

# Use in code
if settings.DEBUG:
    logger.info("Debug mode enabled")
```

**Add new config variable**:
```python
class Settings(BaseSettings):
    GROQ_API_KEY: str
    NEW_VAR: str = "default_value"

    model_config = SettingsConfigDict(
        env_file=".env",
        extra='ignore'
    )
```

### Adding File Support

1. **Add parser function** (in `app/services/parser_service.py`):
```python
async def parse_new_format(content: bytes) -> str:
    """Parse new file format."""
    # Implementation
    return text
```

2. **Update routing**:
```python
async def extract_text_from_file(file_content: bytes, filename: str) -> str:
    if filename.lower().endswith(".newformat"):
        return await parse_new_format(file_content)
    elif filename.lower().endswith(".pdf"):
        return await parse_pdf(file_content)
    # ...
```

## Working with AI Service

### Basic AI Call

```python
from app.services.ai_service import get_ai_completion

async def my_ai_function(text: str) -> dict:
    prompt = f"""
    Process this text: {text}
    Return JSON format.
    """

    result = await get_ai_completion(prompt)
    return result
```

### Using System Prompts

```python
from app.services.ai_service import SYSTEM_RULES, get_ai_completion

async def my_ai_function(text: str) -> dict:
    prompt = f"Process: {text}"
    result = await get_ai_completion(prompt, SYSTEM_RULES)
    return result
```

### Error Handling

```python
from app.services.ai_service import get_ai_completion
from fastapi import HTTPException

async def safe_ai_call(prompt: str) -> dict:
    result = await get_ai_completion(prompt)
    if not result:
        raise HTTPException(status_code=500, detail="AI processing failed")
    return result
```

## Testing

### Writing Unit Tests

Create test file in `tests/unit/`:

```python
import pytest
from app.services.my_service import my_function

@pytest.mark.asyncio
async def test_my_function():
    result = await my_function("test")
    assert result == "TEST"
```

### Writing Integration Tests

Create test file in `tests/integration/`:

```python
import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_endpoint():
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post("/api/my-endpoint", json={
            "param1": "test",
            "param2": 123
        })
        assert response.status_code == 200
        assert "result" in response.json()
```

### File Upload Tests

```python
import pytest
from io import BytesIO

@pytest.mark.asyncio
async def test_file_upload():
    file_content = b"test content"
    file = BytesIO(file_content)
    file.name = "test.txt"

    files = {"files": (file.name, file, "text/plain")}
    response = await client.post("/api/generate-cv", files=files)
    assert response.status_code == 200
```

### Running Tests

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test file
pytest tests/unit/test_my_service.py

# Run specific test
pytest tests/unit/test_my_service.py::test_my_function

# Run with verbose output
pytest -v

# Run async tests
pytest -v --asyncio-mode=auto
```

### Fixtures (conftest.py)

```python
import pytest
from fastapi.testclient import TestClient

@pytest.fixture
def client():
    from app.main import app
    return TestClient(app)

@pytest.fixture
def sample_cv_data():
    return {
        "personalInfo": {
            "fullName": "Test User",
            "email": "test@example.com"
        },
        "experience": [],
        "education": [],
        "skills": []
    }
```

## Debugging

### Logging

```python
import logging

logger = logging.getLogger(__name__)

@router.post("/endpoint")
async def endpoint():
    logger.info("Processing request")
    logger.debug(f"Debug info: {data}")
    logger.error("Error occurred", exc_info=True)
```

### Using Python Debugger

```python
import pdb

@router.post("/endpoint")
async def endpoint():
    pdb.set_trace()  # Breakpoint
    # Continue execution
```

### Debugging AI Responses

```python
async def debug_ai(prompt: str):
    result = await get_ai_completion(prompt)
    print(f"Prompt: {prompt}")
    print(f"Result: {result}")
    return result
```

## Code Quality

### Running Linter

```bash
# Check code
ruff check app/

# Format code
ruff format app/

# Fix issues
ruff check app/ --fix
```

### Type Hints

```python
# Always use type hints
def my_function(param: str) -> str:
    return param.upper()

async def async_function(data: dict) -> dict:
    return {"result": data}
```

### Docstrings

```python
async def my_function(param: str) -> dict:
    """
    Process the input parameter.

    Args:
        param: The input string to process.

    Returns:
        dict: Processed result.

    Raises:
        ValueError: If param is empty.
    """
    if not param:
        raise ValueError("Param cannot be empty")
    return {"result": param.upper()}
```

## Deployment

### Docker

**Build image**:
```bash
docker build -t cv-convos-backend .
```

**Run container**:
```bash
docker run -p 8000:8000 --env-file .env cv-convos-backend
```

### Railway

```bash
# Install CLI
npm install -g @railway/cli

# Login
railway login

# Deploy
railway up
```

### Render

1. Push to GitHub
2. Connect repository to Render
3. Add environment variables:
   - `GROQ_API_KEY`
   - `CORS_ORIGINS`
   - `DEBUG=False`

### Environment Variables

**Production**:
```env
GROQ_API_KEY=gsk_...
DEBUG=False
CORS_ORIGINS=https://your-domain.com
```

**Development**:
```env
GROQ_API_KEY=gsk_...
DEBUG=True
CORS_ORIGINS=http://localhost:3000
```

## Common Issues

### Import Errors

```bash
# Reinstall dependencies
pip install -r requirements.txt

# Check virtual environment is activated
which python
```

### Module Not Found

```bash
# Check PYTHONPATH
export PYTHONPATH="${PYTHONPATH}:$(pwd)"
```

### API Key Issues

```bash
# Check .env file
cat .env

# Verify variable name
echo $GROQ_API_KEY
```

### CORS Errors

```python
# Check CORS configuration in main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### AI Rate Limits

Implement retry logic:

```python
import asyncio

async def retry_ai_call(prompt: str, max_retries=3):
    for attempt in range(max_retries):
        try:
            return await get_ai_completion(prompt)
        except Exception as e:
            if attempt == max_retries - 1:
                raise
            await asyncio.sleep(2 ** attempt)  # Exponential backoff
```

## Best Practices

1. **Async/Await**: Always use async for I/O operations
2. **Error Handling**: Implement proper exception handling
3. **Logging**: Use structured logging
4. **Type Hints**: Add type hints to all functions
5. **Validation**: Use Pydantic for data validation
6. **Tests**: Write tests for new features
7. **Documentation**: Update docstrings
8. **Environment**: Never commit `.env` file
9. **Security**: Never log sensitive data (API keys)
10. **Code Quality**: Run linter before committing

## Keyboard Shortcuts

### VS Code

- `Cmd/Ctrl + P`: Quick open
- `Cmd/Ctrl + Shift + F`: Search files
- `F5`: Debug
- `Cmd/Ctrl + /`: Toggle comment

### Terminal

```bash
# Development server
uvicorn app.main:app --reload

# Run tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Linting
ruff check app/
ruff format app/
```

## Useful Resources

- **FastAPI Docs**: https://fastapi.tiangolo.com
- **Pydantic Docs**: https://docs.pydantic.dev
- **Groq Docs**: https://console.groq.com/docs
- **Pytest Docs**: https://docs.pytest.org
- **Python Async**: https://docs.python.org/3/library/asyncio.html

## Next Steps

1. Read through documentation in `docs/`
2. Explore codebase, especially `app/services/`
3. Try adding a small feature
4. Write tests for your changes
5. Run tests and linter
6. Ask questions in team chat

---

Happy coding! 🚀
