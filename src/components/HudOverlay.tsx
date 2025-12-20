"use client";

import React, { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const HudOverlay: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const leftIndicatorRef = useRef<HTMLDivElement>(null);
    const rightIndicatorRef = useRef<HTMLDivElement>(null);
    const percentageRef = useRef<HTMLSpanElement>(null);

    useGSAP(() => {
        gsap.registerPlugin(ScrollTrigger);

        const tl = gsap.timeline();

        // 1. Entrance Animations (Target Wrappers)
        tl.from(".hud-bracket", {
            scale: 0.9,
            opacity: 0,
            duration: 1,
            ease: "power2.out",
            stagger: 0.2
        })
            // Bottom Left Content Wrappers
            .from(".hud-title-wrapper", {
                y: 20,
                opacity: 0,
                duration: 0.8,
                ease: "power2.out"
            }, "-=0.5")
            .from(".hud-btn-wrapper", {
                x: -20,
                opacity: 0,
                duration: 0.6,
                ease: "power2.out"
            }, "-=0.6")
            // Bottom Right Card Wrapper
            .from(".hud-card-wrapper", {
                x: 20,
                opacity: 0,
                duration: 0.8,
                ease: "power2.out"
            }, "-=0.8")
            // Progress Bar & Counter
            .from(".hud-progress-bar", {
                width: "0%",
                duration: 1.5,
                ease: "power2.out",
                onUpdate: function () {
                    const progress = this.progress();
                    if (percentageRef.current) {
                        percentageRef.current.innerText = Math.round(progress * 98) + "%";
                    }
                }
            }, "-=0.6")
            // Rulers
            .from(".hud-ruler", {
                opacity: 0,
                duration: 1
            }, "-=0.5")
            // Center Label Wrapper
            .from(".hud-center-label-wrapper", {
                opacity: 0,
                scale: 0,
                duration: 0.5
            }, "-=0.5");


        // 2. Scroll Indicators Logic
        if (leftIndicatorRef.current) {
            gsap.to(leftIndicatorRef.current, {
                top: "100%",
                ease: "none",
                scrollTrigger: {
                    trigger: "body",
                    start: "top top",
                    end: "bottom bottom",
                    scrub: true
                }
            });
        }

        if (rightIndicatorRef.current) {
            gsap.to(rightIndicatorRef.current, {
                top: "100%",
                ease: "none",
                scrollTrigger: {
                    trigger: "body",
                    start: "top top",
                    end: "bottom bottom",
                    scrub: true
                }
            });
        }

        // 3. Scroll Exit Animations (Target Inner Content)
        // This ensures the entrance animation (on wrapper) doesn't conflict with exit (on child)
        gsap.to([".hud-title-inner", ".hud-btn-inner", ".hud-center-label-inner"], {
            opacity: 0,
            y: -30,
            filter: "blur(10px)",
            stagger: 0.05,
            scrollTrigger: {
                trigger: "body",
                start: "top top",
                end: "150px top",
                scrub: true
            }
        });

    }, { scope: containerRef });

    return (
        <div ref={containerRef} className="fixed inset-0 pointer-events-none z-30 overflow-hidden">
            {/* Top Left Bracket */}
            <div className="hud-bracket absolute top-4 left-4 w-24 h-24 md:top-8 md:left-8 md:w-48 md:h-48 border-l-2 border-t-2 border-main-black/80 opacity-60 fixed">
                <div className="absolute top-0 right-0 w-2 h-2 bg-main-black/80" />
                <div className="absolute bottom-0 left-0 w-2 h-2 bg-main-black/80" />
                <div className="absolute top-4 left-0 w-2 h-[1px] bg-main-black/50" />
                <div className="absolute top-8 left-0 w-2 h-[1px] bg-main-black/50" />
                <div className="absolute top-12 left-0 w-2 h-[1px] bg-main-black/50" />
            </div>

            {/* Top Right Bracket */}
            <div className="hud-bracket absolute top-4 right-4 w-24 h-24 md:top-8 md:right-8 md:w-48 md:h-48 border-r-2 border-t-2 border-main-black/80 opacity-60 fixed">
                <div className="absolute top-0 left-0 w-2 h-2 bg-main-black/80" />
                <div className="absolute bottom-0 right-0 w-2 h-2 bg-main-black/80" />
            </div>

            {/* Left Vertical Ruler - Hidden on mobile */}
            <div className="hud-ruler hidden md:flex absolute left-8 top-1/2 -translate-y-1/2 h-[30vh] w-[1px] bg-main-black/20 flex-col justify-between items-center fixed">
                {/* Ticks */}
                {Array.from({ length: 15 }).map((_, i) => (
                    <div key={i} className={`w-2 h-[1px] bg-main-black/40 ${i === 0 || i === 14 ? 'w-4' : ''}`} />
                ))}

                {/* Interactive Indicator */}
                <div ref={leftIndicatorRef} className="absolute top-0 left-[-4px] w-0 h-0 border-l-[6px] border-r-[0px] border-t-[4px] border-b-[4px] border-l-main-black border-t-transparent border-b-transparent" />
            </div>

            {/* Right Vertical Ruler - Hidden on mobile */}
            <div className="hud-ruler hidden md:flex absolute right-8 top-1/2 -translate-y-1/2 h-[30vh] w-[1px] bg-main-black/20 flex-col justify-between items-center fixed">
                {/* Ticks */}
                {Array.from({ length: 15 }).map((_, i) => (
                    <div key={i} className={`w-2 h-[1px] bg-main-black/40 ${i === 0 || i === 14 ? 'w-4' : ''}`} />
                ))}

                {/* Interactive Indicator */}
                <div ref={rightIndicatorRef} className="absolute top-0 right-[-4px] w-0 h-0 border-r-[6px] border-l-[0px] border-t-[4px] border-b-[4px] border-r-main-black border-t-transparent border-b-transparent" />
            </div>

            {/* Bottom Left Area - Title & CTA */}
            <div className="absolute bottom-16 left-6 md:bottom-24 md:left-16 flex flex-col items-start gap-4 fixed">
                <div className="hud-title-wrapper pointer-events-auto overflow-hidden">
                    <h2 className="hud-title-inner font-instrument-sans text-3xl md:text-5xl lg:text-7xl font-bold text-main-black uppercase leading-none tracking-tighter opacity-80">
                        Crafted<br />to Shine
                    </h2>
                </div>

                <div className="hud-btn-wrapper">
                    <button
                        onClick={() => {
                            const duration = 8000; // 8 seconds for full experience
                            const targetPosition = document.body.scrollHeight - window.innerHeight;
                            const startPosition = window.scrollY;
                            const startTime = performance.now();

                            function animate(currentTime: number) {
                                const elapsed = currentTime - startTime;
                                const progress = Math.min(elapsed / duration, 1);

                                // Easing function (optional, linear for constant speed)
                                // const ease = 1 - Math.pow(1 - progress, 3); // Cubic ease out
                                const ease = progress; // Linear mainly to keep it steady

                                window.scrollTo(0, startPosition + (targetPosition - startPosition) * ease);

                                if (progress < 1) {
                                    requestAnimationFrame(animate);
                                }
                            }

                            requestAnimationFrame(animate);
                        }}
                        className="cursor-pointer hud-btn-inner pointer-events-auto group flex items-center gap-3 px-6 py-3 bg-transparent border border-main-black/30 hover:bg-main-black hover:text-accent-cream transition-all duration-300 rounded-sm mt-4">
                        <span className="font-instrument-sans text-xs tracking-[0.2em] uppercase font-bold text-main-black group-hover:text-accent-cream">Explore Content</span>
                        <div className="w-2 h-2 bg-main-black group-hover:bg-accent-cream transition-colors rotate-45" />
                    </button>
                </div>
            </div>

            {/* Bottom Right Area - Glass Card - Hidden on mobile/tablet */}
            <div className="hud-card-wrapper hidden lg:block absolute bottom-16 right-16 w-80 backdrop-blur-md bg-accent-cream/20 border border-sec-beige/30 p-6 rounded-lg shadow-sm fixed">
                <div className="flex flex-col gap-2">
                    <span className="font-instrument-sans text-[10px] tracking-widest uppercase text-sec-dark-grey">Most Popular Collection</span>
                    <h3 className="font-playfair text-2xl text-main-black">The Icon Edit</h3>

                    <div className="w-full h-[1px] bg-main-black/10 my-2" />

                    <div className="flex justify-between items-center">
                        <span className="font-instrument-sans text-[10px] tracking-widest uppercase text-sec-dark-grey">Popularity</span>
                        <span ref={percentageRef} className="font-instrument-sans text-xs font-bold text-sec-light-gold">0%</span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full h-1 bg-main-black/10 mt-1 rounded-full overflow-hidden">
                        <div className="hud-progress-bar w-[98%] h-full bg-sec-gold" />
                    </div>
                </div>

                {/* Decorative Corner on card */}
                <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-sec-gold/60" />
            </div>

            {/* Bottom Linear Scale */}
            <div className="hud-ruler absolute bottom-8 left-1/2 -translate-x-1/2 flex items-end gap-1 opacity-50 fixed">
                {Array.from({ length: 40 }).map((_, i) => (
                    <div
                        key={i}
                        className={`w-[1px] bg-main-black ${i % 5 === 0 ? 'h-3' : 'h-1.5'}`}
                    />
                ))}
            </div>

            {/* Floating Label Example (Center-ish) - Hidden on mobile */}
            <div className="hud-center-label-wrapper hidden md:block absolute top-[65%] left-[63%] fixed">
                <div className="hud-center-label-inner flex items-center gap-2">
                    <div className="w-12 h-[1px] bg-main-black/60" />
                    <div className="backdrop-blur-md bg-accent-cream/30 border border-main-white/40 px-3 py-1.5 rounded-sm shadow-sm">
                        <span className="font-instrument-sans text-[10px] tracking-widest uppercase text-main-black font-semibold">Showcase Window</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HudOverlay;
