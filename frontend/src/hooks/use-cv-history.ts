import { useState, useCallback } from 'react';

export function useCVHistory<T>(initialState: T) {
    const [past, setPast] = useState<T[]>([]);
    const [present, setPresent] = useState<T>(initialState);
    const [future, setFuture] = useState<T[]>([]);

    const undo = useCallback(() => {
        if (past.length === 0) return;

        const previous = past[past.length - 1];
        const newPast = past.slice(0, past.length - 1);

        setPast(newPast);
        setFuture([present, ...future]);
        setPresent(previous);
    }, [past, present, future]);

    const redo = useCallback(() => {
        if (future.length === 0) return;

        const next = future[0];
        const newFuture = future.slice(1);

        setPast([...past, present]);
        setPresent(next);
        setFuture(newFuture);
    }, [past, present, future]);

    const set = useCallback((newState: T) => {
        const stateString = JSON.stringify(newState);
        const presentString = JSON.stringify(present);

        if (stateString === presentString) return;

        setPast(prev => [...prev, present].slice(-30)); // Limit to 30 versions
        setPresent(newState);
        setFuture([]);
    }, [present]);

    return {
        state: present,
        set,
        undo,
        redo,
        canUndo: past.length > 0,
        canRedo: future.length > 0,
    };
}
