"use client";

import React, { useRef, useCallback, useEffect, useState } from 'react';
import { useMobileControls } from '@/context/MobileControlsContext';

const MobileJoystick: React.FC = () => {
    const { setJoystick, isMobile } = useMobileControls();
    const joystickRef = useRef<HTMLDivElement>(null);
    const knobRef = useRef<HTMLDivElement>(null);
    const [isActive, setIsActive] = useState(false);
    const touchIdRef = useRef<number | null>(null);

    const JOYSTICK_SIZE = 120;
    const KNOB_SIZE = 50;
    const MAX_DISTANCE = (JOYSTICK_SIZE - KNOB_SIZE) / 2;

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        e.preventDefault();
        const touch = e.touches[0];
        touchIdRef.current = touch.identifier;
        setIsActive(true);
        handleMove(touch.clientX, touch.clientY);
    }, []);

    const handleMove = useCallback((clientX: number, clientY: number) => {
        if (!joystickRef.current || !knobRef.current) return;

        const rect = joystickRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        let deltaX = clientX - centerX;
        let deltaY = clientY - centerY;

        // Clamp to max distance
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        if (distance > MAX_DISTANCE) {
            deltaX = (deltaX / distance) * MAX_DISTANCE;
            deltaY = (deltaY / distance) * MAX_DISTANCE;
        }

        // Move knob visually
        knobRef.current.style.transform = `translate(${deltaX}px, ${deltaY}px)`;

        // Normalize to -1 to 1 range
        const normalizedX = deltaX / MAX_DISTANCE;
        const normalizedY = -deltaY / MAX_DISTANCE; // Invert Y (up = forward)

        setJoystick({ x: normalizedX, y: normalizedY });
    }, [setJoystick, MAX_DISTANCE]);

    const handleTouchMove = useCallback((e: TouchEvent) => {
        if (touchIdRef.current === null) return;
        
        for (let i = 0; i < e.touches.length; i++) {
            if (e.touches[i].identifier === touchIdRef.current) {
                handleMove(e.touches[i].clientX, e.touches[i].clientY);
                break;
            }
        }
    }, [handleMove]);

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
            setIsActive(false);
            setJoystick({ x: 0, y: 0 });
            if (knobRef.current) {
                knobRef.current.style.transform = 'translate(0px, 0px)';
            }
        }
    }, [setJoystick]);

    useEffect(() => {
        window.addEventListener('touchmove', handleTouchMove, { passive: false });
        window.addEventListener('touchend', handleTouchEnd);
        window.addEventListener('touchcancel', handleTouchEnd);

        return () => {
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
            window.removeEventListener('touchcancel', handleTouchEnd);
        };
    }, [handleTouchMove, handleTouchEnd]);

    if (!isMobile) return null;

    return (
        <div className="fixed bottom-8 left-8 z-50 touch-none">
            {/* Joystick Base */}
            <div
                ref={joystickRef}
                onTouchStart={handleTouchStart}
                className={`relative rounded-full border-2 transition-all duration-150 ${
                    isActive 
                        ? 'bg-white/20 border-white/40' 
                        : 'bg-black/30 border-white/20'
                }`}
                style={{ width: JOYSTICK_SIZE, height: JOYSTICK_SIZE }}
            >
                {/* Direction indicators */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="absolute top-2 text-white/30 text-[10px]">▲</div>
                    <div className="absolute bottom-2 text-white/30 text-[10px]">▼</div>
                    <div className="absolute left-2 text-white/30 text-[10px]">◀</div>
                    <div className="absolute right-2 text-white/30 text-[10px]">▶</div>
                </div>

                {/* Joystick Knob */}
                <div
                    ref={knobRef}
                    className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full transition-colors duration-150 ${
                        isActive 
                            ? 'bg-gradient-to-br from-sec-gold to-sec-light-gold shadow-lg' 
                            : 'bg-white/60'
                    }`}
                    style={{ 
                        width: KNOB_SIZE, 
                        height: KNOB_SIZE,
                        willChange: 'transform'
                    }}
                />
            </div>

            {/* Label */}
            <div className="text-center mt-2 text-white/40 font-instrument-sans text-[9px] uppercase tracking-wider">
                Move
            </div>
        </div>
    );
};

export default MobileJoystick;
