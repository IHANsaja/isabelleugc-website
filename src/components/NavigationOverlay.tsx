"use client";

import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import Link from 'next/link';

interface NavigationOverlayProps {
    isOpen: boolean;
    onClose: () => void;
}

const NavigationOverlay: React.FC<NavigationOverlayProps> = ({ isOpen, onClose }) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        const slices = gsap.utils.toArray(".bg-slice");

        if (isOpen) {
            // --- ENTER SEQUENCE ---
            if (containerRef.current) gsap.set(containerRef.current, { pointerEvents: "auto" });

            const tl = gsap.timeline();

            // 1. Container Visible
            tl.set(containerRef.current, { opacity: 1 });

            // 2. Staggered Slices In (Curtain Effect)
            // ScaleY from 0 to 1, origin top
            tl.fromTo(slices, 
                { scaleY: 0, transformOrigin: "top" },
                { scaleY: 1, duration: 0.8, stagger: 0.1, ease: "power4.inOut" }
            );

            // 3. Elements Reveal
            // Wait slightly for background to cover
            const contentDelay = "-=0.4"; 

            // Center Menu
            tl.fromTo(".nav-item", 
                { y: 100, opacity: 0 },
                { y: 0, opacity: 1, duration: 1, stagger: 0.1, ease: "power3.out" },
                contentDelay
            );

            // Featured Card
            tl.fromTo(".featured-card",
                { scale: 0.9, opacity: 0 },
                { scale: 1, opacity: 1, duration: 1, ease: "power3.out" },
                "<" 
            );

            // Sidebar
            tl.fromTo(".sidebar-element",
                { x: 30, opacity: 0 },
                { x: 0, opacity: 1, duration: 1, stagger: 0.1, ease: "power3.out" },
                "<"
            );

            // Close Button - Explicit Pop In
            // Ensure we target the fixed button
            tl.fromTo(".close-btn",
                { scale: 0, rotation: -180, opacity: 0 },
                { scale: 1, rotation: 0, opacity: 1, duration: 0.6, ease: "back.out(1.7)" },
                "-=0.6"
            );

        } else {
            // --- EXIT SEQUENCE ---
            const tl = gsap.timeline({
                onComplete: () => {
                    if (containerRef.current) gsap.set(containerRef.current, { pointerEvents: "none" });
                }
            });

            // 1. Content Out
            tl.to([".nav-item", ".featured-card", ".sidebar-element", ".close-btn"], {
                opacity: 0,
                y: -30,
                duration: 0.4,
                ease: "power2.in",
                stagger: 0.02
            });

            // 2. Slices Out (Slide Up)
            tl.to(slices, {
                scaleY: 0,
                transformOrigin: "bottom", // Slide UP to disappear
                duration: 0.8,
                stagger: {
                    amount: 0.3,
                    from: "end" // Reverse stagger
                },
                ease: "power4.inOut"
            }, "-=0.2");

            // 3. Container Hide
            tl.set(containerRef.current, { opacity: 0 });
        }
    }, { dependencies: [isOpen], scope: containerRef });

    const menuItems = [
        { label: "Home", href: "/", sub: "01 EXPLORE" },
        { label: "About", href: "/about", sub: "02 STORY" },
        { label: "Work", href: "#work", sub: "03 PIECES" },
        { label: "Contact", href: "/contact", sub: "04 CONNECT" },
    ];

    return (
        <div 
            ref={containerRef}
            className="fixed inset-0 z-[99999] opacity-0 pointer-events-none flex"
        >
            {/* --- BACKGROUND SLICES (Z-0) --- */}
            <div className="absolute inset-0 flex z-0 h-full w-full pointer-events-none">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="bg-slice w-1/5 h-full bg-[#110f0b] border-r border-[#F6F3E8]/5 last:border-r-0 origin-top"></div>
                ))}
            </div>

            {/* --- CONTENT (Z-20) --- */}
            <div className="relative z-20 w-full h-full flex text-[#F6F3E8]">
                {/* --- LEFT COLUMN: FEATURED PIECE --- */}
                <div className="hidden md:flex w-1/4 h-full items-center justify-center border-r border-transparent relative"> 
                    {/* Note: transparent border because bg slices have borders */}
                    <div className="featured-card w-64 h-96 border border-[#F6F3E8]/20 p-2 relative group cursor-pointer">
                        <div className="absolute inset-0 border border-[#C9AB6A]/30 scale-95 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-500"></div>
                        <div className="w-full h-full bg-[#1a1815] flex flex-col items-center justify-center relative overflow-hidden">
                            <div className="w-[1px] h-8 bg-[#C9AB6A] mb-4"></div>
                            <span className="font-instrument-sans text-[8px] tracking-[0.3em] text-[#C9AB6A] uppercase mb-1">Featured</span>
                            <span className="font-cormorant-garamond italic text-3xl">Piece</span>
                            
                            {/* Placeholder for image */}
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500"></div>
                        </div>
                        {/* Corner accents */}
                        <div className="absolute top-0 left-0 w-2 h-2 border-l border-t border-[#C9AB6A]"></div>
                        <div className="absolute top-0 right-0 w-2 h-2 border-r border-t border-[#C9AB6A]"></div>
                        <div className="absolute bottom-0 left-0 w-2 h-2 border-l border-b border-[#C9AB6A]"></div>
                        <div className="absolute bottom-0 right-0 w-2 h-2 border-r border-b border-[#C9AB6A]"></div>
                    </div>
                </div>

                {/* --- CENTER COLUMN: MENU --- */}
                <div className="w-full md:w-1/2 h-full flex items-center justify-center relative">
                    <nav className="flex flex-col items-center gap-10 md:gap-14">
                        {menuItems.map((item, i) => (
                            <div key={item.label} className="nav-item flex flex-col items-center group cursor-pointer">
                                <span className="font-instrument-sans text-[8px] tracking-[0.3em] uppercase opacity-40 mb-1 group-hover:text-[#C9AB6A] transition-colors duration-300">
                                    {item.sub}
                                </span>
                                <Link 
                                    href={item.href} 
                                    onClick={onClose}
                                    className="font-cormorant-garamond text-5xl md:text-8xl uppercase tracking-widest leading-none relative overflow-hidden block"
                                >
                                    <span className="block transition-transform duration-500 group-hover:-translate-y-full italic" data-text={item.label}>{item.label}</span>
                                    <span className="absolute top-0 left-0 block translate-y-full transition-transform duration-500 group-hover:translate-y-0 text-[#C9AB6A] italic">{item.label}</span>
                                </Link>
                            </div>
                        ))}
                    </nav>
                </div>

                {/* --- RIGHT COLUMN: SIDEBAR INFO --- */}
                <div className="hidden md:flex w-1/4 h-full border-l border-transparent flex-col justify-between p-12 relative overflow-hidden">
                    
                    {/* Spacer for Close Button */}
                    <div className="w-16 h-16"></div>

                    <div className="flex-1 flex flex-col justify-center items-end gap-20">
                        <div className="sidebar-element flex items-center gap-4 rotate-90 origin-right translate-x-8">
                            <span className="font-instrument-sans text-[9px] tracking-[0.2em] opacity-40 uppercase whitespace-nowrap">Est. 2025 // 51.5074 N</span>
                            <div className="w-12 h-[1px] bg-[#F6F3E8]/20"></div>
                        </div>
                        
                        <div className="sidebar-element rotate-90 origin-right translate-x-8 mt-32">
                            <span className="font-instrument-sans text-[9px] tracking-[0.2em] opacity-30 uppercase">Architectural Status</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Background Texture (Overlay on top of slices) */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-10" style={{ backgroundImage: 'linear-gradient(#F6F3E8 1px, transparent 1px), linear-gradient(90deg, #F6F3E8 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

            {/* --- UNIVERSAL CLOSE BUTTON (Fixed Z-100) --- */}
            <button 
                onClick={onClose}
                className="close-btn fixed top-6 right-6 md:top-12 md:right-12 z-[100000] w-10 h-10 md:w-16 md:h-16 rounded-full border border-[#F6F3E8]/20 flex items-center justify-center hover:bg-[#F6F3E8] hover:text-[#110f0b] transition-all duration-300 group cursor-pointer text-[#F6F3E8]"
            >
                <svg className="w-4 h-4 md:w-5 md:h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
        </div>
    );
};

export default NavigationOverlay;
