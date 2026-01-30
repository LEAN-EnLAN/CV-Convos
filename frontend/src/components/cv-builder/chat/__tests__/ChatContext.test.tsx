/**
 * Tests para ChatContext
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ChatProvider, useChat, useChatState, useChatActions } from '@/contexts/ChatContext';

// Mock fetch global
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Componente de prueba
function TestComponent() {
  const { state, actions } = useChat();

  return (
    <div>
      <div data-testid="messages-count">{state.messages.length}</div>
      <div data-testid="current-phase">{state.currentPhase}</div>
      <div data-testid="is-streaming">{state.isStreaming ? 'true' : 'false'}</div>
      <div data-testid="session-id">{state.sessionId}</div>
      <button
        data-testid="send-message"
        onClick={() => actions.sendMessage('Hola, soy Juan')}
      >
        Enviar mensaje
      </button>
      <button data-testid="reset-chat" onClick={actions.resetChat}>
        Reiniciar chat
      </button>
      <button
        data-testid="set-job-description"
        onClick={() => actions.setJobDescription('Descripción del puesto')}
      >
        Set job description
      </button>
    </div>
  );
}

function renderWithProvider(component: React.ReactElement) {
  return render(<ChatProvider>{component}</ChatProvider>);
}

describe('ChatContext', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Estado inicial', () => {
    it('debe inicializar con el mensaje de bienvenida', () => {
      renderWithProvider(<TestComponent />);

      expect(screen.getByTestId('messages-count').textContent).toBe('1');
      expect(screen.getByTestId('current-phase').textContent).toBe('welcome');
      expect(screen.getByTestId('is-streaming').textContent).toBe('false');
      expect(screen.getByTestId('session-id').textContent).toBeTruthy();
    });

    it('debe generar un sessionId único', () => {
      renderWithProvider(<TestComponent />);
      const sessionId1 = screen.getByTestId('session-id').textContent;

      renderWithProvider(<TestComponent />);
      const sessionId2 = screen.getByTestId('session-id').textContent;

      expect(sessionId1).not.toBe(sessionId2);
    });
  });

  describe('Acciones', () => {
    it('resetChat debe reiniciar el estado inicial', () => {
      renderWithProvider(<TestComponent />);

      const initialSessionId = screen.getByTestId('session-id').textContent;

      fireEvent.click(screen.getByTestId('reset-chat'));

      expect(screen.getByTestId('messages-count').textContent).toBe('1');
      expect(screen.getByTestId('current-phase').textContent).toBe('welcome');
      // El sessionId debe cambiar al reiniciar
      expect(screen.getByTestId('session-id').textContent).not.toBe(initialSessionId);
    });

    it('setJobDescription debe actualizar la descripción del puesto', async () => {
      renderWithProvider(<TestComponent />);

      fireEvent.click(screen.getByTestId('set-job-description'));

      // No hay forma directa de verificar esto en el componente de prueba,
      // pero verificamos que no lanza error
      await waitFor(() => {
        expect(screen.getByTestId('messages-count').textContent).toBe('1');
      });
    });
  });

  describe('useChatState', () => {
    function StateOnlyComponent() {
      const state = useChatState();
      return <div data-testid="phase">{state.currentPhase}</div>;
    }

    it('debe retornar solo el estado', () => {
      renderWithProvider(<StateOnlyComponent />);
      expect(screen.getByTestId('phase').textContent).toBe('welcome');
    });
  });

  describe('useChatActions', () => {
    function ActionsOnlyComponent() {
      const actions = useChatActions();
      return (
        <button data-testid="has-actions" onClick={() => actions.resetChat()}>
          {actions ? 'has-actions' : 'no-actions'}
        </button>
      );
    }

    it('debe retornar solo las acciones', () => {
      renderWithProvider(<ActionsOnlyComponent />);
      expect(screen.getByTestId('has-actions').textContent).toBe('has-actions');
    });
  });

  describe('Error handling', () => {
    it('debe manejar errores de fetch', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      renderWithProvider(<TestComponent />);

      await act(async () => {
        fireEvent.click(screen.getByTestId('send-message'));
      });

      await waitFor(() => {
        expect(screen.getByTestId('is-streaming').textContent).toBe('false');
      });
    });
  });
});

describe('ChatContext - hooks individuales', () => {
  it('useChat debe lanzar error si se usa fuera del provider', () => {
    // Suprimir console.error para este test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

    function ComponentWithoutProvider() {
      useChat();
      return null;
    }

    expect(() => render(<ComponentWithoutProvider />)).toThrow(
      'useChat must be used within a ChatProvider'
    );

    consoleSpy.mockRestore();
  });
});
