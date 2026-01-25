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
import ExperienceTransitionLoader from "./ExperienceTransitionLoader";


// Register ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

export const dynamic = "force-static";

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
const AnimatedPenthouse = (props: any & { onLoadingStart: () => void }) => {
    const groupRef = useRef<THREE.Group>(null);
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

                    if (self.progress > 0.9) {
                        props.onLoadingStart();
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

    }, [camera]); // Removed controls from dependency

    return (
        <group ref={groupRef} position={props.position} scale={props.scale}>
            <Penthouse />
        </group>
    );
};

const PenthouseWrapper = () => {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleLoadingStart = () => {
        if (!isLoading) {
            setIsLoading(true);
        }
    };

    return (
        <div style={{ height: "400vh", position: "relative" }}> {/* Add scrollable height */}
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
                            onLoadingStart={handleLoadingStart}
                        />
                    </Suspense>
                </Canvas>
            </div>

            <ScrollFadeLogic />

            {isLoading && (
                 <ExperienceTransitionLoader 
                     onComplete={() => {
                         router.push("/experience");
                     }} 
                 />
            )}
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
