import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useCVHistory } from '../use-cv-history';

describe('useCVHistory', () => {
    it('should initialize with initial state', () => {
        const { result } = renderHook(() => useCVHistory(0));
        expect(result.current.state).toBe(0);
        expect(result.current.canUndo).toBe(false);
        expect(result.current.canRedo).toBe(false);
    });

    it('should update state', () => {
        const { result } = renderHook(() => useCVHistory(0));
        act(() => {
            result.current.set(1);
        });
        expect(result.current.state).toBe(1);
        expect(result.current.canUndo).toBe(true);
    });

    it('should undo', () => {
        const { result } = renderHook(() => useCVHistory(0));
        act(() => {
            result.current.set(1);
        });
        act(() => {
            result.current.undo();
        });
        expect(result.current.state).toBe(0);
        expect(result.current.canRedo).toBe(true);
    });

    it('should redo', () => {
        const { result } = renderHook(() => useCVHistory(0));
        act(() => {
            result.current.set(1);
        });
        act(() => {
            result.current.undo();
        });
        act(() => {
            result.current.redo();
        });
        expect(result.current.state).toBe(1);
    });

    it('should ignore duplicate updates', () => {
        const { result } = renderHook(() => useCVHistory(0));
        act(() => {
            result.current.set(1);
        });
        act(() => {
            result.current.set(1); // Duplicate
        });
        // Undo should go back to 0, not 1
        act(() => {
            result.current.undo();
        });
        expect(result.current.state).toBe(0);
    });
});
