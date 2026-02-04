'use client';

import { useRouter } from 'next/navigation';
import { TemplateGallery } from '@/components/cv-builder/templates/TemplateGallery';
import { CVTemplate } from '@/types/cv';

export default function TemplatesPage() {
    const router = useRouter();

    const handleSelect = (template: CVTemplate) => {
        localStorage.setItem('cv_template', template);
        router.push('/chat');
    };

    return (
        <TemplateGallery
            onSelect={handleSelect}
            onBack={() => router.push('/')}
        />
    );
}
