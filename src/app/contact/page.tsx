"use client";

import React from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import Header from '@/components/Header';

export default function ContactPage() {
    // Reveal Animations
    useGSAP(() => {
        const tl = gsap.timeline();

        // 1. HUD Brackets Scale In
        tl.from(".hud-bracket", {
            scale: 0.9,
            opacity: 0,
            duration: 1,
            ease: "power2.out",
            stagger: 0.2
        });

        // 2. Text Reveals (Slightly staggered after brackets)
        tl.from(".reveal-text", {
            y: 50,
            opacity: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: "power3.out"
        }, "-=0.5");

        // 3. Central Circle Scale In
        tl.from(".center-circle", {
            scale: 0,
            opacity: 0,
            duration: 1.2,
            ease: "power4.out"
        }, "-=0.6");

        // 4. Form Container Fade Up
        tl.from(".form-container", {
            y: 30,
            opacity: 0,
            duration: 0.8,
            ease: "power3.out"
        }, "-=0.4");
        
    }, []);

    return (
        <div className="w-full h-screen bg-[#F6F3E8] text-[#231F20] overflow-hidden flex flex-col relative selection:bg-[#C9AB6A] selection:text-white">
            
            {/* Reuse Header Logic for consistency (Menu etc.) */}
            <Header />

            {/* --- TOP CORNER BRACKETS (Replaced Text) --- */}
            {/* Top Left Bracket */}
            <div className="hud-bracket absolute top-4 left-4 w-24 h-24 md:top-8 md:left-8 md:w-48 md:h-48 border-l-2 border-t-2 border-[#231F20]/80 opacity-60 pointer-events-none z-10">
                <div className="absolute top-0 right-0 w-2 h-2 bg-[#231F20]/80" />
                <div className="absolute bottom-0 left-0 w-2 h-2 bg-[#231F20]/80" />
                <div className="absolute top-4 left-0 w-2 h-[1px] bg-[#231F20]/50" />
                <div className="absolute top-8 left-0 w-2 h-[1px] bg-[#231F20]/50" />
                <div className="absolute top-12 left-0 w-2 h-[1px] bg-[#231F20]/50" />
            </div>

            {/* Top Right Bracket */}
            <div className="hud-bracket absolute top-4 right-4 w-24 h-24 md:top-8 md:right-8 md:w-48 md:h-48 border-r-2 border-t-2 border-[#231F20]/80 opacity-60 pointer-events-none z-10">
                <div className="absolute top-0 left-0 w-2 h-2 bg-[#231F20]/80" />
                <div className="absolute bottom-0 right-0 w-2 h-2 bg-[#231F20]/80" />
            </div>

            {/* --- LEFT COLUMN: TITLE --- */}
            <div className="absolute left-0 top-0 h-full w-[15%] flex flex-col justify-center items-center pointer-events-none">
                 {/* Rotated Title */}
                 <div className="absolute flex items-center justify-center -rotate-90 origin-center whitespace-nowrap reveal-text">
                      <h1 className="font-cormorant-garamond text-[12vh] md:text-[16vh] leading-none opacity-90 text-[#231F20]">Reach Out</h1>
                 </div>
            </div>

            {/* --- ATELIERS LIST (Bottom Left) --- */}
            <div className="absolute bottom-24 left-8 z-10 hidden md:flex flex-col gap-4 reveal-text">
                <span className="font-instrument-sans text-[9px] tracking-[0.2em] uppercase opacity-40 border-b border-[#231F20]/20 pb-2 mb-2 w-12">Ateliers</span>
                <ul className="flex flex-col gap-1">
                    {['Paris', 'Milan', 'Geneva'].map(city => (
                        <li key={city} className="font-cormorant-garamond italic text-lg opacity-60 hover:opacity-100 cursor-pointer transition-opacity text-left">{city}</li>
                    ))}
                </ul>
            </div>

            {/* --- CENTER VISUAL (Adjusted Position) --- */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-[20%] pointer-events-none z-0">
                 <div className="center-circle w-[40vh] h-[40vh] md:w-[500px] md:h-[500px] rounded-full overflow-hidden relative shadow-2xl">
                      <div 
                         className="absolute inset-0 bg-cover bg-center"
                         style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=2000&auto=format&fit=crop")' }}
                      ></div>
                      <div className="absolute inset-0 bg-black/20"></div>
                      
                      {/* Center Icon */}
                      <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-16 h-16 rounded-full border border-white/30 flex items-center justify-center backdrop-blur-sm bg-white/10">
                             <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z"/></svg> 
                          </div>
                      </div>
                 </div>
            </div>

            {/* --- RIGHT COLUMN: FORM --- */}
            <div className="absolute right-8 md:right-32 top-1/2 -translate-y-1/2 z-20 w-full max-w-sm md:max-w-md form-container bg-[#F6F3E8] p-8 md:p-12 shadow-xl border border-[#231F20]/5">
                <div className="flex justify-between items-start mb-12">
                     <span className="font-instrument-sans text-[9px] tracking-[0.2em] uppercase font-bold">Communication Hub</span>
                     <div className="w-1 h-1 bg-[#231F20]/20 rounded-full"></div>
                </div>

                <form className="flex flex-col gap-8">
                     {/* Identity */}
                     <div className="relative group">
                         <label className="font-instrument-sans text-[8px] tracking-[0.2em] uppercase opacity-40 absolute -top-5 left-0">Identity</label>
                         <input 
                            type="text" 
                            placeholder="Full Name" 
                            className="w-full bg-transparent border border-[#231F20]/20 p-4 font-cormorant-garamond text-lg placeholder:text-[#231F20]/30 hover:border-[#231F20]/40 focus:border-[#231F20] outline-none transition-colors"
                         />
                     </div>

                     {/* Coordinates */}
                     <div className="relative group">
                         <label className="font-instrument-sans text-[8px] tracking-[0.2em] uppercase opacity-40 absolute -top-5 left-0">Coordinates</label>
                         <input 
                            type="email" 
                            placeholder="Email Address" 
                            className="w-full bg-transparent border border-[#231F20]/20 p-4 font-cormorant-garamond text-lg placeholder:text-[#231F20]/30 hover:border-[#231F20]/40 focus:border-[#231F20] outline-none transition-colors"
                         />
                     </div>

                     {/* Signal Content */}
                     <div className="relative group">
                         <label className="font-instrument-sans text-[8px] tracking-[0.2em] uppercase opacity-40 absolute -top-5 left-0">Signal Content</label>
                         <textarea 
                            rows={3}
                            placeholder="Inquiry Details" 
                            className="w-full bg-[#fcfbf7] border border-[#231F20]/10 p-4 font-cormorant-garamond text-lg placeholder:text-[#231F20]/30 hover:border-[#231F20]/40 focus:border-[#231F20] outline-none transition-colors resize-none"
                         />
                     </div>

                     <div className="flex justify-between items-center mt-4">
                         <div className="flex items-center gap-2 opacity-30">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>
                              <span className="font-instrument-sans text-[8px] tracking-[0.2em] uppercase">Secure</span>
                         </div>

                         <button className="bg-[#1a1815] text-[#F6F3E8] px-8 py-3 rounded-none font-instrument-sans text-[9px] tracking-[0.2em] uppercase hover:bg-[#231F20] transition-colors flex items-center gap-4 group">
                             Send
                             <span className="group-hover:translate-x-1 transition-transform">→</span>
                         </button>
                     </div>
                </form>
            </div>

            {/* --- FOOTER STATUS --- */}
            <div className="absolute bottom-0 w-full p-6 flex justify-between items-end border-t border-[#231F20]/5 text-[#231F20]/40 pointer-events-none z-10">
                 <div className="flex items-center gap-2 reveal-text">
                     <div className="w-2 h-2 rounded-full bg-green-900/40"></div>
                     <span className="font-instrument-sans text-[8px] tracking-[0.2em] uppercase">System Operational</span>
                 </div>

                 <div className="flex gap-8 reveal-text">
                     {['Instagram', 'Behance', 'LinkedIn'].map(social => (
                         <span key={social} className="font-instrument-sans text-[8px] tracking-[0.2em] uppercase hover:text-[#231F20] cursor-pointer pointer-events-auto transition-colors">{social}</span>
                     ))}
                 </div>
                 
                 <div className="reveal-text">
                      <span className="font-instrument-sans text-[8px] tracking-[0.2em] uppercase">V.3.1.0</span>
                 </div>
            </div>

        </div>
    );
}
