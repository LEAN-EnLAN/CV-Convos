import { CVData, CVTemplate } from '@/types/cv';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';
const API_ENDPOINT = `${API_BASE_URL}/api`;

export type ExportFormat = 'pdf' | 'docx' | 'txt' | 'json';

export interface ExportOptions {
    signal?: AbortSignal;
    onProgress?: (progress: number) => void;
}

export class ExportApiError extends Error {
    constructor(
        message: string,
        public status: number
    ) {
        super(message);
        this.name = 'ExportApiError';
    }
}

interface ExportPayload {
    cvData: CVData;
    templateId: CVTemplate;
    format: ExportFormat;
}

export async function exportCv(
    payload: ExportPayload,
    options: ExportOptions = {}
): Promise<{ blob: Blob; fileName: string }> {
    const response = await fetch(`${API_ENDPOINT}/export-cv`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            cv_data: payload.cvData,
            template_id: payload.templateId,
            format: payload.format
        }),
        signal: options.signal
    });

    if (!response.ok) {
        let message = response.statusText;
        try {
            const data = await response.json();
            if (typeof data?.detail === 'string') {
                message = data.detail;
            } else if (typeof data?.detail?.message === 'string') {
                message = data.detail.message;
            } else if (typeof data?.message === 'string') {
                message = data.message;
            }
        } catch {
            // Mantener mensaje por defecto si no hay JSON
        }
        throw new ExportApiError(message, response.status);
    }

    const fileName = extractFileName(response.headers.get('content-disposition')) ||
        `cv_export.${payload.format}`;
    const blob = await readResponseBlob(response, options.onProgress);

    return { blob, fileName };
}

async function readResponseBlob(
    response: Response,
    onProgress?: (progress: number) => void
): Promise<Blob> {
    if (!response.body) {
        return response.blob();
    }

    const reader = response.body.getReader();
    const contentLength = response.headers.get('content-length');
    const total = contentLength ? Number(contentLength) : 0;
    const chunks: Uint8Array[] = [];
    let received = 0;

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
            chunks.push(value);
            received += value.length;
            if (onProgress && total > 0) {
                onProgress(Math.round((received / total) * 100));
            }
        }
    }

    if (onProgress && total === 0) {
        onProgress(100);
    }

    return new Blob(chunks, {
        type: response.headers.get('content-type') || 'application/octet-stream'
    });
}

function extractFileName(contentDisposition: string | null): string | null {
    if (!contentDisposition) return null;
    const match = /filename="?([^"]+)"?/i.exec(contentDisposition);
    return match?.[1] ?? null;
}
