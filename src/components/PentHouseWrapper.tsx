"use client";

import { Suspense, useRef, useEffect, useState } from "react";
import { Penthouse } from "./PentHouse";
import { Canvas, useThree } from "@react-three/fiber";
import { Environment, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useRouter } from "next/navigation";

// Register ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// Debug info interface
interface DebugInfo {
    progress: number;
    phase: string;
    position: { x: number; y: number; z: number };
    rotation: { x: number; y: number; z: number };
    scale: { x: number; y: number; z: number };
}

// Animated wrapper component for the Penthouse
// Animated wrapper component for the Penthouse
const AnimatedPenthouse = (props: any & { onDebugUpdate?: (info: DebugInfo) => void }) => {
    const groupRef = useRef<THREE.Group>(null);
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const { camera } = useThree(); // Access the camera

    useGSAP(() => {
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: "body",
                start: "top top",
                end: "bottom bottom",
                scrub: 1.5,
                onUpdate: (self) => {
                    // Update debug info - tracking CAMERA now
                    if (props.onDebugUpdate && groupRef.current) {
                        const progress = self.progress;
                        let phase = "Phase 1: Moving Left";
                        // 4 Phases = 25% each
                        if (progress > 0.25 && progress <= 0.50) {
                            phase = "Phase 2: Center Approach";
                        } else if (progress > 0.50 && progress <= 0.75) {
                            phase = "Phase 3: Moving Right";
                        } else if (progress > 0.75) {
                            phase = "Phase 4: Final Entry";
                        }

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
        camera.position.set(0, 5, 12);
        camera.rotation.set(0, 0, 0); // Reset rotation to be sure

        // --- CAMERA ANIMATION PATH (4 Phases, 3s each -> Total 12s) ---
        
        // Phase 1: Move Camera Left and Forward (0s - 3s)
        tl.to(camera.position, {
            x: -1,   // Camera moves left
            y: 3,    // Height adjustment
            z: 3,    // Move closer 
            duration: 3,
            ease: "sine.inOut",
        }, 0);

        // Rotate camera to look at center
        tl.to(camera.rotation, {
            x: 0,
            y: 0,
            duration: 3,
            ease: "sine.inOut",
        }, 0);


        // Phase 2: Move Camera to Center/Left and Closer (3s - 6s)
        tl.to(camera.position, {
            x: -1,    // Stay left/center?
            y: 3,     // Maintain height
            z: -2.5,  // Much closer
            duration: 3,
            ease: "sine.inOut",
        }, 3);

         tl.to(camera.rotation, {
            y: 0,    // Look straight
            duration: 3,
            ease: "sine.inOut",
        }, 3);


        // Phase 3: Move Camera Right (6s - 9s)
        tl.to(camera.position, {
            x: 0,    // Camera moves right
            y: 3,    // Final height
            z: -4,   // Final very close distance
            duration: 6, // Reduced from 4 to 3 to fit timeline
            ease: "sine.inOut",
        }, 6);

        tl.to(camera.rotation, {
            y: -1.4,  // Look left sharply
            duration: 6,
            ease: "sine.inOut",
        }, 6);


        // Phase 4: Final Entry - Straighten and Enter (starts at 12s because Phase 3 ends at 6+6=12s)
        tl.to(camera.position, {
            x: 0,     // Center align
            y: 3,     // Slight dip for entry?
            z: -5,    // Pass through (-5 as requested)
            duration: 2,
            ease: "sine.in",
        }, 12);

        tl.to(camera.rotation, {
            y: 0,     // Face straight (0 as requested)
            duration: 2,
            ease: "sine.in",
        }, 12);


        // Door Animation (Aligned to timeline)
        if (groupRef.current) {
             const leftDoor = groupRef.current.getObjectByName("penthouse_door_left");
             const rightDoor = groupRef.current.getObjectByName("penthouse_door_right");

             if (leftDoor && rightDoor) {
                 // Open doors around Phase 2-3 transition usually, or sticking to middle
                 // Previous was at '1' which is very early in old timeline (0-10) -> 10%
                 // Let's open them as we get close, maybe around 6s (50% progress)
                 
                 tl.to(leftDoor.rotation, {
                     y: -Math.PI / 2,
                     duration: 3,
                     ease: "sine.inOut",
                 }, 1); // Start at 4.5s (between phase 2 and 3)

                 tl.to(rightDoor.rotation, {
                     y: Math.PI / 2,
                     duration: 3,
                     ease: "sine.inOut",
                 }, 1);
             }
        }

    }, [isLoading, router, camera]);

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
    const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
    const [showDebug, setShowDebug] = useState(true); // Toggle debug overlay

    return (
        <div style={{ height: "400vh", position: "relative" }}> {/* Add scrollable height */}
            <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%" }}>
                <Canvas style={{ width: "100vw", height: "100vh" }}>
                    <ambientLight intensity={0.5} />
                    <directionalLight position={[10, 1, 10]} intensity={1} />
                    <PerspectiveCamera makeDefault position={[0, 5, 12]} />
                    <Environment preset="sunset" />
                    <Suspense fallback={null}>
                        <AnimatedPenthouse 
                            position={[0, 2, -5]} 
                            scale={[0.4, 0.4, 0.4]}
                            onDebugUpdate={setDebugInfo}
                        />
                    </Suspense>
                </Canvas>
            </div>

            {/* Debug Overlay */}
            {showDebug && debugInfo && (
                <div style={{
                    position: "fixed",
                    top: 20,
                    left: 20,
                    background: "rgba(0, 0, 0, 0.85)",
                    color: "#00ff00",
                    padding: "16px",
                    borderRadius: "8px",
                    fontFamily: "monospace",
                    fontSize: "13px",
                    zIndex: 9999,
                    minWidth: "220px",
                    border: "1px solid #00ff00",
                    boxShadow: "0 4px 20px rgba(0, 255, 0, 0.2)",
                }}>
                    <div style={{ marginBottom: "12px", fontWeight: "bold", fontSize: "15px", borderBottom: "1px solid #00ff00", paddingBottom: "8px" }}>
                        📊 Debug Panel
                    </div>
                    <div style={{ marginBottom: "8px" }}>
                        <span style={{ color: "#888" }}>Progress:</span> {debugInfo.progress}%
                    </div>
                    <div style={{ marginBottom: "12px", color: "#ffcc00", fontWeight: "bold" }}>
                        {debugInfo.phase}
                    </div>
                    <div style={{ marginBottom: "8px", borderTop: "1px solid #333", paddingTop: "8px" }}>
                        <span style={{ color: "#888" }}>Position:</span>
                    </div>
                    <div style={{ paddingLeft: "12px" }}>
                        <div><span style={{ color: "#ff6b6b" }}>X:</span> {debugInfo.position.x}</div>
                        <div><span style={{ color: "#4ecdc4" }}>Y:</span> {debugInfo.position.y}</div>
                        <div><span style={{ color: "#45b7d1" }}>Z:</span> {debugInfo.position.z}</div>
                    </div>
                    <div style={{ marginTop: "8px", marginBottom: "8px", borderTop: "1px solid #333", paddingTop: "8px" }}>
                        <span style={{ color: "#888" }}>Scale:</span>
                    </div>
                    <div style={{ paddingLeft: "12px" }}>
                        <div><span style={{ color: "#ff6b6b" }}>X:</span> {debugInfo.scale.x}</div>
                        <div><span style={{ color: "#4ecdc4" }}>Y:</span> {debugInfo.scale.y}</div>
                        <div><span style={{ color: "#45b7d1" }}>Z:</span> {debugInfo.scale.z}</div>
                    </div>
                    <div style={{ marginTop: "8px", marginBottom: "8px", borderTop: "1px solid #333", paddingTop: "8px" }}>
                        <span style={{ color: "#888" }}>Rotation:</span>
                    </div>
                    <div style={{ paddingLeft: "12px" }}>
                        <div><span style={{ color: "#ff6b6b" }}>X:</span> {debugInfo.rotation.x}</div>
                        <div><span style={{ color: "#4ecdc4" }}>Y:</span> {debugInfo.rotation.y}</div>
                        <div><span style={{ color: "#45b7d1" }}>Z:</span> {debugInfo.rotation.z}</div>
                    </div>
                </div>
            )}

            {/* Debug Toggle Button */}
            <button
                onClick={() => setShowDebug(!showDebug)}
                style={{
                    position: "fixed",
                    bottom: 20,
                    left: 20,
                    background: showDebug ? "#00ff00" : "#333",
                    color: showDebug ? "#000" : "#fff",
                    border: "none",
                    padding: "10px 16px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontFamily: "monospace",
                    fontSize: "12px",
                    zIndex: 9999,
                }}
            >
                {showDebug ? "🔍 Hide Debug" : "🔍 Show Debug"}
            </button>

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
