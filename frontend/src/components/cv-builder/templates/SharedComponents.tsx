import React from 'react';
import { TemplateConfig } from '@/types/cv';
import { getDensityPadding } from '@/lib/cv-templates/utils';

interface BaseTemplateProps {
    config: TemplateConfig;
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    paddingUnit?: 'cm' | 'rem' | 'px';
}

/**
 * Common container for all CV templates to ensure consistent sizing and printing
 */
export const BaseTemplate = ({ 
    config, 
    children, 
    className = '', 
    style = {},
    paddingUnit = 'rem'
}: BaseTemplateProps) => {
    return (
        <div
            className={`w-[794px] h-[1122px] max-h-[1122px] overflow-hidden print:shadow-none mx-auto ${className}`}
            style={{
                fontFamily: config.fonts.body,
                backgroundColor: config.colors.background,
                color: config.colors.text,
                padding: getDensityPadding(config.layout.density, paddingUnit),
                ...style
            } as React.CSSProperties}
        >
            {children}
        </div>
    );
};

interface TemplateSectionProps {
    visible?: boolean;
    title: string;
    children: React.ReactNode;
    sectionGap: number;
    titleStyle?: React.CSSProperties;
    className?: string;
}

/**
 * Reusable section with visibility check and consistent spacing
 */
export const TemplateSection = ({
    visible = true,
    title,
    children,
    sectionGap,
    titleStyle = {},
    className = ''
}: TemplateSectionProps) => {
    if (!visible) return null;

    return (
        <section className={className} style={{ marginBottom: `${sectionGap}px` }}>
            <h2 style={titleStyle}>{title}</h2>
            {children}
        </section>
    );
};
