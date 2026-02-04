'use client';

import React from 'react';
import { AlertTriangle, WifiOff, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type ErrorStateVariant = 'network' | 'validation' | 'generic';

interface ErrorStateProps {
  variant?: ErrorStateVariant;
  title?: string;
  description?: string;
  actionLabel?: string;
  onRetry?: () => void;
  className?: string;
}

const defaultCopy: Record<ErrorStateVariant, { title: string; description: string }> = {
  network: {
    title: 'Problemas de conexión',
    description: 'No pudimos comunicarnos con el servidor. Verificá tu conexión e intentá de nuevo.',
  },
  validation: {
    title: 'Revisá los datos ingresados',
    description: 'Algunos datos no son válidos. Corregí los campos marcados y volvé a intentar.',
  },
  generic: {
    title: 'Algo salió mal',
    description: 'Ocurrió un error inesperado. Si el problema persiste, intentá más tarde.',
  },
};

const iconMap: Record<ErrorStateVariant, React.ReactNode> = {
  network: <WifiOff className="h-6 w-6 text-destructive" />,
  validation: <AlertTriangle className="h-6 w-6 text-amber-500" />,
  generic: <XCircle className="h-6 w-6 text-destructive" />,
};

export function ErrorState({
  variant = 'generic',
  title,
  description,
  actionLabel = 'Reintentar',
  onRetry,
  className,
}: ErrorStateProps) {
  const fallback = defaultCopy[variant];
  const showAction = Boolean(onRetry);

  return (
    <div
      className={cn(
        'w-full rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-sm',
        className
      )}
      role="alert"
    >
      <div className="flex items-start gap-4">
        <div className="mt-1 flex h-11 w-11 items-center justify-center rounded-full bg-muted">
          {iconMap[variant]}
        </div>
        <div className="flex-1 space-y-2">
          <h2 className="text-base font-semibold">{title || fallback.title}</h2>
          <p className="text-sm text-muted-foreground">{description || fallback.description}</p>
          {showAction && (
            <div className="pt-2">
              <Button onClick={onRetry} variant="default" size="sm">
                {actionLabel}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
