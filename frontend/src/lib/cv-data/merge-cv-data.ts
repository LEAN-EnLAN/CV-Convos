import { CVData } from '@/types/cv';
import { mergeTemplateConfig } from '@/lib/cv-templates/merge-config';

export const mergeCVData = (
  current: Partial<CVData> | null | undefined,
  incoming: Partial<CVData>
): Partial<CVData> => {
  const base = current ?? {};

  return {
    ...base,
    ...incoming,
    personalInfo: incoming.personalInfo
      ? {
          ...(base.personalInfo ?? {}),
          ...incoming.personalInfo,
        }
      : base.personalInfo,
    experience: incoming.experience ?? base.experience,
    education: incoming.education ?? base.education,
    skills: incoming.skills ?? base.skills,
    projects: incoming.projects ?? base.projects,
    languages: incoming.languages ?? base.languages,
    certifications: incoming.certifications ?? base.certifications,
    interests: incoming.interests ?? base.interests,
    tools: incoming.tools ?? base.tools,
    config: incoming.config ? mergeTemplateConfig(base.config, incoming.config) : base.config,
  };
};
