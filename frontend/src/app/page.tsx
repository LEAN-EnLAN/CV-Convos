'use client';

import React, { useState } from 'react';
import { FileUploader } from '@/components/cv-builder/FileUploader';
import { CVData } from '@/types/cv';
import { Toaster } from 'sonner';

const emptyCV: CVData = {
  personalInfo: { fullName: '', email: '', phone: '', location: '', summary: '' },
  experience: [],
  education: [],
  skills: [],
  projects: [],
  languages: [],
  certifications: []
};

import { Builder } from '@/components/cv-builder/Builder';

export default function Home() {
  const [cvData, setCvData] = useState<CVData | null>(null);

  const handleSuccess = (data: CVData) => {
    // Sanitizar datos y agregar IDs únicos
    const sanitizedData = {
      ...emptyCV,
      ...data,
      experience: (data.experience || []).map(e => ({ ...e, id: e.id || Math.random().toString(36).substr(2, 9) })),
      education: (data.education || []).map(e => ({ ...e, id: e.id || Math.random().toString(36).substr(2, 9) })),
      skills: (data.skills || []).map(e => ({ ...e, id: e.id || Math.random().toString(36).substr(2, 9) })),
      projects: (data.projects || []).map(e => ({ ...e, id: e.id || Math.random().toString(36).substr(2, 9) })),
      languages: (data.languages || []).map(e => ({ ...e, id: e.id || Math.random().toString(36).substr(2, 9) })),
      certifications: (data.certifications || []).map(e => ({ ...e, id: e.id || Math.random().toString(36).substr(2, 9) }))
    };
    setCvData(sanitizedData);
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Toaster
        position="top-center"
        richColors
        toastOptions={{
          style: {
            fontFamily: 'var(--font-outfit)',
          },
        }}
      />

      {!cvData ? (
        <FileUploader onSuccess={handleSuccess} />
      ) : (
        <Builder initialData={cvData} onReset={() => setCvData(null)} />
      )}
    </main>
  );
}
