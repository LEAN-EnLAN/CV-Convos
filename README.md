# CV-ConVos

[![Version](https://img.shields.io/badge/version-1.0-blue.svg)](https://github.com/your-repo/cv-convos)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Status](https://img.shields.io/badge/status-MVP%20Complete-green.svg)]()

AI-powered CV constructor that transforms existing documents (PDF, DOCX, TXT) into professional, ATS-friendly resumes using Large Language Models (Groq's Llama 3.3-70b).

## What's New in v1.0

- **MVP Complete**: Full core functionality implemented including AI-powered extraction, real-time editor, and PDF export.
- **AI-Powered Extraction**: Multi-file upload with text extraction and STAR methodology structuring.
- **Real-Time Editor & Preview**: Dynamic updates with template switching (Modern/Professional) and A4 layout management.
- **Advanced AI Optimization**: "Magic Shrink" (30-40% content synthesis) and "Improve Content" features.
- **Native Export**: High-fidelity PDF generation using window.print() and CSS print media queries.
- **Privacy-First**: No mandatory user registration or long-term data storage.

## Features

- ✅ **AI-Powered Extraction**: Upload multiple files (PDF, DOCX, TXT) for intelligent text extraction and CV structuring using STAR methodology.
- ✅ **Real-Time Editor & Preview**: Live editing with instant preview, supporting full CRUD operations for personal info, experience, education, skills, and projects.
- ✅ **Template System**: Two high-quality base templates (Modern and Professional) with A4 layout management.
- ✅ **Advanced AI Optimization**: "Magic Shrink" for content synthesis and "Improve Content" for enhanced writing.
- ✅ **Native PDF Export**: High-fidelity PDF generation directly in the browser.
- ✅ **Privacy-First Design**: Anonymous usage with no data storage requirements.

## Tech Stack

### Frontend
- **Next.js 15+** (App Router)
- **React 19**
- **TypeScript 5.x**
- **Tailwind CSS 4**
- **Shadcn UI** (Radix UI components)
- **Lucide React** (Icons)
- **Sonner** (Toasts)
- **React-Dropzone** (File uploads)

### Backend
- **FastAPI** (Python)
- **Groq** (Llama 3.3-70b-versatile)
- **PyPDF2, python-docx** (Document parsing)
- **Pydantic / Pydantic Settings** (Configuration)

## Installation

### Prerequisites
- Node.js 18+ (for frontend)
- Python 3.8+ (for backend)
- Groq API key (sign up at [groq.com](https://groq.com))

### Frontend Setup
```bash
cd frontend
npm install
```

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
```

## Usage

1. **Start the Backend**:
   ```bash
   cd backend
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

2. **Start the Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```

3. **Open your browser** and navigate to `http://localhost:3000`

4. **Upload Documents**: Drag and drop PDF, DOCX, or TXT files containing your CV information.

5. **AI Processing**: The system will extract and structure your content using AI.

6. **Edit & Customize**: Use the real-time editor to modify sections, switch templates, and optimize content.

7. **Export PDF**: Generate and download your professional CV.

## Project Structure

```
/
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx (main entry)
│   │   │   ├── layout.tsx
│   │   │   └── globals.css
│   │   ├── components/
│   │   │   ├── cv-builder/
│   │   │   │   ├── Builder.tsx (workspace layer)
│   │   │   │   ├── Editor.tsx (editor component)
│   │   │   │   ├── FileUploader.tsx (uploader layer)
│   │   │   │   └── templates/
│   │   │   │       ├── ModernTemplate.tsx
│   │   │   │       └── ProfessionalTemplate.tsx
│   │   │   └── ui/ (Shadcn UI components)
│   │   └── types/
│   │       └── cv.ts (type definitions)
│   └── package.json
├── backend/
│   ├── app/
│   │   ├── main.py (FastAPI entry point)
│   │   ├── api/
│   │   │   └── endpoints.py (/generate-cv, /optimize-cv routes)
│   │   ├── core/
│   │   │   └── config.py (configuration management)
│   │   └── services/
│   │       ├── parser_service.py (document parsing)
│   │       └── ai_service.py (LLM integration)
│   └── requirements.txt
└── README.md
```

## API Endpoints

### POST `/generate-cv`
Generates a structured CV from uploaded documents using AI.

**Request Body**:
```json
{
  "files": ["base64_encoded_file1", "base64_encoded_file2"],
  "file_types": ["pdf", "docx"]
}
```

**Response**:
```json
{
  "cv_data": {
    "personal_info": {...},
    "experience": [...],
    "education": [...],
    "skills": [...],
    "projects": [...]
  }
}
```

### POST `/optimize-cv`
Optimizes existing CV content using AI (Magic Shrink or Improve Content).

**Request Body**:
```json
{
  "cv_data": {...},
  "optimization_type": "shrink" | "improve",
  "section": "experience" // optional, for section-specific optimization
}
```

**Response**:
```json
{
  "optimized_cv": {...}
}
```

## Environment Variables

### Backend (.env)
```env
GROQ_API_KEY=your_groq_api_key_here
```

## Development Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-repo/cv-convos.git
   cd cv-convos
   ```

2. **Install dependencies** (see Installation section above).

3. **Set up environment variables**:
   - Copy `backend/.env` and add your Groq API key.

4. **Run the development servers** (see Usage section).

5. **Testing**:
   - Frontend: `npm test` (if configured)
   - Backend: `pytest` (if configured)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.