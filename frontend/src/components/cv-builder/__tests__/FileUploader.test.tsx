import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { FileUploader } from '../FileUploader';

// Mock sonner
vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

// Mock fetch
global.fetch = vi.fn();

describe('FileUploader', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders correctly', () => {
        render(<FileUploader onSuccess={vi.fn()} />);
        expect(screen.getAllByText('CV-ConVos')[0]).toBeInTheDocument();
        expect(screen.getByText('Transformá tu carrera')).toBeInTheDocument();
        expect(screen.getByText('Arrastrá tus archivos')).toBeInTheDocument();
    });

    it('handles file selection', async () => {
        render(<FileUploader onSuccess={vi.fn()} />);
        // React-dropzone input is hidden
        // We can find it by role 'button' (the container) or simpler via the input if we know how to target it.
        // The container has role="button" and aria-label.

        // Let's try simulating drop on the dropzone if possible, or just changing the input.
        // The input is hidden but present.

        // Finding the input specifically
        const input = document.querySelector('input[type="file"]');
        expect(input).toBeInTheDocument();

        const file = new File(['hello'], 'hello.txt', { type: 'text/plain' });

        if (input) {
            fireEvent.change(input, { target: { files: [file] } });
        }

        await waitFor(() => {
            expect(screen.getByText('hello.txt')).toBeInTheDocument();
        });

        expect(screen.getByText('Generar CV Profesional')).toBeInTheDocument();
    });
});
