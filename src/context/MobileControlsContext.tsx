"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';

interface JoystickState {
    x: number; // -1 to 1 (left/right)
    y: number; // -1 to 1 (backward/forward)
}

interface MobileControlsContextType {
    isMobile: boolean;
    joystick: JoystickState;
    setJoystick: (state: JoystickState) => void;
    isJumping: boolean;
    setIsJumping: (value: boolean) => void;
    isSprinting: boolean;
    setIsSprinting: (value: boolean) => void;
    isInteracting: boolean;
    setIsInteracting: (value: boolean) => void;
    lookDelta: { x: number; y: number };
    setLookDelta: (delta: { x: number; y: number }) => void;
}

const MobileControlsContext = createContext<MobileControlsContextType | null>(null);

export const MobileControlsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isMobile, setIsMobile] = useState(false);
    const [joystick, setJoystick] = useState<JoystickState>({ x: 0, y: 0 });
    const [isJumping, setIsJumping] = useState(false);
    const [isSprinting, setIsSprinting] = useState(false);
    const [isInteracting, setIsInteracting] = useState(false);
    const [lookDelta, setLookDelta] = useState({ x: 0, y: 0 });

    // Detect mobile on mount
    useEffect(() => {
        const checkMobile = () => {
            const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
            const isSmallScreen = window.innerWidth <= 1024;
            setIsMobile(isTouchDevice && isSmallScreen);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return (
        <MobileControlsContext.Provider value={{
            isMobile,
            joystick,
            setJoystick,
            isJumping,
            setIsJumping,
            isSprinting,
            setIsSprinting,
            isInteracting,
            setIsInteracting,
            lookDelta,
            setLookDelta,
        }}>
            {children}
        </MobileControlsContext.Provider>
    );
};

export const useMobileControls = () => {
    const context = useContext(MobileControlsContext);
    if (!context) {
        throw new Error('useMobileControls must be used within a MobileControlsProvider');
    }
    return context;
};
