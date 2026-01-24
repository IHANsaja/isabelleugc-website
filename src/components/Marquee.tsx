"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

interface MarqueeProps {
    items: string[];
    direction?: "left" | "right";
    speed?: number;
    className?: string;
    separator?: string;
}

const Marquee: React.FC<MarqueeProps> = ({ 
    items, 
    direction = "left", 
    speed = 50, 
    className = "",
    separator = "•" 
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        if (!contentRef.current || !containerRef.current) return;

        const content = contentRef.current;
        const totalWidth = content.scrollWidth / 2; // Since we duplicate content
        const duration = totalWidth / speed;

        gsap.to(content, {
            x: direction === "left" ? -totalWidth : 0,
            duration: duration,
            ease: "none",
            repeat: -1,
            modifiers: {
                x: gsap.utils.unitize((x) => {
                    const val = parseFloat(x);
                    return direction === "left" ? val % totalWidth : (val - totalWidth) % totalWidth;
                })
            }
        });
    }, { scope: containerRef, dependencies: [items, direction, speed] });

    // Duplicate items to ensure seamless loop
    const displayItems = [...items, ...items, ...items, ...items]; 

    return (
        <div ref={containerRef} className={`overflow-hidden whitespace-nowrap flex ${className}`}>
            <div ref={contentRef} className="flex items-center gap-8 px-4">
                {displayItems.map((item, index) => (
                    <React.Fragment key={index}>
                        <span className="uppercase tracking-widest">{item}</span>
                        <span className="opacity-30 text-[0.8em]">{separator}</span>
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};

export default Marquee;
