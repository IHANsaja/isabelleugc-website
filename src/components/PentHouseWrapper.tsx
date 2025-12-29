"use client";

import { Suspense, useRef, useEffect, useState } from "react";
import { Penthouse } from "./PentHouse";
import { Canvas, useThree } from "@react-three/fiber";
import { Environment, OrbitControls, PerspectiveCamera, useProgress } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useRouter } from "next/navigation";


// Register ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

export const dynamic = "force-static";

// Debug info interface
interface DebugInfo {
    progress: number;
    phase: string;
    position: { x: number; y: number; z: number };
    rotation: { x: number; y: number; z: number };
    scale: { x: number; y: number; z: number };
}

// Camera Path Configuration
const CAMERA_PATH_CONFIG = {
    initial: { x: 0, y: 7, z: 12 },
    initialRot: { x: 0, y: 0, z: 0 },
    phase1: { x: 0, y: 5.5, z: 3 },
    phase1Rot: { x: 0, y: 0, z: 0 },
    phase2: { x: 0, y: 5.5, z: 1.3 },
    phase2Rot: { x: 0, y: -1.57, z: 0 }, // Rotate 90 deg right
    phase3: { x: 2.5, y: 5.5, z: 1.3 },  // Move to X=2.5
    phase3Rot: { x: 0, y: -3.14, z: 0 }, // Turn right (180 deg / -PI)
};

// Animated wrapper component for the Penthouse
const AnimatedPenthouse = (props: any & { onDebugUpdate?: (info: DebugInfo) => void }) => {
    const groupRef = useRef<THREE.Group>(null);
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const { camera } = useThree(); // Access the camera

    // --- CAMERA CONTROLS (Static Config) ---
    // Using CAMERA_PATH_CONFIG defined above instead of Leva controls


    useGSAP(() => {
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: "body",
                start: "top top",
                end: "bottom bottom",
                scrub: 1.5,
                onUpdate: (self) => {
                    const progress = self.progress;
                    let phase = "Phase 1: Moving Left";
                    // Timeline Total: 9s (3 + 3 + 3)
                    // P1: 0-3s (0 - 0.33)
                    // P2: 3-6s (0.33 - 0.66)
                    // P3: 6-9s (0.66 - 1.0)

                    if (progress > 0.33 && progress <= 0.66) {
                        phase = "Phase 2: Center Approach";
                    } else if (progress > 0.66) {
                        phase = "Phase 3: Final Turn & Stop";
                    }

                    // Update Leva - REMOVED
                    // set({ currentPhase: phase });

                    // Update debug info - tracking CAMERA now
                    if (props.onDebugUpdate && groupRef.current) {
                        props.onDebugUpdate({
                            progress: Math.round(progress * 100),
                            phase,
                            position: {
                                x: parseFloat(camera.position.x.toFixed(2)),
                                y: parseFloat(camera.position.y.toFixed(2)),
                                z: parseFloat(camera.position.z.toFixed(2)),
                            },
                            rotation: {
                                x: parseFloat(camera.rotation.x.toFixed(2)),
                                y: parseFloat(camera.rotation.y.toFixed(2)),
                                z: parseFloat(camera.rotation.z.toFixed(2)),
                            },
                            scale: { x: 1, y: 1, z: 1 }, // Scale is constant now
                        });
                    }

                    if (self.progress > 0.95 && !isLoading) {
                        setIsLoading(true);
                        setTimeout(() => {
                            router.push("/experience");
                        }, 500);
                    }
                },
            },
        });

        // Ensure camera starts at initial position
        camera.position.set(CAMERA_PATH_CONFIG.initial.x, CAMERA_PATH_CONFIG.initial.y, CAMERA_PATH_CONFIG.initial.z);
        camera.rotation.set(CAMERA_PATH_CONFIG.initialRot.x, CAMERA_PATH_CONFIG.initialRot.y, CAMERA_PATH_CONFIG.initialRot.z);

        // --- CAMERA ANIMATION PATH (3 Phases -> Total 9s) ---

        // Phase 1: Move Camera Left and Forward (0s - 3s)
        tl.to(camera.position, {
            x: CAMERA_PATH_CONFIG.phase1.x,
            y: CAMERA_PATH_CONFIG.phase1.y,
            z: CAMERA_PATH_CONFIG.phase1.z,
            duration: 3,
            ease: "sine.inOut",
        }, 0);

        // Rotate camera
        tl.to(camera.rotation, {
            x: CAMERA_PATH_CONFIG.phase1Rot.x,
            y: CAMERA_PATH_CONFIG.phase1Rot.y,
            z: CAMERA_PATH_CONFIG.phase1Rot.z,
            duration: 3,
            ease: "sine.inOut",
        }, 0);


        // Phase 2: Move Camera to Center/Left and Closer (Starts at 3s for pos, 2.5s for rot)
        tl.to(camera.position, {
            x: CAMERA_PATH_CONFIG.phase2.x,
            y: CAMERA_PATH_CONFIG.phase2.y,
            z: CAMERA_PATH_CONFIG.phase2.z,
            duration: 3,
            ease: "sine.inOut",
        }, 3);

        tl.to(camera.rotation, {
            x: CAMERA_PATH_CONFIG.phase2Rot.x,
            y: CAMERA_PATH_CONFIG.phase2Rot.y,
            z: CAMERA_PATH_CONFIG.phase2Rot.z,
            duration: 3.5, // slightly longer to smooth overlap
            ease: "sine.inOut",
        }, 2.5); // Start 0.5s before Phase 1 ends


        // Phase 3: Final Move to X=2.5 and Turn Right (Starts after Phase 2)
        tl.to(camera.position, {
            x: CAMERA_PATH_CONFIG.phase3.x,
            y: CAMERA_PATH_CONFIG.phase3.y,
            z: CAMERA_PATH_CONFIG.phase3.z,
            duration: 3,
            ease: "power2.out",
        }, 6);

        tl.to(camera.rotation, {
            x: CAMERA_PATH_CONFIG.phase3Rot.x,
            y: CAMERA_PATH_CONFIG.phase3Rot.y,
            z: CAMERA_PATH_CONFIG.phase3Rot.z,
            duration: 3,
            ease: "power2.out",
        }, 6);


        // Door Animation (Aligned to timeline)
        if (groupRef.current) {
            const leftDoor = groupRef.current.getObjectByName("penthouse_door_left");
            const rightDoor = groupRef.current.getObjectByName("penthouse_door_right");

            if (leftDoor && rightDoor) {
                tl.to(leftDoor.rotation, {
                    y: -Math.PI / 2,
                    duration: 3,
                    ease: "power1.inOut",
                }, 2); // Open during Phase 3

                tl.to(rightDoor.rotation, {
                    y: Math.PI / 2,
                    duration: 3,
                    ease: "power1.inOut",
                }, 2);
            }
        }

    }, [isLoading, router, camera]); // Removed controls from dependency

    return (
        <>
            <group ref={groupRef} position={props.position} scale={props.scale}>
                <Penthouse />
            </group>
            {isLoading && (
                <mesh position={[0, 0, 10]}>
                    <planeGeometry args={[100, 100]} />
                    <meshBasicMaterial color="black" transparent opacity={0} ref={(ref) => {
                        if (ref) {
                            gsap.to(ref, { opacity: 1, duration: 0.5 });
                        }
                    }} />
                </mesh>
            )}
        </>
    );
};

const PenthouseWrapper = () => {
    const [showDebug, setShowDebug] = useState(false);
    const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);

    const handleDebugUpdate = (info: DebugInfo) => {
        setDebugInfo(info);
    };

    return (
        <div style={{ height: "400vh", position: "relative" }}> {/* Add scrollable height */}
            {/* Simple Debug Panel */}
            <div style={{
                position: "fixed",
                top: "20px",
                right: "20px",
                zIndex: 1000,
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                gap: "10px"
            }}>
                <button
                    onClick={() => setShowDebug(!showDebug)}
                    style={{
                        padding: "8px 16px",
                        background: "rgba(0,0,0,0.7)",
                        color: "white",
                        border: "1px solid rgba(255,255,255,0.2)",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontSize: "12px",
                        backdropFilter: "blur(5px)"
                    }}
                >
                    {showDebug ? "Hide Debug" : "Show Debug"}
                </button>

                {showDebug && debugInfo && (
                    <div style={{
                        background: "rgba(0,0,0,0.8)",
                        padding: "15px",
                        borderRadius: "12px",
                        color: "#eee",
                        width: "250px",
                        fontFamily: "monospace",
                        fontSize: "12px",
                        backdropFilter: "blur(10px)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
                    }}>
                        <div style={{ marginBottom: "10px", color: "#88c0d0", fontWeight: "bold" }}>
                            {debugInfo.phase}
                        </div>

                        <div style={{ marginBottom: "5px" }}>Position:</div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "5px", marginBottom: "10px", color: "#a3be8c" }}>
                            <span>X: {debugInfo.position.x}</span>
                            <span>Y: {debugInfo.position.y}</span>
                            <span>Z: {debugInfo.position.z}</span>
                        </div>

                        <div style={{ marginBottom: "5px" }}>Rotation:</div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "5px", color: "#ebcb8b" }}>
                            <span>X: {debugInfo.rotation.x}</span>
                            <span>Y: {debugInfo.rotation.y}</span>
                            <span>Z: {debugInfo.rotation.z}</span>
                        </div>

                        <div style={{ marginTop: "10px", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "5px", color: "#666" }}>
                            Progress: {debugInfo.progress}%
                        </div>
                    </div>
                )}
            </div>

            <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%" }}>
                <Canvas style={{ width: "100vw", height: "100vh" }}>
                    <ambientLight intensity={0.5} />
                    <directionalLight position={[10, 1, 10]} intensity={1} />
                    <PerspectiveCamera makeDefault position={[0, 5, 12]} />
                    <Environment files="/hdr/shanghai_night.hdr" />
                    <Suspense fallback={null}>
                        <AnimatedPenthouse
                            position={[0, 5, 0]}
                            scale={[0.3, 0.3, 0.3]}
                            onDebugUpdate={handleDebugUpdate}
                        />
                    </Suspense>
                </Canvas>
            </div>

            <ScrollFadeLogic />
        </div>
    );
};

// Helper component to handle GSAP logic for the indicator outside the main wrapper to avoid re-renders or complexity
const ScrollFadeLogic = () => {
    useGSAP(() => {
        gsap.to(".scroll-indicator", {
            scrollTrigger: {
                trigger: "body",
                start: "top top",
                end: "100px top", // Fade out quickly
                scrub: true,
            },
            opacity: 0,
            y: 20, // Move down slightly while fading
            ease: "power1.out"
        });
    }, []);
    return null;
};

export default PenthouseWrapper;
