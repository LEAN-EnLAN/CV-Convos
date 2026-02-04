/**
 * CV Generator API Client
 * Provides typed functions to interact with the CV generation backend
 */

import { CVData, CVTemplate } from '@/types/cv';
import {
    GenerateCompleteCVRequest,
    GenerateCompleteCVResponse,
    CVGeneratorError,
} from '@/types/cv-generator';
import { parseApiErrorPayload } from '@/lib/error-utils';

// =============================================================================
// CONFIGURATION
// =============================================================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';
const API_ENDPOINT = `${API_BASE_URL}/api`;

const DEFAULT_RETRY_ATTEMPTS = 3;
const DEFAULT_RETRY_DELAY_MS = 1000;

// =============================================================================
// TYPES
// =============================================================================

/**
 * API-specific error class
 */
export class CVGeneratorApiError extends Error {
    constructor(
        message: string,
        public code: string,
        public status: number
    ) {
        super(message);
        this.name = 'CVGeneratorApiError';
    }
}

/**
 * Options for CV generation request
 */
export interface GenerateCVOptions {
    signal?: AbortSignal;
    retries?: number;
    retryDelay?: number;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Delay helper for retries
 */
function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Handle HTTP error responses
 */
async function handleApiError(response: Response): Promise<never> {
    let errorData: { detail?: string; message?: string; code?: string } = {};

    try {
        errorData = await response.json();
    } catch {
        // If JSON can't be parsed, use status text
    }

    const { message, code } = parseApiErrorPayload(errorData, response.status, response.statusText);

    throw new CVGeneratorApiError(message, code, response.status);
}

// =============================================================================
// API FUNCTIONS
// =============================================================================

/**
 * Generate a complete CV with AI enhancement
 * 
 * @param cvData - Current CV data to enhance
 * @param templateType - Template type to format for
 * @param options - Request options (signal, retries, etc.)
 * @returns Promise with the generated CV response
 * @throws CVGeneratorApiError on request failure
 */
export async function generateCompleteCV(
    cvData: CVData,
    templateType: CVTemplate,
    options: GenerateCVOptions = {}
): Promise<GenerateCompleteCVResponse> {
    const {
        signal,
        retries = DEFAULT_RETRY_ATTEMPTS,
        retryDelay = DEFAULT_RETRY_DELAY_MS,
    } = options;

    const requestBody: GenerateCompleteCVRequest = {
        cv_data: cvData,
        template_type: templateType,
    };

    let lastError: Error | null = null;
    let attempt = 0;

    while (attempt < retries) {
        try {
            const response = await fetch(`${API_ENDPOINT}/generate-complete-cv`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
                signal,
            });

            if (!response.ok) {
                await handleApiError(response);
            }

            const data = await response.json();
            return data as GenerateCompleteCVResponse;
        } catch (error) {
            lastError = error as Error;

            // Don't retry on 4xx errors (client errors)
            if (error instanceof CVGeneratorApiError && error.status >= 400 && error.status < 500) {
                throw error;
            }

            attempt++;

            if (attempt < retries) {
                await delay(retryDelay * attempt); // Exponential backoff
            }
        }
    }

    throw lastError || new Error('Failed to generate CV after retries');
}

/**
 * Check if the CV generation service is available
 */
export async function checkServiceHealth(): Promise<boolean> {
    try {
        const response = await fetch(`${API_BASE_URL}/health`);
        return response.ok;
    } catch {
        return false;
    }
}

/**
 * Get supported template types
 */
export function getSupportedTemplates(): CVTemplate[] {
    return [
        'professional',
        'harvard',
        'creative',
        'pure',
        'terminal',
        'care',
        'capital',
        'scholar',
    ];
}

/**
 * Validate template type
 */
export function isValidTemplateType(value: string): value is CVTemplate {
    const templates = getSupportedTemplates();
    return templates.includes(value as CVTemplate);
}
