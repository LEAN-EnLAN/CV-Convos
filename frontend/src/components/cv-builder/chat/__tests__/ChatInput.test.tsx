/**
 * Tests para ChatInput
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ChatInput } from '../ChatInput';

describe('ChatInput', () => {
  const mockSendMessage = vi.fn();
  const mockQuickAction = vi.fn();

  beforeEach(() => {
    mockSendMessage.mockClear();
    mockQuickAction.mockClear();
  });

  it('debe renderizar el textarea y botón de enviar', () => {
    render(<ChatInput onSendMessage={mockSendMessage} />);

    expect(screen.getByPlaceholderText('Escribe tu mensaje...')).toBeInTheDocument();
    expect(screen.getByLabelText('Enviar mensaje')).toBeInTheDocument();
  });

  it('debe llamar onSendMessage al hacer click en enviar', () => {
    render(<ChatInput onSendMessage={mockSendMessage} />);

    const textarea = screen.getByPlaceholderText('Escribe tu mensaje...');
    fireEvent.change(textarea, { target: { value: 'Hola mundo' } });

    const sendButton = screen.getByLabelText('Enviar mensaje');
    fireEvent.click(sendButton);

    expect(mockSendMessage).toHaveBeenCalledWith('Hola mundo');
  });

  it('debe llamar onSendMessage al presionar Enter', () => {
    render(<ChatInput onSendMessage={mockSendMessage} />);

    const textarea = screen.getByPlaceholderText('Escribe tu mensaje...');
    fireEvent.change(textarea, { target: { value: 'Hola mundo' } });
    fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter' });

    expect(mockSendMessage).toHaveBeenCalledWith('Hola mundo');
  });

  it('no debe enviar mensaje vacío', () => {
    render(<ChatInput onSendMessage={mockSendMessage} />);

    const sendButton = screen.getByLabelText('Enviar mensaje');
    fireEvent.click(sendButton);

    expect(mockSendMessage).not.toHaveBeenCalled();
  });

  it('debe permitir nueva línea con Shift+Enter', () => {
    render(<ChatInput onSendMessage={mockSendMessage} />);

    const textarea = screen.getByPlaceholderText('Escribe tu mensaje...') as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: 'Línea 1' } });
    fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter', shiftKey: true });

    // No debe llamar a sendMessage
    expect(mockSendMessage).not.toHaveBeenCalled();
  });

  it('debe deshabilitar el botón cuando isLoading es true', () => {
    render(<ChatInput onSendMessage={mockSendMessage} isLoading />);

    const sendButton = screen.getByLabelText('Enviar mensaje');
    expect(sendButton).toBeDisabled();
  });

  it('debe deshabilitar el input cuando disabled es true', () => {
    render(<ChatInput onSendMessage={mockSendMessage} disabled />);

    const textarea = screen.getByPlaceholderText('Escribe tu mensaje...');
    expect(textarea).toBeDisabled();
  });

  it('debe mostrar acciones rápidas por defecto', () => {
    render(<ChatInput onSendMessage={mockSendMessage} onQuickAction={mockQuickAction} />);

    expect(screen.getByText('Agregar experiencia')).toBeInTheDocument();
    expect(screen.getByText('Agregar educación')).toBeInTheDocument();
    expect(screen.getByText('Agregar skills')).toBeInTheDocument();
    expect(screen.getByText('Ajustar a puesto')).toBeInTheDocument();
    expect(screen.getByText('Optimizar CV')).toBeInTheDocument();
  });

  it('debe ocultar acciones rápidas cuando showQuickActions es false', () => {
    render(
      <ChatInput
        onSendMessage={mockSendMessage}
        onQuickAction={mockQuickAction}
        showQuickActions={false}
      />
    );

    expect(screen.queryByText('Agregar experiencia')).not.toBeInTheDocument();
  });

  it('debe llamar onQuickAction al hacer click en una acción rápida', () => {
    render(<ChatInput onSendMessage={mockSendMessage} onQuickAction={mockQuickAction} />);

    const quickAction = screen.getByText('Agregar experiencia');
    fireEvent.click(quickAction);

    expect(mockQuickAction).toHaveBeenCalledWith('add_experience');
  });

  it('debe limpiar el input después de enviar', () => {
    render(<ChatInput onSendMessage={mockSendMessage} />);

    const textarea = screen.getByPlaceholderText('Escribe tu mensaje...') as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: 'Hola mundo' } });
    expect(textarea.value).toBe('Hola mundo');

    const sendButton = screen.getByLabelText('Enviar mensaje');
    fireEvent.click(sendButton);

    expect(textarea.value).toBe('');
  });

  it('debe mostrar placeholder personalizado cuando se proporciona', () => {
    render(<ChatInput onSendMessage={mockSendMessage} placeholder="Placeholder custom" />);

    expect(screen.getByPlaceholderText('Placeholder custom')).toBeInTheDocument();
  });
});
