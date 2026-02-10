'use client';

import React from 'react';
import { DataExtraction } from '@/types/chat';

interface ExtractionPreviewProps {
  extraction: DataExtraction;
  onApply: (extraction: DataExtraction) => void;
  onDismiss: () => void;
}

// Simplified version to fix build errors
export function ExtractionPreview({ extraction, onApply, onDismiss }: ExtractionPreviewProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-4 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold">Datos Detectados</h3>
        <button onClick={onDismiss} className="text-muted-foreground hover:text-foreground">
          ✕
        </button>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Se detectaron {Object.keys(extraction.extracted).length} secciones de datos.
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => onApply(extraction)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium"
        >
          Aplicar
        </button>
        <button
          onClick={onDismiss}
          className="px-4 py-2 border border-border rounded-md text-sm font-medium"
        >
          Descartar
        </button>
      </div>
    </div>
  );
}

export default ExtractionPreview;
