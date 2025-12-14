'use client';

import { create } from 'zustand';
import type { LucideIcon } from 'lucide-react';

interface Action {
    label: string;
    onClick: () => void;
}

interface DynamicStatusState {
    isVisible: boolean;
    content: string | null;
    icon: LucideIcon | null;
    actions: Action[] | null;
    showStatus: (
        content: string,
        options?: { icon?: LucideIcon; duration?: number; actions?: Action[] }
    ) => void;
    hideStatus: () => void;
}

export const useDynamicStatus = create<DynamicStatusState>((set, get) => ({
    isVisible: false,
    content: null,
    icon: null,
    actions: null,
    
    showStatus: (content, options) => {
        set({
            isVisible: true,
            content,
            icon: options?.icon || null,
            actions: options?.actions || null,
        });

        if (options?.duration) {
            setTimeout(() => {
                get().hideStatus();
            }, options.duration);
        }
    },
    
    hideStatus: () => {
        set({ isVisible: false });
    },
}));
