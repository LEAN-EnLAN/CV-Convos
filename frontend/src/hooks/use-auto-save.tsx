'use client';

import { useState, useEffect } from 'react';
import { CVData } from '@/types/cv';

const STORAGE_KEY = 'cv_builder_unsaved_data';
const AUTOSAVE_DELAY_MS = 2000;

export function useAutoSave(data: CVData, isEnabled = true) {
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);

    // Initialize from localStorage on mount (optional, mostly handled by Builder passing initialData)
    // Actually, Builder usually handles initialization. This hook is just for SAVING.

    // Auto-save to localStorage
    useEffect(() => {
        if (!isEnabled) return;
        const timer = setTimeout(() => {
            setIsSaving(true);
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify({
                    data,
                    timestamp: Date.now()
                }));
                // Also save to a "backup" key just in case
                localStorage.setItem('cv_backup_latest', JSON.stringify(data));

                setLastSaved(new Date());
            } catch (e) {
                console.error('Auto-save failed', e);
            } finally {
                setIsSaving(false);
            }
        }, AUTOSAVE_DELAY_MS);

        return () => clearTimeout(timer);
    }, [data, isEnabled]);

    return {
        isSaving,
        lastSaved
    };
}
