"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

interface ExperienceTransitionLoaderProps {
    onComplete?: () => void;
    initialState?: "hidden" | "visible";
    isFinished?: boolean;
    progress?: number;
}

const ExperienceTransitionLoader: React.FC<ExperienceTransitionLoaderProps> = ({ 
    onComplete, 
    initialState = "hidden",
    isFinished = false,
    progress = 0
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);
    const subtitleRef = useRef<HTMLSpanElement>(null);
    const progressLineRef = useRef<HTMLDivElement>(null);
    const progressContainerRef = useRef<HTMLDivElement>(null);
    const statusItemsRef = useRef<HTMLDivElement>(null);
    const progressTextRef = useRef<HTMLSpanElement>(null);

    // Update progress bar width based on prop
    useGSAP(() => {
        if (progressLineRef.current) {
            gsap.to(progressLineRef.current, {
                width: `${progress}%`,
                duration: 0.5,
                ease: "power2.out"
            });
        }
    }, [progress]);

    useGSAP(() => {
        const tl = gsap.timeline({
            onComplete: () => {
                if (onComplete && initialState === "hidden") onComplete();
            }
        });

        if (initialState === "hidden") {
            // ORIGINAL ENTRANCE ANIMATION (Landing Page)
            
            // 1. Container Fade In
            tl.to(containerRef.current, {
                opacity: 1,
                duration: 0.5,
                ease: "power2.out"
            });

            // 2. Text Stagger Reveal
            tl.fromTo([titleRef.current, subtitleRef.current],
                { y: 30, opacity: 0 },
                { 
                    y: 0, 
                    opacity: 1, 
                    duration: 1.2, 
                    stagger: 0.2,
                    ease: "power3.out" 
                },
                "-=0.2"
            );

            // 3. Progress Line Expand
            tl.fromTo(progressContainerRef.current,
                { scaleX: 0, opacity: 0 },
                { scaleX: 1, opacity: 1, duration: 0.8, ease: "expo.out" },
                "-=0.8"
            );

            // 4. Progress Fill - Fake for landing
            tl.to(progressLineRef.current, {
                width: "100%",
                duration: 2.5,
                ease: "expo.inOut"
            });

            // 5. Status Items Fade In
            tl.fromTo(statusItemsRef.current?.children || [],
                { opacity: 0, y: 10 },
                { opacity: 1, y: 0, duration: 0.5, stagger: 0.1 },
                "<" 
            );

            // 6. Hold State
            tl.to({}, { duration: 0.5 });

        } else {
            // VISIBLE STATE (For Experience Page - Real Loading)
            gsap.set(containerRef.current, { opacity: 1 });
            gsap.set([titleRef.current, subtitleRef.current], { y: 0, opacity: 1 });
            gsap.set(progressContainerRef.current, { scaleX: 1, opacity: 1 });
            // Don't force width to 100% here, let the effect handle it via progress prop
            gsap.set(statusItemsRef.current?.children || [], { opacity: 1, y: 0 });
            
            // Optional: Pulse animation
            gsap.to(subtitleRef.current, { opacity: 0.3, duration: 1, yoyo: true, repeat: -1 });
        }

    }, { scope: containerRef, dependencies: [initialState] });

    // Handle Exit/Cleanup when isFinished is true
    useGSAP(() => {
        if (isFinished && containerRef.current) {
            gsap.to(containerRef.current, {
                opacity: 0,
                duration: 0.6,
                ease: "power2.inOut",
                onComplete: () => {
                    if (onComplete) onComplete();
                }
            });
        }
    }, { scope: containerRef, dependencies: [isFinished] });

    return (
        <div 
            ref={containerRef} 
            className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#F6F3E8] opacity-0 text-[#231F20]"
        >
            {/* Background Decorative Grid */}
            <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" 
                 style={{ 
                     backgroundImage: 'linear-gradient(#231F20 1px, transparent 1px), linear-gradient(90deg, #231F20 1px, transparent 1px)', 
                     backgroundSize: '40px 40px' 
                 }}
            />

            <div className="relative z-10 flex flex-col items-center gap-8 w-full max-w-md px-8">
                
                {/* Main Text */}
                <div className="flex flex-col items-center text-center">
                    <span 
                        ref={subtitleRef} 
                        className="font-instrument-sans text-[10px] md:text-xs font-bold tracking-[0.4em] uppercase opacity-60 mb-3"
                    >
                        {initialState === "hidden" ? "Initializing Interface" : "Finalizing Environment"}
                    </span>
                    <h2 
                        ref={titleRef} 
                        className="font-cormorant-garamond text-4xl md:text-6xl italic leading-none"
                    >
                        {initialState === "hidden" ? "Entering Penthouse" : "System Ready"}
                    </h2>
                </div>

                {/* Technical Progress Bar */}
                <div className="w-full flex flex-col gap-2">
                    <div className="flex justify-between items-end px-1">
                        <span className="font-instrument-sans text-[9px] font-bold tracking-widest opacity-40">LOCALE: SHANGHAI</span>
                        <span className="font-instrument-sans text-[9px] font-bold tracking-widest opacity-40">SYS: {initialState === "hidden" ? "ONLINE" : "LOADING"}</span>
                    </div>
                    
                    <div ref={progressContainerRef} className="w-full h-[1px] bg-[#231F20]/20 relative overflow-hidden origin-left">
                        <div 
                            ref={progressLineRef} 
                            className="absolute left-0 top-0 h-full bg-[#231F20] w-0"
                            style={{ boxShadow: '0 0 10px rgba(35, 31, 32, 0.3)' }}
                        />
                    </div>
                </div>

                {/* Footer Status */}
                <div ref={statusItemsRef} className="flex flex-col items-center gap-1 mt-8">
                    <span className="font-instrument-sans text-[9px] tracking-[0.2em] opacity-30 uppercase">
                        Loading assets... {Math.round(progress)}%
                    </span>
                    <span className="font-instrument-sans text-[9px] tracking-[0.2em] opacity-30 uppercase">
                        Establishing connection...
                    </span>
                </div>
            </div>

            {/* Corner Decorations */}
            <div className="absolute top-8 left-8 w-4 h-4 border-l border-t border-[#231F20]/20" />
            <div className="absolute top-8 right-8 w-4 h-4 border-r border-t border-[#231F20]/20" />
            <div className="absolute bottom-8 left-8 w-4 h-4 border-l border-b border-[#231F20]/20" />
            <div className="absolute bottom-8 right-8 w-4 h-4 border-r border-b border-[#231F20]/20" />
        </div>
    );
};

export default ExperienceTransitionLoader;
