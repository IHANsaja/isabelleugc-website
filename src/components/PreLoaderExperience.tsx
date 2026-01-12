"use client";

import React, { useRef, useState, useEffect, useMemo } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useProgress, useGLTF } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { LoaderShaderMaterial } from "./shaders/LoaderShaderMaterial";
import * as THREE from "three";
import { Suspense } from "react";
import {
    startExperienceBackgroundMusic,
    startWindGrassSound,
    connectSourceToAnalyser,
    startLandingIntroMusic,
    pauseLandingIntroMusic,
    stopLandingIntroMusic
} from "@/utils/audioManager";
import { useSound } from "@/context/SoundContext";

const PenthouseHologram = ({
    globalMouse,
    interactionState,
    landingIntroMusic,
    syntheticMusic,
    position,
    startAnimationSequence,
    onAnimationComplete
}: {
    globalMouse: React.MutableRefObject<THREE.Vector2>,
    interactionState: React.MutableRefObject<{ isHolding: boolean; clickPos: THREE.Vector2; clickTime: number; }>,
    landingIntroMusic: HTMLAudioElement | null,
    syntheticMusic: HTMLAudioElement | null,
    position?: [number, number, number],
    startAnimationSequence: boolean,
    onAnimationComplete: () => void
}) => {
    const { scene } = useGLTF('/models/penthouse.glb');
    
    // Geometry processing for shatter effect
    const processedScene = useMemo(() => {
        const cloned = scene.clone();
        cloned.traverse((obj) => {
            if ((obj as THREE.Mesh).isMesh) {
                const mesh = obj as THREE.Mesh;
                
                // 1. Convert to non-indexed geometry to separate triangles
                const nonIndexedGeo = mesh.geometry.toNonIndexed();
                
                // 2. Add random attribute for each triangle
                const positionAttribute = nonIndexedGeo.getAttribute('position');
                const count = positionAttribute.count; // Total vertices
                
                const randomArray = new Float32Array(count * 3);
                const dropArray = new Float32Array(count); // NEW: Drop flag
                
                // Check if this is the bottom building part
                const isBottom = mesh.name === 'building_bottom';
                
                // Iterate over triangles (3 vertices per triangle)
                for (let i = 0; i < count; i += 3) {
                    // Generate random vector for this triangle
                    const rX = (Math.random() - 0.5) * 2.0; 
                    const rY = (Math.random() - 0.5) * 2.0; 
                    const rZ = (Math.random() - 0.5) * 2.0; 
                    
                    // Assign same random vector to all 3 vertices of the triangle
                    for (let j = 0; j < 3; j++) {
                        randomArray[(i + j) * 3] = rX;
                        randomArray[(i + j) * 3 + 1] = rY;
                        randomArray[(i + j) * 3 + 2] = rZ;
                        
                        // Assign drop flag
                        dropArray[i + j] = isBottom ? 1.0 : 0.0;
                    }
                }
                
                nonIndexedGeo.setAttribute('aRandom', new THREE.BufferAttribute(randomArray, 3));
                nonIndexedGeo.setAttribute('aDrop', new THREE.BufferAttribute(dropArray, 1));
                
                mesh.geometry = nonIndexedGeo;
            }
        });
        return cloned;
    }, [scene]);

    // 1. Initialize Audio (Loop disabled because we trigger it manually)
    const sonarSound = useMemo(() => {
        if (typeof window !== "undefined") {
            const audio = new Audio('/sounds/SFX/Laser_Sonic_Burst.mp3');
            connectSourceToAnalyser(audio);
            return audio;
        }
        return null;
    }, []);

    const modeInitiationSound = useMemo(() => {
        if (typeof window !== "undefined") {
            const audio = new Audio('/sounds/SFX/Mode_Initiation.mp3');
            connectSourceToAnalyser(audio);
            return audio;
        }
        return null;
    }, []);

    const material = useMemo(() => new LoaderShaderMaterial(), []);

    // Animation Refs
    const glowProgressRef = useRef(0);
    const shatterProgressRef = useRef(0);
    const isGlowingRef = useRef(false);
    const isShatteringRef = useRef(false);

    // Hold Logic Refs
    const holdTimeRef = useRef(0);
    const modeInitiationPlayedRef = useRef(false);
    const syntheticMusicPlayedRef = useRef(false);
    const SONAR_CYCLE = 2.5; 

    const { isSoundEnabled } = useSound();

    // Sync mute state for local sounds
    useEffect(() => {
        if (sonarSound) sonarSound.muted = !isSoundEnabled;
        if (modeInitiationSound) modeInitiationSound.muted = !isSoundEnabled;
    }, [isSoundEnabled, sonarSound, modeInitiationSound]);
    
    // Trigger sequence when prop changes
    useEffect(() => {
        if (startAnimationSequence) {
             isGlowingRef.current = true;
        }
    }, [startAnimationSequence]);

    useFrame((state, delta) => {
        material.uTime += delta;
        material.uMouse.set(globalMouse.current.x, globalMouse.current.y);
        
        // --- 1. HOLD LOGIC (Only active if NOT finishing) ---
        if (!startAnimationSequence) {
            if (interactionState.current.isHolding) {
                holdTimeRef.current += delta;
                
                // Only play audio during the sonar pulse phase (0-10 seconds)
                const inPulsePhase = holdTimeRef.current < 10.0;

                if (!inPulsePhase) {
                    pauseLandingIntroMusic();
                }

                if (inPulsePhase) {
                    const cyclePosition = (material.uTime % SONAR_CYCLE) / SONAR_CYCLE;
                    const prevCyclePosition = ((material.uTime - delta) % SONAR_CYCLE) / SONAR_CYCLE;
                    const waveReset = prevCyclePosition > cyclePosition;

                    if (waveReset && sonarSound) {
                        sonarSound.currentTime = 0;
                        sonarSound.play().catch(() => { });
                    }
                } else {
                    if (sonarSound) {
                        sonarSound.pause();
                        sonarSound.currentTime = 0;
                    }

                    if (!modeInitiationPlayedRef.current && modeInitiationSound) {
                        modeInitiationSound.currentTime = 0;
                        modeInitiationSound.volume = 0.5;
                        modeInitiationSound.play().catch(() => { });
                        modeInitiationPlayedRef.current = true;
                    }

                    if (!syntheticMusicPlayedRef.current && syntheticMusic) {
                        syntheticMusic.currentTime = 0;
                        syntheticMusic.play().catch(() => { });
                        syntheticMusicPlayedRef.current = true;
                    }
                }
            } else {
                // Reset on release
                holdTimeRef.current = 0;
                modeInitiationPlayedRef.current = false;
                syntheticMusicPlayedRef.current = false;
                if (sonarSound) {
                    sonarSound.pause();
                    sonarSound.currentTime = 0;
                }
                if (syntheticMusic) {
                    syntheticMusic.pause();
                    syntheticMusic.currentTime = 0;
                }
                startLandingIntroMusic();
            }

            const targetHold = interactionState.current.isHolding ? 1.0 : 0.0;
            material.uHold += (targetHold - material.uHold) * delta * 5.0;
            material.uHoldTime = holdTimeRef.current;
        } else {
            // If finishing, force hold to 0 or freeze? 
            // Better to freeze current logic and override with Glow
            material.uHold = 0; 
        }
        
        // --- 2. ENDING SEQUENCE ---
        
        // GLOW PHASE
        if (isGlowingRef.current) {
            glowProgressRef.current += delta * 1.5; 
            const glow = Math.min(glowProgressRef.current, 1.0);
            material.uGlowFull = glow;
            if (glow >= 1.0) {
                isGlowingRef.current = false;
                isShatteringRef.current = true;
            }
        }
        
        // SHATTER PHASE
        if (isShatteringRef.current) {
            shatterProgressRef.current += delta * 0.5; 
            material.uShatter = Math.min(shatterProgressRef.current, 1.0);
            if (shatterProgressRef.current > 1.5) { 
                 onAnimationComplete();
            }
        }
    });

    useEffect(() => {
        processedScene.traverse((obj) => {
            if ((obj as THREE.Mesh).isMesh) {
                (obj as THREE.Mesh).material = material;
            }
        });
    }, [processedScene, material]);

    return <primitive object={processedScene} position={position || [0, 0, 0]} rotation={[0, 0, 0]} />;
}

const ShaderBackground = ({
    globalMouse,
    interactionState,
    landingIntroMusic,
    syntheticMusic,
    startAnimationSequence,
    onAnimationComplete
}: {
    globalMouse: React.MutableRefObject<THREE.Vector2>,
    interactionState: React.MutableRefObject<{ isHolding: boolean; clickPos: THREE.Vector2; clickTime: number; }>,
    landingIntroMusic: HTMLAudioElement | null,
    syntheticMusic: HTMLAudioElement | null,
    startAnimationSequence: boolean,
    onAnimationComplete: () => void
}) => (
    <div className="absolute inset-0 w-full h-full">
        <Canvas camera={{ position: [0, 10, 15], fov: 100 }} gl={{ preserveDrawingBuffer: true, antialias: false }}>
            <Suspense fallback={null}>
                <PenthouseHologram
                    globalMouse={globalMouse}
                    interactionState={interactionState}
                    landingIntroMusic={landingIntroMusic}
                    syntheticMusic={syntheticMusic}
                    position={[0, 0, 4]}
                    startAnimationSequence={startAnimationSequence}
                    onAnimationComplete={onAnimationComplete}
                />
            </Suspense>
            <ambientLight intensity={1} />
        </Canvas>
    </div>
);

interface PreLoaderExperienceProps {
    onEnter?: () => void;
}

const PreLoaderExperience: React.FC<PreLoaderExperienceProps> = ({ onEnter }) => {
    const { progress } = useProgress();
    const [showEnter, setShowEnter] = useState(false);
    const [startAnimation, setStartAnimation] = useState(false);
    const [removed, setRemoved] = useState(false);
    
    // Hold State
    const [isHolding, setIsHolding] = useState(false);
    const [holdTime, setHoldTime] = useState(0);

    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const progressTextRef = useRef<HTMLSpanElement>(null);

    const globalMouse = useRef(new THREE.Vector2(0, 0));
    const interactionState = useRef({
        isHolding: false,
        clickPos: new THREE.Vector2(-10, -10),
        clickTime: -100
    });
    
    // Audio references
    const syntheticMusic = useRef<HTMLAudioElement | null>(null);
    const landingIntroStarted = useRef(false);

    const { isSoundEnabled } = useSound();

    // Initialize audio on mount
    useEffect(() => {
        if (typeof window !== "undefined") {
            // Try to play landing intro music, but it might be blocked by browser
            startLandingIntroMusic();
            landingIntroStarted.current = true;

            // Synthetic music
            syntheticMusic.current = new Audio('/sounds/SFX/synthetic-music.mp3');
            syntheticMusic.current.loop = true;
            syntheticMusic.current.volume = 0.4;
            syntheticMusic.current.muted = !isSoundEnabled;
            connectSourceToAnalyser(syntheticMusic.current);
        }

        return () => {
            // Cleanup synthetic music
            if (syntheticMusic.current) {
                syntheticMusic.current.pause();
                syntheticMusic.current = null;
            }
        };
    }, []);

    // Sync mute state on change
    useEffect(() => {
        if (syntheticMusic.current) {
            syntheticMusic.current.muted = !isSoundEnabled;
        }
    }, [isSoundEnabled]);

    useEffect(() => {
        document.body.style.overflow = 'hidden';

        const handleMouseMove = (e: MouseEvent) => {
            const x = (e.clientX / window.innerWidth) * 2 - 1;
            const y = -(e.clientY / window.innerHeight) * 2 + 1;
            globalMouse.current.set(x, y);

            // Try to start landing intro if it hasn't started yet (autoplay was blocked)
            if (!landingIntroStarted.current) {
                startLandingIntroMusic();
                landingIntroStarted.current = true;
            }
        };
        
        const handleMouseDown = (e: MouseEvent) => {
            if (startAnimation) return; // Disable hold if animation started
            if ((e.target as HTMLElement).tagName === 'BUTTON' || (e.target as HTMLElement).closest('button')) {
                return;
            }
            interactionState.current.isHolding = true;
            setIsHolding(true);
        };

        const handleMouseUp = () => {
            interactionState.current.isHolding = false;
            setIsHolding(false);
            setHoldTime(0);
        };

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mousedown", handleMouseDown);
        window.addEventListener("mouseup", handleMouseUp);

        return () => {
            document.body.style.overflow = '';
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mousedown", handleMouseDown);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, [startAnimation]);

    // Greeting Logic
    const [greeting, setGreeting] = useState("");
    const greetingRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const now = new Date();
        const hours = now.getHours();
        let text = "";
        if (hours >= 5 && hours < 12) text = "Good Morning";
        else if (hours >= 12 && hours < 17) text = "Good Afternoon";
        else text = "Good Evening";
        setGreeting(text);
    }, []);

    useGSAP(() => {
        if (greeting && greetingRef.current) {
            gsap.fromTo(greetingRef.current,
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: 1.5, ease: "power3.out", delay: 0.5 }
            );
        }
    }, [greeting]);

    useEffect(() => {
        if (progress === 100) {
            const timer = setTimeout(() => setShowEnter(true), 500);
            return () => clearTimeout(timer);
        }
    }, [progress]);
    
    // Update hold time for countdown display
    useEffect(() => {
        let animationFrameId: number;
        const updateHoldTime = () => {
            if (isHolding) {
                setHoldTime(prev => Math.min(prev + 0.016, 10)); 
            }
            animationFrameId = requestAnimationFrame(updateHoldTime);
        };
        animationFrameId = requestAnimationFrame(updateHoldTime);
        return () => cancelAnimationFrame(animationFrameId);
    }, [isHolding]);

    useGSAP(() => {
        if (showEnter && buttonRef.current) {
            gsap.fromTo(buttonRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1, ease: "power3.out" });
        }
    }, [showEnter]);
    
    // Triggered when button is clicked
    const handleEnterClick = () => {
        setStartAnimation(true);
        // Fade out UI immediately
        if (contentRef.current) {
             gsap.to(contentRef.current, { opacity: 0, duration: 0.5 });
        }
    };

    // Triggered by onAnimationComplete callback from Hologram (after shatter)
    const finishIntroduction = () => {
        // Stop synthetic music
        if (syntheticMusic.current) {
            syntheticMusic.current.pause();
            syntheticMusic.current.currentTime = 0;
        }

        // Stop landing intro and start experience audio
        stopLandingIntroMusic();
        startExperienceBackgroundMusic();
        startWindGrassSound();

        // Dispatch experience start event for time-based scenery
        window.dispatchEvent(new CustomEvent("experience:start"));

        if (onEnter) onEnter();
        if (containerRef.current) {
            gsap.to(containerRef.current, {
                opacity: 0,
                duration: 1.0,
                ease: "power2.inOut",
                onComplete: () => {
                    document.body.style.overflow = '';
                    setRemoved(true);
                }
            });
        }
    };

    if (removed) return null;

    return (
        <div ref={containerRef} className="fixed inset-0 z-[9999] pointer-events-auto flex items-center justify-center font-instrument-sans text-[#231F20] bg-[#F6F3E8]">
            <ShaderBackground
                globalMouse={globalMouse}
                interactionState={interactionState}
                landingIntroMusic={null}
                syntheticMusic={syntheticMusic.current}
                startAnimationSequence={startAnimation}
                onAnimationComplete={finishIntroduction}
            />
            <div ref={contentRef} className="absolute inset-0 z-20 w-full h-full pointer-events-none">

                {/* TOP BAR */}
                <div className="absolute top-8 left-8 right-8 md:top-12 md:left-12 md:right-12 flex justify-between items-start z-30">
                    <div className="flex flex-col items-start">
                        <span className="text-[10px] md:text-xs font-bold tracking-[0.2em] mb-2 uppercase border-b border-[#231F20]/20 pb-0.5">EXPERIENCE</span>
                        <span className="text-xl md:text-2xl font-cormorant-garamond italic text-[#231F20]/80">Image Gang</span>
                    </div>

                    <div className="flex flex-col items-end text-right">
                        <span className="text-[10px] md:text-xs font-bold tracking-[0.2em] mb-2 uppercase">EST. 2025</span>
                        <span className="text-xl md:text-2xl font-cormorant-garamond italic text-[#231F20]/80">Portfolio</span>
                    </div>
                </div>

                {/* CENTER GREETING */}
                <div className="absolute top-[20%] left-1/2 -translate-x-1/2 flex flex-col items-center justify-center w-full z-30 select-none">
                    {greeting && (
                        <div ref={greetingRef} className="flex flex-col items-center opacity-0 mb-4">
                            <h1 className="font-cormorant-garamond text-6xl md:text-8xl italic text-[#231F20] text-center mb-4">
                                {greeting}
                            </h1>
                            <div className="flex items-center gap-4">
                                <span className="w-12 h-[1px] bg-[#231F20]/10"></span>
                                <span className="text-[10px] md:text-xs font-bold tracking-[0.4em] text-[#231F20]/60 uppercase">
                                    IMAGEGANG IMMERSIVE PORTFOLIO
                                </span>
                                <span className="w-12 h-[1px] bg-[#231F20]/10"></span>
                            </div>
                        </div>
                    )}
                </div>

                {/* HOLD INTERACTION */}
                {showEnter && !startAnimation && (
                    <div className="absolute top-[52%] left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center z-40 pointer-events-none select-none">
                        <div className="relative group">
                            {/* Wave animations */}
                            {isHolding && (
                                <div className="absolute inset-0 pointer-events-none">
                                    <div className="absolute inset-0 rounded-full border border-[#231F20]/30 animate-[ping_2s_linear_infinite]"></div>
                                    <div className="absolute inset-0 rounded-full border border-[#231F20]/20 animate-[ping_2s_linear_0.6s_infinite]"></div>
                                    <div className="absolute inset-0 rounded-full border border-[#231F20]/10 animate-[ping_2s_linear_1.2s_infinite]"></div>
                                </div>
                            )}

                            {/* Outer dotted ring */}
                            <div className="absolute -inset-8">
                                <svg className="w-full h-full transform -rotate-90 scale-150">
                                    <circle 
                                        cx="50%" cy="50%" r="48%" 
                                        stroke="currentColor" 
                                        strokeWidth="0.5" 
                                        strokeDasharray="2 4" 
                                        fill="none" 
                                        className="text-[#231F20]/20" 
                                    />
                                </svg>
                            </div>

                            {/* Fingerprint Button Area */}
                            <div className="relative w-24 h-24 rounded-full border border-[#231F20]/10 flex items-center justify-center overflow-hidden backdrop-blur-sm bg-white/5">
                                <div className={`absolute inset-0 bg-[#231F20] transition-transform duration-700 ${isHolding ? "scale-100" : "scale-0"} origin-center opacity-5`}></div>
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={`transition-all duration-500 ${isHolding ? "scale-110 text-[#231F20]" : "text-[#231F20]/40"}`}>
                                    <path d="M12 11C12 11 10.5 11 9.5 12C8.5 13 8.5 14.5 9.5 15.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                                    <path d="M14.5 15.5C15.5 14.5 15.5 13 14.5 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                                    <path d="M12 7C14.7614 7 17 9.23858 17 12C17 14.7614 14.7614 17 12 17C9.23858 17 7 14.7614 7 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="1 3"/>
                                    <path d="M12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3Z" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeDasharray="4 8"/>
                                </svg>
                            </div>
                        </div>

                        <div className="mt-12 flex flex-col items-center gap-2">
                            <span className="text-[10px] font-bold tracking-[0.4em] text-[#231F20] uppercase transition-all duration-300">
                                {isHolding ? "TRANSMITTING DATA..." : "HOLD TO REVEAL"}
                            </span>
                            <span className="text-[9px] font-instrument-sans italic text-[#231F20]/40 tracking-widest whitespace-nowrap">
                                {isHolding ? `(${Math.max(0, Math.ceil(10 - holdTime))} Seconds)` : "(10 Seconds)"}
                            </span>
                        </div>
                    </div>
                )}

                {/* BOTTOM BAR */}
                <div className="absolute bottom-8 left-8 right-8 md:bottom-12 md:left-12 md:right-12 flex justify-between items-end z-30">
                    <div className="flex flex-col items-start gap-3">
                        <div className="flex flex-col">
                            <span className="text-[9px] font-bold tracking-[0.3em] text-[#231F20]/40 uppercase mb-1">SYSTEM STATUS</span>
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                <span className="text-[10px] md:text-xs font-bold tracking-[0.2em] text-[#231F20]">OPERATIONAL</span>
                            </div>
                        </div>
                    </div>

                    <div className="absolute left-1/2 -bottom-2 -translate-x-1/2 flex flex-col items-center gap-4 pb-2">
                        <span className="text-[9px] font-bold tracking-[0.5em] text-[#231F20]/40 uppercase">SCROLL</span>
                        <div className="w-[1px] h-12 bg-gradient-to-b from-[#231F20] to-transparent opacity-20"></div>
                    </div>

                    <div className="flex flex-col items-end pointer-events-none">
                         <span ref={progressTextRef} className="text-6xl md:text-8xl font-cormorant-garamond text-[#231F20] italic leading-none relative">
                            {Math.round(progress)}%
                            <span className="absolute -top-4 right-0 text-[10px] font-bold tracking-[0.3em] text-[#231F20] uppercase">Loading</span>
                         </span>
                    </div>
                </div>

                {/* ENTER BUTTON */}
                <div className="absolute top-[80%] left-1/2 -translate-x-1/2 z-50 flex flex-col items-center">
                    {showEnter && (
                        <button 
                            ref={buttonRef} 
                            onClick={handleEnterClick} 
                            className="cursor-pointer group relative px-10 py-4 rounded-full backdrop-blur-xl bg-white/10 border border-white/30 text-[#231F20] overflow-hidden transition-all duration-500 hover:scale-105 hover:bg-[#231F20] hover:text-[#F6F3E8] hover:border-[#231F20] pointer-events-auto"
                        >
                            <span className="relative z-10 text-xs md:text-sm font-bold tracking-[0.3em] uppercase flex items-center gap-3 transition-colors duration-500">
                                Enter Experience
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="transform group-hover:translate-x-1 transition-all duration-500">
                                    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PreLoaderExperience;