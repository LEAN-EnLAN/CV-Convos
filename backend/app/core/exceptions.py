from fastapi import HTTPException, status


class CVProcessingError(HTTPException):
    def __init__(self, detail: str = "CV processing failed"):
        super().__init__(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={"error": "cv_processing_error", "message": detail},
        )


class FileProcessingError(HTTPException):
    def __init__(self, detail: str = "File processing failed"):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": "file_processing_error", "message": detail},
        )


class AIServiceError(HTTPException):
    def __init__(self, detail: str = "AI service error"):
        super().__init__(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={"error": "ai_service_error", "message": detail},
        )


class ValidationError(HTTPException):
    def __init__(self, detail: str = "Validation error"):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": "validation_error", "message": detail},
        )


class RateLimitError(HTTPException):
    def __init__(self, detail: str = "Rate limit exceeded"):
        super().__init__(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail={"error": "rate_limit_exceeded", "message": detail},
        )
