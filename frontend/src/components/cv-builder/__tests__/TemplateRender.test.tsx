import React from 'react';
import { render } from '@testing-library/react';

import { LOREM_CV_DATA } from '@/lib/debug-utils';
import { CapitalTemplate } from '@/components/cv-builder/templates/CapitalTemplate';
import { CareTemplate } from '@/components/cv-builder/templates/CareTemplate';
import { CreativeTemplate } from '@/components/cv-builder/templates/CreativeTemplate';
import { HarvardTemplate } from '@/components/cv-builder/templates/HarvardTemplate';
import { ProfessionalTemplate } from '@/components/cv-builder/templates/ProfessionalTemplate';
import { PureTemplate } from '@/components/cv-builder/templates/PureTemplate';
import { ScholarTemplate } from '@/components/cv-builder/templates/ScholarTemplate';
import { TerminalTemplate } from '@/components/cv-builder/templates/TerminalTemplate';

const templates = [
    { name: 'CapitalTemplate', Component: CapitalTemplate },
    { name: 'CareTemplate', Component: CareTemplate },
    { name: 'CreativeTemplate', Component: CreativeTemplate },
    { name: 'HarvardTemplate', Component: HarvardTemplate },
    { name: 'ProfessionalTemplate', Component: ProfessionalTemplate },
    { name: 'PureTemplate', Component: PureTemplate },
    { name: 'ScholarTemplate', Component: ScholarTemplate },
    { name: 'TerminalTemplate', Component: TerminalTemplate },
];

describe('CV templates', () => {
    it.each(templates)('renders $name without crashing', ({ Component }) => {
        const { container } = render(<Component data={LOREM_CV_DATA} />);
        expect(container).toBeTruthy();
    });
});
