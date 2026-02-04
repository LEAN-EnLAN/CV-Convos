/**
 * Helpers compartidos para construir URLs del backend
 */

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

/**
 * Construye una URL absoluta o relativa para el backend.
 */
export function buildApiUrl(path: string): string {
  const normalizedBase = API_BASE_URL.replace(/\/$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  return `${normalizedBase}${normalizedPath}`;
}
