import pytest
from unittest.mock import AsyncMock
from fastapi.testclient import TestClient
from app.main import app
from app.api.schemas import CVInput
from app.core.exceptions import CVProcessingError, FileProcessingError, AIServiceError

client = TestClient(app)


@pytest.mark.asyncio
async def test_cv_input_validation():
    # Test valid CVInput
    valid_data = {
        "skills": ["Python", "JavaScript"],
        "experience": ["5 years development"],
    }
    cv_input = CVInput(**valid_data)
    assert cv_input.skills == ["Python", "JavaScript"]

    # Test invalid CVInput - empty skills
    with pytest.raises(ValueError):
        CVInput(skills=[], experience=["test"])

    # Test invalid CVInput - empty strings in lists
    with pytest.raises(ValueError):
        CVInput(skills=["Python", ""], experience=["test"])


def test_generate_cv_endpoint_validation(mocker):
    # Mock the extract_text_from_file to avoid file processing
    mock_extract = mocker.patch(
        "app.api.endpoints.extract_text_from_file", new_callable=AsyncMock
    )
    mock_extract.return_value = "Test CV content"

    # Mock the AI service
    mock_ai = mocker.patch("app.api.endpoints.extract_cv_data", new_callable=AsyncMock)
    mock_ai.return_value = {
        "personalInfo": {"fullName": "John Doe"},
        "experience": [],
        "education": [],
        "skills": [],
    }

    # Test with valid PDF file
    response = client.post(
        "/api/generate-cv",
        files={"files": ("test.pdf", b"PDF content", "application/pdf")},
    )
    assert response.status_code == 200
    assert response.json()["personalInfo"]["fullName"] == "John Doe"

    # Test with supported TXT file
    response = client.post(
        "/api/generate-cv", files={"files": ("test.txt", b"Text content", "text/plain")}
    )
    assert response.status_code == 200
    assert response.json()["personalInfo"]["fullName"] == "John Doe"

    # Test with unsupported file type
    response = client.post(
        "/api/generate-cv", files={"files": ("test.jpg", b"Image content", "image/jpeg")}
    )
    assert response.status_code == 400
    assert "detail" in response.json()
    assert response.json()["detail"]["error"] == "file_processing_error"

    # Test with no files
    response = client.post("/api/generate-cv")
    assert response.status_code == 422  # ValidationError uses 422
    assert "detail" in response.json()


def test_ats_check_endpoint_validation(mocker):
    # Mock the extract_text_from_file
    mock_extract = mocker.patch(
        "app.api.endpoints.extract_text_from_file", new_callable=AsyncMock
    )
    mock_extract.return_value = "Test CV content"

    # Mock the AI service
    mock_ai = mocker.patch("app.api.endpoints.analyze_ats", new_callable=AsyncMock)
    mock_ai.return_value = {
        "ats_score": 85,
        "grade": "A",
        "summary": "Good CV",
        "format_score": 90,
        "keyword_score": 80,
        "completeness_score": 85,
        "found_keywords": ["Python"],
        "missing_keywords": ["React"],
        "industry_recommendation": "tech",
        "issues": [],
        "quick_wins": [],
        "detailed_tips": "Improve keywords",
    }

    # Test with valid PDF file
    response = client.post(
        "/api/ats-check",
        files={"files": ("test.pdf", b"PDF content", "application/pdf")},
    )
    assert response.status_code == 200
    assert response.json()["ats_score"] == 85

    # Test with supported TXT file
    response = client.post(
        "/api/ats-check", files={"files": ("test.txt", b"Text content", "text/plain")}
    )
    assert response.status_code == 200
    assert response.json()["ats_score"] == 85

    # Test with unsupported file type
    response = client.post(
        "/api/ats-check", files={"files": ("test.jpg", b"Image content", "image/jpeg")}
    )
    assert response.status_code == 400
    assert "detail" in response.json()
    assert response.json()["detail"]["error"] == "file_processing_error"


@pytest.mark.asyncio
async def test_ping_endpoint():
    response = client.get("/ping")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"
    assert response.json()["message"] == "pong"


@pytest.mark.asyncio
async def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


@pytest.mark.asyncio
async def test_custom_exceptions():
    # Test CVProcessingError
    with pytest.raises(CVProcessingError) as exc_info:
        raise CVProcessingError("Test error")
    assert exc_info.value.status_code == 422
    assert exc_info.value.detail["error"] == "cv_processing_error"

    # Test FileProcessingError
    with pytest.raises(FileProcessingError) as exc_info:
        raise FileProcessingError("Test error")
    assert exc_info.value.status_code == 400
    assert exc_info.value.detail["error"] == "file_processing_error"

    # Test AIServiceError
    with pytest.raises(AIServiceError) as exc_info:
        raise AIServiceError("Test error")
    assert exc_info.value.status_code == 503
    assert exc_info.value.detail["error"] == "ai_service_error"
