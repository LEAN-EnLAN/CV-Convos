/**
 * Tests para PhaseIndicator
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PhaseIndicator } from '../PhaseIndicator';

describe('PhaseIndicator', () => {
  it('debe renderizar la fase actual', () => {
    render(<PhaseIndicator currentPhase="welcome" />);

    expect(screen.getByText('Bienvenida')).toBeInTheDocument();
  });

  it('debe mostrar el progreso correcto para welcome', () => {
    render(<PhaseIndicator currentPhase="welcome" />);

    expect(screen.getByText('14%')).toBeInTheDocument();
  });

  it('debe mostrar el progreso correcto para personal_info', () => {
    render(<PhaseIndicator currentPhase="personal_info" />);

    expect(screen.getByText('29%')).toBeInTheDocument();
  });

  it('debe mostrar el progreso correcto para review', () => {
    render(<PhaseIndicator currentPhase="review" />);

    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('debe marcar fases anteriores como completadas', () => {
    render(<PhaseIndicator currentPhase="experience" />);

    // Welcome y personal_info deben estar marcados como completados
    const checkIcons = document.querySelectorAll('svg');
    // Debe haber al menos un check para fases completadas
    expect(checkIcons.length).toBeGreaterThan(0);
  });

  it('debe mostrar versión compacta cuando compact es true', () => {
    render(<PhaseIndicator currentPhase="welcome" compact />);

    // En modo compacto solo muestra el progreso y la fase
    expect(screen.getByText('14%')).toBeInTheDocument();
  });

  it('debe aplicar clase personalizada', () => {
    render(<PhaseIndicator currentPhase="welcome" className="custom-class" />);

    const container = document.querySelector('.custom-class');
    expect(container).toBeInTheDocument();
  });
});
