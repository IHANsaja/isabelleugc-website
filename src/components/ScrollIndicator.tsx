"use client";

import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const ScrollIndicator: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLParagraphElement>(null);
    const mouseRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        if (!containerRef.current || !textRef.current || !mouseRef.current) return;

        // 1. Jump & Bounce Animation (Idle)
        // A more energetic jump than a simple float
        const jumpTl = gsap.timeline({ repeat: -1, repeatDelay: 1 });

        jumpTl.to(mouseRef.current, {
            y: -15,
            duration: 0.4,
            ease: "power2.out"
        })
            .to(mouseRef.current, {
                y: 0,
                duration: 0.5,
                ease: "bounce.out"
            });

        // 2. Unique Text Animation (Staggered or subtle wave)
        // Split text logic manually or just animate the whole block nicely
        gsap.to(textRef.current, {
            y: 5,
            opacity: 0.5,
            duration: 1.5,
            yoyo: true,
            repeat: -1,
            ease: "sine.inOut"
        });

        // 3. Fade Out on Scroll
        gsap.to(containerRef.current, {
            scrollTrigger: {
                trigger: "body",
                start: "top top",
                end: "100px top",
                scrub: true,
            },
            opacity: 0,
            y: 20,
            ease: "power1.out"
        });

    }, { scope: containerRef });

    return (
        <div
            ref={containerRef}
            className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-10 flex flex-col items-center space-y-3 pointer-events-none mix-blend-difference text-white"
        >
            {/* Scroll text */}
            <p ref={textRef} className="font-instrument-sans text-[10px] tracking-widest uppercase">
                Scroll to Experience
            </p>

            {/* Mouse Icon */}
            <div ref={mouseRef} className="w-6 h-12 border-2 border-white rounded-full flex justify-center pt-2 relative overflow-hidden">
                <div className="w-1.5 h-3 bg-white rounded-full animate-scroll-wheel-gsap-controlled" />
            </div>

            <style jsx>{`
                @keyframes wheel-slide {
                    0% { transform: translateY(0); opacity: 1; }
                    100% { transform: translateY(15px); opacity: 0; }
                }
                .animate-scroll-wheel-gsap-controlled {
                    animation: wheel-slide 1.5s infinite;
                }
            `}</style>
        </div>
    );
};

export default ScrollIndicator;