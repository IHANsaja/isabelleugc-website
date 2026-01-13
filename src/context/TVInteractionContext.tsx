"use client";

import React, { createContext, useContext, useState, useRef, useCallback, ReactNode } from 'react';

interface TVInteractionContextType {
    isLookingAtTV: boolean;
    setIsLookingAtTV: (value: boolean) => void;
    isPanelOpen: boolean;
    setIsPanelOpen: (value: boolean) => void;
    togglePanel: () => void;
    videoElement: HTMLVideoElement | null;
    setVideoElement: (video: HTMLVideoElement | null) => void;
}

const TVInteractionContext = createContext<TVInteractionContextType | null>(null);

export const TVInteractionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isLookingAtTV, setIsLookingAtTV] = useState(false);
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);

    const togglePanel = useCallback(() => {
        if (isLookingAtTV) {
            setIsPanelOpen(prev => !prev);
        }
    }, [isLookingAtTV]);

    return (
        <TVInteractionContext.Provider value={{
            isLookingAtTV,
            setIsLookingAtTV,
            isPanelOpen,
            setIsPanelOpen,
            togglePanel,
            videoElement,
            setVideoElement,
        }}>
            {children}
        </TVInteractionContext.Provider>
    );
};

export const useTVInteraction = () => {
    const context = useContext(TVInteractionContext);
    if (!context) {
        throw new Error('useTVInteraction must be used within a TVInteractionProvider');
    }
    return context;
};
