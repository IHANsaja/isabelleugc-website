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
            if (progressTextRef.current) gsap.to(progressTextRef.current, { opacity: 0, duration: 0.5 });
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

                {/* UI CORNERS */}
                <div className="absolute top-8 left-8 md:top-12 md:left-12 flex flex-col items-start bg-transparent">
                    <span className="text-[10px] md:text-xs font-bold tracking-[0.2em] mb-1">EXPERIENCE</span>
                    <span className="text-sm md:text-base font-playfair italic opacity-70">Image Gang</span>
                </div>

                <div className="absolute top-8 right-8 md:top-12 md:right-12 text-right">
                    <span className="text-[10px] md:text-xs font-bold tracking-[0.2em] block mb-1">EST. 2025</span>
                    <span className="text-sm md:text-base font-playfair italic opacity-70">Portfolio</span>
                </div>

                <div className="absolute bottom-8 left-8 md:bottom-12 md:left-12">
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full bg-[#231F20] ${!showEnter ? "animate-pulse" : ""}`}></div>
                        <span className="text-[10px] md:text-xs font-bold tracking-[0.2em]">{showEnter ? "READY" : "LOADING ASSETS"}</span>
                    </div>
                </div>

                <div className="absolute bottom-8 right-8 md:bottom-12 md:right-12">
                    <span ref={progressTextRef} className="text-4xl md:text-6xl font-playfair font-medium">{Math.round(progress)}%</span>
                </div>

                {/* CENTER GREETING */}
                {greeting && (
                    <div ref={greetingRef} className="absolute top-[23%] left-1/2 transform -translate-x-1/2 text-center pointer-events-none z-30 opacity-0">
                        <span className="font-playfair text-2xl md:text-3xl italic text-[#231F20] opacity-80">{greeting}</span>
                    </div>
                )}
                
                {/* HOLD INDICATOR (Restored) */}
                {showEnter && (
                    <div className="absolute top-32 left-1/2 transform -translate-x-1/2 flex flex-col items-center justify-center z-30 pointer-events-none select-none">
                        <div className="relative flex flex-col items-center justify-center gap-4 bg-[#F6F3E8]/80 backdrop-blur-md rounded-full p-6 shadow-lg border border-[#231F20]/10">
                            <div className="relative w-24 h-24 flex items-center justify-center">
                                <svg className="absolute w-full h-full transform -rotate-90">
                                    <circle cx="48" cy="48" r="44" stroke="#231F20" strokeWidth="2" fill="none" className="opacity-10" />
                                    <circle cx="48" cy="48" r="44" stroke="#231F20" strokeWidth="3" fill="none" strokeDasharray="276" strokeDashoffset={isHolding ? "0" : "276"} className={`transition-[stroke-dashoffset] ease-linear ${isHolding ? "duration-[10000ms]" : "duration-300"}`} />
                                </svg>
                                <div className={`w-px h-12 bg-[#231F20] opacity-20 ${!isHolding ? "animate-pulse" : "h-16 opacity-40"} transition-all duration-500`}></div>
                            </div>
                            <div className="flex flex-col items-center gap-1">
                                <span className="text-[10px] font-bold tracking-[0.3em] opacity-80">{isHolding ? "KEEP HOLDING..." : "HOLD TO REVEAL"}</span>
                                <span className="text-[9px] font-instrument-sans italic opacity-50">
                                    {isHolding ? `(${Math.max(0, Math.ceil(10 - holdTime))} Seconds)` : "(10 Seconds)"}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-auto">
                    {!showEnter ? (
                        <div className="w-px h-16 bg-[#231F20] opacity-20 animate-pulse"></div>
                    ) : (
                        <button ref={buttonRef} onClick={handleEnterClick} className="cursor-pointer group relative px-8 py-3 bg-[#231F20] text-[#F6F3E8] overflow-hidden transition-all duration-300 hover:scale-105">
                            <span className="relative z-10 text-xs md:text-sm font-bold tracking-[0.3em] uppercase">Enter Experience</span>
                            <div className="absolute inset-0 bg-[#3a3536] transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500 ease-out"></div>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PreLoaderExperience;