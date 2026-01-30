"""
Tests unitarios para el servicio de chat conversacional.

Este módulo prueba las funcionalidades de:
- Extracción de datos de conversaciones
- Generación de respuestas
- Análisis de puestos
- Manejo de sesiones
"""

import pytest
from datetime import datetime
from unittest.mock import patch, MagicMock
from typing import Dict, Any, List

from app.services.ai_service import (
    generate_conversation_response,
    generate_conversation_response_stream,
    extract_cv_data_from_message,
    generate_next_question,
    analyze_job_description,
    _format_chat_history,
    _calculate_completeness,
    _detect_phase_transition,
    _get_default_question,
)
from app.api.schemas import (
    ChatMessage,
    DataExtraction,
    ConversationPhase,
    JobAnalysisResponse,
    TailoringSuggestion,
)


# =============================================================================
# FIXTURES
# =============================================================================

@pytest.fixture
def sample_cv_data() -> Dict[str, Any]:
    """Datos de CV de ejemplo para testing."""
    return {
        "personalInfo": {
            "fullName": "Juan Pérez",
            "email": "juan@example.com",
            "phone": "+54 11 1234-5678",
            "location": "Buenos Aires, Argentina",
            "summary": "Desarrollador Full Stack con 5 años de experiencia",
        },
        "experience": [
            {
                "company": "TechCorp",
                "position": "Senior Developer",
                "startDate": "2020-01",
                "endDate": "Present",
                "current": True,
                "description": "Desarrollo de aplicaciones web con React y Node.js",
                "highlights": ["Lideré equipo de 5 desarrolladores", "Reduje tiempo de carga en 40%"],
            }
        ],
        "education": [
            {
                "institution": "Universidad de Buenos Aires",
                "degree": "Licenciatura",
                "fieldOfStudy": "Ciencias de la Computación",
                "startDate": "2015-03",
                "endDate": "2019-12",
            }
        ],
        "skills": [
            {"name": "React", "level": "Advanced", "category": "Frontend"},
            {"name": "Node.js", "level": "Advanced", "category": "Backend"},
            {"name": "Python", "level": "Intermediate", "category": "Backend"},
        ],
    }


@pytest.fixture
def sample_chat_history() -> List[ChatMessage]:
    """Historial de chat de ejemplo."""
    return [
        ChatMessage(
            id="msg_1",
            role="assistant",
            content="¡Hola! Soy tu asistente para crear CV. ¿Cómo te llamas?",
            timestamp=datetime.utcnow(),
        ),
        ChatMessage(
            id="msg_2",
            role="user",
            content="Me llamo Juan Pérez",
            timestamp=datetime.utcnow(),
        ),
    ]


@pytest.fixture
def mock_groq_response():
    """Mock de respuesta de Groq API."""
    return {
        "response": "¡Mucho gusto, Juan! ¿Cuál es tu correo electrónico?",
        "content": "¡Mucho gusto, Juan! ¿Cuál es tu correo electrónico?",
    }


# =============================================================================
# TESTS: FORMATTING HELPERS
# =============================================================================

class TestFormattingHelpers:
    """Tests para funciones auxiliares de formateo."""

    def test_format_chat_history(self, sample_chat_history):
        """Test de formateo de historial de chat."""
        formatted = _format_chat_history(sample_chat_history)

        assert "Asistente:" in formatted
        assert "Usuario:" in formatted
        assert "Juan Pérez" in formatted
        assert "asistente para crear CV" in formatted

    def test_format_chat_history_empty(self):
        """Test de formateo con historial vacío."""
        formatted = _format_chat_history([])
        assert formatted == ""

    def test_calculate_completeness_full(self, sample_cv_data):
        """Test de cálculo de completitud con datos completos."""
        completeness = _calculate_completeness(
            sample_cv_data, ConversationPhase.PERSONAL_INFO
        )

        assert completeness["overall"] > 0.5
        assert completeness["personal_info"] == 1.0
        assert completeness["experience"] == 1.0
        assert completeness["education"] == 1.0
        assert completeness["skills"] == 1.0

    def test_calculate_completeness_empty(self):
        """Test de cálculo de completitud sin datos."""
        completeness = _calculate_completeness({}, ConversationPhase.WELCOME)

        assert completeness["overall"] == 0.0
        assert completeness["personal_info"] == 0.0
        assert completeness["experience"] == 0.0

    def test_calculate_completeness_partial(self):
        """Test de cálculo de completitud con datos parciales."""
        cv_data = {
            "personalInfo": {"fullName": "Juan", "email": ""},
            "experience": [],
            "skills": [{"name": "Python"}],
        }
        completeness = _calculate_completeness(cv_data, ConversationPhase.PERSONAL_INFO)

        assert 0 < completeness["personal_info"] < 1
        assert completeness["experience"] == 0.0
        assert completeness["skills"] < 1.0


# =============================================================================
# TESTS: PHASE DETECTION
# =============================================================================

class TestPhaseDetection:
    """Tests para detección de transiciones de fase."""

    def test_detect_phase_transition_welcome_to_personal(self):
        """Test transición de welcome a personal_info."""
        # Datos completos para todas las secciones para que el overall >= 0.8
        cv_data = {
            "personalInfo": {"fullName": "Juan Pérez", "email": "juan@test.com"},
            "experience": [{"company": "TechCorp", "position": "Dev"}],
            "education": [{"institution": "UBA", "degree": "Lic"}],
            "skills": [{"name": "Python"}, {"name": "React"}, {"name": "Node"}],
        }

        new_phase = _detect_phase_transition(
            "Soy Juan Pérez",
            "¡Mucho gusto! ¿Cuál es tu email?",
            ConversationPhase.WELCOME,
            cv_data,
        )

        # Con datos completos (overall >= 0.8), debería avanzar
        assert new_phase is not None

    def test_detect_phase_transition_no_change(self):
        """Test que no hay transición cuando faltan datos."""
        cv_data = {"personalInfo": {"fullName": "Juan Pérez"}}  # Falta email

        new_phase = _detect_phase_transition(
            "Soy Juan",
            "¡Mucho gusto!",
            ConversationPhase.PERSONAL_INFO,
            cv_data,
        )

        # No debería cambiar de fase
        assert new_phase is None

    def test_get_default_question_welcome(self):
        """Test pregunta por defecto en fase welcome."""
        question = _get_default_question(ConversationPhase.WELCOME)
        assert "Hola" in question or "llamas" in question

    def test_get_default_question_experience(self):
        """Test pregunta por defecto en fase experience."""
        question = _get_default_question(ConversationPhase.EXPERIENCE)
        assert "trabajado" in question or "experiencia" in question.lower()

    def test_get_default_question_skills(self):
        """Test pregunta por defecto en fase skills."""
        question = _get_default_question(ConversationPhase.SKILLS)
        assert "habilidades" in question.lower() or "skills" in question.lower()


# =============================================================================
# TESTS: CONVERSATION RESPONSE
# =============================================================================

@pytest.mark.asyncio
class TestConversationResponse:
    """Tests para generación de respuestas conversacionales."""

    @patch("app.services.ai_service.get_ai_completion")
    @patch("app.services.ai_service.settings")
    async def test_generate_conversation_response_success(
        self, mock_settings, mock_get_ai_completion, sample_chat_history, sample_cv_data
    ):
        """Test respuesta conversacional exitosa."""
        mock_settings.GROQ_API_KEY = "test_key"
        mock_get_ai_completion.return_value = {
            "response": "¡Perfecto! ¿Cuál es tu email?"
        }

        result = await generate_conversation_response(
            message="Me llamo Juan",
            history=sample_chat_history,
            cv_data=sample_cv_data,
            current_phase=ConversationPhase.PERSONAL_INFO,
        )

        assert "response" in result
        assert "email" in result["response"].lower() or "correo" in result["response"].lower()
        mock_get_ai_completion.assert_called_once()

    @patch("app.services.ai_service.settings")
    async def test_generate_conversation_response_no_api_key(
        self, mock_settings, sample_chat_history, sample_cv_data
    ):
        """Test respuesta cuando no hay API key configurada."""
        mock_settings.GROQ_API_KEY = "placeholder_key"

        result = await generate_conversation_response(
            message="Hola",
            history=sample_chat_history,
            cv_data=sample_cv_data,
            current_phase=ConversationPhase.WELCOME,
        )

        assert "response" in result
        assert "no está disponible" in result["response"].lower() or "not available" in result["response"].lower()

    @patch("app.services.ai_service.get_ai_completion")
    @patch("app.services.ai_service.settings")
    async def test_generate_conversation_response_error(
        self, mock_settings, mock_get_ai_completion, sample_chat_history, sample_cv_data
    ):
        """Test manejo de error en respuesta conversacional."""
        mock_settings.GROQ_API_KEY = "test_key"
        mock_get_ai_completion.return_value = None

        result = await generate_conversation_response(
            message="Hola",
            history=sample_chat_history,
            cv_data=sample_cv_data,
            current_phase=ConversationPhase.WELCOME,
        )

        assert "response" in result
        assert "problema" in result["response"].lower() or "sorry" in result["response"].lower()


# =============================================================================
# TESTS: DATA EXTRACTION
# =============================================================================

@pytest.mark.asyncio
class TestDataExtraction:
    """Tests para extracción de datos de mensajes."""

    @patch("app.services.ai_service.get_ai_completion")
    @patch("app.services.ai_service.settings")
    async def test_extract_cv_data_from_message_success(
        self, mock_settings, mock_get_ai_completion, sample_chat_history
    ):
        """Test extracción exitosa de datos."""
        mock_settings.GROQ_API_KEY = "test_key"
        mock_get_ai_completion.return_value = {
            "extracted": {
                "personalInfo": {"fullName": "Juan Pérez", "email": "juan@test.com"}
            },
            "confidence": {"fullName": 0.95, "email": 0.9},
            "needs_clarification": [],
            "follow_up_questions": [],
        }

        result = await extract_cv_data_from_message(
            message="Me llamo Juan Pérez y mi email es juan@test.com",
            history=sample_chat_history,
            cv_data={},
            current_phase=ConversationPhase.PERSONAL_INFO,
        )

        assert result is not None
        assert "personalInfo" in result.extracted
        assert result.extracted["personalInfo"]["fullName"] == "Juan Pérez"
        assert result.confidence["fullName"] == 0.95

    @patch("app.services.ai_service.settings")
    async def test_extract_cv_data_no_api_key(self, mock_settings, sample_chat_history):
        """Test extracción sin API key."""
        mock_settings.GROQ_API_KEY = "placeholder_key"

        result = await extract_cv_data_from_message(
            message="Me llamo Juan",
            history=sample_chat_history,
            cv_data={},
            current_phase=ConversationPhase.PERSONAL_INFO,
        )

        assert result is None

    @patch("app.services.ai_service.get_ai_completion")
    @patch("app.services.ai_service.settings")
    async def test_extract_cv_data_invalid_json(
        self, mock_settings, mock_get_ai_completion, sample_chat_history
    ):
        """Test manejo de respuesta JSON inválida."""
        mock_settings.GROQ_API_KEY = "test_key"
        mock_get_ai_completion.return_value = "not valid json"

        result = await extract_cv_data_from_message(
            message="Me llamo Juan",
            history=sample_chat_history,
            cv_data={},
            current_phase=ConversationPhase.PERSONAL_INFO,
        )

        assert result is None


# =============================================================================
# TESTS: NEXT QUESTION GENERATION
# =============================================================================

@pytest.mark.asyncio
class TestNextQuestionGeneration:
    """Tests para generación de próximas preguntas."""

    @patch("app.services.ai_service.get_ai_completion")
    @patch("app.services.ai_service.settings")
    async def test_generate_next_question_success(
        self, mock_settings, mock_get_ai_completion, sample_cv_data
    ):
        """Test generación exitosa de siguiente pregunta."""
        mock_settings.GROQ_API_KEY = "test_key"
        mock_get_ai_completion.return_value = {
            "next_question": "¿Cuál es tu número de teléfono?",
            "target_phase": "personal_info",
            "priority": "high",
            "suggested_answers": [],
        }

        result = await generate_next_question(
            cv_data=sample_cv_data,
            current_phase=ConversationPhase.PERSONAL_INFO,
            history=[],
        )

        assert "next_question" in result
        assert "teléfono" in result["next_question"].lower() or "phone" in result["next_question"].lower()
        assert result["priority"] == "high"

    @patch("app.services.ai_service.settings")
    async def test_generate_next_question_no_api_key(self, mock_settings, sample_cv_data):
        """Test generación de pregunta sin API key."""
        mock_settings.GROQ_API_KEY = "placeholder_key"

        result = await generate_next_question(
            cv_data=sample_cv_data,
            current_phase=ConversationPhase.EXPERIENCE,
            history=[],
        )

        assert "next_question" in result
        assert "experiencia" in result["next_question"].lower() or "experience" in result["next_question"].lower()

    @patch("app.services.ai_service.get_ai_completion")
    @patch("app.services.ai_service.settings")
    async def test_generate_next_question_error(
        self, mock_settings, mock_get_ai_completion, sample_cv_data
    ):
        """Test manejo de error en generación de pregunta."""
        mock_settings.GROQ_API_KEY = "test_key"
        mock_get_ai_completion.return_value = None

        result = await generate_next_question(
            cv_data=sample_cv_data,
            current_phase=ConversationPhase.EDUCATION,
            history=[],
        )

        assert "next_question" in result
        # Debería retornar pregunta por defecto


# =============================================================================
# TESTS: JOB ANALYSIS
# =============================================================================

@pytest.mark.asyncio
class TestJobAnalysis:
    """Tests para análisis de descripciones de puesto."""

    @patch("app.services.ai_service.get_ai_completion")
    @patch("app.services.ai_service.settings")
    async def test_analyze_job_description_success(
        self, mock_settings, mock_get_ai_completion, sample_cv_data
    ):
        """Test análisis de puesto exitoso."""
        mock_settings.GROQ_API_KEY = "test_key"
        mock_get_ai_completion.return_value = {
            "match_score": 75,
            "key_requirements": ["React", "Node.js", "5 años de experiencia"],
            "matched_skills": ["React", "Node.js"],
            "missing_skills": ["TypeScript", "AWS"],
            "suggestions": [
                {
                    "section": "skills",
                    "current": "React, Node.js",
                    "suggested": "React, Node.js, TypeScript",
                    "reason": "El puesto requiere TypeScript",
                    "priority": "high",
                }
            ],
            "optimized_cv": sample_cv_data,
        }

        result = await analyze_job_description(
            job_description="Buscamos desarrollador React con experiencia en Node.js",
            cv_data=sample_cv_data,
        )

        assert result is not None
        assert result.match_score == 75
        assert len(result.matched_skills) == 2
        assert len(result.missing_skills) == 2
        assert len(result.suggestions) == 1
        assert result.suggestions[0].priority == "high"

    @patch("app.services.ai_service.settings")
    async def test_analyze_job_description_no_api_key(self, mock_settings, sample_cv_data):
        """Test análisis sin API key."""
        mock_settings.GROQ_API_KEY = "placeholder_key"

        result = await analyze_job_description(
            job_description="Buscamos desarrollador",
            cv_data=sample_cv_data,
        )

        assert result is None

    @patch("app.services.ai_service.get_ai_completion")
    @patch("app.services.ai_service.settings")
    async def test_analyze_job_description_invalid_response(
        self, mock_settings, mock_get_ai_completion, sample_cv_data
    ):
        """Test manejo de respuesta inválida."""
        mock_settings.GROQ_API_KEY = "test_key"
        mock_get_ai_completion.return_value = "invalid json"

        result = await analyze_job_description(
            job_description="Buscamos desarrollador",
            cv_data=sample_cv_data,
        )

        assert result is None


# =============================================================================
# TESTS: STREAMING RESPONSE
# =============================================================================

@pytest.mark.asyncio
class TestStreamingResponse:
    """Tests para respuestas en streaming."""

    @patch("app.services.ai_service.Groq")
    @patch("app.services.ai_service.settings")
    async def test_generate_conversation_response_stream(
        self, mock_settings, mock_groq_class, sample_chat_history, sample_cv_data
    ):
        """Test generación de respuesta en streaming."""
        mock_settings.GROQ_API_KEY = "test_key"

        # Mock del cliente y stream
        mock_client = MagicMock()
        mock_groq_class.return_value = mock_client

        # Crear chunks simulados
        chunks = [
            MagicMock(choices=[MagicMock(delta=MagicMock(content="¡Hola "))]),
            MagicMock(choices=[MagicMock(delta=MagicMock(content="Juan! "))]),
            MagicMock(choices=[MagicMock(delta=MagicMock(content="¿Cómo estás?"))]),
        ]
        mock_client.chat.completions.create.return_value = chunks

        events = []
        async for event in generate_conversation_response_stream(
            message="Hola",
            history=sample_chat_history,
            cv_data=sample_cv_data,
            current_phase=ConversationPhase.WELCOME,
        ):
            events.append(event)

        # Verificar que se generaron eventos
        assert len(events) > 0

        # Verificar formato SSE
        for event in events:
            assert event.startswith("data: ")

    @patch("app.services.ai_service.settings")
    async def test_streaming_no_api_key(self, mock_settings, sample_chat_history, sample_cv_data):
        """Test streaming sin API key."""
        mock_settings.GROQ_API_KEY = "placeholder_key"

        events = []
        async for event in generate_conversation_response_stream(
            message="Hola",
            history=sample_chat_history,
            cv_data=sample_cv_data,
            current_phase=ConversationPhase.WELCOME,
        ):
            events.append(event)

        assert len(events) == 1
        assert "error" in events[0]


# =============================================================================
# TESTS: EDGE CASES
# =============================================================================

class TestEdgeCases:
    """Tests para casos edge y manejo de errores."""

    def test_deep_merge_nested_dicts(self):
        """Test merge profundo de diccionarios anidados."""
        from app.api.endpoints import _deep_merge

        base = {
            "personalInfo": {"fullName": "Juan", "email": "old@email.com"},
            "skills": [{"name": "Python"}],
        }
        update = {
            "personalInfo": {"email": "new@email.com", "phone": "123456"},
            "skills": [{"name": "React"}],
        }

        result = _deep_merge(base, update)

        assert result["personalInfo"]["fullName"] == "Juan"  # Preservado
        assert result["personalInfo"]["email"] == "new@email.com"  # Actualizado
        assert result["personalInfo"]["phone"] == "123456"  # Nuevo
        assert len(result["skills"]) == 2  # Ambos skills

    def test_deep_merge_empty_update(self):
        """Test merge con update vacío."""
        from app.api.endpoints import _deep_merge

        base = {"name": "Juan", "skills": ["Python"]}
        result = _deep_merge(base, {})

        assert result == base

    def test_chat_message_creation(self):
        """Test creación de mensaje de chat."""
        msg = ChatMessage(
            id="test_1",
            role="user",
            content="Hola",
        )

        assert msg.id == "test_1"
        assert msg.role == "user"
        assert msg.content == "Hola"
        assert msg.timestamp is not None

    def test_data_extraction_creation(self):
        """Test creación de extracción de datos."""
        extraction = DataExtraction(
            extracted={"name": "Juan"},
            confidence={"name": 0.95},
            needs_clarification=["email"],
            follow_up_questions=["¿Cuál es tu email?"],
        )

        assert extraction.extracted["name"] == "Juan"
        assert extraction.confidence["name"] == 0.95
        assert "email" in extraction.needs_clarification

    def test_job_analysis_response_creation(self):
        """Test creación de respuesta de análisis de puesto."""
        suggestion = TailoringSuggestion(
            section="skills",
            current="Python",
            suggested="Python, React",
            reason="El puesto requiere React",
            priority="high",
        )

        response = JobAnalysisResponse(
            match_score=80,
            key_requirements=["React", "Node.js"],
            matched_skills=["React"],
            missing_skills=["Node.js"],
            suggestions=[suggestion],
        )

        assert response.match_score == 80
        assert len(response.suggestions) == 1
        assert response.suggestions[0].priority == "high"


# =============================================================================
# TESTS: CONVERSATION PHASES
# =============================================================================

class TestConversationPhases:
    """Tests para fases de conversación."""

    def test_conversation_phase_values(self):
        """Test valores de enum de fases."""
        assert ConversationPhase.WELCOME.value == "welcome"
        assert ConversationPhase.PERSONAL_INFO.value == "personal_info"
        assert ConversationPhase.EXPERIENCE.value == "experience"
        assert ConversationPhase.EDUCATION.value == "education"
        assert ConversationPhase.SKILLS.value == "skills"
        assert ConversationPhase.PROJECTS.value == "projects"
        assert ConversationPhase.SUMMARY.value == "summary"
        assert ConversationPhase.JOB_TAILORING.value == "job_tailoring"
        assert ConversationPhase.OPTIMIZATION.value == "optimization"
        assert ConversationPhase.REVIEW.value == "review"

    def test_default_questions_all_phases(self):
        """Test que todas las fases tienen pregunta por defecto."""
        for phase in ConversationPhase:
            question = _get_default_question(phase)
            assert question is not None
            assert len(question) > 0
            assert isinstance(question, str)


# =============================================================================
# TESTS: INTEGRATION-LIKE SCENARIOS
# =============================================================================

@pytest.mark.asyncio
class TestIntegrationScenarios:
    """Tests de escenarios integrados."""

    @patch("app.services.ai_service.get_ai_completion")
    @patch("app.services.ai_service.settings")
    async def test_full_conversation_flow(
        self, mock_settings, mock_get_ai_completion
    ):
        """Test de flujo completo de conversación."""
        mock_settings.GROQ_API_KEY = "test_key"

        # Simular respuestas del AI
        responses = [
            {"response": "¡Hola Juan! ¿Cuál es tu email?"},
            {"response": "Perfecto, ¿y tu teléfono?"},
            {"response": "Gracias. ¿Dónde has trabajado?"},
        ]
        mock_get_ai_completion.side_effect = responses

        history = []
        cv_data = {}

        # Simular conversación
        messages = [
            ("Me llamo Juan Pérez", ConversationPhase.WELCOME),
            ("juan@test.com", ConversationPhase.PERSONAL_INFO),
            ("+54 11 1234-5678", ConversationPhase.PERSONAL_INFO),
        ]

        for msg, phase in messages:
            result = await generate_conversation_response(
                message=msg,
                history=history,
                cv_data=cv_data,
                current_phase=phase,
            )

            assert "response" in result
            history.append(
                ChatMessage(
                    id=f"msg_{len(history)}",
                    role="user",
                    content=msg,
                )
            )

    @patch("app.services.ai_service.get_ai_completion")
    @patch("app.services.ai_service.settings")
    async def test_data_extraction_with_clarification(
        self, mock_settings, mock_get_ai_completion
    ):
        """Test extracción que requiere aclaración."""
        mock_settings.GROQ_API_KEY = "test_key"
        mock_get_ai_completion.return_value = {
            "extracted": {
                "personalInfo": {"fullName": "Juan"}
            },
            "confidence": {"fullName": 0.6},  # Baja confianza
            "needs_clarification": ["fullName"],
            "follow_up_questions": ["¿Cuál es tu apellido?"],
        }

        result = await extract_cv_data_from_message(
            message="Me llamo Juan",
            history=[],
            cv_data={},
            current_phase=ConversationPhase.PERSONAL_INFO,
        )

        assert result is not None
        assert "fullName" in result.needs_clarification
        assert len(result.follow_up_questions) > 0