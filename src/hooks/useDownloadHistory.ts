
import { useState, useEffect } from 'react';

export interface DownloadedApp {
    id: string;
    title: string;
    icon_name: string;
    timestamp: number;
    action_type: 'download' | 'launch';
}

const STORAGE_KEY = 'dta_download_history';

export const useDownloadHistory = () => {
    const [history, setHistory] = useState<DownloadedApp[]>([]);

    useEffect(() => {
        // Load from local storage on mount
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                setHistory(JSON.parse(stored));
            } catch (e) {
                console.error('Failed to parse download history', e);
            }
        }
    }, []);

    const addToHistory = (app: { id: string; title: string; icon_name: string }, action_type: 'download' | 'launch') => {
        const newEntry: DownloadedApp = {
            id: app.id,
            title: app.title,
            icon_name: app.icon_name,
            timestamp: Date.now(),
            action_type
        };

        setHistory((prev) => {
            // Remove duplicates of same app (keep latest)
            const filtered = prev.filter(item => item.id !== app.id);
            const updated = [newEntry, ...filtered];

            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            return updated;
        });
    };

    const clearHistory = () => {
        localStorage.removeItem(STORAGE_KEY);
        setHistory([]);
    };

    return { history, addToHistory, clearHistory };
};
