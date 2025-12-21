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
                        // Timeline Total: 17s (3 + 3 + 6 + 5)
                        // P1: 0-3s (0 - 0.176)
                        // P2: 3-6s (0.176 - 0.353)
                        // P3: 6-12s (0.353 - 0.706)
                        // P4: 12-17s (0.706 - 1.0)

                        if (progress > 0.176 && progress <= 0.353) {
                            phase = "Phase 2: Center Approach";
                        } else if (progress > 0.353 && progress <= 0.706) {
                            phase = "Phase 3: Moving Right (Long)";
                        } else if (progress > 0.706) {
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

        // --- CAMERA ANIMATION PATH (4 Phases -> Total 17s) ---

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


        // Phase 3: Move Camera Right (6s - 12s) [Extended 6s duration]
        // Split into 2 steps for smoother rotation curve

        // Step 3a: Mid-way turn (6s - 9s)
        tl.to(camera.position, {
            x: 0,    // Moving towards right
            y: 3,
            z: -3.2,   // Approaching
            duration: 3,
            ease: "none", // Linear for middle segment
        }, 6);

        tl.to(camera.rotation, {
            y: -0.7,  // Halfway rotation
            duration: 3,
            ease: "none",
        }, 6);

        // Step 3b: Complete turn (9s - 12s)
        tl.to(camera.position, {
            x: 0,    // Final right position
            y: 3,
            z: -4,
            duration: 3,
            ease: "none",
        }, 9);

        tl.to(camera.rotation, {
            y: -1.4,  // Full rotation
            duration: 3,
            ease: "none",
        }, 9);


        // Phase 4: Final Entry - Straighten and Enter (12s - 17s) [5s duration]
        tl.to(camera.position, {
            x: 0,     // Center align
            y: 3,     // Maintain height (or dip 2?)
            z: -5,    // Pass through (-5 as requested)
            duration: 5, // +2 seconds added
            ease: "power2.inOut", // Smooth entry
        }, 12);

        tl.to(camera.rotation, {
            y: 0,     // Face straight (0 as requested)
            duration: 5,
            ease: "power2.inOut",
        }, 12);


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
                            position={[0, 3, 0]}
                            scale={[0.3, 0.3, 0.3]}
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
