"use client";

import React, { useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Marquee from "@/components/Marquee";

export default function AboutPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    
    // Animation for entrance
    useGSAP(() => {
        const tl = gsap.timeline();
        
        tl.from(".animate-fade-up", {
            y: 50,
            opacity: 0,
            duration: 1,
            stagger: 0.1,
            ease: "power3.out"
        });
        
        tl.from(".animate-scale", {
            scale: 1.1,
            opacity: 0,
            duration: 1.5,
            ease: "power2.out"
        }, 0);
        
    }, { scope: containerRef });

    return (
        <div ref={containerRef} className="min-h-screen bg-[#F6F3E8] text-[#231F20] overflow-hidden flex flex-col md:flex-row relative">
            
            {/* --- LEFT COLUMN: CONTENT --- */}
            <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-between relative z-10">
                
                {/* Background "ECLAT" Watermark */}
                <div className="absolute top-0 left-0 h-full w-full overflow-hidden pointer-events-none opacity-[0.03]">
                     <span className="font-cormorant-garamond font-bold text-[40vh] leading-none absolute -left-[10vh] top-[10vh] rotate-90 origin-top-left whitespace-nowrap">
                        ECLAT
                     </span>
                </div>

                {/* Top Badge / Logo */}
                <div className="animate-fade-up self-start">
                    <Link href="/" className="block relative cursor-pointer group">
                        <div className="perspective">
                             <img 
                                src="/assets/images/logo.png" 
                                alt="Logo" 
                                className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-full shadow-lg transform-style-preserve-3d"
                             />
                        </div>
                    </Link>
                </div>

                {/* Main Content */}
                <div className="mt-12 md:mt-24 max-w-lg animate-fade-up">
                    <div className="mb-2">
                        <span className="font-instrument-sans text-[10px] tracking-[0.3em] opacity-60 uppercase border-l border-[#231F20] pl-3">
                            The Penthouse Experience
                        </span>
                    </div>
                    
                    <h1 className="font-cormorant-garamond text-7xl md:text-8xl leading-[0.9] mb-8">
                        Jewelry <br/>
                        <span className="italic">that</span> <br/>
                        defines <br/>
                        <span className="text-[#C9AB6A] italic opacity-80">a lifestyle.</span>
                    </h1>

                    <div className="space-y-6 max-w-md font-instrument-sans text-sm md:text-base leading-relaxed opacity-80">
                        <p>
                            Welcome to a sanctuary of brilliance. High above the city noise, we have curated a space where time slows down, allowing the true character of our rare gems to emerge.
                        </p>
                        <p>
                            Every diamond is hand-selected for its fire, every setting crafted to be an extension of the wearer. Browsing our collection is not merely shopping; it is an intimate discovery of artistry within a sunlit penthouse environment.
                        </p>

                        <div className="pt-4">
                            <p className="font-cormorant-garamond text-xl text-[#C9AB6A]">
                                Luxury is personal. Let us find the piece that speaks.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Bottom Status */}
                <div className="mt-12 animate-fade-up">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#C9AB6A]"></div>
                        <span className="font-instrument-sans text-xs tracking-widest uppercase opacity-60">
                            Open for Viewing
                        </span>
                    </div>
                </div>

            </div>


            {/* --- RIGHT COLUMN: IMAGE & ACTION --- */}
            <div className="w-full md:w-1/2 h-[50vh] md:h-screen relative bg-[#110f0b] text-[#F6F3E8] overflow-hidden">
                
                {/* 1. Full Height Image Link - TRACKS MOUSE */}
                <a 
                    href="https://www.google.com" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full h-full relative cursor-none z-0"
                    onMouseEnter={() => {
                        window.dispatchEvent(new CustomEvent("cursor:toggle", { detail: { hide: true } }));
                        gsap.to(".view-cursor", { scale: 1, opacity: 1, duration: 0.3 });
                    }}
                    onMouseLeave={() => {
                        window.dispatchEvent(new CustomEvent("cursor:toggle", { detail: { hide: false } }));
                        gsap.to(".view-cursor", { scale: 0, opacity: 0, duration: 0.3 });
                    }}
                    onMouseMove={(e) => {
                         // We track mouse relative to viewport for the fixed cursor
                         gsap.to(".view-cursor", {
                            x: e.clientX,
                            y: e.clientY,
                            duration: 0.1, 
                            ease: "power2.out"
                         });
                    }}
                >
                    <div 
                        className="animate-scale absolute inset-0 w-full h-full bg-cover bg-center opacity-80"
                        style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=2070&auto=format&fit=crop")' }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    </div>
                </a>

                {/* 2. Top Menu Button & Concierge - HIGHER Z-INDEX, PROTECTED ZONE */}
                <div 
                    className="absolute top-4 right-4 md:top-8 md:right-8 z-30 flex flex-col items-center gap-4 pointer-events-auto p-4 md:p-8"
                    onMouseEnter={() => {
                        // Force hide the image interaction cursor
                        gsap.to(".view-cursor", { scale: 0, opacity: 0, duration: 0.2 });
                        // Restore global cursor visibility if needed (state management)
                        window.dispatchEvent(new CustomEvent("cursor:toggle", { detail: { hide: false } }));
                    }}
                >
                     {/* Menu Button - Styled like Homepage Header */}
                     <Link 
                        href="/" 
                        className="cursor-pointer px-4 py-2 text-main-black font-instrument-sans text-[10px] tracking-widest uppercase rounded-full shadow-lg transition-all duration-300 bg-[#C5BDB6] hover:bg-opacity-90"
                     >
                        Menu
                     </Link>
                     
                     <div className="flex flex-col items-center mt-4 text-[#F6F3E8]/60">
                         <div className="w-8 h-8 rounded-full border border-current flex items-center justify-center mb-1">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                         </div>
                         <span className="text-[8px] uppercase tracking-widest">Concierge</span>
                     </div>
                </div>

                {/* 3. Custom Floating Cursor - FIXED */}
                <div 
                    className="view-cursor fixed top-0 left-0 z-50 pointer-events-none opacity-0 scale-0"
                    style={{ transform: "translate(-50%, -50%)" }}
                >
                    <div className="relative w-32 h-32 md:w-32 md:h-32">
                         <div className="absolute inset-0 rounded-full border border-[#F6F3E8]/30 animate-[spin_10s_linear_infinite]"></div>
                         <div className="absolute inset-0 flex items-center justify-center">
                            <svg className="w-full h-full animate-[spin_15s_linear_infinite]" viewBox="0 0 100 100">
                                <path id="curve-cursor" d="M 50 50 m -37 0 a 37 37 0 1 1 74 0 a 37 37 0 1 1 -74 0" fill="transparent"/>
                                <text className="text-[11px] uppercase tracking-[0.1em]" fill="#F6F3E8">
                                    <textPath href="#curve-cursor">
                                        View Collection • View Collection •
                                    </textPath>
                                </text>
                            </svg>
                         </div>
                         <div className="absolute inset-0 m-auto w-10 h-10 bg-[#F6F3E8] text-[#231F20] rounded-full flex items-center justify-center">
                             <svg className="w-4 h-4 rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M12 5l7 7-7 7"/></svg>
                         </div>
                    </div>
                </div>

                {/* 4. Floating Product Card - ABOVE IMAGE, BELOW MENU */}
                {/* Note: We keep this above the link. If hovered, onMouseLeave of link will fire, resetting cursor. Perfect. */}
                <div className="absolute bottom-32 md:bottom-auto md:top-[60%] right-8 md:right-16 bg-[#F6F3E8] text-[#231F20] p-6 md:p-8 max-w-[280px] shadow-2xl animate-fade-up pointer-events-auto z-10 transition-transform hover:scale-105 duration-300">
                    <div className="flex justify-between items-start mb-4 border-b border-[#231F20]/10 pb-4">
                        <span className="font-instrument-sans text-[8px] tracking-widest uppercase opacity-60">Icon Edit</span>
                        <div className="w-1 h-1 rounded-full bg-[#C9AB6A]"></div>
                    </div>
                    
                    <h3 className="font-cormorant-garamond italic text-2xl mb-2">The Solitaire No. 1</h3>
                    <p className="font-instrument-sans text-[10px] text-[#231F20]/60 leading-normal mb-6">
                        3.5ct Oval Cut Diamond. VVS1 Clarity. Set in 18k Champagne Gold.
                    </p>

                    <div className="flex justify-between items-center">
                        <span className="font-cormorant-garamond text-xl">$42,500</span>
                        <button className="border border-[#231F20] px-4 py-1.5 text-[9px] uppercase tracking-widest hover:bg-[#231F20] hover:text-[#F6F3E8] transition-colors cursor-pointer">
                            Inquire
                        </button>
                    </div>
                </div>

                {/* Bottom Signature */}
                 <div className="absolute bottom-8 right-8 text-right opacity-60 pointer-events-none z-10">
                    <span className="font-instrument-sans text-[8px] tracking-widest uppercase block mb-1">Collection</span>
                    <span className="font-cormorant-garamond italic text-4xl">FW 25</span>
                </div>

            </div>

             {/* --- BOTTOM MARQUEE --- */}
             <div className="absolute bottom-0 left-0 w-full bg-[#F6F3E8] py-3 border-t border-[#231F20]/10 z-30">
                <Marquee 
                    items={[
                        "Handcrafted in Paris", 
                        "Penthouse Exclusives", 
                        "Rare Gems", 
                        "New Arrivals", 
                        "The Diamond Vault",
                        "Private Viewing Only"
                    ]} 
                    speed={40}
                    className="text-[#231F20]/80 font-instrument-sans text-[10px] uppercase tracking-[0.2em]"
                />
             </div>

        </div>
    );
}
