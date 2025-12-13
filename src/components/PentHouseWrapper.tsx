"use client";

import { Suspense, useRef, useEffect, useState } from "react";
import { Penthouse } from "./PentHouse";
import { Canvas } from "@react-three/fiber";
import { Environment, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useRouter } from "next/navigation";

// Register ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// Animated wrapper component for the Penthouse
const AnimatedPenthouse = (props: any) => {
    const groupRef = useRef<THREE.Group>(null);
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    useGSAP(() => {
        if (!groupRef.current) return;

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: "body", // Use body as trigger for main scroll
                start: "top top",
                end: "bottom bottom",
                scrub: 1.5,
                onUpdate: (self) => {
                    // Check if we are near the end to trigger loading/redirect
                    if (self.progress > 0.95 && !isLoading) {
                        setIsLoading(true);
                        // Fade out effect could go here
                        setTimeout(() => {
                            router.push("/experience");
                        }, 500);
                    }
                },
            },
        });

        // 1. Initial Float Animation (matches previous idle state but subtle)
        // We might want to kill this or blend it, but for now let's keep it simple
        // or just let the scroll override it. 
        // Actually, let's focus on the Scroll Interaction.

        // Scale Up Animation
        tl.to(groupRef.current.scale, {
            x: 5,
            y: 5,
            z: 5,
            duration: 10,
            ease: "power2.inOut",
        }, 0);

        // Move Position to simulate entering (optional, if scale isn't enough)
        tl.to(groupRef.current.position, {
            y: -2, // Adjust to center the door
            z: 8,  // Move closer to camera
            duration: 10,
            ease: "power2.inOut",
        }, 0);

        // Door Animation
        // Access doors via getObjectByName since we named them in PentHouse.tsx
        const leftDoor = groupRef.current.getObjectByName("penthouse_door_left");
        const rightDoor = groupRef.current.getObjectByName("penthouse_door_right");

        if (leftDoor && rightDoor) {
            // Open Doors at 80% of the timeline
            tl.to(leftDoor.rotation, {
                z: -Math.PI / 2, // Rotate 90 degrees outward (check axis!)
                duration: 2,
                ease: "power1.inOut",
            }, 8);

            tl.to(rightDoor.rotation, {
                z: Math.PI / 2, // Rotate 90 degrees outward
                duration: 2,
                ease: "power1.inOut",
            }, 8);
        }

    }, [isLoading, router]);

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
                        <AnimatedPenthouse position={[0, 2, -5]} scale={[0.4, 0.4, 0.4]} />
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
