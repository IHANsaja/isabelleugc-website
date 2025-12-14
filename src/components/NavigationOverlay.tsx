"use client";

import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

interface NavigationOverlayProps {
    isOpen: boolean;
    onClose: () => void;
}

const NavigationOverlay: React.FC<NavigationOverlayProps> = ({ isOpen, onClose }) => {
    const containerRef = useRef<HTMLDivElement>(null);

    // 10 columns x 5 rows cover the 75vh decently on most screens.
    // We'll use more rows for better density if needed, but 50 divs is cheap.
    const rows = 5;
    const cols = 10;
    const gridItems = Array.from({ length: rows * cols });

    const tl = useRef<gsap.core.Timeline | null>(null);

    useGSAP(() => {
        tl.current = gsap.timeline({
            paused: true,
            onReverseComplete: () => {
                if (containerRef.current) {
                    containerRef.current.style.pointerEvents = "none";
                }
            }
        });

        // 1. Grid Squares Reveal
        tl.current.to(".grid-square", {
            scale: 1.05, // Slight overlap to prevent gaps
            opacity: 1,
            duration: 0.5,
            stagger: {
                grid: [rows, cols],
                from: "start", // Starts from top-left (first item)
                axis: "x",
                amount: 0.8
            },
            ease: "power3.inOut"
        })
            // 2. Links Fade In
            .to(".nav-link", {
                y: 0,
                opacity: 1,
                stagger: 0.1,
                duration: 0.5,
                ease: "power2.out"
            }, "-=0.4"); // Overlap slightly with squares

    }, { scope: containerRef }); // Run once to create timeline

    // Control timeline based on isOpen changes
    useGSAP(() => {
        if (isOpen) {
            if (containerRef.current) {
                containerRef.current.style.pointerEvents = "auto";
            }
            tl.current?.play();
        } else {
            tl.current?.reverse();
        }
    }, { dependencies: [isOpen] });

    return (
        <div
            ref={containerRef}
            className="fixed top-0 left-0 w-full h-[75vh] z-40 pointer-events-none"
        >
            {/* Background Grid Layer */}
            <div className="absolute inset-0 w-full h-full grid grid-cols-10 grid-rows-5">
                {gridItems.map((_, i) => (
                    <div
                        key={i}
                        className="grid-square w-full h-full bg-[#111111] scale-0 opacity-0"
                    />
                ))}
            </div>

            {/* Content Layer */}
            <div className="absolute inset-0 flex items-center justify-center z-50">
                <nav className="flex flex-col items-center gap-8">
                    {['Home', 'About', 'Work', 'Contact'].map((item) => (
                        <a
                            key={item}
                            href={`#${item.toLowerCase()}`}
                            className="nav-link text-white font-instrument-sans text-4xl md:text-6xl uppercase tracking-widest opacity-0 translate-y-8 hover:text-gray-400 transition-colors"
                            onClick={onClose}
                        >
                            {item}
                        </a>
                    ))}
                </nav>
            </div>
        </div>
    )
}

export default NavigationOverlay;
