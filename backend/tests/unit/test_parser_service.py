import pytest
from unittest.mock import Mock
from app.services.parser_service import extract_text_from_file

@pytest.mark.asyncio
async def test_extract_text_txt():
    content = b"Hello World"
    text = await extract_text_from_file(content, "test.txt")
    assert text == "Hello World"

@pytest.mark.asyncio
async def test_extract_text_pdf(mocker):
    # Mock PdfReader
    mock_reader = mocker.patch("app.services.parser_service.PdfReader")
    mock_page = Mock()
    mock_page.extract_text.return_value = "PDF Content"
    mock_instance = mock_reader.return_value
    mock_instance.pages = [mock_page]
    
    content = b"fake pdf content"
    text = await extract_text_from_file(content, "test.pdf")
    assert "PDF Content" in text

@pytest.mark.asyncio
async def test_extract_text_docx(mocker):
    # Mock Document
    mock_doc_class = mocker.patch("app.services.parser_service.Document")
    mock_para = Mock()
    mock_para.text = "DOCX Content"
    mock_instance = mock_doc_class.return_value
    mock_instance.paragraphs = [mock_para]
    
    content = b"fake docx content"
    text = await extract_text_from_file(content, "test.docx")
    assert "DOCX Content" in text

@pytest.mark.asyncio
async def test_unknown_extension():
    content = b"content"
    text = await extract_text_from_file(content, "test.xyz")
    assert text == ""
