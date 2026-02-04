from typing import Any, Dict

from fastapi import HTTPException, status


def build_error_detail(code: str, message: str) -> Dict[str, str]:
    """Construye un payload estándar para errores de API."""
    return {"code": code, "message": message}


def normalize_error_detail(detail: Any, status_code: int) -> Dict[str, str]:
    """Normaliza un detail variable para mantener un esquema consistente."""
    if isinstance(detail, dict):
        code = detail.get("code") or detail.get("error")
        message = detail.get("message") or detail.get("detail") or detail.get("error")
        if message:
            return {
                "code": str(code) if code else f"HTTP_{status_code}",
                "message": str(message),
            }

    if isinstance(detail, str):
        return {"code": f"HTTP_{status_code}", "message": detail}

    return {"code": f"HTTP_{status_code}", "message": "Ocurrió un error inesperado."}


class APIError(HTTPException):
    def __init__(self, status_code: int, code: str, message: str):
        super().__init__(status_code=status_code, detail=build_error_detail(code, message))


class CVProcessingError(APIError):
    def __init__(self, detail: str = "No se pudo procesar el CV."):
        super().__init__(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            code="cv_processing_error",
            message=detail,
        )


class FileProcessingError(APIError):
    def __init__(self, detail: str = "No se pudo procesar el archivo."):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            code="file_processing_error",
            message=detail,
        )


class AIServiceError(APIError):
    def __init__(self, detail: str = "El servicio de IA no está disponible."):
        super().__init__(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            code="ai_service_unavailable",
            message=detail,
        )


class ValidationError(APIError):
    def __init__(self, detail: str = "Los datos enviados no son válidos."):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            code="validation_error",
            message=detail,
        )


class RateLimitError(APIError):
    def __init__(self, detail: str = "Demasiadas solicitudes. Probá más tarde."):
        super().__init__(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            code="rate_limit_exceeded",
            message=detail,
        )


class NotFoundError(APIError):
    def __init__(self, detail: str = "Recurso no encontrado."):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            code="not_found",
            message=detail,
        )


class InternalServerError(APIError):
    def __init__(self, detail: str = "Ocurrió un error inesperado. Intentá de nuevo."):
        super().__init__(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            code="internal_server_error",
            message=detail,
        )
