import { TemplateConfig } from '@/types/cv';

/**
 * Cleans a URL by removing protocol and www prefix
 */
export const cleanUrl = (url?: string) => {
    if (!url) return '';
    return url.replace(/^https?:\/\//, '').replace(/^www\./, '');
};

/**
 * Gets consistent padding based on layout density
 */
export const getDensityPadding = (density: TemplateConfig['layout']['density'], unit: 'cm' | 'rem' | 'px' = 'rem') => {
    const maps = {
        cm: {
            compact: '1.5cm',
            standard: '2.54cm',
            relaxed: '3.5cm'
        },
        rem: {
            compact: '1.5rem',
            standard: '2.5rem',
            relaxed: '3.5rem'
        },
        px: {
            compact: '16px',
            standard: '24px',
            relaxed: '32px'
        }
    };

    return maps[unit][density] || maps[unit].standard;
};

/**
 * Formats a date range string
 */
export const formatDateRange = (startDate?: string, endDate?: string, current?: boolean) => {
    if (!startDate) return '';
    const end = current ? 'Present' : (endDate || 'Present');
    return `${startDate} – ${end}`;
};
