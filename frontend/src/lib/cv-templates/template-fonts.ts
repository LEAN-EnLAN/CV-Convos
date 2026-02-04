import { CVTemplate, TemplateConfig } from '@/types/cv';
import { DEFAULT_CONFIG } from './defaults';

export const TEMPLATE_FONT_PRESETS: Record<CVTemplate, TemplateConfig['fonts']> = {
    professional: { heading: '"Playfair Display"', body: '"Inter"' },
    harvard: { heading: '"Playfair Display"', body: '"Source Sans Pro"' },
    creative: { heading: '"Montserrat"', body: '"Raleway"' },
    pure: { heading: '"Raleway"', body: '"Open Sans"' },
    terminal: { heading: '"Fira Code"', body: '"Fira Code"' },
    care: { heading: '"Lato"', body: '"Lato"' },
    capital: { heading: '"Playfair Display"', body: '"Roboto"' },
    scholar: { heading: '"Playfair Display"', body: '"Source Sans Pro"' },
};

export const getTemplateFontPreset = (template: CVTemplate): TemplateConfig['fonts'] => {
    return TEMPLATE_FONT_PRESETS[template] || DEFAULT_CONFIG.fonts;
};
