"use client";

import { Suspense, useRef, useEffect, useState } from "react";
import { PenthouseWithRoof } from "./PentHouseWithRoof";
import { Canvas, useThree } from "@react-three/fiber";
import { Environment, PerspectiveCamera } from "@react-three/drei";
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
    phase2: { x: 0, y: 5.5, z: 0.7 },
    phase2Rot: { x: 0, y: -1.57, z: 0 }, // Rotate 90 deg right
    phase3: { x: 2.7, y: 5.5, z: 0.7 },  // Move to X=2.5
    phase3Rot: { x: 0, y: -3.14, z: 0 }, // Turn right (180 deg / -PI)
};

// Animated wrapper component for the Penthouse
const AnimatedPenthouse = (props: any & { onLoadingStart: () => void }) => {
    const groupRef = useRef<THREE.Group>(null);
    const { camera } = useThree(); // Access the camera


    useGSAP(() => {
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: "body",
                start: "top top",
                end: "bottom bottom",
                scrub: 1.5,
                onUpdate: (self) => {
                    if (self.progress > 0.9) {
                        props.onLoadingStart();
                    }
                },
            },
        });

        // Ensure camera starts at initial position
        camera.position.set(CAMERA_PATH_CONFIG.initial.x, CAMERA_PATH_CONFIG.initial.y, CAMERA_PATH_CONFIG.initial.z);
        camera.rotation.set(CAMERA_PATH_CONFIG.initialRot.x, CAMERA_PATH_CONFIG.initialRot.y, CAMERA_PATH_CONFIG.initialRot.z);

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


        // Phase 2: Move Camera to Center/Left and Closer
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
            duration: 3.5,
            ease: "sine.inOut",
        }, 2.5);


        // Phase 3: Final Move and Turn
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




    }, [camera]);

    return (
        <group ref={groupRef} position={props.position} scale={props.scale}>
            <PenthouseWithRoof />
        </group>
    );
};

const PenthouseWithRoofWrapper = () => {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleLoadingStart = () => {
        if (!isLoading) {
            setIsLoading(true);
        }
    };

    return (
        <div style={{ height: "400vh", position: "relative" }}>
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

const ScrollFadeLogic = () => {
    useGSAP(() => {
        gsap.to(".scroll-indicator", {
            scrollTrigger: {
                trigger: "body",
                start: "top top",
                end: "100px top",
                scrub: true,
            },
            opacity: 0,
            y: 20,
            ease: "power1.out"
        });
    }, []);
    return null;
};

export default PenthouseWithRoofWrapper;
