import type React from 'react';
import { CVData, CVTemplate } from '@/types/cv';
import { ProfessionalTemplate } from '@/components/cv-builder/templates/ProfessionalTemplate';
import { HarvardTemplate } from '@/components/cv-builder/templates/HarvardTemplate';
import { CreativeTemplate } from '@/components/cv-builder/templates/CreativeTemplate';
import { PureTemplate } from '@/components/cv-builder/templates/PureTemplate';
import { TerminalTemplate } from '@/components/cv-builder/templates/TerminalTemplate';
import { CareTemplate } from '@/components/cv-builder/templates/CareTemplate';
import { CapitalTemplate } from '@/components/cv-builder/templates/CapitalTemplate';
import { ScholarTemplate } from '@/components/cv-builder/templates/ScholarTemplate';

export type TemplateComponent = React.ComponentType<{ data: CVData }>;

export const TEMPLATE_RENDERERS: Record<CVTemplate, TemplateComponent> = {
    professional: ProfessionalTemplate,
    harvard: HarvardTemplate,
    creative: CreativeTemplate,
    pure: PureTemplate,
    terminal: TerminalTemplate,
    care: CareTemplate,
    capital: CapitalTemplate,
    scholar: ScholarTemplate,
};

export const getTemplateRenderer = (template: CVTemplate): TemplateComponent => {
    return TEMPLATE_RENDERERS[template] || CreativeTemplate;
};
