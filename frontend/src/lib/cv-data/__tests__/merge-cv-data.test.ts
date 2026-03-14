import { describe, expect, it } from 'vitest';
import { mergeCVData } from '../merge-cv-data';
import { DEFAULT_CONFIG } from '@/lib/cv-templates/defaults';

describe('mergeCVData', () => {
  it('mergea personalInfo sin perder campos existentes', () => {
    const result = mergeCVData(
      {
        personalInfo: {
          fullName: 'Giorgio',
          email: 'giorgio@test.dev',
          phone: '',
          location: '',
          summary: '',
        },
      },
      {
        personalInfo: {
          role: 'React Developer',
        },
      }
    );

    expect(result.personalInfo?.fullName).toBe('Giorgio');
    expect(result.personalInfo?.email).toBe('giorgio@test.dev');
    expect(result.personalInfo?.role).toBe('React Developer');
  });

  it('mergea config con la utilidad de templates', () => {
    const result = mergeCVData(
      { config: DEFAULT_CONFIG },
      { config: { colors: { primary: '#111111' } } as any }
    );

    expect(result.config?.colors.primary).toBe('#111111');
    expect(result.config?.colors.background).toBe(DEFAULT_CONFIG.colors.background);
  });
});
