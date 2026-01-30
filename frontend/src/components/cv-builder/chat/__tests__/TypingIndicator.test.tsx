/**
 * Tests para TypingIndicator
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { TypingIndicator } from '../TypingIndicator';

describe('TypingIndicator', () => {
  it('debe renderizar tres puntos animados', () => {
    render(<TypingIndicator />);

    const dots = document.querySelectorAll('[class*="rounded-full"]');
    expect(dots.length).toBe(3);
  });

  it('debe tener atributos de accesibilidad correctos', () => {
    render(<TypingIndicator />);

    const indicator = screen.getByRole('status');
    expect(indicator).toHaveAttribute('aria-label', 'El asistente está escribiendo...');
  });

  it('debe aplicar clase personalizada', () => {
    render(<TypingIndicator className="custom-class" />);

    const indicator = document.querySelector('.custom-class');
    expect(indicator).toBeInTheDocument();
  });

  it('debe tener animación bounce en los puntos', () => {
    render(<TypingIndicator />);

    const dots = document.querySelectorAll('[class*="animate-bounce"]');
    expect(dots.length).toBe(3);
  });
});
