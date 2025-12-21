"use client";

import React, { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useProgress, useGLTF } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { LoaderShaderMaterial } from "./shaders/LoaderShaderMaterial";
import * as THREE from "three";
import { Suspense, useMemo } from "react";
import { startExperienceBackgroundMusic, startWindGrassSound, connectSourceToAnalyser } from "@/utils/audioManager";
import { useSound } from "@/context/SoundContext";

const PenthouseHologram = ({
    globalMouse,
    interactionState,
    landingIntroMusic,
    syntheticMusic,
    position
}: {
    globalMouse: React.MutableRefObject<THREE.Vector2>,
    interactionState: React.MutableRefObject<{ isHolding: boolean; clickPos: THREE.Vector2; clickTime: number; }>,
    landingIntroMusic: HTMLAudioElement | null,
    syntheticMusic: HTMLAudioElement | null,
    position?: [number, number, number]
}) => {
    const { scene } = useGLTF('/models/penthouse.glb');
    const clonedScene = useMemo(() => scene.clone(), [scene]);

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
    const holdTimeRef = useRef(0);
    const modeInitiationPlayedRef = useRef(false);
    const syntheticMusicPlayedRef = useRef(false);

    // Shader sonar wave timing: scanSpeed = 0.4, distance = 24 units
    // Wave cycle period = distance / speed = 24 / 0.4 = 60 seconds per full cycle
    // But the wave travels 24 units total, creating a pulse every time it resets
    // fract(uTime * 0.4) resets every 1/0.4 = 2.5 seconds
    const SONAR_CYCLE = 2.5; // Matches shader's scan wave reset period

    const { isSoundEnabled } = useSound();

    // Sync mute state for local sounds
    useEffect(() => {
        if (sonarSound) sonarSound.muted = !isSoundEnabled;
        if (modeInitiationSound) modeInitiationSound.muted = !isSoundEnabled;
    }, [isSoundEnabled, sonarSound, modeInitiationSound]);

    useFrame((state, delta) => {
        material.uTime += delta;
        material.uMouse.set(globalMouse.current.x, globalMouse.current.y);

        if (interactionState.current.isHolding) {
            holdTimeRef.current += delta;

            // Only play audio during the sonar pulse phase (0-10 seconds)
            // After 10 seconds, the final holographic effect starts and pulses stop
            const inPulsePhase = holdTimeRef.current < 10.0;

            // Stop landing intro music when holding completes (10 seconds)
            if (!inPulsePhase && landingIntroMusic && !landingIntroMusic.paused) {
                landingIntroMusic.pause();
                landingIntroMusic.currentTime = 0;
            }

            if (inPulsePhase) {
                // Sync with shader's sonar wave cycle
                // Calculate current position in the wave cycle
                const cyclePosition = (material.uTime % SONAR_CYCLE) / SONAR_CYCLE;
                const prevCyclePosition = ((material.uTime - delta) % SONAR_CYCLE) / SONAR_CYCLE;

                // Detect when wave resets (cycle wraps from ~1.0 back to ~0.0)
                const waveReset = prevCyclePosition > cyclePosition;

                // Play sound at the start of each wave cycle
                if (waveReset && sonarSound) {
                    sonarSound.currentTime = 0;
                    sonarSound.play().catch(() => { });
                }
            } else {
                // Stop audio when entering final holographic phase
                if (sonarSound) {
                    sonarSound.pause();
                    sonarSound.currentTime = 0;
                }

                // Play Mode_Initiation sound once when entering final phase
                if (!modeInitiationPlayedRef.current && modeInitiationSound) {
                    modeInitiationSound.currentTime = 0;
                    modeInitiationSound.volume = 0.5;
                    modeInitiationSound.play().catch(() => { });
                    modeInitiationPlayedRef.current = true;
                }

                // Play synthetic music loop after Mode_Initiation
                if (!syntheticMusicPlayedRef.current && syntheticMusic) {
                    syntheticMusic.currentTime = 0;
                    syntheticMusic.play().catch(() => { });
                    syntheticMusicPlayedRef.current = true;
                }
            }
        } else {
            // Reset everything on release
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
            // Restart landing intro music when released
            if (landingIntroMusic) {
                landingIntroMusic.currentTime = 0;
                landingIntroMusic.play().catch(() => { });
            }
        }

        const targetHold = interactionState.current.isHolding ? 1.0 : 0.0;
        material.uHold += (targetHold - material.uHold) * delta * 5.0;
        material.uHoldTime = holdTimeRef.current;
    });

    useEffect(() => {
        clonedScene.traverse((obj) => {
            if ((obj as THREE.Mesh).isMesh) {
                (obj as THREE.Mesh).material = material;
            }
        });
    }, [clonedScene, material]);

    return <primitive object={clonedScene} position={position || [0, 0, 0]} rotation={[0, 0, 0]} />;
}

const ShaderBackground = ({
    globalMouse,
    interactionState,
    landingIntroMusic,
    syntheticMusic
}: {
    globalMouse: React.MutableRefObject<THREE.Vector2>,
    interactionState: React.MutableRefObject<{ isHolding: boolean; clickPos: THREE.Vector2; clickTime: number; }>,
    landingIntroMusic: HTMLAudioElement | null,
    syntheticMusic: HTMLAudioElement | null
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
    const [removed, setRemoved] = useState(false);
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
    const landingIntroMusic = useRef<HTMLAudioElement | null>(null);
    const syntheticMusic = useRef<HTMLAudioElement | null>(null);
    const landingIntroStarted = useRef(false);

    const { isSoundEnabled } = useSound();

    // Initialize audio on mount
    useEffect(() => {
        if (typeof window !== "undefined") {
            // Landing intro music
            landingIntroMusic.current = new Audio('/sounds/SFX/landing_intro.mp3');
            landingIntroMusic.current.loop = true;
            landingIntroMusic.current.volume = 0.3;
            landingIntroMusic.current.muted = !isSoundEnabled;
            connectSourceToAnalyser(landingIntroMusic.current);

            // Try to play, but it might be blocked by browser
            landingIntroMusic.current.play().then(() => {
                landingIntroStarted.current = true;
            }).catch(() => {
                // Autoplay was blocked, will retry on user interaction
                console.log("Autoplay blocked, waiting for user interaction");
            });

            // Synthetic music
            syntheticMusic.current = new Audio('/sounds/SFX/synthetic-music.mp3');
            syntheticMusic.current.loop = true;
            syntheticMusic.current.volume = 0.4;
            syntheticMusic.current.muted = !isSoundEnabled;
            connectSourceToAnalyser(syntheticMusic.current);
        }

        return () => {
            // Cleanup all audio on unmount
            if (landingIntroMusic.current) {
                landingIntroMusic.current.pause();
                landingIntroMusic.current = null;
            }
            if (syntheticMusic.current) {
                syntheticMusic.current.pause();
                syntheticMusic.current = null;
            }
        };
    }, []);

    // Sync mute state on change
    useEffect(() => {
        if (landingIntroMusic.current) {
            landingIntroMusic.current.muted = !isSoundEnabled;
        }
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
            if (!landingIntroStarted.current && landingIntroMusic.current) {
                landingIntroMusic.current.play().then(() => {
                    landingIntroStarted.current = true;
                }).catch(() => { });
            }
        };

        const handleMouseDown = (e: MouseEvent) => {
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
    }, []);

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
                setHoldTime(prev => Math.min(prev + 0.016, 10)); // ~60fps, max 10s
            }
            animationFrameId = requestAnimationFrame(updateHoldTime);
        };
        animationFrameId = requestAnimationFrame(updateHoldTime);

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, [isHolding]);

    useGSAP(() => {
        if (showEnter && buttonRef.current) {
            gsap.fromTo(buttonRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1, ease: "power3.out" });
            if (progressTextRef.current) gsap.to(progressTextRef.current, { opacity: 0, duration: 0.5 });
        }
    }, [showEnter]);

    const handleEnterClick = () => {
        // Stop synthetic music
        if (syntheticMusic.current) {
            syntheticMusic.current.pause();
            syntheticMusic.current.currentTime = 0;
        }

        // Stop landing intro if still playing
        if (landingIntroMusic.current) {
            landingIntroMusic.current.pause();
            landingIntroMusic.current.currentTime = 0;
        }

        // Start both experience background music and wind-n-grass using global audio manager
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
                landingIntroMusic={landingIntroMusic.current}
                syntheticMusic={syntheticMusic.current}
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

                {/* CENTER HOLD INDICATOR */}
                {greeting && (
                    <div ref={greetingRef} className="absolute top-[23%] left-1/2 transform -translate-x-1/2 text-center pointer-events-none z-30 opacity-0">
                         <span className="font-playfair text-2xl md:text-3xl italic text-[#231F20] opacity-80">{greeting}</span>
                    </div>
                )}

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