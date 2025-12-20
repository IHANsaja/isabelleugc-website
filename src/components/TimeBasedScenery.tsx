"use client";

import React, { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

const TimeBasedScenery: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [greeting, setGreeting] = useState('');
    const [isNight, setIsNight] = useState(false);
    const [positionX, setPositionX] = useState('100vw');
    const containerRef = useRef<HTMLDivElement>(null);
    const sunMoonRef = useRef<HTMLDivElement>(null);
    const greetingRef = useRef<HTMLDivElement>(null);
    const blurRef = useRef<HTMLDivElement>(null);
    const mainRef = useRef<HTMLDivElement>(null);
    const hasAnimated = useRef(false);

    useEffect(() => {
        const updateScenery = (showGreeting: boolean = false) => {
            const now = new Date();
            const hours = now.getHours();
            const minutes = now.getMinutes();
            const totalHours = hours + minutes / 60;

            // Determine Day/Night
            const night = totalHours < 6 || totalHours >= 18;
            setIsNight(night);
            document.body.dataset.theme = night ? 'night' : 'day';

            // Calculate Position X
            let percent = 50;
            if (!night) {
                percent = 100 - ((totalHours - 6) / 12) * 100;
            } else {
                let adjustedHours = totalHours >= 18 ? totalHours - 18 : totalHours + 6;
                percent = 100 - (adjustedHours / 12) * 100;
            }

            percent = Math.max(0, Math.min(100, percent));
            setPositionX(`${percent}vw`);

            if (showGreeting) {
                let text = '';
                if (hours >= 5 && hours < 12) text = 'Good Morning';
                else if (hours >= 12 && hours < 15) text = 'Good Afternoon';
                else text = 'Good Evening';

                setGreeting(text + "!");
                setIsVisible(true);
            }
        };

        let intervalId: NodeJS.Timeout;

        const handleStart = () => {
            updateScenery(true);
            // Real-time update every minute
            intervalId = setInterval(() => updateScenery(false), 60000);
        };

        window.addEventListener('experience:start', handleStart);
        return () => {
            window.removeEventListener('experience:start', handleStart);
            if (intervalId) clearInterval(intervalId);
        };
    }, []);

    // Entrance Animation (Greeting + Initial Sun/Moon entrance)
    useGSAP(() => {
        if (!isVisible || hasAnimated.current) return;

        hasAnimated.current = true;
        const tl = gsap.timeline();

        // Sun/Moon Entrance Animation (Animate from off-screen Right to the CURRENT position)
        tl.fromTo(sunMoonRef.current,
            { x: '120vw', opacity: 0 },
            {
                x: positionX,
                opacity: 1,
                duration: 3,
                ease: "power2.out"
            }
        );

        // Backdrop Blur and Greeting Animation
        gsap.timeline()
            .to(blurRef.current, {
                opacity: 1,
                duration: 1.5,
                ease: "power2.out"
            })
            .fromTo(greetingRef.current,
                { opacity: 0, scale: 0.8, y: 50 },
                {
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    duration: 2,
                    ease: "power3.out"
                }, "-=1")
            .to(greetingRef.current, {
                opacity: 0,
                y: -50,
                duration: 1.5,
                delay: 3,
                ease: "power3.in"
            })
            .to(blurRef.current, {
                opacity: 0,
                duration: 1.5,
                ease: "power2.in"
            }, "-=1");

    }, { scope: mainRef, dependencies: [isVisible] });

    // Drifting Updates (Smooth movement every minute)
    useGSAP(() => {
        if (!isVisible || !hasAnimated.current) return;

        // Smoothly transition to the new position
        gsap.to(sunMoonRef.current, {
            x: positionX,
            duration: 2,
            ease: "power1.inOut"
        });
    }, { scope: mainRef, dependencies: [positionX] });

    if (!isVisible) return null;

    return (
        <div ref={mainRef} className="pointer-events-none">
            {/* Backdrop Blur Overlay - Fixed to viewport */}
            <div
                ref={blurRef}
                className="fixed inset-0 z-[80] pointer-events-none opacity-0 backdrop-blur-[4px] bg-black/5"
            />

            {/* Scenery Container - Absolute so it scrolls with content */}
            <div ref={containerRef} className="absolute inset-x-0 top-0 h-screen pointer-events-none z-[0] overflow-hidden">
                {/* Sun or Moon Wrapper */}
                <div
                    ref={sunMoonRef}
                    className="absolute top-[16%] w-20 h-20 md:w-24 md:h-24 flex items-center justify-center -translate-x-1/2"
                >
                    {isNight ? (
                        <div className="relative w-full h-full">
                            <div className="absolute inset-0 bg-[#F6F3E8] rounded-full shadow-[0_0_40px_rgba(246,243,232,0.3)]" />
                            <div className="absolute inset-x-3 inset-y-0 bg-theme-bg rounded-full translate-x-3 transition-colors duration-1000" />
                        </div>
                    ) : (
                        <div className="w-full h-full bg-[#FFD700] rounded-full shadow-[0_0_60px_rgba(255,215,0,0.6)] animate-pulse" />
                    )}
                </div>
            </div>

            {/* Greeting Message - Direct child of root to avoid stacking context issues */}
            <div
                ref={greetingRef}
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center w-full px-8 pointer-events-none z-[100]"
            >
                <h2 className="font-playfair text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-main-black opacity-100 transition-colors duration-1500">
                    {greeting}
                </h2>
                <div className="w-16 h-px bg-main-black mx-auto mt-6 opacity-30" />
            </div>
        </div>
    );
};

export default TimeBasedScenery;
