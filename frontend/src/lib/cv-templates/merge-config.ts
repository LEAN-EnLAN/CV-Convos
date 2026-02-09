import { TemplateConfig } from '@/types/cv';
import { DEFAULT_CONFIG } from './defaults';

export const mergeTemplateConfig = (
    base?: TemplateConfig,
    update?: Partial<TemplateConfig>
): TemplateConfig => {
    const safeBase = base ?? DEFAULT_CONFIG;
    if (!update) return safeBase;

    const mergedSections = { ...safeBase.sections };
    if (update.sections) {
        Object.entries(update.sections).forEach(([key, value]) => {
            if (!value) return;
            const sectionKey = key as keyof TemplateConfig['sections'];
            mergedSections[sectionKey] = {
                ...mergedSections[sectionKey],
                ...value,
            };
        });
    }

    return {
        ...safeBase,
        ...update,
        colors: {
            ...safeBase.colors,
            ...update.colors,
        },
        fonts: {
            ...safeBase.fonts,
            ...update.fonts,
        },
        layout: {
            ...safeBase.layout,
            ...update.layout,
        },
        sections: mergedSections,
    };
};
