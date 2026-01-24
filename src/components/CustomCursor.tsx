"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { usePathname } from "next/navigation";

export default function CustomCursor() {
    const cursorRef = useRef<HTMLDivElement>(null);
    const followerRef = useRef<HTMLDivElement>(null);
    const isHiddenRef = useRef(false); // Track visibility for GSAP loop
    const [isPointer, setIsPointer] = useState(false);
    const [isText, setIsText] = useState(false);
    const [shouldHide, setShouldHide] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const handleToggle = (e: any) => {
            const hide = !!e.detail?.hide;
            setShouldHide(hide);
            isHiddenRef.current = hide; // Sync ref
        };
        window.addEventListener("cursor:toggle", handleToggle);
        return () => window.removeEventListener("cursor:toggle", handleToggle);
    }, []);

    // Force remount key - increments on reset to force React to recreate elements
    const [resetKey, setResetKey] = useState(0);

    // Listen for reset event (triggered when exiting pointer lock)
    useEffect(() => {
        const handleReset = () => {
            setResetKey(prev => prev + 1);
        };
        window.addEventListener("cursor:reset", handleReset);
        return () => window.removeEventListener("cursor:reset", handleReset);
    }, []);

    // Reset cursor state when navigating to a new route
    useEffect(() => {
        setShouldHide(false);
        isHiddenRef.current = false;
        setIsPointer(false);
        setIsText(false);

        // Kill all active tweens and reset positions
        if (cursorRef.current && followerRef.current) {
            gsap.killTweensOf([cursorRef.current, followerRef.current]);
            gsap.set([cursorRef.current, followerRef.current], {
                clearProps: "x,y,scale",
            });
            gsap.set([cursorRef.current, followerRef.current], {
                x: 0,
                y: 0,
                scale: 0,
                xPercent: -50,
                yPercent: -50
            });
        }
    }, [pathname]);

    useGSAP(() => {
        // Initial hide
        gsap.set(cursorRef.current, { xPercent: -50, yPercent: -50, scale: 0 });
        gsap.set(followerRef.current, { xPercent: -50, yPercent: -50, scale: 0 });

        const moveCursor = (e: MouseEvent) => {
            const scale = isHiddenRef.current ? 0 : 1;
            
            gsap.to(cursorRef.current, {
                x: e.clientX,
                y: e.clientY,
                duration: 0.1,
                ease: "power2.out",
                scale: scale, 
            });
            gsap.to(followerRef.current, {
                x: e.clientX,
                y: e.clientY,
                duration: 0.3,
                ease: "power2.out",
                scale: scale, 
            });
        };

        const handleClick = () => {
            import("@/utils/audioManager").then((mod) => {
                mod.playClickSound();
            });
        };

        window.addEventListener("mousemove", moveCursor);
        window.addEventListener("mousedown", handleClick);

        return () => {
            window.removeEventListener("mousemove", moveCursor);
            window.removeEventListener("mousedown", handleClick);
        };
    }, []);

    useEffect(() => {
        const onMouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement;

            // Pointer detection
            const isLink = target.closest("a, button, [role='button'], .pointer-cursor") ||
                window.getComputedStyle(target).cursor === "pointer";
            setIsPointer(!!isLink);

            // Text detection
            const isInput = target.closest("input, textarea, [contenteditable='true'], .text-cursor");
            setIsText(!!isInput);
        };

        window.addEventListener("mouseover", onMouseOver);
        return () => window.removeEventListener("mouseover", onMouseOver);
    }, []);

    // --- RENDER ---
    // Instead of returning null effectively unmounting, we just hide visual elements
    // so the component preserves its state and position (fixing the top-left jump bug).
    
    return (
        <>
            {/* Main Dot / Caret */}
            <div
                key={`cursor-dot-${resetKey}`}
                ref={cursorRef}
                className={`fixed top-0 left-0 pointer-events-none z-[1000001] mix-blend-difference bg-white transition-all duration-300 ease-out
                ${isText ? "w-[1.5px] h-6 rounded-full" : ""}
                ${isPointer ? "w-1 h-1 rounded-full opacity-50" : ""}
                ${!isText && !isPointer ? "w-2.5 h-2.5 rounded-full" : ""}
                ${shouldHide ? "opacity-0" : "opacity-100"}
                `}
            />

            {/* Follower Ring / Capsule */}
            <div
                key={`cursor-ring-${resetKey}`}
                ref={followerRef}
                className={`fixed top-0 left-0 pointer-events-none z-[1000000] mix-blend-difference border border-white/40 rounded-full transition-all duration-500 ease-out
                ${isPointer ? "w-14 h-14 bg-white/10 border-white" : ""}
                ${isText ? "w-4 h-8 bg-white/5 border-white/20" : ""}
                ${!isPointer && !isText ? "w-9 h-9" : ""}
                ${shouldHide ? "opacity-0" : "opacity-100"}
                `}
            />
        </>
    );
}
