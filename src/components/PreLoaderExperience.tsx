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
    landingIntroMusic,
    syntheticMusic,
    position,
    startAnimationSequence,
    onAnimationComplete
}: {
    globalMouse: React.MutableRefObject<THREE.Vector2>,
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
                    }
                }
                
                nonIndexedGeo.setAttribute('aRandom', new THREE.BufferAttribute(randomArray, 3));
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
        material.uHold = 0; // Always IDLE until animation starts
        
        // 1. GLOW PHASE
        if (isGlowingRef.current) {
            glowProgressRef.current += delta * 1.5; // Glow speed (approx 0.7s)
            
            const glow = Math.min(glowProgressRef.current, 1.0);
            material.uGlowFull = glow;
            
            // Once fully glowing, trigger shatter
            if (glow >= 1.0) {
                isGlowingRef.current = false;
                isShatteringRef.current = true;
            }
        }
        
        // 2. SHATTER PHASE
        if (isShatteringRef.current) {
            shatterProgressRef.current += delta * 0.5; // Shatter speed
            
            // Wait a tiny bit at full glow before starting shatter movement?
            // Currently immediate transition.
            
            material.uShatter = Math.min(shatterProgressRef.current, 1.0);
            
            if (shatterProgressRef.current > 1.5) { // Wait after shatter
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
    landingIntroMusic,
    syntheticMusic,
    startAnimationSequence,
    onAnimationComplete
}: {
    globalMouse: React.MutableRefObject<THREE.Vector2>,
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

    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const progressTextRef = useRef<HTMLSpanElement>(null);

    const globalMouse = useRef(new THREE.Vector2(0, 0));
    
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

        window.addEventListener("mousemove", handleMouseMove);

        return () => {
            document.body.style.overflow = '';
            window.removeEventListener("mousemove", handleMouseMove);
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

    useGSAP(() => {
        if (showEnter && buttonRef.current) {
            gsap.fromTo(buttonRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1, ease: "power3.out" });
            if (progressTextRef.current) gsap.to(progressTextRef.current, { opacity: 0, duration: 0.5 });
        }
    }, [showEnter]);
    
    // Triggered when button is clicked
    const handleEnterClick = () => {
        setStartAnimation(true);
        // Fade out UI immediately so we see the full glow effect clearly
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