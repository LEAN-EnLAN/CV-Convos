/**
 * CV Generator Types
 * Type definitions for the complete CV generation API
 */

import { CVData, CVTemplate } from './cv';

/**
 * Request model for complete CV generation
 */
export interface GenerateCompleteCVRequest {
    cv_data: CVData;
    template_type: CVTemplate;
}

/**
 * Response model for complete CV generation
 */
export interface GenerateCompleteCVResponse {
    data: CVData;
    metadata: CVGenerationMetadata;
    template_type: string;
    generated_at: string;
}

/**
 * Metadata returned from CV generation
 */
export interface CVGenerationMetadata {
    completeness_score: number;
    section_counts: {
        experience: number;
        education: number;
        skills: number;
        projects: number;
        certifications: number;
    };
    sections: string[];
    template_type: string;
    version: string;
}

/**
 * API error response
 */
export interface CVGeneratorError {
    error: string;
    message: string;
    status: number;
}

/**
 * State for the generator component
 */
export interface GeneratorState {
    isGenerating: boolean;
    error: string | null;
    lastResult: GenerateCompleteCVResponse | null;
}
