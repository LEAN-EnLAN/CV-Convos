import { describe, it, expect } from 'vitest';
import { mergeTemplateConfig } from '../merge-config';
import { DEFAULT_CONFIG } from '../defaults';

const clone = () => JSON.parse(JSON.stringify(DEFAULT_CONFIG));

describe('mergeTemplateConfig', () => {
    it('preserva valores base cuando el update es parcial', () => {
        const base = clone();
        const result = mergeTemplateConfig(base, {
            colors: { primary: '#ff0000' },
        });

        expect(result.colors.primary).toBe('#ff0000');
        expect(result.colors.secondary).toBe(base.colors.secondary);
        expect(result.layout.sectionGap).toBe(base.layout.sectionGap);
    });

    it('mezcla secciones sin perder visibilidad ni títulos previos', () => {
        const base = clone();
        const result = mergeTemplateConfig(base, {
            sections: {
                skills: { visible: false, title: 'Skills' },
            },
        });

        expect(result.sections.skills.visible).toBe(false);
        expect(result.sections.skills.title).toBe('Skills');
        expect(result.sections.experience.visible).toBe(base.sections.experience.visible);
    });

    it('actualiza templateId y layout en el merge', () => {
        const base = clone();
        const result = mergeTemplateConfig(base, {
            templateId: 'terminal',
            layout: { density: 'compact' },
        });

        expect(result.templateId).toBe('terminal');
        expect(result.layout.density).toBe('compact');
        expect(result.layout.contentGap).toBe(base.layout.contentGap);
    });
});
