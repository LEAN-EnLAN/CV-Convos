from fastapi.testclient import TestClient
from unittest.mock import MagicMock
from app.main import app

client = TestClient(app)

TEST_CV_DATA = {
    "personalInfo": {
        "fullName": "Juan Pérez",
        "email": "juan@example.com",
        "summary": "Dev",
    }
}


def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"
    assert "version" in response.json()


def test_root():
    response = client.get("/")
    assert response.status_code == 200


def test_optimize_cv(mocker):
    """Test optimization endpoint with mocked AI service."""
    # Mock Groq to avoid real API calls
    mock_groq = mocker.patch("app.services.ai_service.Groq")
    mock_client = mock_groq.return_value

    # Mock response structure
    mock_resp = MagicMock()
    mock_resp.choices = [
        MagicMock(
            message=MagicMock(content='{"personalInfo": {"fullName": "Juan Pérez"}}')
        )
    ]
    mock_client.chat.completions.create.return_value = mock_resp

    response = client.post("/api/optimize-cv?target=shrink", json=TEST_CV_DATA)
    assert response.status_code == 200
    assert response.json()["personalInfo"]["fullName"] == "Juan Pérez"


def test_critique_cv(mocker):
    """Test critique endpoint with mocked AI service."""
    mock_groq = mocker.patch("app.services.ai_service.Groq")
    mock_client = mock_groq.return_value

    mock_resp = MagicMock()
    mock_resp.choices = [
        MagicMock(
            message=MagicMock(
                content='{"critique": [{"id": "1", "target_field": "summary", "suggested_text": "Better summary"}]}'
            )
        )
    ]
    mock_client.chat.completions.create.return_value = mock_resp

    response = client.post("/api/critique-cv", json=TEST_CV_DATA)
    assert response.status_code == 200
    result = response.json()
    assert "critique" in result
    assert len(result["critique"]) == 1


def test_generate_cv_no_files():
    """Test generate endpoint with no files."""
    response = client.post("/api/generate-cv", files=[])
    # FastAPI usually returns 422 if required file list is missing or empty list handling depends on definition
    # The endpoint defines: files: List[UploadFile] = File(...)
    # Sending empty list might trigger 422 validation
    assert response.status_code in [400, 422]
