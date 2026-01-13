"use client";

import React, { useRef, useCallback, useEffect } from 'react';
import { useMobileControls } from '@/context/MobileControlsContext';

interface MobileLookControlsProps {
    isActive: boolean;
}

const MobileLookControls: React.FC<MobileLookControlsProps> = ({ isActive }) => {
    const { isMobile, setLookDelta } = useMobileControls();
    const touchIdRef = useRef<number | null>(null);
    const lastTouchRef = useRef<{ x: number; y: number } | null>(null);

    const SENSITIVITY = 0.003;

    const handleTouchStart = useCallback((e: TouchEvent) => {
        // Ignore if touching on controls (joystick/buttons have touch-none class)
        const target = e.target as HTMLElement;
        if (target.closest('.touch-none')) return;
        if (touchIdRef.current !== null) return; // Already tracking a touch

        const touch = e.touches[0];
        touchIdRef.current = touch.identifier;
        lastTouchRef.current = { x: touch.clientX, y: touch.clientY };
    }, []);

    const handleTouchMove = useCallback((e: TouchEvent) => {
        if (touchIdRef.current === null || !lastTouchRef.current) return;

        for (let i = 0; i < e.touches.length; i++) {
            if (e.touches[i].identifier === touchIdRef.current) {
                const touch = e.touches[i];
                const deltaX = (touch.clientX - lastTouchRef.current.x) * SENSITIVITY;
                const deltaY = (touch.clientY - lastTouchRef.current.y) * SENSITIVITY;

                setLookDelta({ x: deltaX, y: deltaY });

                lastTouchRef.current = { x: touch.clientX, y: touch.clientY };
                break;
            }
        }
    }, [setLookDelta]);

    const handleTouchEnd = useCallback((e: TouchEvent) => {
        if (touchIdRef.current === null) return;

        let stillTouching = false;
        for (let i = 0; i < e.touches.length; i++) {
            if (e.touches[i].identifier === touchIdRef.current) {
                stillTouching = true;
                break;
            }
        }

        if (!stillTouching) {
            touchIdRef.current = null;
            lastTouchRef.current = null;
            setLookDelta({ x: 0, y: 0 });
        }
    }, [setLookDelta]);

    useEffect(() => {
        if (!isMobile || !isActive) return;

        window.addEventListener('touchstart', handleTouchStart, { passive: true });
        window.addEventListener('touchmove', handleTouchMove, { passive: true });
        window.addEventListener('touchend', handleTouchEnd);
        window.addEventListener('touchcancel', handleTouchEnd);

        return () => {
            window.removeEventListener('touchstart', handleTouchStart);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
            window.removeEventListener('touchcancel', handleTouchEnd);
        };
    }, [isMobile, isActive, handleTouchStart, handleTouchMove, handleTouchEnd]);

    // This component doesn't render anything - it just handles touch events
    return null;
};

export default MobileLookControls;
