# Documentation Index - CV-ConVos Backend

This directory contains comprehensive documentation for CV-ConVos Backend.

## 📚 Documentation

### Core Documentation

1. **[ARCHITECTURE.md](ARCHITECTURE.md)**
   - Project architecture and patterns
   - File organization
   - Design patterns
   - Security considerations
   - Performance optimizations

2. **[TECH_STACK.md](TECH_STACK.md)**
   - Technology stack details
   - Frameworks and libraries
   - Dependencies and versions
   - Installation and setup

3. **[API_REFERENCE.md](API_REFERENCE.md)**
   - Complete API documentation
   - All endpoints with examples
   - Request/Response models
   - Error handling
   - Usage examples in multiple languages

4. **[DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md)**
   - Getting started guide
   - Common tasks
   - Working with AI service
   - Testing strategies
   - Deployment guide
   - Best practices

## 🚀 Quick Start

### For New Developers

1. Start with [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md) for setup
2. Read [ARCHITECTURE.md](ARCHITECTURE.md) to understand the project
3. Check [API_REFERENCE.md](API_REFERENCE.md) for available endpoints
4. Review [TECH_STACK.md](TECH_STACK.md) for technology details

### For Feature Development

1. Read [ARCHITECTURE.md](ARCHITECTURE.md) for patterns
2. Check [API_REFERENCE.md](API_REFERENCE.md) for endpoint examples
3. Follow patterns in [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md)

### For AI/LLM Integration

1. Review `app/services/ai_service.py` for system prompts
2. Understand prompt engineering patterns
3. Check [ARCHITECTURE.md](ARCHITECTURE.md) for AI integration architecture
4. Test prompts thoroughly before deploying

## 📋 Key Concepts

### Tech Stack
- **Framework**: FastAPI (Python 3.11+)
- **Server**: Uvicorn (ASGI)
- **AI Provider**: Groq (Llama 3.3-70b-versatile)
- **Validation**: Pydantic
- **Testing**: Pytest

### Architecture Patterns
- **Layered Architecture**: API → Services → Core
- **Async/Await**: For all I/O operations
- **Dependency Injection**: FastAPI's built-in DI
- **Type Safety**: Python type hints + Pydantic

### AI Integration
- **Model**: Llama 3.3-70b-versatile
- **Response Format**: JSON (structured)
- **Temperature**: 0.1 (consistent outputs)
- **Prompts**: System prompts in `ai_service.py`

### API Features
- **CV Generation**: Parse files and extract CV data
- **CV Optimization**: Shrink or improve CV content
- **CV Critique**: Get AI feedback on CV
- **Role Alignment**: Optimize for specific job roles
- **ATS Analysis**: Check ATS compatibility
- **Content Generation**: LinkedIn posts, cover letters

## 🔗 Related Resources

- [Main README](../README.md)
- [CONTRIBUTING.md](../CONTRIBUTING.md)
- [FastAPI Documentation](https://fastapi.tiangolo.com)
- [Pydantic Documentation](https://docs.pydantic.dev)
- [Groq API Documentation](https://console.groq.com/docs)
- [Uvicorn Documentation](https://www.uvicorn.org)

## 📝 Documentation Standards

When adding or updating documentation:

1. **Keep it current**: Update docs when code changes
2. **Be specific**: Include code examples and exact paths
3. **Link related docs**: Cross-reference where relevant
4. **Use clear language**: Avoid jargon when possible
5. **Include examples**: Show, don't just tell

## 🤝 Contributing to Documentation

To improve documentation:

1. Make changes to relevant markdown file
2. Update table of contents if adding sections
3. Test any code examples
4. Update this index if adding new docs

## 📖 Quick Reference

### Starting the Server

```bash
# Development
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Production
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Running Tests

```bash
# All tests
pytest

# With coverage
pytest --cov=app --cov-report=html

# Specific file
pytest tests/unit/test_ai_service.py
```

### Code Quality

```bash
# Linting
ruff check app/

# Formatting
ruff format app/

# Fix issues
ruff check app/ --fix
```

### Environment Setup

```bash
# Create virtual environment
python -m venv .venv

# Activate (Linux/Mac)
source .venv/bin/activate

# Activate (Windows)
.venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Setup environment
cp .env.example .env
# Edit .env with your API keys
```

---

**Last Updated**: January 2026
