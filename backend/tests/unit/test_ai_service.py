import pytest
from unittest.mock import MagicMock
from app.services.ai_service import (
    extract_cv_data,
    optimize_cv_data,
    critique_cv_data,
    optimize_for_role,
    generate_linkedin_post,
    generate_cover_letter,
    analyze_ats,
)


@pytest.fixture
def mock_groq_response():
    def _create_response(content_str):
        mock_resp = MagicMock()
        mock_resp.choices = [MagicMock(message=MagicMock(content=content_str))]
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

    mock_client.chat.completions.create.return_value = mock_groq_response(
        "Invalid JSON"
    )

    result = await extract_cv_data("CV Text")
    assert result is None


@pytest.mark.asyncio
async def test_optimize_cv_data(mocker, mock_groq_response):
    mock_groq = mocker.patch("app.services.ai_service.Groq")
    mock_client = mock_groq.return_value

    # Test with one_page target which returns full CV
    mock_content = '{"personalInfo": {"fullName": "John Doe"}, "experience": []}'
    mock_client.chat.completions.create.return_value = mock_groq_response(mock_content)

    result = await optimize_cv_data({"cv": "data"}, target="one_page", section="all")
    assert result["personalInfo"]["fullName"] == "John Doe"


@pytest.mark.asyncio
async def test_critique_cv_data(mocker, mock_groq_response):
    mock_groq = mocker.patch("app.services.ai_service.Groq")
    mock_client = mock_groq.return_value

    mock_content = '{"critique": []}'
    mock_client.chat.completions.create.return_value = mock_groq_response(mock_content)

    result = await critique_cv_data({"cv": "data"})
    assert result["critique"] == []


@pytest.mark.asyncio
async def test_optimize_for_role(mocker, mock_groq_response):
    mock_groq = mocker.patch("app.services.ai_service.Groq")
    mock_client = mock_groq.return_value

    mock_content = '{"personalInfo": {"fullName": "John Doe"}, "experience": []}'
    mock_client.chat.completions.create.return_value = mock_groq_response(mock_content)

    result = await optimize_for_role({"cv": "data"}, "Software Engineer")
    assert result["personalInfo"]["fullName"] == "John Doe"


@pytest.mark.asyncio
async def test_generate_linkedin_post(mocker, mock_groq_response):
    mock_groq = mocker.patch("app.services.ai_service.Groq")
    mock_client = mock_groq.return_value

    mock_content = '{"post_content": "Hello LinkedIn!"}'
    mock_client.chat.completions.create.return_value = mock_groq_response(mock_content)

    result = await generate_linkedin_post({"cv": "data"})
    assert result["post_content"] == "Hello LinkedIn!"


@pytest.mark.asyncio
async def test_generate_cover_letter(mocker, mock_groq_response):
    mock_groq = mocker.patch("app.services.ai_service.Groq")
    mock_client = mock_groq.return_value

    mock_content = '{"opening": "Dear Hiring Manager", "body": "I am writing to apply...", "closing": "Sincerely", "signature": "John Doe"}'
    mock_client.chat.completions.create.return_value = mock_groq_response(mock_content)

    result = await generate_cover_letter(
        {"cv": "data"},
        "Tech Corp",
        "Hiring Manager",
        "Software Engineer position",
        "formal",
    )
    assert result["opening"] == "Dear Hiring Manager"


@pytest.mark.asyncio
async def test_analyze_ats(mocker, mock_groq_response):
    mock_groq = mocker.patch("app.services.ai_service.Groq")
    mock_client = mock_groq.return_value

    mock_content = '{"ats_score": 85, "grade": "A", "summary": "Good CV"}'
    mock_client.chat.completions.create.return_value = mock_groq_response(mock_content)

    result = await analyze_ats("CV text", "tech")
    assert result["ats_score"] == 85


@pytest.mark.asyncio
async def test_retry_mechanism(mocker, mock_groq_response):
    mock_groq = mocker.patch("app.services.ai_service.Groq")
    mock_client = mock_groq.return_value

    # Simulate first failure, then success
    mock_client.chat.completions.create.side_effect = [
        Exception("API error"),
        mock_groq_response('{"personalInfo": {"fullName": "John Doe"}}'),
    ]

    result = await extract_cv_data("CV Text")
    assert result["personalInfo"]["fullName"] == "John Doe"
    assert mock_client.chat.completions.create.call_count == 2
