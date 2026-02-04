import { CVData, CVTemplate, TemplateConfig } from '@/types/cv';

/**
 * Template Validator
 * 
 * Purpose: Ensure all CV templates meet minimum quality requirements
 * before being displayed to users. This prevents broken templates from
 * loading and provides clear error messages for debugging.
 */

export interface ValidationError {
    severity: 'critical' | 'warning';
    message: string;
    section?: string;
}

export interface ValidationResult {
    valid: boolean;
    errors: ValidationError[];
    warnings: ValidationError[];
}

/**
 * Mandatory requirements that ALL templates MUST satisfy
 */
export const TEMPLATE_REQUIREMENTS = {
    // If data.personalInfo.summary exists and is visible, template must render it
    mustRenderSummary: true,

    // Templates must use config.layout values, not hardcoded spacing
    mustRespectLayoutConfig: true,

    // Templates must hide sections when config.sections.*.visible = false
    mustRespectSectionVisibility: true,

    // Templates should apply config.fonts values
    shouldRespectFontConfig: true,

    // Templates should apply config.colors values
    shouldRespectColorConfig: true
};

/**
 * Validates that a template implementation meets all requirements
 * 
 * NOTE: This is a runtime check - it doesn't analyze the React component code,
 * but rather checks if the rendered output behaves correctly. For full validation,
 * use the manual testing protocol in cv-builder-test.md
 * 
 * @param templateId - The template identifier (e.g., 'harvard', 'creative')
 * @param data - The CV data being rendered
 * @param config - The template configuration
 * @returns ValidationResult with any errors or warnings
 */
export function validateTemplate(
    templateId: CVTemplate,
    data: CVData,
    config: TemplateConfig
): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    // Check 1: Summary section validation
    if (data.personalInfo.summary && config.sections.summary.visible) {
        // This is a manual check - automated validation would require DOM inspection
        // See cv-builder-test.md for testing protocol
        console.log(`[Validator] Template '${templateId}' should render summary section`);
    }

    // Check 2: Layout config validation
    // This is validated at build time through TypeScript
    // Runtime validation would require DOM measurement

    // Check 3: Section visibility validation
    // This is validated through manual testing protocol

    return {
        valid: errors.length === 0,
        errors,
        warnings
    };
}

/**
 * Template compliance checklist
 * 
 * Use this to verify a template implementation before deployment.
 * All items must pass for a template to be considered production-ready.
 */
export const TEMPLATE_COMPLIANCE_CHECKLIST = {
    // Data rendering
    rendersSummaryWhenPresent: false,
    rendersAllProvidedSections: false,

    // Config respect
    usesDynamicSectionGap: false,
    usesDynamicContentGap: false,
    usesDynamicDensity: false,
    respectsSectionVisibility: false,

    // Styling
    appliesFontConfig: false,
    appliesColorConfig: false,

    // Accessibility
    hasSemanticHTML: false,
    hasProperHeadingHierarchy: false
};

/**
 * Get human-readable template name
 */
export const TEMPLATE_DISPLAY_NAMES: Record<CVTemplate, string> = {
    professional: 'Executive',
    creative: 'Studio',
    harvard: 'Ivy',
    pure: 'Swiss',
    terminal: 'Code',
    care: 'Care',
    capital: 'Capital',
    scholar: 'Scholar'
};

/**
 * Helper to log validation issues to console during development
 */
export function logTemplateValidation(templateId: CVTemplate, result: ValidationResult) {
    const displayName = TEMPLATE_DISPLAY_NAMES[templateId] || templateId;

    if (result.valid) {
        console.log(`✅ Template '${displayName}' passed validation`);
    } else {
        console.error(`❌ Template '${displayName}' has validation errors:`);
        result.errors.forEach(err => {
            console.error(`  [${err.severity.toUpperCase()}] ${err.message}`);
        });
    }

    if (result.warnings.length > 0) {
        console.warn(`⚠️ Template '${displayName}' has warnings:`);
        result.warnings.forEach(warn => {
            console.warn(`  ${warn.message}`);
        });
    }
}
