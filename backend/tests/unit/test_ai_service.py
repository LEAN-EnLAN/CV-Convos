import pytest
from unittest.mock import MagicMock
from app.services.ai_service import extract_cv_data, optimize_cv_data, critique_cv_data

@pytest.fixture
def mock_groq_response():
    def _create_response(content_str):
        mock_resp = MagicMock()
        mock_resp.choices = [
            MagicMock(message=MagicMock(content=content_str))
        ]
        return mock_resp
    return _create_response

@pytest.mark.asyncio
async def test_extract_cv_data_success(mocker, mock_groq_response):
    # Mock Groq client
    mock_groq = mocker.patch("app.services.ai_service.Groq")
    mock_client = mock_groq.return_value
    
    mock_content = '{"personalInfo": {"fullName": "John Doe"}}'
    mock_client.chat.completions.create.return_value = mock_groq_response(mock_content)
    
    result = await extract_cv_data("CV Text")
    assert result["personalInfo"]["fullName"] == "John Doe"

@pytest.mark.asyncio
async def test_extract_cv_data_empty(mocker, mock_groq_response):
    mock_groq = mocker.patch("app.services.ai_service.Groq")
    mock_client = mock_groq.return_value
    
    mock_client.chat.completions.create.return_value = mock_groq_response("")
    
    result = await extract_cv_data("CV Text")
    assert result is None

@pytest.mark.asyncio
async def test_extract_cv_data_json_error(mocker, mock_groq_response):
    mock_groq = mocker.patch("app.services.ai_service.Groq")
    mock_client = mock_groq.return_value
    
    mock_client.chat.completions.create.return_value = mock_groq_response("Invalid JSON")
    
    result = await extract_cv_data("CV Text")
    assert result is None

@pytest.mark.asyncio
async def test_optimize_cv_data(mocker, mock_groq_response):
    mock_groq = mocker.patch("app.services.ai_service.Groq")
    mock_client = mock_groq.return_value
    
    mock_content = '{"optimized": true}'
    mock_client.chat.completions.create.return_value = mock_groq_response(mock_content)
    
    result = await optimize_cv_data({"cv": "data"}, target="shrink")
    assert result["optimized"] is True

@pytest.mark.asyncio
async def test_critique_cv_data(mocker, mock_groq_response):
    mock_groq = mocker.patch("app.services.ai_service.Groq")
    mock_client = mock_groq.return_value
    
    mock_content = '{"critique": []}'
    mock_client.chat.completions.create.return_value = mock_groq_response(mock_content)
    
    result = await critique_cv_data({"cv": "data"})
    assert result["critique"] == []
