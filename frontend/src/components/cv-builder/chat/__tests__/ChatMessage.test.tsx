/**
 * Tests para ChatMessage
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ChatMessage } from '../ChatMessage';
import { ChatMessage as ChatMessageType } from '@/types/chat';

describe('ChatMessage', () => {
  const userMessage: ChatMessageType = {
    id: '1',
    role: 'user',
    content: 'Hola, soy Juan',
    timestamp: new Date('2024-01-15T10:00:00'),
  };

  const assistantMessage: ChatMessageType = {
    id: '2',
    role: 'assistant',
    content: '¡Hola Juan! Encantado de conocerte.',
    timestamp: new Date('2024-01-15T10:00:05'),
  };

  it('debe renderizar mensaje del usuario alineado a la derecha', () => {
    render(<ChatMessage message={userMessage} />);

    expect(screen.getByText('Hola, soy Juan')).toBeInTheDocument();
    // El mensaje del usuario debe tener clase de alineación derecha
    const messageContainer = screen.getByText('Hola, soy Juan').closest('.flex');
    expect(messageContainer).toHaveClass('flex-row-reverse');
  });

  it('debe renderizar mensaje del asistente alineado a la izquierda', () => {
    render(<ChatMessage message={assistantMessage} />);

    expect(screen.getByText('¡Hola Juan! Encantado de conocerte.')).toBeInTheDocument();
    const messageContainer = screen.getByText('¡Hola Juan! Encantado de conocerte.').closest('.flex');
    expect(messageContainer).toHaveClass('flex-row');
  });

  it('debe formatear markdown básico (negritas)', () => {
    const messageWithBold: ChatMessageType = {
      ...assistantMessage,
      content: 'Este es un texto **en negrita**',
    };

    render(<ChatMessage message={messageWithBold} />);

    const strongElement = document.querySelector('strong');
    expect(strongElement).toBeInTheDocument();
    expect(strongElement?.textContent).toBe('en negrita');
  });

  it('debe formatear markdown básico (itálicas)', () => {
    const messageWithItalic: ChatMessageType = {
      ...assistantMessage,
      content: 'Este es un texto *en cursiva*',
    };

    render(<ChatMessage message={messageWithItalic} />);

    const emElement = document.querySelector('em');
    expect(emElement).toBeInTheDocument();
    expect(emElement?.textContent).toBe('en cursiva');
  });

  it('debe formatear markdown de código inline', () => {
    const messageWithCode: ChatMessageType = {
      ...assistantMessage,
      content: 'Usa el comando `npm install`',
    };

    render(<ChatMessage message={messageWithCode} />);

    const codeElement = document.querySelector('code');
    expect(codeElement).toBeInTheDocument();
    expect(codeElement?.textContent).toBe('npm install');
  });

  it('debe mostrar indicador de typing cuando isStreaming es true y no hay contenido', () => {
    const emptyStreamingMessage: ChatMessageType = {
      ...assistantMessage,
      content: '',
    };

    render(<ChatMessage message={emptyStreamingMessage} isStreaming />);

    // Debe mostrar el TypingIndicator (3 puntos animados)
    const typingIndicator = document.querySelector('[role="status"]');
    expect(typingIndicator).toBeInTheDocument();
    expect(typingIndicator).toHaveAttribute('aria-label', 'El asistente está escribiendo...');
  });

  it('debe mostrar el timestamp formateado', () => {
    render(<ChatMessage message={userMessage} />);

    // El timestamp debe mostrarse en formato HH:MM
    expect(screen.getByText('07:00')).toBeInTheDocument(); // UTC-3
  });

  it('debe aplicar clase personalizada cuando se proporciona', () => {
    render(<ChatMessage message={userMessage} className="custom-class" />);

    const messageElement = document.querySelector('.custom-class');
    expect(messageElement).toBeInTheDocument();
  });
});
