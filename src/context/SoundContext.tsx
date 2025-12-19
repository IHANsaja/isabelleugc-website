"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { setGlobalMute } from "@/utils/audioManager";

interface SoundContextType {
    isSoundEnabled: boolean;
    toggleSound: () => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export const SoundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isSoundEnabled, setIsSoundEnabled] = useState(true);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // Initialize from localStorage on mount
        const stored = localStorage.getItem("isSoundEnabled");
        if (stored !== null) {
            const enabled = stored === "true";
            setIsSoundEnabled(enabled);
            setGlobalMute(!enabled);
        }
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;
        localStorage.setItem("isSoundEnabled", String(isSoundEnabled));
        setGlobalMute(!isSoundEnabled);
    }, [isSoundEnabled, mounted]);

    const toggleSound = () => {
        setIsSoundEnabled((prev) => !prev);
    };

    return (
        <SoundContext.Provider value={{ isSoundEnabled, toggleSound }}>
            {children}
        </SoundContext.Provider>
    );
};

export const useSound = () => {
    const context = useContext(SoundContext);
    if (!context) {
        throw new Error("useSound must be used within a SoundProvider");
    }
    return context;
};
