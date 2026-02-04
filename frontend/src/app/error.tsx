'use client';

import React, { useMemo } from 'react';
import { ErrorState } from '@/components/ui/error-state';

function resolveVariant(message: string): 'network' | 'validation' | 'generic' {
  const normalized = message.toLowerCase();

  if (normalized.includes('network') || normalized.includes('fetch') || normalized.includes('conexión')) {
    return 'network';
  }

  if (
    normalized.includes('validation') ||
    normalized.includes('invalid') ||
    normalized.includes('422') ||
    normalized.includes('400')
  ) {
    return 'validation';
  }

  return 'generic';
}

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const description = useMemo(() => error.message, [error.message]);
  const variant = resolveVariant(error.message);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-16">
      <div className="max-w-xl w-full">
        <ErrorState
          variant={variant}
          description={description}
          onRetry={reset}
        />
      </div>
    </div>
  );
}
