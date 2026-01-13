"use client";

import React, { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

interface NavigationHUDProps {
    isVisible: boolean;
    isLookingAtTV?: boolean;
}

const NavigationHUD: React.FC<NavigationHUDProps> = ({ isVisible, isLookingAtTV = false }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [shouldRender, setShouldRender] = useState(isVisible);

    useEffect(() => {
        if (isVisible) {
            setShouldRender(true);
        }
    }, [isVisible]);

    useGSAP(() => {
        if (!containerRef.current) return;

        const tl = gsap.timeline({
            onComplete: () => {
                if (!isVisible) setShouldRender(false);
            }
        });

        if (isVisible && shouldRender) {
            // Appear animation
            tl.set(".nav-hud-element", { opacity: 0, scale: 0.8 })
                .set(".crosshair-element", { opacity: 0, scale: 0.5 })
                .to(".crosshair-element", {
                    opacity: 1,
                    scale: 1,
                    duration: 0.3,
                    ease: "back.out(2)"
                })
                .to(".nav-hud-element", {
                    opacity: 1,
                    scale: 1,
                    duration: 0.4,
                    stagger: 0.1,
                    ease: "power2.out"
                }, "-=0.1");
        } else if (!isVisible && shouldRender) {
            // Disappear animation
            tl.to(".nav-hud-element", {
                opacity: 0,
                scale: 0.8,
                duration: 0.2,
                stagger: 0.05,
                ease: "power2.in"
            })
                .to(".crosshair-element", {
                    opacity: 0,
                    scale: 0.5,
                    duration: 0.2,
                    ease: "power2.in"
                }, "-=0.1");
        }
    }, { scope: containerRef, dependencies: [isVisible, shouldRender] });

    if (!shouldRender) return null;

    return (
        <div ref={containerRef} className="absolute inset-0 z-40 pointer-events-none">
            {/* Center Crosshair */}
            <div className="crosshair-element absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="relative w-6 h-6">
                    {/* Horizontal line */}
                    <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/50 -translate-y-1/2"></div>
                    {/* Vertical line */}
                    <div className="absolute left-1/2 top-0 w-[1px] h-full bg-white/50 -translate-x-1/2"></div>
                    {/* Center dot */}
                    <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full transition-colors duration-200 ${isLookingAtTV ? 'bg-sec-gold' : 'bg-white/80'}`}></div>
                    {/* Outer ring */}
                    <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full border transition-colors duration-200 ${isLookingAtTV ? 'border-sec-gold/60' : 'border-white/30'}`}></div>
                </div>
            </div>

            {/* TV Interaction Prompt - shows when looking at TV */}
            {isLookingAtTV && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-8 flex items-center gap-3 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full border border-sec-gold/30">
                    <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded bg-sec-gold/20 border border-sec-gold/40 flex items-center justify-center text-sec-gold text-[10px] font-bold">E</div>
                        <span className="text-sec-gold/60 font-instrument-sans text-[10px]">/</span>
                        <div className="w-5 h-5 rounded bg-sec-gold/20 border border-sec-gold/40 flex items-center justify-center text-sec-gold text-[8px] font-bold">LMB</div>
                    </div>
                    <span className="text-sec-gold/80 font-instrument-sans text-[10px] uppercase tracking-wider">Interact</span>
                </div>
            )}

            {/* Bottom Center - Exit Hint */}
            <div className="nav-hud-element absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10">
                <div className="w-4 h-4 rounded bg-white/10 border border-white/20 flex items-center justify-center text-white/60 text-[8px]">ESC</div>
                <span className="text-white/50 font-instrument-sans text-[10px] uppercase tracking-wider">Press to exit</span>
            </div>

            {/* Top Left - Exploring indicator */}
            <div className="nav-hud-element absolute top-6 left-6 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                <span className="text-white/50 font-instrument-sans text-[10px] uppercase tracking-[0.2em]">Exploring</span>
            </div>

            {/* Top Right - Minimal controls reminder */}
            <div className="nav-hud-element absolute top-6 right-6 flex items-center gap-3 text-white/30 text-[10px] uppercase tracking-wider font-instrument-sans">
                <span>WASD</span>
                <span className="text-white/20">|</span>
                <span>Mouse</span>
            </div>

            {/* Corner accents - minimal */}
            <div className="nav-hud-element absolute top-4 left-4 w-4 h-4 border-l border-t border-white/10"></div>
            <div className="nav-hud-element absolute top-4 right-4 w-4 h-4 border-r border-t border-white/10"></div>
            <div className="nav-hud-element absolute bottom-4 left-4 w-4 h-4 border-l border-b border-white/10"></div>
            <div className="nav-hud-element absolute bottom-4 right-4 w-4 h-4 border-r border-b border-white/10"></div>
        </div>
    );
};

export default NavigationHUD;
