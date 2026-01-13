"use client";

import React, { useCallback } from 'react';
import { useMobileControls } from '@/context/MobileControlsContext';
import { useTVInteraction } from '@/context/TVInteractionContext';

const MobileActionButtons: React.FC = () => {
    const { isMobile, setIsJumping, isSprinting, setIsSprinting } = useMobileControls();
    const { isLookingAtTV, isPanelOpen, togglePanel, setIsPanelOpen } = useTVInteraction();

    const handleJumpStart = useCallback((e: React.TouchEvent) => {
        e.preventDefault();
        setIsJumping(true);
    }, [setIsJumping]);

    const handleJumpEnd = useCallback(() => {
        setIsJumping(false);
    }, [setIsJumping]);

    const handleSprintToggle = useCallback((e: React.TouchEvent) => {
        e.preventDefault();
        setIsSprinting(!isSprinting);
    }, [setIsSprinting, isSprinting]);

    const handleInteract = useCallback((e: React.TouchEvent) => {
        e.preventDefault();
        if (isPanelOpen) {
            setIsPanelOpen(false);
        } else if (isLookingAtTV) {
            togglePanel();
        }
    }, [isLookingAtTV, isPanelOpen, togglePanel, setIsPanelOpen]);

    if (!isMobile) return null;

    return (
        <div className="fixed bottom-8 right-8 z-50 touch-none flex flex-col gap-3 items-end">
            {/* Interact Button - only show when looking at TV or panel open */}
            {(isLookingAtTV || isPanelOpen) && (
                <button
                    onTouchStart={handleInteract}
                    className="w-14 h-14 rounded-full bg-sec-gold/30 border-2 border-sec-gold/60 flex items-center justify-center active:scale-90 transition-transform"
                >
                    <span className="text-sec-gold font-bold text-lg">E</span>
                </button>
            )}

            {/* Button Row */}
            <div className="flex gap-3">
                {/* Sprint Toggle */}
                <button
                    onTouchStart={handleSprintToggle}
                    className={`w-14 h-14 rounded-full border-2 flex items-center justify-center active:scale-90 transition-all ${
                        isSprinting 
                            ? 'bg-sec-gold/40 border-sec-gold/80' 
                            : 'bg-black/30 border-white/20'
                    }`}
                >
                    <svg className={`w-6 h-6 ${isSprinting ? 'text-sec-gold' : 'text-white/60'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                </button>

                {/* Jump Button */}
                <button
                    onTouchStart={handleJumpStart}
                    onTouchEnd={handleJumpEnd}
                    onTouchCancel={handleJumpEnd}
                    className="w-16 h-16 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center active:scale-90 active:bg-white/30 transition-all"
                >
                    <svg className="w-7 h-7 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                </button>
            </div>

            {/* Labels */}
            <div className="flex gap-3 text-white/40 font-instrument-sans text-[9px] uppercase tracking-wider">
                <span className="w-14 text-center">Sprint</span>
                <span className="w-16 text-center">Jump</span>
            </div>
        </div>
    );
};

export default MobileActionButtons;
