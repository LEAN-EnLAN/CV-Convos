from pypdf import PdfReader
from docx import Document
import io

async def parse_pdf(content: bytes) -> str:
    reader = PdfReader(io.BytesIO(content))
    text = ""
    for page in reader.pages:
        text += page.extract_text() + "\n"
    return text

async def parse_docx(content: bytes) -> str:
    doc = Document(io.BytesIO(content))
    text = ""
    for para in doc.paragraphs:
        text += para.text + "\n"
    return text

async def extract_text_from_file(file_content: bytes, filename: str) -> str:
    if filename.lower().endswith(".pdf"):
        return await parse_pdf(file_content)
    elif filename.lower().endswith(".docx"):
        return await parse_docx(file_content)
    elif filename.lower().endswith(".txt"):
        return file_content.decode("utf-8")
    else:
        return ""
