export type ApiErrorPayload = {
  code?: string;
  message?: string;
  detail?: unknown;
  error?: string;
};

/**
 * Normaliza el payload de error para obtener un mensaje consistente.
 */
export function resolveApiErrorMessage(payload: ApiErrorPayload | string | undefined, fallback: string): string {
  if (!payload) {
    return fallback;
  }

  if (typeof payload === 'string') {
    return payload;
  }

  if (payload.message) {
    return payload.message;
  }

  if (payload.detail) {
    if (typeof payload.detail === 'string') {
      return payload.detail;
    }

    if (typeof payload.detail === 'object' && payload.detail !== null) {
      const detailData = payload.detail as { message?: string; error?: string };
      return detailData.message || detailData.error || fallback;
    }
  }

  return payload.error || fallback;
}

/**
 * Normaliza el payload de error para obtener mensaje y código.
 */
export function parseApiErrorPayload(
  payload: ApiErrorPayload | string | undefined,
  status: number,
  fallbackMessage = 'Ocurrió un error inesperado.'
): { message: string; code: string } {
  const message = resolveApiErrorMessage(payload, fallbackMessage);
  const code = typeof payload === 'object' && payload?.code ? payload.code : `HTTP_${status}`;

  return { message, code };
}
